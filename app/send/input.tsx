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

import TextField from "@/components/inputs/text";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import { Colors } from "@/constants/Colors";
import { UserData } from "@/interface/interface";
import sessionManager from "@/session/session";
import AddressValidator from "@/validator/address";
import { Image } from "expo-image";
import { router, Stack, } from "expo-router";
import React from "react";
import { Appearance, ColorSchemeName, Platform, Pressable, StyleSheet, TouchableOpacity } from "react-native";

interface IProps { }

interface IState {
    valid: boolean;
    loading: boolean;
    address: string;
}

export default class SendInputAddressScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Send Input Address Screen";
    private validator: AddressValidator;
    constructor(props: IProps) {
        super(props);
        this.state = { valid: false, loading: false, address: "" };
        this.validator = new AddressValidator();
    }

    public componentDidMount(): void { }

    private validateAddress = (address: string): void => {
        const { currency } = this.session.params;
        const isValid = this.validator.address(currency, address);
        this.setState({ valid: isValid });
    };

    private handleAddressChange = (address: string) => {
        this.setState({ address });
        this.validateAddress(address);
    };

    render(): React.ReactNode {
        const { currency } = this.session.params;
        const { valid, address } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.safeArea}>
                    <ThemedView style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}>
                            <Image
                                source={require("../../assets/icons/chevron_right.svg")}
                                style={styles.backIcon}
                                tintColor={this.appreance === "dark" ? Colors.light.background : "#000000"} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.title}>Send {currency}</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.content}>
                        <TextField
                            placeholder="Enter Recipient Address"
                            title="Enter Recipient Address"
                            showText={false}
                            textValue={address}
                            onChangeText={this.handleAddressChange}
                            onBlur={() => { }}
                            onFocus={() => { }}
                            secureTextEntry={false}
                            showPasteButton={true}
                        />
                    </ThemedView>

                    <ThemedView style={styles.nextButtonContainer}>
                        <Pressable
                            style={[styles.nextButton, { backgroundColor: valid ? '#FBA91E' : '#ccc' }]}
                            onPress={async (): Promise<void> => {
                                await sessionManager.updateSession({ ...this.session, params: { ...this.session.params, toaddress: address } });
                                router.push("/send");
                            }}
                            disabled={!valid}
                        >
                            <ThemedText style={styles.nextButtonText}>
                                Next
                            </ThemedText>
                        </Pressable>
                    </ThemedView>
                </ThemedSafeArea>
            </>
        );
    }

}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 50 : Platform.OS === "web" ? 20 : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
        borderRadius: 99,
        paddingVertical: 5,
        paddingRight: 20,
    },
    backIcon: {
        height: 20,
        width: 20,
    },
    backText: {
        fontFamily: 'AeonikRegular',
        fontSize: 12,
        lineHeight: 14,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 30,
        alignItems: 'flex-start',
        width: "100%"
    },
    nextButtonContainer: {
        paddingHorizontal: 16,
        position: Platform.OS === 'android' ? 'absolute' : 'relative',
        bottom: 32,
        width: '100%',
    },
    nextButton: {
        paddingHorizontal: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    nextButtonText: {
        color: '#1F1F1F',
        fontFamily: 'AeonikMedium',
        fontSize: 16,
        lineHeight: 20,
    },
});
