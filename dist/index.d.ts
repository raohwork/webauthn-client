export interface Endpoints {
    host?: string;
    beginReg?: string;
    confirmReg?: string;
    beginAuth?: string;
    confirmAuth?: string;
}
export interface Option {
    host: string;
    beginReg: string;
    confirmReg: string;
    beginAuth: string;
    confirmAuth: string;
}
export declare function isSupported(): boolean;
declare class Base {
    protected opt: Option;
    constructor(ep?: Endpoints);
    protected uri(ep: string): string;
}
export declare class Register extends Base {
    register<T>(userData?: any): Promise<T>;
}
export declare class Auth extends Base {
    login<T>(userData?: any): Promise<T>;
}
export declare class Client {
    private auth;
    private reg;
    constructor(ep?: Endpoints);
    register<T>(userData?: any): Promise<T>;
    login<T>(userData?: any): Promise<T>;
}
export {};
