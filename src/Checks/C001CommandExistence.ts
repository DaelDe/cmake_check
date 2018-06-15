import jsonata from "jsonata";
import { CMakeFile } from "../Parser/CMakeFile";
import { Command } from "../Parser/Command";
import { FailedCheck, IChecker, ILocation } from "./IChecker";

export interface ICommandCheck {
    name: string;
    /** number of expected occurences of command; not checked if not available */
    occurences?: number;
}

export interface ICM001Config {
    commands: ICommandCheck[];
}

interface IC001Intermediate {
    /** the configured command to check */
    cCommand: ICommandCheck;
    /** the compiled query for the check */
    qCommand: jsonata.Expression;

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
                    qCommand: jsonata(`$[type='command' and $contains(name, /${com.name}/)
                                       and $not(args[name='ALIAS'])]`),
                },
            );
        });
    }

    public check(cm: CMakeFile): FailedCheck[] {
        // const count: Map<string, Command[]> = new Map<string, Command[]>();
        const result: FailedCheck[] = [];

        this.temp.forEach((tmp: IC001Intermediate) => {
            let res = tmp.qCommand.evaluate(cm.obj);
            const com = tmp.cCommand;

            // reduce result set by filters

            // workaround for jsonata bug, we always want the result as array
            res = Array.isArray(res) ? res : [res];
            if (res[0] === undefined) {
                // does not exist
                if (!("occurences" in com) || com.occurences as number > 0) {
                    const message: string =
                        `expected calls to ${com.name}`;
                    result.push(new FailedCheck(undefined, com.name, message
                        , { occurences: 0 }, { occurences: com.occurences }));
                }
            } else if ("occurences" in com) {
                if ("occurences" in com && com.occurences !== res.length) {
                    let loc: ILocation | undefined;
                    if (com.occurences as number < res.length) {
                        // location of the warning is the first command that violates
                        loc = res[com.occurences as number].loc;
                    } else if (com.occurences as number > res.length) {
                        // location of the warning is end of file because more matches have been expected
                        loc = {
                            end: { offset: 0, line: cm.numLines, column: 0 },
                            start: { offset: 0, line: cm.numLines, column: 0 },
                        };
                    }

                    const message: string =
                        `expected ${com.occurences} occurences of ${com.name}, but got ${res.length}`;
                    result.push(new FailedCheck(loc, com.name, message
                        , { occurences: com.occurences }, { occurences: res.length }));
                }
            }
        });

        return result;
    }
}
