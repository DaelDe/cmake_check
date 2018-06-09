import CMakeFile from "../Parser/CMakeFile";
import { Command } from "../Parser/Command";
import {CheckerResultBase, IChecker, ILocation} from "./IChecker";

export enum CheckOrder {
    /** Commands must appear in given order without other commands or comments in between */
    STRICT,
    /** Commands must appear in given order without other commands or comments in between */
    RELAXED,
    /** The ordering is not checked at all. */
    NONE,
}

interface ICM002Config {
    commands: string[];
    order: CheckOrder;
}

class C002Result extends CheckerResultBase {
    constructor( loc: ILocation) {
        super(loc);
    }
}

// tslint:disable-next-line:max-classes-per-file
export class C002 implements IChecker {
    private config: ICM002Config;

    constructor( c: ICM002Config) {
        this.config = c;
    }

    public check(cm: CMakeFile): C002Result[] {
        const count: Map<string, Command[]> = new Map<string, Command[]>();
        // collect the commands
/*        cm.commands().forEach( (command: Command) => {
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
                console.log("false - nexist");
            }
        });*/
        return [];
    }
}
