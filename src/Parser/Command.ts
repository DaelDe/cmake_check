import {ILocation} from "../Checks/IChecker";

enum ArgumentType {
    quoted,
    unquoted,
    bracket,
}

export interface IArgument {
    class: ArgumentType;
    name: string;
    location: Location;
}

export class Command {
    private c: any;

    constructor(cmd: any) {
        this.c = cmd;
    }

    get name(): string {
        return this.c.name;
    }

    public argument(name: string): IArgument|undefined {
        return this.c.args.find( (el: any) => {
            if ( el.type === "argument" && el.name === name ) {
                return el;
            } else {
                return undefined;
            }
        });
    }

    get arguments(): IArgument[] {
        return this.c.args.filter( (el: any) => {
            if ( el.type === "argument") {
                return el;
            }
        });
    }

    get location(): ILocation {
        return this.c.loc;
    }
}
