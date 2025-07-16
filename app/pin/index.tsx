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
import { UserData } from "@/interface/interface";
import { Appearance, ColorSchemeName, FlatList, Platform, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import BackButton from "@/components/button/back";
import PrimaryButton from "@/components/button/primary";
import LoadingModal from "@/components/modals/loading";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Defaults from "../default/default";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import { Status } from "@/enums/enums";

interface IProps { }

interface IState {
    newPin: string[];
    loading: boolean;
}

export default class SetNewPinScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "New Transaction Pin";
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private pinRefs: React.RefObject<TextInput | null>[] = Array(4).fill(null).map(() => React.createRef<TextInput>());
    constructor(props: IProps) {
        super(props);
        this.state = { newPin: Array(4).fill(""), loading: false };

        const login: boolean = Defaults.LOGIN_STATUS();
        if (!login) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            return;
        };
    }

    componentDidMount(): void { }

    private handlePin = async (): Promise<void> => {
        try {
            this.setState({ loading: true });
            const { newPin } = this.state;

            const login: boolean = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            };

            await Defaults.IS_NETWORK_AVAILABLE();
            if (!newPin.join("")) throw new Error("Invalid Pin");

            const res = await fetch(`${Defaults.API}/user/modification`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceId,
                    'x-wealthx-location': this.session.location,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
                body: JSON.stringify({
                    otp: this.session.params.otp,
                    newPin: newPin.join(""),
                    which: 'pin'
                }),
            });

            const data = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                await sessionManager.updateSession({
                    ...this.session,
                    params: {
                        ...this.session.params,
                        otp: "",
                    }
                });
                Defaults.TOAST("New pin set successfully", "Success", "success");
                router.navigate("/dashboard");
                return;
            };

        } catch (error: any) {
            logger.error(error.message);
            Defaults.TOAST(error.message);
        } finally {
            this.setState({ loading: false });
        }
    }

    private handlePinInput = (value: string, index: number): void => {
        const { newPin } = this.state;
        const updatedPin = [...newPin];

        if (value === 'Backspace') {
            if (updatedPin[index]) {
                updatedPin[index] = "";
            } else if (index > 0) {
                updatedPin[index - 1] = "";
                this.pinRefs[index - 1].current?.focus();
            }
        } else {
            updatedPin[index] = value;
            if (index < updatedPin.length - 1) {
                this.pinRefs[index + 1].current?.focus();
            }
        }

        this.setState({ newPin: updatedPin });
    };

    private renderInputItem = ({ item, index }: { item: string, index: number }): React.JSX.Element => {
        return (
            <ThemedView style={{ alignItems: 'center', alignSelf: 'center' }}>
                <TextInput
                    style={styles.input}
                    value={item}
                    onChangeText={(text) => this.handlePinInput(text, index)}
                    keyboardType='numeric'
                    maxLength={1}
                    secureTextEntry={true}
                    ref={this.pinRefs[index]}
                    onFocus={(e) => {
                        if (Platform.OS === 'web') {
                            e.target.blur();
                        }
                    }}
                />
            </ThemedView>
        );
    };

    private renderKeypadItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.box}
            onPress={() => {
                const index = item === 'Backspace' ? this.state.newPin.findIndex(p => p === '') - 1 : this.state.newPin.findIndex(p => !p);
                this.handlePinInput(item.toString(), index >= 0 ? index : this.state.newPin.length - 1);
            }}
        >
            {item === 'Backspace' ? (
                <MaterialCommunityIcons name="backspace" size={24} color="red" />
            ) : (
                <ThemedText style={styles.buttonText}>{item}</ThemedText>
            )}
        </TouchableOpacity>
    );

    render(): React.ReactNode {
        const { newPin, loading } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.safeArea}>
                    <ThemedView style={{ paddingHorizontal: 16, paddingTop: 24 }}>

                        <BackButton
                            title={`${this.title}`}
                            subtitle={'Set new pin to approve your transactions'} />

                        <ThemedView style={styles.container}>
                            <FlatList
                                data={newPin}
                                renderItem={this.renderInputItem}
                                keyExtractor={(item, index) => index.toString()}
                                horizontal={true}
                                contentContainerStyle={styles.inputContainer}
                            />
                        </ThemedView>

                        <LoadingModal loading={loading} />
                    </ThemedView>
                    <ThemedView style={styles.keypadContainer}>
                        <ThemedView style={{ width: '100%', paddingHorizontal: 16, marginBottom: 30 }}>
                            {(newPin.join('') && newPin.join('').length === 4)
                                ? <PrimaryButton Gradient title={'Continue'} onPress={this.handlePin} />
                                : <PrimaryButton Grey onPress={() => { }} title={'Continue'} />}
                        </ThemedView>
                        <FlatList
                            data={[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'Backspace']}
                            renderItem={this.renderKeypadItem}
                            keyExtractor={(item, index) => index.toString()}
                            numColumns={3}
                            contentContainerStyle={styles.keypad}
                        />
                    </ThemedView>
                </ThemedSafeArea>
                <StatusBar style={this.appreance === "dark" ? "light" : "dark"} />
            </>
        )
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 35 : 0,
    },
    errorText: {
        color: 'red',
        fontSize: 10,
        fontFamily: 'AeonikRegular',
        lineHeight: 12,
        top: 0,
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 40,
    },
    inputContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    input: {
        width: 50,
        height: 50,
        backgroundColor: '#F7F7F7',
        borderRadius: 10,
        fontSize: 24,
        textAlign: 'center',
        marginHorizontal: 5,
        alignSelf: 'center',
        fontFamily: 'AeonikMedium',
    },
    keypadContainer: {
        width: '100%',
        alignItems: 'center',
        position: "absolute",
        top: "auto",
        bottom: Platform.OS === "android" ? 20 : 30,
    },
    keypad: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    box: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        marginVertical: 15,
        borderRadius: 10,
    },
    buttonText: {
        fontSize: 24,
        fontFamily: 'AeonikMedium',
    },
});