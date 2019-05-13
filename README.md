[WIP] Simple client for [Go WebAuthn](https://github.com/duo-labs/webauthn) powered servers.

# WIP Project

It is not tested in any means yet.

# Synopsis (typescript)

```ts
import {Client} from 'webauthn-client';

const cl = new Client({
    // endpoint to retrieve credential creation options for registration
    beginReg: '/webauthn/register/request',
    // endpoint to submit attestation
    confirmReg: '/webauthn/register/verify',
    // endpoint to retrieve credential creation options for login
    beginAuth: '/webauthn/login/request',
    // endpoint to submit assertion
    confirmAuth: '/webauthn/login/verify',
    // api server hostname. BE AWARE! webauthn ONLY work in secure site (https)
    // You should leave this empty in most case.
    host: 'https://example.com',
});

interface MyRegResp {
  msg: string;
}

try {
    const resp = await cl.register<MyRegResp>({
      myData: 1,
      someOtherData: [2, 3, 4],
    });
    
    alert(resp.msg);
} catch (e) {
    alert("cannot register: " + e);
}
```

# APIs

- register: Registers a new credential for the user. Submits custom data to `beginReg` endpoint, and returns data received from `confirmReg` endpoint.
- login: Authenticates the user with previously registered credential. Submits custom data to `beginAuth` endpoint, and returns data received from `confirmAuth` endpoint.
- isSupported: See if current browser supports WebAuthn.

# License

Copyright (c) 2019 Ronmi Ren <ronmi.ren@gmail.com>

Licensed under the MPL-2.0 license.
