import * as checks from "../Checks/IChecker";
import {CMakeFile} from "../Parser/CMakeFile";

export class Rule {
    private checks: checks.IChecker[] = [];
    private results: checks.FailedCheck[] = [];

    constructor( private ID: string, private NAME: string ) {}

    public get id() {
        return this.ID;
    }

    public get name() {
        return this.NAME;
    }

    public addCheck(c: checks.IChecker): void {
        this.checks.push(c);
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
