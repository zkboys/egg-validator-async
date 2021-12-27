import { InternalRuleItem, RuleType, SyncValidateResult, ValidateOption, Value, Values } from "async-validator";

export interface RuleItem {
    type?: RuleType | string; // 这个可以是自定义string
    required?: boolean;
    pattern?: RegExp | string;
    min?: number;
    max?: number;
    len?: number;
    enum?: Array<string | number | boolean | null | undefined>;
    whitespace?: boolean;
    fields?: Record<string, Rule>;
    options?: ValidateOption;
    defaultField?: Rule;
    transform?: (value: Value) => Value;
    message?: string | ((a?: string) => string);
    asyncValidator?: (rule: InternalRuleItem, value: Value, callback: (error?: string | Error) => void, source: Values, options: ValidateOption) => void | Promise<void>;
    validator?: (rule: InternalRuleItem, value: Value, callback: (error?: string | Error) => void, source: Values, options: ValidateOption) => SyncValidateResult | void;
}

export declare type Rule = RuleItem | RuleItem[];

declare type Rules = Record<string, Rule | RuleType | string>; // rule 可以是type的简写方式

declare module 'egg' {
    export interface Context {
        validate: (descriptor: Rules, data?: any) => Promise<any>;
    }

    export interface Application {
        validator: {
            addRule: (type: string, rule: RuleItem) => void;
            addRules: (rules: Rules) => void;
            validate: (descriptor: Rules, data?: any) => Promise<any>;
            rules: Rules,
        };
    }
}
