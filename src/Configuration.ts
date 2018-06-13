export interface ICheck {
    id: string;
    config: object;
}

export interface IRule {
    id: string;
    name: string;
    checks: ICheck[];
}

export interface IRuleSet {
    appliesTo: string;
    rules: IRule[];
}

export class Configuration {
    // schema laden
    // config file laden
    // regel-configs bereitstellen
}
