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
import { ActivityIndicator, Appearance, ColorSchemeName, Keyboard, Platform, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import Defaults from "../default/default";
import MessageModal from "@/components/modals/message";
import LoadingModal from "@/components/modals/loading";
import PinModal from "@/components/modals/pin";
import ConfirmModal from "@/components/modals/confirm";
import {
    addNotificationReceivedListener,
    addNotificationResponseReceivedListener,
    registerForPushNotificationsAsync,
    removeNotificationSubscription,
    scheduleNotification
} from "@/notifications/notification";
import AmountField from "@/components/inputs/amount";
import { IList, ILocation, IMarket, IResponse, UserData } from "@/interface/interface";
import { BlockchainNetwork, Coin, Status, WalletType } from "@/enums/enums";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import Handshake from "@/handshake/handshake";

interface IProps { }

interface IState {
    loading: boolean;
    bottomsheet: boolean;
    error_modal: boolean;
    error_title: string;
    error_message: string;
    pin_modal: boolean;
    pin: string;
    twofa: string;
    twofamodal: boolean;
    amount: string;
    cryptoAmount: number;
    confirm_modal: boolean;
    expoPushToken: string;
    asset: IMarket;
    location: ILocation | null;
}

export default class SendScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Send Screen";
    private notificationListener: any;
    private responseListener: any;
    constructor(props: IProps) {
        super(props);
        this.state = {
            pin: "",
            loading: false,
            pin_modal: false,
            error_modal: false,
            error_title: "",
            error_message: "",
            bottomsheet: false,
            amount: "",
            cryptoAmount: 0,
            confirm_modal: false,
            expoPushToken: "",
            twofa: "",
            twofamodal: false,
            location: null,
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
        };

        const login: boolean = Defaults.LOGIN_STATUS();
        if (!login) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            return;
        };
    }

    public componentDidMount(): void {
        const { currency, network } = this.session.params;
        const asset: IMarket = Defaults.FIND_MARKET(currency, network);
        this.setState({ asset });
        this.geolocation();
        registerForPushNotificationsAsync().then(token => this.setState({ expoPushToken: token ? token : "" }));

        this.notificationListener = addNotificationReceivedListener(notification => {
            logger.log("notification: ", notification);
        });

        this.responseListener = addNotificationResponseReceivedListener(response => {
            logger.log("response: ", response);
        });
    }

    componentWillUnmount() {
        removeNotificationSubscription(this.notificationListener);
        removeNotificationSubscription(this.responseListener);
    };

    private geolocation = async () => {
        try {
            const res = await fetch('https://ipapi.co/json/', {
                method: 'GET',
                headers: { "Accept": "application/json" }
            });

            if (!res.ok) throw new Error('Failed to fetch location data from IP!');

            const data = await res.json();
            if (!data) throw new Error('Failed to fetch location data from IP!');

            this.setState({ location: data });
        } catch (error) {
            console.error('Unable to fetch location from IP!', error);
        }
    };

    private confirm = async (): Promise<void> => {
        const { cryptoAmount, asset, amount } = this.state;
        try {
            Keyboard.dismiss();
            if (!cryptoAmount || cryptoAmount <= 0) throw new Error("Please enter an amount to send");
            if (asset.balance <= cryptoAmount) throw new Error(`Insufficient ${asset.currency} balance`);
            if ((asset.currency === Coin.USDT || asset.currency === Coin.USDC) && parseFloat(amount) < 10) throw new Error("Minimum amount to send is $10");
            if (asset.currency === Coin.BTC && parseFloat(amount) < 20) throw new Error(`Minimum amount to send is $20 for ${asset.currency}`);
            if (asset.currency === Coin.ETH && parseFloat(amount) < 20) throw new Error(`Minimum amount to send is $20 for ${asset.currency}`);

            this.setState({ confirm_modal: true });
        } catch (error: any) {
            logger.error(error.message || error);
            this.setState({ error_modal: true, error_title: "Transaction Error", error_message: error.message });
        }
    }

    private confirm_data = (): Array<Partial<IList>> => {
        const { asset, cryptoAmount } = this.state;
        const { params } = this.session;
        return [
            { name: "Transfer fees", description: `0 ${asset.currency} ( ~$(0) Fast` },
            { name: "Provider", description: "wealthx" },
            { name: "From", description: asset.address.slice(0, 8) + "..." + asset.address.slice(-8) },
            { name: "To", description: (params.toaddress || "").slice(0, 8) + "..." + (params.toaddress || "").slice(-8) },
            { name: "Amount", description: `${(asset.currency === Coin.USDC || asset.currency === Coin.USDT) ? cryptoAmount.toFixed(2) : cryptoAmount.toFixed(8)} ${asset.currency}` },
        ];
    };

    private handleAmountChange = async (amount: string): Promise<void> => {
        const cryptoAmount: number = Number(amount) / this.state.asset.price;
        this.setState({ amount: amount, cryptoAmount });
    }

    private sendTransaction = async (): Promise<void> => {
        const { cryptoAmount, pin, location, asset } = this.state;
        const { toaddress } = this.session.params;
        try {
            Keyboard.dismiss();
            this.setState({ loading: true });
            await Defaults.IS_NETWORK_AVAILABLE();

            const login: boolean = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            };

            const res = await fetch(`${Defaults.API}/transaction/init`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-location': location ? `${location?.region}, ${location?.country}` : "Unknown",
                    'x-wealthx-ip': location?.ip || "Unknown",
                    'x-wealthx-devicename': this.session.devicename,
                }
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process transaction right now, please try again.');

                const amountToSend = asset.currency === "USDT" || asset.currency === "USDC"
                    ? Number(cryptoAmount).toFixed(2)
                    : Number(cryptoAmount).toFixed(6);

                const payload = { coin: asset.currency, toAddress: toaddress, amount: amountToSend, pin: pin };

                const secret = Handshake.secret(this.session.client.privateKey, data.handshake);
                const body = Handshake.encrypt(JSON.stringify(payload), secret);

                const res = await fetch(`${Defaults.API}/auth/login`, {
                    method: 'POST',
                    headers: {
                        ...Defaults.HEADERS,
                        'x-wealthx-handshake': this.session.client.publicKey,
                        'x-wealthx-deviceid': this.session.deviceid,
                        'x-wealthx-location': location ? `${location?.region}, ${location?.country}` : "Unknown",
                        'x-wealthx-ip': location?.ip || "Unknown",
                        'x-wealthx-devicename': this.session.devicename,
                    },
                    body: body,
                });

                const senddata: IResponse = await res.json();
                if (senddata.status === Status.ERROR) throw new Error(senddata.message || senddata.error);
                if (senddata.status === Status.SUCCESS) {
                    await scheduleNotification(
                        "Transaction Request",
                        `You have request to sent ${cryptoAmount} ${asset.currency} to ${toaddress}`,
                        { type: "success" },
                        2
                    );

                    await sessionManager.updateSession({
                        ...this.session,
                        params: {
                            ...this.session.params,
                            amount: amountToSend,
                        }
                    })

                    router.navigate('/send/success');
                }
            }
        } catch (error: any) {
            logger.error(error.message || error);
            this.setState({ error_modal: true, error_title: "Transaction Error", error_message: error.message });
        } finally {
            this.setState({ loading: false, confirm_modal: false, error_modal: false, error_title: "", error_message: "", pin_modal: true });
        }
    }

    render(): React.ReactNode {
        const { loading, cryptoAmount, error_title, confirm_modal, error_modal, error_message, pin_modal, amount, asset } = this.state;
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
                                tintColor={"#000000"} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.title}>Send</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.content}>
                        <AmountField
                            placeholder="0.00"
                            balance={asset.balance}
                            title="Enter Amount"
                            showText={true}
                            value={amount}
                            onBlur={(): void => Keyboard.dismiss()}
                            onFocus={(): void => { }}
                            maxLength={9}
                            symbol={asset.currency}
                            onChangeText={this.handleAmountChange}
                            coinRate={(): void => { }}
                            rate={asset.price}
                            asset={asset}
                            currencyName={asset.name} />
                    </ThemedView>

                    <ThemedView style={styles.nextButtonContainer}>
                        <ThemedView style={styles.transactionFeeContainer}>
                            <ThemedText style={styles.transactionFeeTextLeft}>Transaction fee</ThemedText>
                            <ThemedView style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
                                <ThemedText style={styles.transactionFeeTextRight}>0 {asset.currency}</ThemedText>
                            </ThemedView>
                        </ThemedView>
                        <Pressable
                            style={[styles.nextButton, { backgroundColor: (!amount || loading) ? "#ccc" : '#FBA91E' }]}
                            onPress={this.confirm}
                            disabled={!amount || loading}>
                            {loading ?
                                <ActivityIndicator color={"#FFFFFF"} /> : <ThemedText style={styles.nextButtonText}> Continue </ThemedText>
                            }
                        </Pressable>
                    </ThemedView>

                    <MessageModal
                        visible={error_modal}
                        type={Status.ERROR}
                        onClose={(): void => this.setState({ error_modal: !error_modal })}
                        message={{ title: error_title, description: error_message }} />
                    <LoadingModal loading={loading} />
                    <PinModal
                        visible={pin_modal}
                        onClose={(): void => this.setState({ pin_modal: !pin_modal })}
                        onComplete={(pin: string): void => this.setState({ pin_modal: false, pin: pin }, async () => {
                            await this.sendTransaction();
                        })} />
                    <ConfirmModal
                        asset={asset}
                        visible={confirm_modal}
                        onClose={(): void => this.setState({ confirm_modal: !confirm_modal })}
                        onConfirm={(): void => this.setState({ confirm_modal: false }, async () => {
                            this.setState({ pin_modal: true });
                        })}
                        amount={cryptoAmount.toFixed(asset.currency === Coin.USDC || asset.currency === Coin.USDT ? 2 : 8)}
                        list={this.confirm_data()}
                        dollarEquiv={Number(Number(amount).toLocaleString())}>
                    </ConfirmModal>
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
        height: 24,
        width: 24,
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
    transactionFeeContainer: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
        justifyContent: 'space-between',
    },
    transactionFeeTextLeft: {
        fontSize: 14,
        fontFamily: 'AeonikMedium',
    },
    transactionFeeTextRight: {
        fontSize: 14,
        fontFamily: 'AeonikMedium',
        paddingHorizontal: 10
    }
});