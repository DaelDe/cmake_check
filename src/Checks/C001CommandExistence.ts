import { CMakeFile } from "../Parser/CMakeFile";
import { Command } from "../Parser/Command";
import { FailedCheck, IChecker, ILocation } from "./IChecker";

export interface ICommandCheck {
    name: string;
    /**
     * number of expected occurences of command; not checked if not available
     * it can be a number or number with postfix '+' for occurences >= given number
     */
    occurences: string;
}

export interface ICM001Config {
    commands: ICommandCheck[];
}

interface IC001Intermediate {
    /** the configured command to check */
    cCommand: ICommandCheck;
    /** the compiled query for the check */
    commands: Command[];

}

// tslint:disable-next-line:max-classes-per-file
export class C001 implements IChecker {
    private config: ICM001Config;
    private temp: IC001Intermediate[] = [];

    constructor(c: ICM001Config) {
        this.config = c;

        // compile needed queries
        this.config.commands.forEach((com: ICommandCheck) => {
            this.temp.push(
                {
                    cCommand: com,
                    commands: [],
                },
            );
        });
    }

    public check(cm: CMakeFile): FailedCheck[] {
        const result: FailedCheck[] = [];
        this.temp.forEach((tmp: IC001Intermediate) => {
            tmp.commands = [];
            cm.commands(new RegExp(tmp.cCommand.name)).filter((com: Command) => {
        // add nargs and args to config
                if (!com.argument("ALIAS")) {
                    tmp.commands.push(com);
                }
            });

            // evaluate
            if (tmp.commands.length === 0) {
                // does not exist
                if (!("occurences" in tmp.cCommand) || !this.occured(tmp.cCommand.occurences, 0) ) {
                    const message: string =
                        `expected calls to ${tmp.cCommand.name}`;
                    result.push(new FailedCheck(undefined, tmp.cCommand.name, message
                        , { occurences: 0 }, { occurences: tmp.cCommand.occurences }));
                }
            } else {
                if ("occurences" in tmp.cCommand) {
                    const r = this.occured(tmp.cCommand.occurences, tmp.commands.length);
                    if ( r !== 0 ) {
                        let loc: ILocation | undefined;
                        if (r === -1) {
                            // location of the warning is the first command that violates
                            loc = tmp.commands[this.numOccurence(tmp.cCommand.occurences)].location;
                        } else  {
                            // location of the warning is end of file because more matches have been expected
                            loc = {
                                end: { offset: 0, line: cm.numLines, column: 0 },
                                start: { offset: 0, line: cm.numLines, column: 0 },
                            };
                        }

                        const message: string =
                            // tslint:disable-next-line:max-line-length
                            `expected ${tmp.cCommand.occurences} occurences of ${tmp.cCommand.name}, but got ${tmp.commands.length}`;
                        result.push(new FailedCheck(loc, tmp.cCommand.name, message
                            , { occurences: tmp.cCommand.occurences }, { occurences: tmp.commands.length }));
                    }
                }
            }
        });

        return result;
    }

    private numOccurence(occ: string): number {
        return occ.endsWith("+") ? parseInt( occ.substr(0, occ.length - 1), 10) : parseInt(occ, 10);
    }

    private occured(expected: string, actual: number): number {
        const exp: number = this.numOccurence(expected);
        if (expected.endsWith("+")) {
            return  exp <= actual ? 0 : 1;
        } else {
            return exp === actual ? 0 : exp < actual ? -1 : 1;
        }
    }

    // public check(cm: CMakeFile): FailedCheck[] {
    //     // const count: Map<string, Command[]> = new Map<string, Command[]>();
    //     const result: FailedCheck[] = [];

    //     this.temp.forEach((tmp: IC001Intermediate) => {
    //         let res = tmp.qCommand.evaluate(cm.obj);
    //         const com = tmp.cCommand;

    //         // workaround for jsonata bug, we always want the result as array
    //         res = Array.isArray(res) ? res : [res];
    //         if (res[0] === undefined) {
    //             // does not exist
    //             if (!("occurences" in com) || com.occurences as number > 0) {
    //                 const message: string =
    //                     `expected calls to ${com.name}`;
    //                 result.push(new FailedCheck(undefined, com.name, message
    //                     , { occurences: 0 }, { occurences: com.occurences }));
    //             }
    //         } else if ("occurences" in com) {
    //             if ("occurences" in com && com.occurences !== res.length) {
    //                 let loc: ILocation | undefined;
    //                 if (com.occurences as number < res.length) {
    //                     // location of the warning is the first command that violates
    //                     loc = res[com.occurences as number].loc;
    //                 } else if (com.occurences as number > res.length) {
    //                     // location of the warning is end of file because more matches have been expected
    //                     loc = {
    //                         end: { offset: 0, line: cm.numLines, column: 0 },
    //                         start: { offset: 0, line: cm.numLines, column: 0 },
    //                     };
    //                 }

    //                 const message: string =
    //                     `expected ${com.occurences} occurences of ${com.name}, but got ${res.length}`;
    //                 result.push(new FailedCheck(loc, com.name, message
    //                     , { occurences: com.occurences }, { occurences: res.length }));
    //             }
    //         }
    //     });

    //     return result;
    // }
}
