import {CMakeFile} from "../Parser/CMakeFile";
import {Command} from "../Parser/Command";
import {FailedCheck, IChecker, ILocation} from "./IChecker";

export interface ICommandCheck {
    name: string;
    /** number of expected occurences of command; not checked if not available */
    occurences?: number;
}

export interface ICM001Config {
    commands: ICommandCheck[];
}

// tslint:disable-next-line:max-classes-per-file
export class C001 implements IChecker {
    private config: ICM001Config;

    constructor( c: ICM001Config) {
        this.config = c;
    }

    public check(cm: CMakeFile): FailedCheck[] {
        const count: Map<string, Command[]> = new Map<string, Command[]>();
        // collect the commands
        cm.commands().forEach( (command: Command) => {
            this.config.commands.forEach( (com: ICommandCheck) => {
                if ( com.name === command.name ) {
                    if (count.has(com.name)) {
                        (count.get(com.name) as Command[]).push(command);
                    } else {
                        count.set(com.name, [command]);
                    }
                }
            });
        });

        // check for occurences
        const result: FailedCheck[] = [];
        this.config.commands.forEach( (com: ICommandCheck) => {
            if (count.has(com.name)) {
                // exists!
                if ("occurences" in com) {
                    // check occurences
                    const actual = count.get(com.name) as Command[];
                    if ( "occurences" in com && com.occurences !== actual.length) {
                        let loc: ILocation|undefined;
                        if (com.occurences as number < actual.length) {
                            // location of the warning is the first command that violates
                            loc = actual[com.occurences as number].location;
                        } else if (com.occurences as number > actual.length) {
                            // location of the warning is end of file because more matches have been expected
                            loc = {start: {offset: 0, line: cm.numLines, column: 0},
                                   end: {offset: 0, line: cm.numLines, column: 0}};
                        }

                        //console.log(actual[com.occurences as number]);
                        const message: string =
                            `expected ${com.occurences} occurences of ${com.name}, but got ${actual.length}` ;
                        result.push(new FailedCheck(loc, com.name, message
                            , {occurences: com.occurences}, {occurences: actual.length}));
                    }
                }
            } else {
                // does not exist
                if (!("occurences" in com) || com.occurences as number > 0) {
                    const message: string =
                        `expected calls to ${com.name}`;
                    result.push(new FailedCheck(undefined, com.name, message
                        , {occurences: 0}, {occurences: com.occurences}));
                }
            }
        });
        return result;
    }
}
