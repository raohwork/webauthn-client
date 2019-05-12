"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const base64 = __importStar(require("base64-arraybuffer"));
const defaultEndpoints = {
    host: '',
    beginReg: '/egister/challenge',
    confirmReg: '/register/verify',
    beginAuth: '/login/challenge',
    confirmAuth: '/login/verify',
    logout: '/logout',
};
function post(uri, body) {
    return __awaiter(this, void 0, void 0, function* () {
        body = body || {};
        const resp = yield fetch(uri, {
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
        return yield resp.json();
    });
}
function get(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield fetch(uri, {
            method: 'GET',
            credentials: 'include',
        });
        if (resp.status != 200) {
            throw new Error('server returns ' + resp.status + ' for ' + uri);
        }
        return yield resp.json();
    });
}
function beginReg(uri, userData) {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield post(uri, userData);
        resp.challenge = base64.decode(resp.challenge);
        resp.user.id = base64.decode(resp.user.id);
        return resp;
    });
}
function beginLogin(uri, userData) {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield post(uri, userData);
        resp.challenge = base64.decode(resp.challenge);
        for (const c of resp.allowCredentials) {
            c.id = base64.decode(c.id);
        }
        return resp;
    });
}
const CC = navigator.credentials;
function prepareJson(data) {
    if (ArrayBuffer.isView(data)) {
        return data.buffer;
    }
    if (data instanceof ArrayBuffer) {
        return base64.encode(data);
    }
    if (data instanceof Array) {
        const ret = [];
        for (const item of data) {
            ret.push(prepareJson(item));
        }
        return ret;
    }
    if (data instanceof Object) {
        const ret = {};
        for (const key in data) {
            ret[key] = prepareJson(key);
        }
        return ret;
    }
    return data;
}
class Client {
    constructor(ep) {
        this.opt = Object.assign({}, defaultEndpoints, ep);
    }
    uri(ep) {
        if (!!this.opt.host) {
            return this.opt.host + ep;
        }
        return ep;
    }
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const publicKey = yield beginReg(this.uri(this.opt.beginReg), userData);
            const cred = yield CC.create({ publicKey });
            if (!!cred) {
                throw new Error('cannot generate new credential');
            }
            return yield post(this.uri(this.opt.confirmReg), prepareJson(cred));
        });
    }
    login(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const publicKey = yield beginLogin(this.uri(this.opt.beginAuth), userData);
            const cred = yield CC.get({ publicKey });
            if (!!cred) {
                throw new Error('cannot generate new credential');
            }
            return yield post(this.uri(this.opt.confirmAuth), prepareJson(cred));
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            return get(this.uri(this.opt.logout));
        });
    }
}
exports.Client = Client;
