
enum ArgumentType {
    quoted,
    unquoted,
    bracket,
}

export interface Argument {
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

    public argument(name: string): Argument|undefined {
        return this.c.args.find( (el: any) => {
            if ( el.type === "argument" && el.name === name ) {
                return el;
            } else {
                return undefined;
            }
        });
    }

    get arguments(): Argument[] {
        return this.c.args.filter( (el: any) => {
            if ( el.type === "argument") {
                return el;
            }
        });
    }

    get location(): Location {
        return this.c.location;
    }
}
