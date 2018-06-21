import { CMakeFile } from "../Parser/CMakeFile";
import { Command } from "../Parser/Command";
import { FailedCheck, IChecker, ILocation } from "./IChecker";

export interface ICM003Config {
    commands: string[];
}

// tslint:disable-next-line:max-classes-per-file
export class C003 implements IChecker {
    constructor(private c: ICM003Config) {
    }

    public check(cm: CMakeFile): FailedCheck[] {
        const result: FailedCheck[] = [];

        cm.commands().forEach( (c) => {
            if (!this.c.commands.includes(c.name.toLowerCase())) {
                const message: string =
                    `calls to ${c.name} are not allowed by whitelist`;
                result.push(new FailedCheck(c.location, c.name, message, {}, {}));
            }
        });

        return result;
    }

}
