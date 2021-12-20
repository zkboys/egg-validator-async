declare module 'egg' {
    export interface Context {
        validate: (descriptor: any, data?: any) => any;
    }
}
