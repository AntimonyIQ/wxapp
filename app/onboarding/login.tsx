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

import { toastRef } from "@/app/default/default";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import BackButton from "@/components/button/back";
import PrimaryButton from "@/components/button/primary";
import TextField from "@/components/inputs/text";
import LoadingModal from "@/components/modals/loading";
import TwoFAModal from "@/components/modals/twofamodal";
import SimpleToast from "@/components/toast/toast";
import { Colors } from "@/constants/Colors";
import { Status } from "@/enums/enums";
import { ILocation, IResponse, IUser, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import sessionManager from "@/session/session";
import Validate from "@/validator/validator";
import { router, Stack } from "expo-router";
import React from "react";
import { Keyboard, Platform, Pressable, StyleSheet } from "react-native";
import Defaults from "../default/default";
import Handshake from "@/handshake/handshake";

interface IProps { }

interface IState {
    email: string;
    emailFocused: boolean;
    password: string;
    passwordFocused: boolean;
    loading: boolean;
    location: ILocation | null;
    authcode: string;
    authmodal: boolean;
}

export default class LoginScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Login Screen";
    constructor(props: IProps) {
        super(props);
        this.state = { email: '', password: '', loading: false, emailFocused: true, passwordFocused: false, location: null, authcode: '', authmodal: false };
    }

    componentDidMount(): void {
        // this.geolocation();
    }

    private geolocation = async () => {
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = res.ok ? await res.json() : null;
            if (data) this.setState({ location: data });
        } catch (_) {
            // Ignore error silently
        }
    };

    private handleLogin = async (): Promise<void> => {
        const { email, password, location, authcode } = this.state;
        Keyboard.dismiss();

        try {
            this.setState({ loading: true });
            const client = Handshake.generate();

            await Defaults.IS_NETWORK_AVAILABLE();
            if (!email || !password || !Validate.Email(email)) throw new Error("please provide email and password to continue");

            const res = await fetch(`${Defaults.API}/auth/login`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-location': location ? `${location?.region}, ${location?.country}` : "Unknown",
                    'x-wealthx-ip': location?.ip || "Unknown",
                    'x-wealthx-devicename': this.session.devicename,
                },
                body: JSON.stringify({ email: email, password: password, code: authcode }),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process login response right now, please try again.');
                const parseData = Defaults.PARSE_DATA(data.data, client.privateKey, data.handshake);
                const authorization: string = parseData.authorization;

                const res = await fetch(`${Defaults.API}/user`, {
                    method: 'GET',
                    headers: {
                        ...Defaults.HEADERS,
                        'x-wealthx-handshake': client.publicKey,
                        'x-wealthx-deviceid': this.session.deviceid,
                        Authorization: `Bearer ${authorization}`,
                    },
                });

                const userdata: IResponse = await res.json();
                if (userdata.status === Status.ERROR) throw new Error(userdata.message || userdata.error);
                if (userdata.status === Status.SUCCESS) {
                    if (!userdata.handshake) throw new Error('Unable to process login response right now, please try again.');
                    const userParseData: IUser = Defaults.PARSE_DATA(userdata.data, client.privateKey, userdata.handshake);
                    await sessionManager.login({
                        ...this.session,
                        isRegistred: true,
                        authorization: authorization,
                        isLoggedIn: true,
                        user: userParseData,
                        passkeyEnabled: userParseData.passkeyEnabled,
                        refreshToken: userParseData.refreshToken,
                    });

                    if (userParseData.isSuspended) {
                        router.navigate('/suspend');
                    } else {
                        router.navigate('/dashboard');
                    }
                }
            };

        } catch (error: any) {
            logger.error('Failed to login:', error.message);
            Defaults.TOAST(error.message, "Login");
        } finally {
            this.setState({ loading: false, password: "" });
        }
    }

    render(): React.ReactNode {
        const { email, password, loading, authmodal } = this.state;
        const { user } = this.session;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={{ paddingTop: Platform.OS === 'android' ? 35 : 0, flex: 1 }}>
                    <ThemedView style={{ width: "100%", height: "100%", padding: 20 }}>

                        <BackButton title="Login" />

                        <TextField
                            showPasteButton={true}
                            showText={true}
                            title="Email"
                            placeholder="Email"
                            onClear={() => this.setState({ email: '' })}
                            onFocus={() => this.setState({ emailFocused: true })}
                            textValue={email}
                            keyboardType="email-address"
                            onChangeText={(text) => this.setState({ email: text.toLowerCase().trim() })} />

                        <TextField
                            showEye={true}
                            showText={true}
                            title="Password"
                            placeholder="Password"
                            onClear={() => this.setState({ password: '' })}
                            onFocus={() => this.setState({ passwordFocused: true })}
                            textValue={password}
                            secureTextEntry={true}
                            keyboardType="visible-password"
                            onChangeText={(text) => this.setState({ password: text.trim() })} />

                        <ThemedView style={{ gap: 20, }}>
                            <ThemedView style={{ marginTop: 34, width: "100%" }}>
                                {email.length > 0 && password.length > 0 && !loading
                                    ? <PrimaryButton
                                        Gradient
                                        title={loading ? "Logging In..." : "Log In"}
                                        onPress={(): void => {
                                            (user !== undefined && user?.twoFactorEnabled === true)
                                                ? this.setState({ authmodal: true })
                                                : this.handleLogin();
                                        }}
                                        disabled={loading} />
                                    : <PrimaryButton Grey disabled title={loading ? "Logging In..." : "Log In"} onPress={() => { }} />
                                }
                            </ThemedView>
                            <Pressable style={{ alignSelf: 'center' }} onPress={() => router.navigate('/onboarding/login')}>
                                <ThemedText style={[styles.forgotPasswordText, { color: Colors.blue }]}>Forgot Password</ThemedText>
                            </Pressable>
                            <Pressable style={{ alignSelf: 'center', flexDirection: "row", alignItems: "center" }} onPress={() => router.navigate('/onboarding/signup')}>
                                <ThemedText style={[styles.forgotPasswordText]}>Don't have an account? </ThemedText>
                                <ThemedText style={[styles.forgotPasswordText, { color: Colors.blue }]}>Create an account</ThemedText>
                            </Pressable>
                        </ThemedView>

                    </ThemedView>

                    <TwoFAModal
                        visible={authmodal}
                        onClose={() => this.setState({ authmodal: false })}
                        onPinComplete={(pin: string) => {
                            this.setState({ authcode: pin, authmodal: false });
                            this.handleLogin();
                        }}
                    />
                    <LoadingModal loading={loading} />
                    <SimpleToast ref={toastRef} />
                </ThemedSafeArea>
            </>
        )
    }
}

const styles = StyleSheet.create({
    forgotPasswordText: {
        fontFamily: 'AeonikRegular',
        fontSize: 14,
        lineHeight: 16,
    },
});