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

import BackButton from "@/components/button/back";
import PrimaryButton from "@/components/button/primary";
import LoadingModal from "@/components/modals/loading";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import { Status } from "@/enums/enums";
import { IUser, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import sessionManager from "@/session/session";
import * as Clipboard from 'expo-clipboard';
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, Pressable, StyleSheet, TextInput, Vibration } from "react-native";
import Defaults from "../default/default";

interface IProps { }

interface IState {
    code: string;
    qrCode: string;
    loading: boolean;
    secret: string;
}

export default class Activate2FAScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "New Transaction Pin";
    constructor(props: IProps) {
        super(props);
        this.state = { code: "", qrCode: "", secret: "", loading: false };

        const login: boolean = Defaults.LOGIN_STATUS();
        if (!login) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            return;
        };
    }

    componentDidMount(): void {
        this.get2FASecret();
    }

    private copyToClipboard = async () => {
        const { secret } = this.state;
        await Clipboard.setStringAsync(secret);

        const vibrationPattern = [0, 5];
        Vibration.vibrate(vibrationPattern, false);
        Defaults.TOAST('Wallet address copied to clipboard', "Copied", "success")
    };

    private handleVerify2FA = async (): Promise<void> => {
        try {
            this.setState({ loading: true });
            const { code } = this.state;

            const login: boolean = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            };

            await Defaults.IS_NETWORK_AVAILABLE();
            if (!code) throw new Error("Invalid Pin");

            const res = await fetch(`${Defaults.API}/user/2fa/verify`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-devicename': this.session.devicename,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
                body: JSON.stringify({ code: code }),
            });

            const data = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                await sessionManager.updateSession({
                    ...this.session,
                    user: {
                        ...this.session.user as IUser,
                        twoFactorEnabled: !this.session.user?.twoFactorEnabled,
                    }
                });
                Defaults.TOAST('2FA setup successfully', "Success", "success");
                router.navigate("/dashboard/profile");
                return;
            };

        } catch (error: any) {
            logger.error(error.message);
            Defaults.TOAST(error.message);
        } finally {
            this.setState({ loading: false });
        }
    }

    private get2FASecret = async (): Promise<void> => {
        try {
            this.setState({ loading: true });

            const login: boolean = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            };

            await Defaults.IS_NETWORK_AVAILABLE();

            const res = await fetch(`${Defaults.API}/user/2fa/init`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-devicename': this.session.devicename,
                    Authorization: `Bearer ${this.session.authorization}`,
                }
            });

            const data = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to get 2FA, please try again.');
                const parseData = Defaults.PARSE_DATA(data.data, this.session.client.privateKey, data.handshake);
                this.setState({ qrCode: parseData.qrCode, secret: parseData.twoFactorSecret });
                return;
            };

        } catch (error: any) {
            logger.error(error.message);
            Defaults.TOAST(error.message);
        } finally {
            this.setState({ loading: false });
        }
    }

    render(): React.ReactNode {
        const { code, qrCode, loading } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.safeArea}>
                    <ThemedView style={{ flex: 1 }}>
                        <ThemedView style={{ padding: 20 }}>
                            <BackButton title="Setup 2FA Authentication" subtitle="Scan the qrcode with an authenticator app to begin." />
                        </ThemedView>

                        <ThemedView
                            style={{
                                width: '100%',
                                paddingHorizontal: 20,
                            }}>
                            <ThemedView>
                                <ThemedView style={{ alignItems: 'center' }}>
                                    <Image source={{ uri: qrCode }} style={{ width: 200, height: 200 }} />
                                </ThemedView>
                                <Pressable style={styles.walletAddressContainer}>
                                    <ThemedView style={styles.walletAddressInfo}>
                                        <ThemedText style={styles.walletAddressLabel}>
                                            2FA Secret
                                        </ThemedText>
                                        <ThemedText style={styles.walletAddress}>
                                            ●●●●● ●●●●● ●●●●● ●●●●●
                                        </ThemedText>
                                    </ThemedView>
                                    <Pressable style={styles.clearButton} onPress={this.copyToClipboard}>
                                        <ThemedText style={styles.clearButtonText}>
                                            Copy
                                        </ThemedText>
                                    </Pressable>
                                </Pressable>
                                <ThemedView
                                    style={{
                                        paddingHorizontal: 16,
                                        backgroundColor: '#f7f7f7',
                                        borderRadius: 10,
                                        marginVertical: 16,
                                        flexDirection: 'row',
                                    }}>
                                    <TextInput
                                        placeholder={'Enter 6-digit code from your authenticator app'}
                                        value={code}
                                        onChangeText={(text) => this.setState({ code: text })}
                                        editable={true}
                                        style={{
                                            flex: 1,
                                            fontFamily: 'AeonikRegular',
                                            fontSize: 14,
                                            color: 'black',
                                            paddingVertical: 16,
                                            lineHeight: 16,
                                        }}
                                    />
                                </ThemedView>
                            </ThemedView>
                            <PrimaryButton Gradient title={'Verify'} onPress={this.handleVerify2FA} />
                        </ThemedView>
                    </ThemedView>

                    <LoadingModal loading={loading} />
                </ThemedSafeArea>
                <StatusBar style={"dark"} />
            </>
        )
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 35 : 0,
    },
    walletAddressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F7F7F7',
        paddingHorizontal: 12,
        paddingVertical: 21,
        borderRadius: 12,
        gap: 12,
        alignItems: 'center',
        width: '100%',
    },
    walletAddressInfo: {
        gap: 12,
    },
    walletAddressLabel: {
        fontSize: 12,
        color: '#757575',
        fontWeight: '400',
        lineHeight: 14,
    },
    walletAddress: {
        color: '#1F1F1F',
        fontSize: 16,
        lineHeight: 14,
    },
    clearButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    clearButtonText: {
        color: '#1F1F1F',
        fontSize: 12,
        lineHeight: 14,
    },
});