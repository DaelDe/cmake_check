import * as fs from "fs";
import { promisify } from "util";
import {Logger} from "winston";
import * as test from "../Checks/C001CommandExistence";
import * as conf from "../Configuration";
import {CMakeFile} from "../Parser/CMakeFile";
import * as p from "../Parser/CMakeParser";
import {Rule} from "../Rules/Rule";
import {FileType, RuleSet} from "../Rules/RuleSet";

const rf = promisify(fs.readFile);

export default class RuleChecker {
    private parser: p.CMakeParser;

    constructor(private logger: Logger, private ruleLogger: Logger, private rulesets: conf.IRuleSet[]) {
// should use its own, logger
        this.parser = new p.CMakeParser();
    }

    public async check(file: string) {
        try {
            const c = await rf(file);
            // this.logger.info(`Parsing file ${file}`);
            const cm: CMakeFile = this.parser.parse(c.toString(), file);

            this.rulesets.forEach( (set) => {
                const rs = new RuleSet(set, this.logger);
                rs.check(cm).forEach( (message) => {
                    this.ruleLogger.warn(message);
                });
    // rule results go to winston
            });
        } catch (error) {
            if (error.name === "SyntaxError") {
                this.logger.error(`${file}:${error.location.start.line} ${error.message}`);
            }
            this.logger.error(error.message);
        }

    }
}
