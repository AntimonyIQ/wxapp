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

import { Platform } from 'react-native';
import JWT from '@/cryptography/jwt';
import { DecodedToken, UserData } from "@/interface/interface";
import logger from '@/logger/logger';

let Storage: any;

// Ensure localStorage is only used in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

if (Platform.OS === 'web' && isBrowser) {
    Storage = {
        getItem: async ({ key }: { key: string }) => {
            return Promise.resolve(localStorage.getItem(key));
        },
        setItem: async ({ key, value }: { key: string; value: string }) => {
            localStorage.setItem(key, value);
            return Promise.resolve();
        },
        removeItem: async ({ key }: { key: string }) => {
            localStorage.removeItem(key);
            return Promise.resolve();
        }
    };
} else {
    Storage = require('expo-storage').default;
}

class SessionManager {
    private isLoggedIn: boolean;
    private userData: UserData | any;
    private secretKey: string;
    private storageKey: string;
    private expiresTimer: number;

    constructor(secretKey: string) {
        this.isLoggedIn = false;
        this.userData = {};
        this.secretKey = secretKey;
        this.storageKey = 'session';
        this.expiresTimer = 525600;

        // Prevent session load in server-side/SSR environments
        if (isBrowser || Platform.OS !== 'web') {
            this.loadSession();
        }
    }

    private async loadSession(): Promise<void> {
        try {
            const storedToken = await Storage.getItem({ key: this.storageKey });
            if (storedToken) {
                const decodedToken = JWT.decode(storedToken, this.secretKey) as DecodedToken;
                if (decodedToken && typeof decodedToken === 'object') {
                    const { isLoggedIn, userData, exp } = decodedToken;
                    this.isLoggedIn = isLoggedIn;
                    this.userData = userData;

                    const currentTime = Math.floor(Date.now() / 1000);
                    if (exp && exp < currentTime) {
                        logger.error('Token has expired. Clearing from storage.');
                        await Storage.removeItem({ key: this.storageKey });
                    }
                } else {
                    throw new Error('Invalid token data');
                }
            }
        } catch (error) {
            logger.error('Failed to load session:', (error as Error).message);
            await Storage.removeItem({ key: this.storageKey });
        }
    }

    private async saveSession(): Promise<void> {
        try {
            const expiresInMinutes = this.expiresTimer;
            const token = JWT.encode(
                { isLoggedIn: this.isLoggedIn, userData: this.userData },
                this.secretKey,
                expiresInMinutes
            );
            await Storage.setItem({
                key: this.storageKey,
                value: token
            });
        } catch (error) {
            logger.error('Failed to save session:', (error as Error).message);
        }
    }

    public async login(userData: UserData): Promise<void> {
        this.isLoggedIn = true;
        this.userData = userData;
        await this.saveSession();
    }

    public async logout(): Promise<void> {
        this.isLoggedIn = false;
        this.userData = {};
        await Storage.removeItem({ key: this.storageKey });
    }

    public checkLoggedIn(): boolean {
        return this.isLoggedIn;
    }

    public getUserData(): UserData {
        return this.userData;
    }

    public async updateSession(userData: UserData): Promise<void> {
        if (this.isLoggedIn) {
            this.userData = { ...this.userData, ...userData };
            await this.saveSession();
        } else {
            logger.error('Cannot update session. User is not logged in.');
        }
    }

    public async updateSessionKey(key: string, value: any): Promise<void> {
        if (this.isLoggedIn) {
            if (this.userData.hasOwnProperty(key)) {
                this.userData[key] = value;
                await this.saveSession();
            } else {
                logger.error(`Key '${key}' does not exist in userData.`);
            }
        } else {
            logger.error('Cannot update session. User is not logged in.');
        }
    }
}

const secretKey = 'PeMI3dz69XUmS1GL4FE2fw';
const sessionManager = new SessionManager(secretKey);

export default sessionManager;
