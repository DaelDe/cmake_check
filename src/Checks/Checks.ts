import {C001, ICM001Config} from "./C001CommandExistence";
// import {C002, ICM002Config} from "./C002CommandOrder";
import {C003, ICM003Config} from "./C003CommandWhitelist";
import * as icheck from "./IChecker";

export {IChecker, FailedCheck} from "./IChecker";

const Store: any = {
    C001,
    // C002,
    C003,
};

export function createCheck(checker: string, config: object): icheck.IChecker {
    if (Store[checker] === undefined || Store[checker] === null) {
        throw new Error(`Checker type of \'${checker}\' does not exist`);
    }
    return new Store[checker](config);
}
