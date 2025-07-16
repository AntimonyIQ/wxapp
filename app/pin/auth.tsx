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
import sessionManager from "@/session/session";
import { ActivityIndicator, Appearance, Dimensions, FlatList, Platform, Pressable, StyleSheet, TextInput } from "react-native";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import BackButton from "@/components/button/back";
import { Colors } from "@/constants/Colors";
import LoadingModal from "@/components/modals/loading";
import PrimaryButton from "@/components/button/primary";
import Defaults from "../default/default";
import { IResponse, UserData } from "@/interface/interface";
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedText from "@/components/ThemedText";
import { Status } from "@/enums/enums";

interface IProps { }

interface IState {
    otp: string[];
    loading: boolean;
    error: string;
    resetLoading: boolean;
    resendCooldown: number; // in seconds
}

const { height } = Dimensions.get("window");

export default class AuthPinScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Pin Change Authorization";
    private inputRefs: React.RefObject<TextInput | null>[] = Array(4).fill(null).map(() => React.createRef<TextInput>());
    private interval: number | null = null;

    constructor(props: IProps) {
        super(props);
        this.state = {
            otp: Array(4).fill(""),
            loading: false,
            error: "",
            resetLoading: false,
            resendCooldown: 120, // 2 minutes
        };
        if (!this.session) {
            logger.log("Session not found. Redirecting to login screen.");
        }
    }

    componentDidMount(): void {
        this.startCooldownTimer();
    }

    componentWillUnmount(): void {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    private startCooldownTimer = (): void => {
        this.interval = setInterval(() => {
            this.setState(prev => {
                if (prev.resendCooldown <= 1 && this.interval) {
                    clearInterval(this.interval);
                    return { resendCooldown: 0 };
                }
                return { resendCooldown: prev.resendCooldown - 1 };
            });
        }, 1000);
    };

    private formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    private handleInputChange = (text: string, index: number): void => {
        const newInputs: string[] = [...this.state.otp];
        newInputs[index] = text;
        this.setState({ otp: newInputs });

        if (text) {
            if (index < this.state.otp.length - 1) {
                this.inputRefs[index + 1].current?.focus();
            }
        } else {
            if (index > 0) {
                this.inputRefs[index - 1].current?.focus();
            }
        }
    };

    private handleKeyPress = (e: any, index: number): void => {
        if (e.nativeEvent.key === 'Backspace' && !this.state.otp[index] && index > 0) {
            this.inputRefs[index - 1].current?.focus();
        }
    };

    private handleVerifyOTP = async (): Promise<void> => {
        const { otp } = this.state;
        if (!otp.every((code) => code.trim() !== "")) {
            Defaults.TOAST("Invalid OTP");
            return;
        }
        await sessionManager.updateSession({ ...this.session, params: { ...this.session.params, otp: otp.join("") } });
        router.navigate("/pin");
    }

    private handleOTPResend = async (): Promise<void> => {
        if (this.state.resendCooldown > 0) return;

        try {
            this.setState({ resetLoading: true, resendCooldown: 120 });
            this.startCooldownTimer();
            await Defaults.IS_NETWORK_AVAILABLE();

            const res = await fetch(`${Defaults.API}/user/modification/pin`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-location': this.session.location,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                Defaults.TOAST('OTP has been resent', "OTP Resent", "success");
            };
        } catch (error: any) {
            logger.log(error.message);
            Defaults.TOAST(error.message);
        } finally {
            this.setState({ resetLoading: false });
        }
    }

    private renderInputItem = ({ item, index }: { item: string, index: number }): React.JSX.Element => {
        return (
            <ThemedView style={{ alignItems: 'center', alignSelf: 'center' }}>
                <TextInput
                    style={styles.input}
                    value={item}
                    onChangeText={(text) => this.handleInputChange(text, index)}
                    keyboardType='numeric'
                    maxLength={1}
                    secureTextEntry={true}
                    ref={this.inputRefs[index]}
                    onKeyPress={(e) => this.handleKeyPress(e, index)}
                />
            </ThemedView>
        );
    };

    render(): React.ReactNode {
        const { otp, resetLoading, error, loading, resendCooldown } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.safeArea}>
                    <ThemedView style={{ height: "100%" }}>
                        <ThemedView style={{ paddingHorizontal: 16, paddingTop: 20 }}>
                            <ThemedView style={{ marginBottom: 30 }}>
                                <BackButton
                                    title={this.title}
                                    subtitle={`We sent a one time password to your email`}
                                />
                            </ThemedView>

                            <FlatList
                                data={otp}
                                renderItem={this.renderInputItem}
                                keyExtractor={(_item, index) => index.toString()}
                                horizontal={true}
                                contentContainerStyle={styles.inputContainer}
                            />

                            <Pressable
                                style={{ marginTop: 12, flexDirection: "row", gap: 8, alignItems: "center" }}
                                onPress={this.handleOTPResend}
                                disabled={resendCooldown > 0}
                            >
                                <ThemedText style={{ fontFamily: 'AeonikRegular', fontSize: 14, color: '#757575', lineHeight: 16 }}>
                                    Didn't get the code?
                                </ThemedText>
                                {resetLoading ? (
                                    <ActivityIndicator color={Colors.blue} size={15} />
                                ) : resendCooldown > 0 ? (
                                    <ThemedText style={{ fontFamily: 'AeonikRegular', fontSize: 14, color: '#999' }}>
                                        Retry in {this.formatTime(resendCooldown)}
                                    </ThemedText>
                                ) : (
                                    <ThemedText style={{ fontFamily: 'AeonikRegular', fontSize: 14, color: '#253E92' }}>
                                        Resend code
                                    </ThemedText>
                                )}
                            </Pressable>

                            <ThemedView style={{ marginTop: 40, gap: 10 }}>
                                <PrimaryButton Gradient title={'Continue'} onPress={this.handleVerifyOTP} />
                                {error.length > 0 && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
                            </ThemedView>
                        </ThemedView>
                    </ThemedView>
                    <LoadingModal loading={loading} />
                </ThemedSafeArea>
                <StatusBar style='light' />
            </>
        );
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 35 : 0,
        height: height
    },
    inputContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    input: {
        width: 50,
        height: 50,
        color: Appearance.getColorScheme() === "dark" ? Colors.dark.text : Colors.light.text,
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#000" : '#F7F7F7',
        borderRadius: 10,
        fontSize: 24,
        textAlign: 'center',
        marginHorizontal: 5,
        alignSelf: 'center',
    },
    button: {
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#253E92',
    },
});
