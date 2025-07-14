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

import LoadingModal from "@/components/modals/loading";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import { UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import sessionManager from "@/session/session";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import React from "react";
import { FlatList, Platform, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import Defaults from "../default/default";

interface IProps { }

interface IState {
    passcode: string[];
    loading: boolean;
}

export default class CreateNewPasskeyScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Passkey Screen";
    private pinRefs: React.RefObject<TextInput | null>[] = Array(4).fill(null).map(() => React.createRef<TextInput>());
    constructor(props: IProps) {
        super(props);
        this.state = { passcode: Array(4).fill(""), loading: false };
        if (!this.session) {
            logger.log("Session not found. Redirecting to login screen.");
        };

        const login: boolean = Defaults.LOGIN_STATUS();
        if (!login) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            return;
        };
    }

    private processLoginRefresh = async () => {
        const { passcode } = this.state;

        try {
            const login: boolean = Defaults.LOGIN_STATUS();
            console.log({ passcode, login });

            if (!passcode.join("") || passcode.join("").length < 4) throw new Error("Your pin is wrong please try again");
            await sessionManager.updateSession({
                ...this.session,
                passkey: passcode.join(""),
            })
            router.navigate("/passkey/confirm");

        } catch (error: any) {
            logger.log("Passkey Error: ", error.message);
            Defaults.TOAST(error.message, "Error");
        } finally {
            this.setState({ loading: false });
        }
    };

    private handlePinInput = (value: string, index: number): void => {
        let { passcode } = this.state;
        const newPin = [...passcode];

        if (value === 'Backspace') {
            if (newPin[index]) {
                newPin[index] = "";
            } else if (index > 0) {
                newPin[index - 1] = "";
                this.pinRefs[index - 1].current?.focus();
            }
        } else {
            newPin[index] = value;
            if (index < newPin.length - 1) {
                this.pinRefs[index + 1].current?.focus();
            }
        }

        this.setState({ passcode: newPin }, async () => {
            if (newPin.join("").length === 4) {
                await this.processLoginRefresh();
            }
        });
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
                    showSoftInputOnFocus={false}
                    onFocus={(e) => {
                        if (Platform.OS === 'web') {
                            e.target.blur();
                        }
                    }}
                />
            </ThemedView>
        );
    };

    private renderKeypadItem = ({ item }: { item: any }): React.JSX.Element => (
        <TouchableOpacity
            style={styles.box}
            onPress={() => {
                if (item === '.') {
                    return;
                }

                const index = item === 'Backspace'
                    ? this.state.passcode.findIndex(p => p === '') - 1
                    : this.state.passcode.findIndex(p => !p);

                this.handlePinInput(item.toString(), index >= 0 ? index : this.state.passcode.length - 1);
            }}>
            {item === 'Backspace'
                ? <MaterialCommunityIcons name="backspace" size={24} color="red" />
                : <ThemedText style={styles.buttonText}>{item}</ThemedText>}
        </TouchableOpacity>
    );

    render(): React.ReactNode {
        const { passcode, loading } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.container}>
                    <ThemedView style={styles.passkeyContainer}>

                        <ThemedView style={styles.title}>
                            <ThemedText style={styles.titleText}>Setup New Passkey</ThemedText>
                        </ThemedView>

                        <ThemedView style={styles.sub_con}>
                            <Image
                                source={require("../../assets/icons/logo.svg")}
                                tintColor="#253E92"
                                style={{ width: 150, height: 150 }}
                                transition={1000} />
                        </ThemedView>

                        <ThemedView>
                            <ThemedView
                                style={{
                                    height: 1,
                                    width: '100%',
                                    backgroundColor: '#E8E8E8',
                                    marginBottom: 24,
                                }}
                            />

                            <ThemedView>

                                <ThemedView>
                                    <ThemedView style={{ marginBottom: 0, marginTop: 40 }}>
                                        <FlatList
                                            data={passcode}
                                            renderItem={this.renderInputItem}
                                            keyExtractor={(item, index) => index.toString()}
                                            horizontal={true}
                                            contentContainerStyle={styles.inputContainer}
                                        />
                                    </ThemedView>
                                    <FlatList
                                        data={[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'Backspace']}
                                        renderItem={this.renderKeypadItem}
                                        keyExtractor={(item, index) => index.toString()}
                                        numColumns={3}
                                        contentContainerStyle={styles.keypad}
                                        style={{ paddingBottom: 20 }}
                                    />
                                </ThemedView>

                            </ThemedView>

                        </ThemedView>
                    </ThemedView>
                </ThemedSafeArea>
                <LoadingModal loading={loading} />
            </>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 35 : 0,
    },
    title: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingVertical: 20,
        paddingHorizontal: 20
    },
    sub_con: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    titleText: {
        fontSize: 22,
        fontFamily: 'AeonikMedium',
    },
    passkeyContainer: {
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
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
        position: 'absolute',
        bottom: 20,
    },
    keypad: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    box: {
        width: 90,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        marginVertical: 15,
        borderRadius: 10,
    },
    buttonText: {
        fontSize: 32,
        lineHeight: 36,
        fontFamily: 'AeonikMedium',
    },
});