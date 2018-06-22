import * as fs from "fs";
import { promisify } from "util";
import {Logger} from "winston";
import * as test from "../Checks/C001CommandExistence";
import {FailedCheck} from "../Checks/IChecker";
import * as conf from "../Configuration";
import {CMakeFile} from "../Parser/CMakeFile";
import * as p from "../Parser/CMakeParser";
import {Rule} from "../Rules/Rule";

const rf = promisify(fs.readFile);

class Statistics {
    public checkedFiles: number = 0;
    public ignoredFiles: number = 0;
    public cleanFiles: number = 0;
    public dirtyFiles: number = 0;
}

interface IOptions {
    rules: conf.IRule[];
    writeJSON: boolean;
}

// tslint:disable-next-line:max-classes-per-file
export default class RuleChecker {
    private parser: p.CMakeParser;
    private stats: Statistics;
    private rules: Rule[] = [];

    constructor(private logger: Logger, private ruleLogger: Logger, private config: IOptions) {
// should use its own, logger
        this.parser = new p.CMakeParser();
        this.stats = new Statistics();

        this.config.rules.forEach( (rule) => {
            this.rules.push(new Rule(rule));
        });
    }

    public async check(file: string) {
        try {
            const c = await rf(file);
            this.stats.checkedFiles++;
            const cm: CMakeFile = this.parser.parse(c.toString(), file);
            if (this.config.writeJSON) {
                cm.writeJSON();
            }
            let results: string[]|undefined;

            this.rules.forEach( (rule) => {
                const result = rule.check(cm);
                if (result) {
                    if (!results) {
                        results = [];
                    }
                    results = results.concat(this.formatMessages(cm, result, rule));
                }
            });

            if (results) {
                if (results.length === 0) {
                    this.stats.cleanFiles++;
                    this.logger.verbose(`${cm.filename} is clean`);
                } else {
                    results.forEach( (message) => {
                        this.ruleLogger.warn(message);
                    });
                    this.stats.dirtyFiles++;
                    this.logger.verbose(`${cm.filename} has ${results.length} warnings`);
                }
            } else {
                this.stats.ignoredFiles++;
                this.logger.verbose(`${cm.filename} is ignored`);
            }

        } catch (error) {
            if (error.name === "SyntaxError") {
                this.logger.error(`${file}:${error.location.start.line} ${error.message}`);
            }
            this.logger.error(error.message);
        }

    }

    public logSummary() {
        this.logger.info(`Checked ${this.stats.checkedFiles} files`);
        this.logger.info(`${this.stats.cleanFiles} files are clean`);
        this.logger.info(`${this.stats.dirtyFiles} files have warnings`);
        this.logger.info(`${this.stats.ignoredFiles} files are ignored`);
    }

    private formatMessages(cm: CMakeFile, results: FailedCheck[], r: Rule): string[] {
        const result: string[] = [];
        results.forEach( (fc: FailedCheck) => {
            let line: number = -1;
            if (fc.location) {
                line = fc.location.start.line;
            }
            result.push(
                `${cm.filename} (${line}): ${r.id} - ${fc.message}`,
            );
        });
        return result;
    }

}
