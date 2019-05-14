import * as base64 from 'base64-arraybuffer';

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

const defaultEndpoints = {
    host: '',
    beginReg: '/register/challenge',
    confirmReg: '/register/verify',
    beginAuth: '/login/challenge',
    confirmAuth: '/login/verify',
}

async function post<T>(uri: string, body?: any): Promise<T> {
    body = body || {};
    const resp = await fetch(uri, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (resp.status != 200) {
        throw new Error('server returns ' + resp.status + ' for ' + uri);
    }

    return await resp.json() as T;
}

async function beginReg(uri: string, userData?: any): Promise<PublicKeyCredentialCreationOptions> {
    const resp = await post<any>(uri, userData);
    resp.challenge = base64.decode(resp.challenge);
    resp.user.id = base64.decode(resp.user.id);
    return resp as PublicKeyCredentialCreationOptions;
}

async function beginLogin(uri: string, userData?: any): Promise<PublicKeyCredentialRequestOptions> {
    const resp = await post<any>(uri, userData);
    resp.challenge = base64.decode(resp.challenge);
    for (const c of resp.allowCredentials) {
        c.id = base64.decode(c.id);
    }

    return resp as PublicKeyCredentialRequestOptions;
}

const CC = (navigator as any).credentials as CredentialsContainer

function prepareJson(data: any): any {
    if (ArrayBuffer.isView(data)) {
        return data.buffer;
    }

    if (data instanceof ArrayBuffer) {
        return base64.encode(data);
    }

    if (data instanceof Array) {
        const ret = [] as any[];
        for (const item of data) {
            ret.push(prepareJson(item));
        }

        return ret;
    }

    if (data instanceof Object) {
        const ret = {} as any;
        for (const key in data) {
            ret[key] = prepareJson(key);
        }

        return ret;
    }

    return data;
}

export function isSuported(): boolean {
    return !!navigator && !!CC && !!CC.get && !!CC.create;
}


class Base {
    protected opt: Option;

    public constructor(ep?: Endpoints) {
        this.opt = Object.assign({}, defaultEndpoints, ep);
    }

    protected uri(ep: string): string {
        if (!!this.opt.host) {
            return this.opt.host+ep;
        }
        return ep;
    }
}

export class Register extends Base {
    public async register<T>(userData?: any): Promise<T> {
        const publicKey = await beginReg(this.uri(this.opt.beginReg), userData);
        const cred = await CC.create({ publicKey });
        if (!!cred) {
            throw new Error('cannot generate new credential');
        }
        return await post<T>(this.uri(this.opt.confirmReg), prepareJson(cred));
    }
}

export class Auth extends Base {
    public async login<T>(userData?: any): Promise<T> {
        const publicKey = await beginLogin(this.uri(this.opt.beginAuth), userData);
        const cred = await CC.get({ publicKey });
        if (!!cred) {
            throw new Error('cannot generate new credential');
        }
        return await post<T>(this.uri(this.opt.confirmAuth), prepareJson(cred));
    }
}

export class Client {
    private auth: Auth;
    private reg: Register;

    public constructor(ep?: Endpoints) {
        this.auth = new Auth(ep);
        this.reg = new Register(ep);
    }

    public async register<T>(userData?: any): Promise<T> {
        return await this.reg.register<T>(userData);
    }

    public async login<T>(userData?: any): Promise<T> {
        return await this.auth.login<T>(userData);
    }
}