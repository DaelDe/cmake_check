import * as checks from "../Checks/Checks";
import * as conf from "../Configuration";
import {CMakeFile} from "../Parser/CMakeFile";

export class Rule {
    private checks: checks.IChecker[] = [];
    private results: checks.FailedCheck[] = [];

    constructor( private config: conf.IRule ) {
        this.config.checks.forEach( (check: conf.ICheck) => {
            this.checks.push(checks.createCheck(check.id, check.config));
        });
    }

    public get id() {
        return this.config.id;
    }

    public get name() {
        return this.config.name;
    }

    public check(cm: CMakeFile): checks.FailedCheck[] {
        this.results = [];
        this.checks.forEach( (c) => {
            this.results = this.results.concat(c.check(cm));
        });
        return this.results;
    }

}
