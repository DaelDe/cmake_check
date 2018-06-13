import * as test from "../Checks/C001CommandExistence";
import * as checks from "../Checks/IChecker";
import * as conf from "../Configuration";
import {CMakeFile} from "../Parser/CMakeFile";

export class Rule {
    private checks: checks.IChecker[] = [];
    private results: checks.FailedCheck[] = [];

    constructor( private config: conf.IRule ) {
        this.config.checks.forEach( (check: conf.ICheck) => {
            this.checks.push(new test.C001(check.config as test.ICM001Config));
    // TODO: create tests from string, factory
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
            // handle results
            // consider to build a message in the check
            this.results = this.results.concat(c.check(cm));
        });
        return this.results;
    }

}
