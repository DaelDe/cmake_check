import CMakeFile from "../Parser/CMakeFile";

export interface ICursor {
    offset: number;
    line: number;
    column: number;
}
export interface ILocation {
    start: ICursor;
    end: ICursor;
}

export class CheckerResultBase {
    public location: ILocation;

    constructor( loc: ILocation) {
        this.location = loc;
    }
}

export interface IChecker {
    check(cm: CMakeFile): CheckerResultBase[];
}
