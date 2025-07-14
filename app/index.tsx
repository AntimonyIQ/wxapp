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

import React from "react";
import sessionManager from "../session/session";
import { UserData } from "@/interface/interface";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as Device from 'expo-device';
import Handshake from "@/cryptography/handshake";
import * as Crypto from 'expo-crypto';

interface IProps { }

interface IState { }

export default class SplashScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private timer: number | undefined;
    constructor(props: IProps) {
        super(props);
    }

    public componentDidMount(): void {
        this.timer = setTimeout(() => this.handleSplashNavigation(), 1000);
    }

    private async handleSplashNavigation(): Promise<void> {
        const { isLoggedIn, isRegistred, user } = this.session;

        if (isLoggedIn === true && user?.refreshToken && user?.passkeyEnabled === true) {
            router.navigate('/passkey');
            return;
        }

        if (isRegistred === true) {
            router.navigate('/onboarding/login');
            return;
        }

        const client = Handshake.generate();
        const devicename = Device.deviceName ?? "Unknown Device";
        const deviceid = Crypto.randomUUID();

        const sessionData: UserData = {
            ...this.session,
            client,
            deviceid,
            devicename,
            isLoggedIn: false,
            isRegistred: false,
            isVerified: false,
            user: undefined,
        };

        await sessionManager.login(sessionData);
        router.navigate('/onboarding');
    }

    public componentWillUnmount(): void {
        clearTimeout(this.timer);
    }

    public render(): React.ReactNode {
        return (
            <View style={{ flex: 1 }}>
                <LinearGradient
                    colors={["#2B49AB", "#101C41"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.container}
                >
                    <Image
                        source={require("../assets/icons/logo.svg")}
                        style={{ width: 90, height: 90 }}
                        contentFit="cover"
                        transition={1000}
                    />
                </LinearGradient>
                <StatusBar style='light' />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
});