import * as fs from "fs";
import * as pegjs from "pegjs";
import CMakeFile from "./CMakeFile";

export {parser as err} from "pegjs";

export class CMakeParser {
    private parser: pegjs.Parser;

    constructor() {
        const grammar: Buffer = fs.readFileSync("res/cmake.pegjs");
        this.parser = pegjs.generate(grammar.toString());
    }

    public parse( text: string ): CMakeFile {
        return new CMakeFile( this._parse(text), text );
    }

    public _parse( text: string ): any[] {
        return this.parser.parse(text);
    }
}
