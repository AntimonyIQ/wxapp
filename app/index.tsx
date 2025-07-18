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
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as Device from "expo-device";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";

import sessionManager from "../session/session";
import Handshake from "@/handshake/handshake";
import { IParams, IRegistration, UserData } from "@/interface/interface";

interface IProps { }

interface IState { }

export default class SplashScreen extends React.Component<IProps, IState> {
    private timer: number | undefined;

    constructor(props: IProps) {
        super(props);
    }

    public componentDidMount(): void {
        this.timer = setTimeout(() => {
            this.handleSplashNavigation().catch(console.error);
        }, 1000);
    }

    public componentWillUnmount(): void {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    private async handleSplashNavigation(): Promise<void> {
        try {
            const session = sessionManager.getUserData();

            if (
                session?.isLoggedIn === true &&
                session.user?.refreshToken &&
                session.user?.passkeyEnabled === true
            ) {
                router.replace("/passkey");
                return;
            }

            if (session?.isRegistred === true) {
                router.replace("/onboarding/login");
                return;
            }

            const client = Handshake.generate();
            const deviceid = Crypto.randomUUID();
            const devicename = Device.deviceName ?? "Unknown Device";

            const sessionData: UserData = {
                client,
                deviceid,
                devicename,
                isLoggedIn: false,
                isRegistred: false,
                isVerified: false,
                user: undefined,
                registration: {} as IRegistration,
                authorization: "",
                deviceId: "",
                location: "",
                markets: [],
                transactions: [],
                hideBalance: false,
                totalBalanceNgn: 0,
                totalBalanceUsd: 0,
                passkey: "",
                params: {} as IParams
            };

            await sessionManager.login(sessionData);
            router.replace("/onboarding");
        } catch (error) {
            console.error("Splash navigation error:", error);
            router.replace("/onboarding/login");
        }
    }

    public render(): React.ReactNode {
        return (
            <View style={styles.root}>
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
                <StatusBar style="light" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
    },
});