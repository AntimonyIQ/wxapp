// This is part for the Wealthx Mobile Application.
// Copyright © 2023 WealthX. All rights reserved.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';

export default class JWT {
    static encode(payload: Record<string, any>, secretKey: string, expiresInMinutes: number): string {
        const currentTime = Math.floor(Date.now() / 1000);
        const expirationTime = currentTime + (expiresInMinutes * 60);
        payload.exp = expirationTime;

        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };
        const encodedHeader = this.base64urlEncode(JSON.stringify(header));
        const encodedPayload = this.base64urlEncode(JSON.stringify(payload));
        const signature = this.hmacSHA256(`${encodedHeader}.${encodedPayload}`, secretKey);
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    static decode(token: string, secretKey: string): Record<string, any> {
        const [encodedHeader, encodedPayload, signature] = token.split('.');
        const payload = JSON.parse(this.base64urlDecode(encodedPayload));
        const expectedSignature = this.hmacSHA256(`${encodedHeader}.${encodedPayload}`, secretKey);

        if (signature !== expectedSignature) {
            throw new Error('Invalid signature');
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
            throw new Error('Token has expired');
        }

        return payload;
    }

    static base64urlEncode(str: string): string {
        return Buffer.from(str).toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    static base64urlDecode(str: string): string {
        const base64String = str.replace(/-/g, '+').replace(/_/g, '/');
        return Buffer.from(base64String, 'base64').toString('utf-8');
    }

    static hmacSHA256(data: string, key: string): string {
        return CryptoJS.HmacSHA256(data, key).toString(CryptoJS.enc.Base64)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
}
