import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { Command } from "./Command";

export enum FileType {
    CMakeModule,
    TargetCMakeLists,
    CMakeLists,
    Unknown,
}

export class CMakeFile {
    constructor(private cmake: any[], private raw: string, public filename: string) { }

    get unparsed(): string {
        return this.raw;
    }

    get obj(): any[] {
        return this.cmake;
    }

    public toString(): string {
        return JSON.stringify(this.cmake, null, 2);
    }

    public length(): number {
        return this.cmake.length;
    }

    public type(): FileType {
        if ( new RegExp(/^CMakeLists.*\.txt$/).test(path.parse(this.filename).base)) {
                if (this.commands(/^add_library|add_executable$/).length > 0) {
                    return FileType.TargetCMakeLists;
                }
                return FileType.CMakeLists;
            }
            // check .cmake extension for modules

        return FileType.Unknown;
    }

    public async writeJSON() {
        await promisify(fs.writeFile)
            (this.filename + "_cmake_style.json", JSON.stringify(this.cmake, null, 3));
    }

    /**
     * Returns the list of commands, ordered by their appearance.
     * Only top-level commands are considered (e.g. not commands called in functions).
     * @param filter Only returns commands whose names match.
     */
    public commands(filter: RegExp = /.*/): Command[] {
        return this.cmake.filter((el) => {
            return (el.type === "command" && filter.test(el.name));
        }).map((ele) => {
            return new Command(ele);
        });

    }

    /**
     * Returns the first occurence of a command
     * @param name command name to search
     */
    public command(name: string): Command | undefined {
        const ret = this.cmake.find((el: any) => {
            return (el.type === "command" && el.name === name);
        });

        if (ret) {
            return new Command(ret);
        } else {
            return undefined;
        }
    }

    get numLines(): number {
        return this.raw.split(/\r\n|\r|\n/).length;
    }

}
