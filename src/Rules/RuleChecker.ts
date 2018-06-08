import * as fs from "fs";
import { promisify } from "util";
import {Logger} from "winston";
import CMakeFile from "../Parser/CMakeFile";
import * as p from "../Parser/CMakeParser";

const rf = promisify(fs.readFile);

export default class RuleChecker {
    private logger: Logger;
    private parser: p.CMakeParser;

    constructor(log: Logger) {
        this.logger = log;
        this.parser = new p.CMakeParser();
    }

    public configure(conf: any) {
        // takes json rule config
        // creates all rulesets internally
    }

    public async check(file: string) {
        try {
            const c = await rf(file);
            const cm: CMakeFile = this.parser.parse(c.toString());
    // iterate through the rules and check
    // rule results go to winston
        } catch (error) {
            if (error.name === "SyntaxError") {
                this.logger.error(`${file}:${error.location.start.line} ${error.message}`);
            }
            console.log(error.name);
        }

    }
}
