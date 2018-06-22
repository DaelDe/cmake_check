export interface ICheck {
    id: string;
    config: object;
}

export interface IRule {
    id: string;
    name: string;
    appliesTo: string;
    checks: ICheck[];
}
