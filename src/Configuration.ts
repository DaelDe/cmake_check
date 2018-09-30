export interface ICheck {
    id: string;
    config: object;
}

export interface IRule {
    id: string;
    name: string;
    severity: string;
    appliesTo: string[];
    enabled: boolean;
    checks: ICheck[];
}
