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
import { Platform, ScrollView, StyleSheet } from "react-native";
import logger from "@/logger/logger";
import { IRegistration, IResponse, UserData } from "@/interface/interface";
import sessionManager from "@/session/session";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import BackButton from "@/components/button/back";
import Defaults from "../default/default";
import TextField from "@/components/inputs/text";
import PasswordCondition from "@/components/passwordcondition";
import PrimaryButton from "@/components/button/primary";
import LoadingModal from "@/components/modals/loading";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import { Status } from "@/enums/enums";

interface IProps { }

interface IConditions {
    email: string;
    password: string;
    confirmPassword: string;
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    passwordConfirm: boolean;
    specialCharacter: boolean;
    loading: boolean;
    emailFocused: boolean;
    passwordFocused: boolean;
    confirmPasswordFocused: boolean;
    passwordLengthError: boolean;
    passwordConfirmError: boolean;
    emailError: boolean;
    formError: boolean;
    formSuccess: boolean;
    showPassword: boolean;
    showConfirmPassword: boolean;
    passwordStrength: "weak" | "medium" | "strong";
    confirmPasswordStrength: "weak" | "medium" | "strong";
    emailPatternError: boolean;
    confirmEmailPatternError: boolean;
    passwordPatternError: boolean;
    confirmPasswordPatternError: boolean;
    passwordErrorMessages: string[];
    confirmPasswordErrorMessages: string[];
    emailErrorMessages: string[];
    formErrorMessages: string[];
    formSuccessMessages: string[];
    passwordLengthErrorMessage: string;
    passwordConfirmErrorMessage: string;
}

interface IState {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    loading: boolean;
    emailFocused: boolean;
    passwordFocused: boolean;
    confirmPasswordFocused: boolean;
    fullNameFocused: boolean;
    conditions: IConditions;
    passwordError: boolean;
}

