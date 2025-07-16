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
import PhoneField from "@/components/inputs/phone";
import TextField from "@/components/inputs/text";
import LoadingModal from "@/components/modals/loading";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import { Colors } from "@/constants/Colors";
import { Status } from "@/enums/enums";
import { IList, IResponse, IUser, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import sessionManager from "@/session/session";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import countries from "../data/countries_states.json";
import Defaults from "../default/default";

interface IProps { }

interface IState {
    phone: string;
    code: string;
    loading: boolean;
    list_modal: boolean;
    lists: Array<IList>;
    phones: Array<IList>;
    countryCode: string;
    timer: number;
    isTimerRunning: boolean;
}

export default class VerifyPhoneScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Verify Phone";
    private timerRef: number | null = null;

    constructor(props: IProps) {
        super(props);
        this.state = {
            code: "",
            phone: "",
            loading: false,
            list_modal: false,
            lists: [],
            phones: [],
            countryCode: "+234",
            timer: 0,
            isTimerRunning: false,
        };

        const login: boolean = Defaults.LOGIN_STATUS();
        if (!login) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            return;
        };
    }

    componentDidMount(): void {
        requestAnimationFrame(() => this.loadList());
    }

    componentWillUnmount(): void {
        if (this.timerRef) clearInterval(this.timerRef);
    }

    private loadList = (): void => {
        const rawPhone = this.session.user?.phoneNumber || "";

        const lists: Array<IList> = countries.map((country) => ({
            name: country.name,
            description: country.name,
            icon: `https://flagcdn.com/24x18/${country.iso2.toLowerCase()}.png`
        }));

        const phones: Array<IList> = countries.map((country) => ({
            name: country.name,
            description: `+${country.phonecode}`,
            icon: `https://flagcdn.com/24x18/${country.iso2.toLowerCase()}.png`
        }));

        let phone = rawPhone;
        for (const country of countries) {
            const code = country.phonecode.toString();
            if (phone.startsWith(code) && phone.length > code.length + 5) {
                phone = phone.slice(code.length);
                break;
            }
        }

        this.setState({ lists, phones, phone });
    };

    private verifyphone = async (): Promise<void> => {
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

            const res = await fetch(`${Defaults.API}/user/phone/verify`, {
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

    private sendotp = async (): Promise<void> => {
        try {
            this.setState({ loading: true });
            const { phone, countryCode } = this.state;
            if (!phone || !countryCode) throw new Error("Invalid phone number or country code");

            const login: boolean = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            };

            await Defaults.IS_NETWORK_AVAILABLE();

            const codeOnly = countryCode.replace('+', '');
            const phoneClean = phone.replace(/^0+/, '');
            const fullPhone = codeOnly + phoneClean;

            const res = await fetch(`${Defaults.API}/user/phone`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-devicename': this.session.devicename,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
                body: JSON.stringify({ phoneNumber: fullPhone })
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                Defaults.TOAST("OTP sent successfully", "OTP", "success");

                // Start 4-minute countdown
                this.setState({ timer: 240, isTimerRunning: true });
                this.timerRef = setInterval(() => {
                    this.setState(prev => {
                        const nextTimer = prev.timer - 1;

                        if (nextTimer <= 0) {
                            if (this.timerRef) clearInterval(this.timerRef);
                            return { timer: 0, isTimerRunning: false };
                        }

                        return { timer: nextTimer, isTimerRunning: true };
                    });
                }, 1000);
            }

        } catch (error: any) {
            logger.error(error.message);
            Defaults.TOAST(error.message);
        } finally {
            this.setState({ loading: false });
        }
    }

    render(): React.ReactNode {
        const { code, phone, loading, phones, isTimerRunning, timer } = this.state;

        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.safeArea}>
                    <ThemedView style={{ flex: 1 }}>
                        <ThemedView style={{ padding: 20 }}>
                            <BackButton
                                title="Verify Phone Number"
                                subtitle="Provide a valid phone number to receive your verification code."
                            />
                        </ThemedView>

                        <ThemedView style={{ width: '100%', paddingHorizontal: 20 }}>
                            <ThemedView style={{ marginBottom: 20 }}>

                                <ThemedView style={styles.walletAddressContainer}>
                                    <ThemedView style={{ width: "85%" }}>
                                        <PhoneField
                                            placeholder='Phone Number'
                                            maxLength={20}
                                            getCode={(code) => this.setState({ countryCode: code })}
                                            textValue={phone}
                                            onChangeText={(text): void => this.setState({ phone: text })}
                                            showPasteButton={false}
                                            showText={true}
                                            title="Phone Number"
                                            lists={phones}
                                            onClear={(): void => this.setState({ phone: "" })}
                                            onFocus={(): void => this.setState({ list_modal: false })}
                                        />
                                    </ThemedView>
                                    <Pressable
                                        style={[
                                            styles.clearButton,
                                            isTimerRunning && { backgroundColor: '#ccc' }
                                        ]}
                                        onPress={!isTimerRunning ? this.sendotp : undefined}
                                        disabled={isTimerRunning}
                                    >
                                        <ThemedText style={styles.clearButtonText}>
                                            {isTimerRunning
                                                ? `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`
                                                : 'Send'}
                                        </ThemedText>
                                    </Pressable>
                                </ThemedView>

                                <ThemedView>
                                    <TextField
                                        placeholder={'Enter OTP'}
                                        showText={true}
                                        onFocus={() => { }}
                                        textValue={code.trim()}
                                        onChangeText={(text) => this.setState({ code: text.trim() })}
                                        onClear={() => this.setState({ code: '' })}
                                        onBlur={() => { }}
                                        title={'Enter OTP'}
                                    />
                                </ThemedView>

                            </ThemedView>
                            <PrimaryButton Gradient title={'Verify'} onPress={this.verifyphone} />
                        </ThemedView>
                    </ThemedView>

                    <LoadingModal loading={loading} />
                </ThemedSafeArea>
                <StatusBar style={"dark"} />
            </>
        );
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
        paddingHorizontal: 12,
        paddingLeft: 0,
        paddingVertical: 5,
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
        fontFamily: 'Aeonik-Regular',
        color: '#757575',
        fontWeight: '400',
        lineHeight: 14,
    },
    walletAddress: {
        color: '#1F1F1F',
        fontSize: 16,
        lineHeight: 14,
        fontFamily: 'Aeonik-Regular',
    },
    clearButton: {
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 360,
        alignItems: 'center',
        backgroundColor: Colors.blue,
    },
    clearButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        lineHeight: 14,
        fontFamily: 'Aeonik-Regular',
    },
});
