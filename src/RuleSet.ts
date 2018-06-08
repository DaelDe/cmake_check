import CMakeFile from "./Parser/CMakeFile";

export enum RuleSeverity {
    info, // failure is informational only
    warning, // failure is indicated as warning
}

// base class for rule configuration
export interface IRuleConfig {
    name: string;
    severity: RuleSeverity;
}

export enum RuleClass {
    style,
    convention,
    readability,
    whitespace,
    syntax,
}

// base class for specific rules
export abstract class Rule {
    abstract get class(): RuleClass;
    abstract get severity(): RuleSeverity;

    public abstract check( cmake: CMakeFile ): boolean;
}

// logs events from rules, fails
interface Reporting {
    // all fails with location and description
}

// read from JSON, object with same member
interface IExampleRuleConfig extends IRuleConfig {
}

class ExampleRule extends Rule{
    get class(): RuleClass{
        return RuleClass.style;
    }

    get severity(): RuleSeverity{
        return RuleSeverity.warning;
    }

    check( cmake: CMakeFile ):boolean{
        return true;
    }
    
}

export class RuleSet{
    // add rule
    // check_all rules

}