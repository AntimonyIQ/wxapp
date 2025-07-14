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
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { Appearance, Platform, Pressable, StyleSheet, Vibration } from "react-native";
import { Image } from "expo-image";
import Defaults from "../default/default";
import * as Clipboard from 'expo-clipboard';
import Toast from "react-native-toast-message";
import PrimaryButton from "@/components/button/primary";
import { IMarket, UserData } from "@/interface/interface";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import { BlockchainNetwork, Coin, WalletType } from "@/enums/enums";

interface IProps { }

interface IState {
    asset: IMarket;
}

export default class SendSuccessScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Send Success";
    constructor(props: IProps) {
        super(props);
        this.state = {
            asset: {
                currency: Coin.BTC,
                name: "",
                categorie: WalletType.CRYPTO,
                network: BlockchainNetwork.ETHEREUM,
                address: "",
                price: 0,
                balance: 0,
                balanceUsd: 0,
                icon: "",
                percent_change_24h: 0,
                volume_change_24h: 0,
                market_cap: 0,
                active: false
            }
        }
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
    }

    componentDidMount(): void {
        logger.clear();
        const { currency, network } = this.session.params;
        const asset: IMarket = Defaults.FIND_MARKET(currency, network);
        this.setState({ asset });
    }

    private copy = async () => {
        const { toaddress } = this.session.params
        await Clipboard.setStringAsync(String(toaddress));

        const vibrationPattern = [0, 5];
        Vibration.vibrate(vibrationPattern, false);

        Toast.show({
            type: 'success',
            text1: 'Copied',
            text2: `copied: ${toaddress}`,
            text1Style: { fontSize: 16, fontFamily: 'AeonikBold' },
            text2Style: { fontSize: 12, fontFamily: 'AeonikRegular' },
        });
    };

    render(): React.ReactNode {
        const { asset } = this.state;
        const { amount } = this.session.params;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.container}>
                    <ThemedView style={styles.content}>

                        <ThemedView style={styles.iconContainer}>
                            <Image
                                source={require("../../assets/images/sales.png")}
                                style={{ width: 180, height: 180 }}
                                tintColor={"#111827"}
                                transition={500} />
                            <ThemedView style={styles.textContainer}>
                                <ThemedText style={styles.title}>
                                    Your transaction is being processed
                                </ThemedText>
                                <ThemedText style={styles.subtitle}>
                                    We'll notify you once it's completed. Thank you for your patience!
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>

                        <ThemedView style={styles.amountContainer}>
                            <ThemedText style={styles.label}>You sent</ThemedText>
                            <ThemedText style={styles.amount}>{(amount ? amount : 0).toLocaleString(undefined,
                                {
                                    minimumFractionDigits: Defaults.MIN_DECIMAL,
                                    maximumFractionDigits: asset.currency === Coin.USDC || asset.currency === Coin.USDT ? 2 : 8
                                })} {asset.currency}</ThemedText>
                        </ThemedView>

                        <ThemedView style={styles.ethAddressContainer}>
                            <ThemedView style={styles.ethIconContainer}>
                                <Image
                                    source={{ uri: asset.icon }}
                                    style={{ width: 16, height: 16 }} />
                                <ThemedText style={styles.ethLabel}>
                                    {asset.currency} Destination Wallet Address
                                </ThemedText>
                            </ThemedView>
                            <Pressable
                                style={styles.addressPressable}
                                onPress={() => this.copy()}
                            >
                                <ThemedText style={styles.addressText}>{asset.address}</ThemedText>
                                <ThemedView style={styles.copyButton}>
                                    <ThemedText>copy</ThemedText>
                                </ThemedView>
                            </Pressable>
                        </ThemedView>

                        <ThemedView style={styles.buttonContainer}>
                            <PrimaryButton onPress={async (): Promise<void> => {
                                await sessionManager.updateSession({
                                    ...this.session,
                                    params: {
                                        ...this.session.params,
                                        toaddress: "",
                                        amount: ""
                                    }
                                })
                                router.push("/dashboard");
                            }} Gradient title={'Done'} />
                        </ThemedView>

                    </ThemedView>
                </ThemedSafeArea>
            </>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Platform.OS === 'android' ? 50 : Platform.OS === "web" ? 20 : 0,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 44,
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    title: {
        fontSize: 20,
        fontFamily: 'AeonikBold',
        color: Appearance.getColorScheme() === "dark" ? '#f8faff' : '#111827',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: Appearance.getColorScheme() === "dark" ? '#a3adc2' : '#6B7280',
        lineHeight: 18,
        fontFamily: 'AeonikRegular',
        textAlign: 'center',
    },
    amountContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    label: {
        fontSize: 14,
        color: Appearance.getColorScheme() === "dark" ? '#d2d2d2' : '#757575',
        lineHeight: 14,
        fontFamily: 'AeonikRegular',
    },
    amount: {
        fontSize: 40,
        lineHeight: 48,
        fontFamily: 'AeonikBold',
        marginTop: 8,
    },
    ethAddressContainer: {
        marginTop: 24,
        width: '100%',
        paddingHorizontal: 16,
    },
    ethIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 4,
    },
    ethLabel: {
        fontSize: 12,
        lineHeight: 14,
        fontFamily: 'AeonikRegular',
    },
    addressPressable: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 21,
        width: '100%',
        backgroundColor: Appearance.getColorScheme() === "dark" ? '#010101' : '#F7F7F7',
        borderRadius: 12,
        marginTop: 12,
    },
    addressText: {
        fontFamily: 'AeonikRegular',
        fontSize: 12,
        fontStyle: 'normal',
        lineHeight: 14,
    },
    copyButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 99,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        paddingHorizontal: 16,
    },
});