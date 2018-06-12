import {Logger} from "winston";
import {FailedCheck} from "../Checks/IChecker";
import {CMakeFile, FileType} from "../Parser/CMakeFile";
import {Rule} from "./Rule";

export {FileType};

export class RuleSet {
    private rules: Rule[] = [];
    private results: string[] = [];

    constructor(public appliesTo: FileType, private logger: Logger) {}

    public addRule(r: Rule): void {
        this.rules.push(r);
    }

    /**
     *
     * @param cm the CMakeFile to check
     */
    public check(cm: CMakeFile): string[] {
        if (!cm.type || this.appliesTo !== cm.type()) {
            this.logger.warn(`${cm.filename} is not a ${this.appliesTo.toString()}`);
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
