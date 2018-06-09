import * as fs from "fs";
import { promisify } from "util";
import {Logger} from "winston";
import * as test from "../Checks/C001CommandExistence";
import CMakeFile from "../Parser/CMakeFile";
import * as p from "../Parser/CMakeParser";

const rf = promisify(fs.readFile);

export default class RuleChecker {
    private logger: Logger;
    private parser: p.CMakeParser;

    constructor(log: Logger) {
        this.logger = log;
// should use its own, logger
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
            const ch = new test.C001({ commands:
                [{name: "add_library", occurences: 1}, {name: "target_include_directories"}],
            });
            console.log(ch.check(cm));
    // iterate through the rules and check
    // rule results go to winston
        } catch (error) {
            if (error.name === "SyntaxError") {
                this.logger.error(`${file}:${error.location.start.line} ${error.message}`);
            }
            this.logger.error(error.message);
        }

    }
}
