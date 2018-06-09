import CMakeFile from "../Parser/CMakeFile";
import { Command } from "../Parser/Command";
import {CheckerResultBase, IChecker, ILocation} from "./IChecker";

interface ICommandCheck {
    name: string;
    /** number of expected occurences of command; not checked if not available */
    occurences?: number;
}

interface ICM001Config {
    commands: ICommandCheck[];
}

class C001Result extends CheckerResultBase {
    constructor( loc: ILocation) {
        super(loc);
    }
}

// tslint:disable-next-line:max-classes-per-file
export class C001 implements IChecker {
    private config: ICM001Config;

    constructor( c: ICM001Config) {
        this.config = c;
    }

    public check(cm: CMakeFile): C001Result[] {
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

//        console.log(count);
//        console.log(this.config.commands);
        // check for occurences
        this.config.commands.forEach( (com: ICommandCheck) => {
            if (count.has(com.name)) {
                // exists!
                if ("occurences" in com) {
                    // check occurences
                    if (com.occurences !== (count.get(com.name) as Command[]).length) {
                        console.log(`false - ncount`);
                    }
                }
            } else {
                // does not exist
                // if occurences is !=0
                console.log("false - nexist");
            }
        });
        return [];
    }
}
