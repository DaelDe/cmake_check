import * as fs from "fs";
import * as pegjs from "pegjs";
import {CMakeFile} from "./CMakeFile";

export {parser as err} from "pegjs";

export class CMakeParser {
    private parser: pegjs.Parser;

    constructor() {
        const grammar: Buffer = fs.readFileSync(`${__dirname}/../../res/cmake.pegjs`);
        this.parser = pegjs.generate(grammar.toString());
    }

    public parse( text: string, filename: string ): CMakeFile {
        return new CMakeFile( this._parse(text), text, filename);
    }

    public _parse( text: string ): any[] {
        return this.parser.parse(text);
    }
}
