import * as checks from "../Checks/Checks";
import * as conf from "../Configuration";
import {CMakeFile, FileType} from "../Parser/CMakeFile";

export class Rule {
    private checks: checks.IChecker[] = [];
    private results: checks.FailedCheck[] = [];

    constructor( private config: conf.IRule ) {
        this.config.checks.forEach( (check: conf.ICheck) => {
            this.checks.push(checks.createCheck(check.id, check.config));
        });
    }

    public get id(): string {
        return this.config.id;
    }

    public get name(): string {
        return this.config.name;
    }

    public get appliesTo(): string[] {
        return this.config.appliesTo;
    }

    public get enabled(): boolean {
        return this.config.enabled;
    }

    public check(cm: CMakeFile): checks.FailedCheck[]|undefined {
        if (!cm.type || !this.config.appliesTo.includes(FileType[cm.type()]) ) {
            return undefined;
        }

        this.results = [];
        this.checks.forEach( (c) => {
            this.results = this.results.concat(c.check(cm));
        });
        return this.results;
    }

}
