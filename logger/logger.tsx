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

import { Platform } from "react-native";

export default class logger {
    private static logMessage(method: 'log' | 'info' | 'warn' | 'error' | 'table', message?: any, ...optionalParams: any[]) {
        const visible = true;
        if (visible) {
            console[method](message, ...optionalParams);
        }
    }

    public static log(message?: any, ...optionalParams: any[]) {
        this.logMessage('log', message, ...optionalParams);
    }

    public static info(message?: any, ...optionalParams: any[]) {
        this.logMessage('info', message, ...optionalParams);
    }

    public static warn(message?: any, ...optionalParams: any[]) {
        this.logMessage('warn', message, ...optionalParams);
    }

    public static error(message?: any, ...optionalParams: any[]) {
        this.logMessage('error', message, ...optionalParams);
    }

    public static table(...data: any[]) {
        this.logMessage('table', data);
    }

    public static clear() {
        console.clear();
        if (Platform.OS !== "web") return;
        console.log(
            `%c\u26D4 STOP! \u26D4%c\n`,
            'color: red; font-size: 30px; text-shadow: 2px 2px black;',
            'color: white;'
        );
        console.log(
            `%cThis is a browser feature intended for developers. If someone told you to copy and paste something here to enable a wealthx feature or "hack" someone's account, it is a scam and will give them access to your wealthx Account account.%c`,
            'color: red; font-size: 20px;',
            'color: red;'
        );
    }

    public static clearGroup() {
        console.groupEnd();
    }

    public static group(label?: string) {
        console.group(label);
    }

    public static groupCollapsed(label?: string) {
        console.groupCollapsed(label);
    }

    public static groupEnd() {
        console.groupEnd();
    }

    public static assert(condition: boolean, message?: string) {
        if (!condition) {
            throw new Error(message);
        }
    }

    public static count(label?: string) {
        console.count(label);
    }
}