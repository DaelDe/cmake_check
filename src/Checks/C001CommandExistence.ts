import CMakeFile from "../Parser/CMakeFile";
import { Command } from "../Parser/Command";
import {FailedCheck, IChecker, ILocation} from "./IChecker";

interface ICommandCheck {
    name: string;
    /** number of expected occurences of command; not checked if not available */
    occurences?: number;
}

interface ICM001Config {
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
                    const actual = (count.get(com.name) as Command[]).length;
                    if (com.occurences !== actual) {
                        result.push(new FailedCheck(undefined, com.name
                            , {occurences: com.occurences}, {occurences: actual}));
                    }
                }
            } else {
                // does not exist
                if (!("occurences" in com) || com.occurences as number > 0) {
                    result.push(new FailedCheck(undefined, com.name, {occurences: 0}, {occurences: com.occurences}));
                }
            }
        });
        return result;
    }
}
