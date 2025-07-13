// This file is part of the Wealthx project.
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

import Handshake from "@/handshake/handshake";
import { IMarket, IWallet, UserData } from "@/interface/interface";
import sessionManager from "@/session/session";
import * as Network from 'expo-network';
import Toast, { ToastType } from "react-native-toast-message";

export default class Defaults {
    constructor() { }

    public static readonly PROJECT_NAME = "WealthX";
    public static readonly DECIMAL = 4;
    public static readonly MAX_DECIMAL = 18;
    public static readonly MIN_DECIMAL = 2;
    public static readonly PACKAGE_NAME = "com.wealthx.wallet";
    public static readonly ZERO_PERCENT = "0.0%";
    public static readonly ZERO_BALANCE = "0.00";
    public static readonly API = "https://api.v3.wealthx.app/api/v2"; // "http://localhost:5500/api/v2";
    public static readonly API_V3 = "https://api.wealthx.app/api/v3";
    public static readonly COIN_MARKET_CAP_API = "https://pro-api.coinmarketcap.com";
    public static readonly COIN_MARKET_CAP_KEY = "dbf24205-e0c0-4a10-9e26-901d183e1fa1";

    public static readonly HEADERS: { [key: string]: string } = {
        "Accept": "*/*",
        "Content-Type": "application/json",
    };

    public static FORMAT_DATE(dateString: string | number): string {
        let date: Date;

        if (!isNaN(Number(dateString))) {
            date = new Date(parseInt(dateString as string) * 1000);
        } else {
            date = new Date(dateString);
        }

        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';

        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        return `${month} ${day}, ${year} ${hours}:${minutes}${ampm}`;
    }

    public static TIME_AGE(timestamp: number): string {
        const now = Date.now();
        const elapsed = now - timestamp;

        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (seconds < 60) {
            return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
        } else if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (hours < 24) {
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else if (days < 7) {
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        } else if (weeks < 4) {
            return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
        } else if (months < 12) {
            return `${months} month${months !== 1 ? 's' : ''} ago`;
        } else {
            return `${years} year${years !== 1 ? 's' : ''} ago`;
        }
    }

    public static FORMAT_AMOUNT(amount: number): string {
        return Number(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 5
        });
    }

    public static PARSE_DATA = (data: string, key: string, handshake: string) => {
        const secret: string = Handshake.secret(key, handshake);
        const decryptedData: string = Handshake.decrypt(data, secret);
        const dataObject = JSON.parse(decryptedData);
        return dataObject;
    };

    static FILTER_MARKET = (wallets: Array<IMarket>, currencies: Array<string>) => {
        const seen = new Set();

        return wallets.filter(wallet => {
            if (currencies.includes(wallet.currency)) {
                if (seen.has(wallet.currency)) {
                    return false;
                }
                seen.add(wallet.currency);
                return true;
            }
            return true;
        });
    };

    static IS_NETWORK_AVAILABLE = async (): Promise<void> => {
        const state = await Network.getNetworkStateAsync();
        if (!state.isConnected) throw new Error("Please connect to internet to retry!");
    };

    public static LOGIN_STATUS = () => {
        const session = sessionManager.getUserData();
        if (!session || !session.user || !session.user.loginLastAt) return false;

        const loginLastAt: Date = new Date(session.user.loginLastAt);
        const now: Date = new Date();
        const diffMinutes: number = Math.floor((now.getTime() - loginLastAt.getTime()) / 1000 / 60);

        if (diffMinutes >= 60) {
            const data: UserData = { ...session, isLoggedIn: false };
            sessionManager.updateSession(data);
            return false;
        }

        return true;
    };

    public static TOAST = (message: string, title?: string, type?: ToastType): void => {
        Toast.show({
            type: type || 'error',
            text1: title || 'Action Error',
            text2: message,
            text1Style: { fontSize: 16, fontFamily: 'AeonikBold' },
            text2Style: { fontSize: 12, fontFamily: 'AeonikRegular' },
        });
    }
}