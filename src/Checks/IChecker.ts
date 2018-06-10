import CMakeFile from "../Parser/CMakeFile";
import { Command } from "../Parser/Command";

export interface ICursor {
    offset: number;
    line: number;
    column: number;
}
export interface ILocation {
    start: ICursor;
    end: ICursor;
}

export class FailedCheck {
    /**
     * @param location location where the check failed, undefined if no location applies
     * @param command command where the check failed, empty if the check is not related to a command
     * @param message a human readable description why the warning failed 
     */
    constructor(
          public location: ILocation|undefined
        , public command: string
        , public message: string
        , public expected: object
        , public actual: object) {
    }
}

export interface IChecker {
    check(cm: CMakeFile): FailedCheck[];
}
