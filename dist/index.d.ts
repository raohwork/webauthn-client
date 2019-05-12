export interface Endpoints {
    host?: string;
    beginReg?: string;
    confirmReg?: string;
    beginAuth?: string;
    confirmAuth?: string;
    logout?: string;
}
export interface Option {
    host: string;
    beginReg: string;
    confirmReg: string;
    beginAuth: string;
    confirmAuth: string;
    logout: string;
}
export declare class Client {
    private opt;
    constructor(ep?: Endpoints);
    private uri;
    register<T>(userData?: any): Promise<T>;
    login<T>(userData?: any): Promise<T>;
    logout<T>(): Promise<T>;
}
