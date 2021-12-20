import { Rules } from 'async-validator';

declare module 'egg' {
    export interface Context {
        validate: (descriptor: Rules, data?: any) => any;
    }
}
