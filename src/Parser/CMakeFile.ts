import { Command } from "./Command";

export enum FileType {
    CMakeModule,
    TargetCMakeLists,
    FolderCMakeLists,
    Unknown,
}

export class CMakeFile {
    constructor( private cmake: any[], private raw: string, public filename: string ) {}

    public unparsed(): string {
        return this.raw;
    }

    public toString(): string {
        return JSON.stringify(this.cmake, null, 2);
    }

    public length(): number {
        return this.cmake.length;
    }

    public type(): FileType {
        if (this.command("add_library") ||
            this.command("add_executable") ) {
            return FileType.TargetCMakeLists;
        }

        return FileType.Unknown;
    }

    /**
     * Returns the list of commands, ordered by their appearance.
     * Only top-level commands are considered (e.g. not commands called in functions).
     */
    public commands(): Command[] {
        return this.cmake.filter( (el) => {
            return el.type === "command";
        }).map( (ele) => {
            return new Command(ele);
        });
    }

    /**
     * Returns the first occurence of a command
     * @param name command name to search
     */
    public command(name: string): Command|undefined {
        const ret = this.cmake.find( (el: any) => {
            return ( el.type === "command" && el.name === name );
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
