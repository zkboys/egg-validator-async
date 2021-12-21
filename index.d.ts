import { Rules } from 'async-validator';

declare module 'egg' {
    export interface Context {
        validate: (descriptor: Rules, data?: any) => any;
    }

    export interface Application {
        validator: {
            addRule: (type: string, rule: any) => any;
            addRules: (rules: any) => any;
        };
    }
}