export default class SignupScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Create an account";
    constructor(props: IProps) {
        super(props);
        this.state = {
            email: "",
            password: "",
            confirmPassword: "",
            fullName: "",
            loading: false,
            emailFocused: false,
            passwordFocused: false,
            confirmPasswordFocused: false,
            fullNameFocused: true,
            passwordError: false,
            conditions: {} as IConditions
        }
    }

    componentDidMount(): void { }

    private handlePasswordChange = (value: string) => {
        const meetsLength = value.length >= 8 && value.length <= 20;
        const meetsUppercase = /[A-Z]/.test(value);
        const meetsLowercase = /[a-z]/.test(value);
        const meetsSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value) || /[0-9]/.test(value);

        this.setState({
            password: value,
            conditions: {
                ...this.state.conditions,
                length: meetsLength,
                uppercase: meetsUppercase,
                lowercase: meetsLowercase,
                specialCharacter: meetsSpecial,
                passwordStrength: meetsLength && meetsUppercase && meetsLowercase && meetsSpecial ? "strong" : meetsLength && meetsUppercase && meetsLowercase ? "medium" : "weak",
            },
        })
    };

    private handleConfirmPasswordChange = (value: string) => {
        this.setState({
            confirmPassword: value,
            conditions: {
                ...this.state.conditions,
                passwordConfirm: value === this.state.password,
                confirmPasswordStrength: value === this.state.password ? "strong" : value === "" ? "weak" : "medium",
            },
        })
    };

    private handleSubmit = async () => {
        try {
            this.setState({ loading: true });
            const { email, password, confirmPassword, conditions, fullName } = this.state;

            await Defaults.IS_NETWORK_AVAILABLE();
            if (!email || !password || !confirmPassword || !fullName) throw new Error("Form is not filled out correctly.");
            if (!conditions.length || !conditions.uppercase || !conditions.lowercase || !conditions.specialCharacter) throw new Error("Passwords do not meet the required conditions.");

            const res = await fetch(`${Defaults.API}/auth/email`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-location': this.session.location,
                },
                body: JSON.stringify({ email: email, password: password, fullName: fullName }),
            });

            const data: IResponse = await res.json();
            console.log(data);
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                const registration: IRegistration = { ...this.session.registration, email, password, confirmPassword, fullName, termsAndConditions: true };
                await sessionManager.updateSession({
                    ...this.session,
                    registration: registration
                });

                this.setState({ email: '', password: '', confirmPassword: '', fullName: '' });
                router.navigate(`/verify`);
            };
        } catch (error: any) {
            logger.error(error.message);
            Defaults.TOAST(error.message);
        } finally {
            this.setState({ loading: false, });
        }
    }

    private offfocus = () => {
        this.setState({
            emailFocused: false,
            passwordFocused: false,
            confirmPasswordFocused: false,
            fullNameFocused: false,
        })
    }

    render(): React.ReactNode {
        const { email, emailFocused, password, passwordFocused, fullName, fullNameFocused, conditions, confirmPassword, confirmPasswordFocused, passwordError, loading } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: 'Onboarding', headerShown: false }} />
                <ThemedSafeArea style={{ paddingTop: Platform.OS === 'android' ? 35 : 0, flex: 1 }}>
                    <ScrollView
                        shouldRasterizeIOS={true}
                        contentContainerStyle={{ flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}>
                        <ThemedView style={{ width: "100%", height: "100%", paddingHorizontal: 16, paddingTop: 24 }}>

                            <BackButton title={this.title} />

                            <TextField
                                placeholder={'Full Name'}
                                title={'Full Name'}
                                showText={fullNameFocused}
                                onFocus={() => {
                                    this.offfocus();
                                    this.setState({ fullNameFocused: true });
                                }}
                                textValue={fullName}
                                onChangeText={(text) => this.setState({ fullName: text })}
                                onClear={() => this.setState({ fullName: '' })}
                                onBlur={() => this.setState({ fullNameFocused: false })}
                            />

                            <TextField
                                placeholder={'Email Address'}
                                title={'Email Address'}
                                showText={emailFocused}
                                onFocus={() => {
                                    this.offfocus();
                                    this.setState({ emailFocused: true });
                                }}
                                textValue={email.toLowerCase()}
                                onChangeText={(text) => this.setState({ email: text.toLowerCase() })}
                                onClear={() => this.setState({ email: '' })}
                                onBlur={() => this.setState({ emailFocused: false })}
                            />

                            <TextField
                                placeholder={'Password'}
                                showText={passwordFocused}
                                onFocus={() => this.setState({ passwordFocused: true, emailFocused: false, confirmPasswordFocused: false })}
                                textValue={password}
                                onChangeText={this.handlePasswordChange}
                                onClear={() => this.setState({ password: '' })}
                                onBlur={() => this.setState({ passwordFocused: false })}
                                title={'Password'}
                                secureTextEntry
                                showEye={true}
                            />

                            <ThemedView style={{ gap: 8, marginBottom: 24 }}>
                                <PasswordCondition
                                    title={'Password should be 8-20 characters'}
                                    meetsCondition={conditions.length}
                                />
                                <PasswordCondition
                                    title={'Password should have an uppercase letter'}
                                    meetsCondition={conditions.uppercase}
                                />
                                <PasswordCondition
                                    title={'Password should have a lowercase letter'}
                                    meetsCondition={conditions.lowercase}
                                />
                                <PasswordCondition
                                    title={'Password should have a special character or a number eg: 1 2 @ &'}
                                    meetsCondition={conditions.specialCharacter}
                                />
                            </ThemedView>

                            <TextField
                                placeholder={'Confirm Password'}
                                showText={confirmPasswordFocused}
                                onFocus={() => this.setState({ confirmPasswordFocused: true, emailFocused: false, passwordFocused: false })}
                                textValue={confirmPassword}
                                onChangeText={this.handleConfirmPasswordChange}
                                onClear={() => this.setState({ confirmPassword: '' })}
                                onBlur={() => this.setState({ confirmPasswordFocused: false, passwordError: password !== confirmPassword })}
                                title={'Confirm Password'}
                                secureTextEntry
                                showEye={true}
                            />

                            {passwordError && (
                                <ThemedText style={styles.errorText}>Passwords do not match</ThemedText>
                            )}

                            <ThemedView style={{ marginTop: 34, marginBottom: 100, gap: 10 }}>
                                {email.length > 0 && password.length > 0 && confirmPassword.length > 0 && password === confirmPassword && !loading
                                    ? <PrimaryButton Gradient title={'Create Account'} onPress={this.handleSubmit} />
                                    : <PrimaryButton Grey disabled title={'Create Account'} onPress={() => { }} />
                                }
                            </ThemedView>

                        </ThemedView>
                    </ScrollView>
                    <LoadingModal loading={loading} />
                    <StatusBar style={"dark"} />
                </ThemedSafeArea>
            </>
        )
    }
}

const styles = StyleSheet.create({
    errorText: {
        color: 'red',
        fontSize: 10,
        fontFamily: 'AeonikRegular',
        lineHeight: 12,
        top: 0,
    },
    button: {
        height: 48,
        borderRadius: 24,
        backgroundColor: '#253E92',
        alignItems: 'center',
        justifyContent: 'center',
    },
});