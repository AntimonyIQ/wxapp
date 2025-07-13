// This file is part of the Wealthex project.
// Copyright © 2023 paytec. All rights reserved.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


import secp256k1 from 'secp256k1';
import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';

const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
};

const hexToBytes = (hex: string): Uint8Array => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
};

const generateIV = (): CryptoJS.lib.WordArray => {
    const ivBytes: Uint8Array<ArrayBufferLike> = Crypto.getRandomBytes(16);
    const hex: string = Array.from(ivBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return CryptoJS.enc.Hex.parse(hex);
}

export default class Handshake {
    static generate(): { privateKey: string; publicKey: string } {
        try {
            let privateKey: Uint8Array;
            do {
                privateKey = new Uint8Array(32);
                Crypto.getRandomValues(privateKey);
            } while (!secp256k1.privateKeyVerify(privateKey));

            const publicKey = secp256k1.publicKeyCreate(privateKey);
            return {
                privateKey: bytesToHex(privateKey),
                publicKey: bytesToHex(publicKey),
            };
        } catch (error) {
            console.error('Error generating key pair!', error);
            throw error;
        }
    }

    static generateFromPrivate(privateKeyHex: string): { privateKey: string; publicKey: string } {
        try {
            const privateKey = hexToBytes(privateKeyHex);
            if (!secp256k1.privateKeyVerify(privateKey)) {
                throw new Error('Invalid private key');
            }
            const publicKey = secp256k1.publicKeyCreate(privateKey);
            return {
                privateKey: privateKeyHex,
                publicKey: bytesToHex(publicKey),
            };
        } catch (error) {
            console.error('Error generating key pair from private key!', error);
            throw error;
        }
    }

    static secret(privateKeyHex: string, otherPublicKeyHex: string): string {
        try {
            const privateKey = hexToBytes(privateKeyHex);
            const publicKey = hexToBytes(otherPublicKeyHex);
            const shared = secp256k1.ecdh(publicKey, privateKey);
            return bytesToHex(shared);
        } catch (error) {
            console.error('Error generating shared secret!', error);
            throw error;
        }
    }

    static encrypt(message: string, sharedSecret: string): string {
        try {
            const key = sharedSecret.slice(0, 64);
            const keyWordArray = CryptoJS.enc.Hex.parse(key);
            const iv = generateIV();
            const encrypted = CryptoJS.AES.encrypt(message, keyWordArray, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            });
            return iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.ciphertext.toString(CryptoJS.enc.Hex);
        } catch (error) {
            console.error('Error encrypting message!', error);
            throw error;
        }
    }

    static decrypt(cipherTextWithIV: string, sharedSecret: string): string {
        try {
            const [ivHex, cipherText] = cipherTextWithIV.split(':');
            const key = sharedSecret.slice(0, 64);
            const keyWordArray = CryptoJS.enc.Hex.parse(key);
            const ivWordArray = CryptoJS.enc.Hex.parse(ivHex);
            const encryptedParams = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Hex.parse(cipherText) });

            const decrypted = CryptoJS.AES.decrypt(
                encryptedParams,
                keyWordArray,
                { iv: ivWordArray, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
            );
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Error decrypting message!', error);
            throw error;
        }
    }
}
