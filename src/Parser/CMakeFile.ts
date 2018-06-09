import { Command } from "./Command";

export default class CMakeFile {
    private cmake: any[];
    private raw: string;

    constructor( cm: any[], raw: string ) {
        this.cmake = cm;
        this.raw = raw;
    }

    public unparsed(): string {
        return this.raw;
    }

    public toString(): string {
        return JSON.stringify(this.cmake, null, 2);
    }

    public length(): number {
        return this.cmake.length;
    }

    public commands(): Command[] {
        return this.cmake.filter( (el) => {
            return el.type === "command";
        });
    }

    public command(name: string): Command|undefined {
        return new Command(
                this.cmake.find( (el: any) => {
                    return ( el.type === "command" && el.name === name );
                },
            ),
        );
    }
}
