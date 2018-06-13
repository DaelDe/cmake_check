import {Logger} from "winston";
import {FailedCheck} from "../Checks/IChecker";
import * as conf from "../Configuration";
import {CMakeFile, FileType} from "../Parser/CMakeFile";
import {Rule} from "./Rule";

export {FileType};

export class RuleSet {
    private rules: Rule[] = [];
    private results: string[] = [];

    constructor(private config: conf.IRuleSet, private logger: Logger) {
        this.config.rules.forEach( (rule: conf.IRule) => {
            this.rules.push( new Rule(rule) );
        });
    }

    /**
     *
     * @param cm the CMakeFile to check
     */
    public check(cm: CMakeFile): string[] {
        // only apply the rules when the file type matches
//        console.log(FileType[cm.type()]);
//        console.log(this.config.appliesTo);
        if (!cm.type || this.config.appliesTo !== FileType[cm.type()] ) {
            this.logger.warn(`${cm.filename} is not a ${this.config.appliesTo.toString()}`);
            return [];
        }

        let  results: string[] = [];
        this.rules.forEach( (r) => {
            results = results.concat(this.formatMessages(cm, r.check(cm), r ));
        });

        return results;
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
