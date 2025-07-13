import React from "react";
import sessionManager from "@/session/session";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { ActivityIndicator, Appearance, ColorSchemeName, Keyboard, Platform, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
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
import { ITransaction, UserData } from "@/interface/interface";
import { Coin } from "@/enums/enums";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";

interface IProps { }

interface IState {
    NGN_BALANCE: number;
    loading: boolean;
    transactions: Array<ITransaction>;
    refreshing: boolean;
    bottomsheet: boolean;
    gasFee: number;
    loadingGasFee: boolean;
    fee_loading: boolean;
    error_modal: boolean;
    error_title: string;
    error_message: string;
    pin_modal: boolean;
    pin: string;
    amount: string;
    cryptoAmount: number;
    confirm_modal: boolean;
    expoPushToken: string;
    rate: number;
    wealthxFee: number;
}

export default class SendScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Send Screen";
    private coin: ISelectedCoin;
    private send: ISend;
    private notificationListener: any;
    private responseListener: any;
    constructor(props: IProps) {
        super(props);
        this.state = {
            NGN_BALANCE: 0,
            pin: "",
            loading: false,
            pin_modal: false,
            error_modal: false,
            error_title: "",
            error_message: "",
            loadingGasFee: false,
            fee_loading: false,
            transactions: [],
            refreshing: false,
            bottomsheet: false,
            gasFee: 0,
            amount: "",
            cryptoAmount: 0,
            confirm_modal: false,
            expoPushToken: "",
            rate: 0,
            wealthxFee: 0,
        };
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
        this.coin = this.session.selectedCoin;
        this.send = this.session.sendTransaction;
    }

    componentDidMount(): void {
        registerForPushNotificationsAsync().then(token => this.setState({ expoPushToken: token ? token : "" }));
        this.getTxFees();

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

    private confirm = async (): Promise<void> => {
        const { gasFee, wealthxFee, cryptoAmount, amount } = this.state;
        const { currency, address } = this.coin;
        try {
            Keyboard.dismiss();

            const totalFee: number = gasFee + wealthxFee;
            const total_amount: number = cryptoAmount + totalFee;

            const user: UserDocument = this.session.user;

            if (user.userType === UserType.USER) {
                if (!cryptoAmount || cryptoAmount <= 0) throw new Error("Please enter an amount to send");
                if (address.balance <= total_amount) throw new Error(`Insufficient ${currency.symbol} balance`);
                if ((currency.symbol === Coin.USDT || currency.symbol === Coin.USDC) && parseFloat(amount) < 10) throw new Error("Minimum amount to send is $10");
                if (currency.symbol === Coin.BTC && parseFloat(amount) < 20) throw new Error(`Minimum amount to send is $20 for ${currency.symbol}`);
                if (currency.symbol === Coin.ETH && parseFloat(amount) < 20) throw new Error(`Minimum amount to send is $20 for ${currency.symbol}`);
                if (totalFee > cryptoAmount) throw new Error(`Insufficient Amount for gas fee`);
            }

            this.setState({ confirm_modal: true });
        } catch (error: any) {
            logger.error(error.message || error);
            this.setState({ error_modal: true, error_title: "Transaction Error", error_message: error.message });
        }
    }

    private confirm_data = (): Array<IConfirmData> => {
        const { gasFee, wealthxFee, amount, rate, cryptoAmount } = this.state;
        const { currency, address } = this.coin;
        const totalFee: number = gasFee + wealthxFee;
        const totalFeeUsd: number = Number(totalFee) / rate;
        return [
            { title: "Transfer fees", details: `${totalFee} ${currency.symbol} ( ~$${totalFeeUsd}) Fast` },
            { title: "Provider", details: "wealthx" },
            { title: "From", details: address.address.slice(0, 8) + "..." + address.address.slice(-8) },
            { title: "To", details: this.send.address.slice(0, 8) + "..." + this.send.address.slice(-8) },
            { title: "Amount", details: `${(currency.symbol === Coin.USDC || currency.symbol === Coin.USDT) ? cryptoAmount.toFixed(2) : cryptoAmount.toFixed(8)} ${currency.symbol}` },
        ];
    };

    private handleAmountChange = async (amount: string): Promise<void> => {
        const { rate } = this.state;

        const cryptoAmount: number = Number(amount) / rate;
        this.setState({ amount: amount, cryptoAmount });

        await this.estimategas();
    }

    private sendTransaction = async (): Promise<void> => {
        const { currency } = this.coin;
        const { gasFee, cryptoAmount, pin, amount } = this.state;
        try {
            Keyboard.dismiss();
            this.setState({ loading: true });
            await Defaults.IS_NETWORK_AVAILABLE();

            const value: number = currency.symbol === Coin.USDC || currency.symbol === Coin.USDT ? parseFloat(cryptoAmount.toFixed(2)) : parseFloat(cryptoAmount.toFixed(8));
            const totalFee: number = gasFee + this.state.wealthxFee;
            const totalvalue: number = value + totalFee;

            const newSend: ISend = { ...this.send, value: cryptoAmount, dollarValue: Number(amount) };
            await sessionManager.updateSession({ ...this.session, sendTransaction: newSend });

            const payload: string = JSON.stringify({
                coin: currency.symbol,
                toAddress: this.send.address,
                amount: totalvalue,
                pin: pin
            });

            const response = await fetch(`${Defaults.API}/blockchain/send-transaction`, {
                method: 'POST',
                headers: { ...Defaults.HEADERS, "Authorization": `Bearer ${this.session.accessToken}` },
                body: payload,
            });

            // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            if (!data.success) {
                await scheduleNotification(
                    "Transaction Failed",
                    `Failed to send ${cryptoAmount} ${currency.symbol} to ${this.send.address}`,
                    { type: "success" },
                    2
                );

                throw new Error(data.message || "Unkown Error");
            }

            await scheduleNotification(
                "Transaction Request",
                `You have request to sent ${cryptoAmount} ${currency.symbol} to ${this.send.address}`,
                { type: "success" },
                2
            );

            router.navigate("/send/success");
        } catch (error: any) {
            logger.error(error.message || error);
            this.setState({ error_modal: true, error_title: "Transaction Error", error_message: error.message });
        } finally {
            this.setState({ loading: false, confirm_modal: false, error_modal: false, error_title: "", error_message: "", pin_modal: true });
        }
    }

    private estimategas = async (): Promise<void> => {
        try {
            this.setState({ loadingGasFee: true });
            const { currency, address } = this.coin;
            const { cryptoAmount } = this.state;

            const response = await fetch(`${Defaults.API}/blockchain/check-gas-fee`, {
                method: 'POST',
                headers: { ...Defaults.HEADERS, "Authorization": `Bearer ${this.session.accessToken}` },
                body: JSON.stringify({ currency: currency.symbol, amount: cryptoAmount, fromAddress: address.address, toAddress: this.send.address })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data.success === true && data.gasFee) this.setState({ gasFee: Number(parseFloat(data.gasFee).toFixed(6)) });
        } catch (error: any) {
            logger.log(error);
        } finally {
            this.setState({ loadingGasFee: false });
        }
    };

    private getTxFees = async () => {
        const { currency } = this.coin;
        try {
            this.setState({ fee_loading: true });
            const apiSymbol = currency.symbol.toLowerCase();

            const response = await fetch(`${Defaults.API}/fee?code=${apiSymbol}&isActive=true`, {
                method: 'GET',
                headers: { ...Defaults.HEADERS, Authorization: `Bearer ${this.session.accessToken}` }
            });

            if (!response.ok) throw new Error(`Error fetching fees rate: ${response.statusText}`);

            const data = await response.json();

            if (data.status === "success") {
                const rate: number = Number(data.rate || 0);
                const wealthxFee = data.data.find((item: { code: string; }) => item.code === apiSymbol);
                logger.log(`wealthx Fee for ${apiSymbol}: `, wealthxFee.value);
                logger.log("rate is: ", data.rate);

                if (wealthxFee) {
                    this.setState({ wealthxFee: Number(wealthxFee.value), rate: rate });
                }
            }
        } catch (error: any) {
            logger.log(error);
        } finally {
            this.setState({ fee_loading: false });
        }
    }

    render(): React.ReactNode {
        const { currency, address } = this.coin;
        const { loading, gasFee, cryptoAmount, error_title, confirm_modal, loadingGasFee, fee_loading, error_modal, error_message, pin_modal, amount, rate } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.safeArea}>
                    <ThemedView style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}>
                            <Image
                                source={require("../../assets/icons/chevron-left.svg")}
                                style={styles.backIcon}
                                tintColor={this.appreance === "dark" ? Colors.light.background : "#000000"} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.title}>Send</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.content}>
                        <AmountField
                            placeholder="0.00"
                            balance={address.balance}
                            title="Enter Amount"
                            showText={true}
                            value={amount}
                            onBlur={(): void => Keyboard.dismiss()}
                            onFocus={(): void => { }}
                            maxLength={9}
                            getEquivalentAmount={(): void => { }}
                            symbol={currency.symbol}
                            getTransactionFee={(): void => { }}
                            onChangeText={this.handleAmountChange}
                            onEquivalentAmountChange={(): void => { }}
                            secureTextEntry={false}
                            coinRate={(): void => { }}
                            rate={rate}
                            currencyName={currency.name} />
                    </ThemedView>

                    <ThemedView style={styles.nextButtonContainer}>
                        <ThemedView style={styles.transactionFeeContainer}>
                            <ThemedText style={styles.transactionFeeTextLeft}>Transaction fee</ThemedText>
                            <ThemedView style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
                                {fee_loading &&
                                    <ActivityIndicator color={"#757575"} size={18} />
                                }
                                <ThemedText style={styles.transactionFeeTextRight}>
                                    {(gasFee || 0)} {currency.symbol.toUpperCase()}
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                        <Pressable
                            style={[styles.nextButton, { backgroundColor: fee_loading ? '#ccc' : '#FBA91E' }]}
                            onPress={this.confirm}
                            disabled={loadingGasFee ? loadingGasFee : fee_loading}
                        >
                            {loading ?
                                <ActivityIndicator color={"#FFFFFF"} /> : <ThemedText style={styles.nextButtonText}> Continue </ThemedText>
                            }
                        </Pressable>
                    </ThemedView>

                    <MessageModal
                        visible={error_modal}
                        type={MessageModalType.ERROR}
                        onClose={(): void => this.setState({ error_modal: !error_modal })}
                        message={{ title: error_title, description: error_message }} />
                    <LoadingModal loading={loading} />
                    <LoadingModal loading={fee_loading} />
                    <PinModal
                        visible={pin_modal}
                        onClose={(): void => this.setState({ pin_modal: !pin_modal })}
                        onComplete={(pin: string): void => this.setState({ pin_modal: false, pin: pin }, async () => {
                            await this.sendTransaction();
                        })} />
                    <ConfirmModal
                        visible={confirm_modal}
                        onClose={(): void => this.setState({ confirm_modal: !confirm_modal })}
                        onConfirm={(): void => this.setState({ confirm_modal: false }, async () => {
                            this.setState({ pin_modal: true });
                        })}
                        amount={cryptoAmount.toFixed(currency.symbol === Coin.USDC || currency.symbol === Coin.USDT ? 2 : 8)}
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
        backgroundColor: Appearance.getColorScheme() === "dark" ? '#070707' : '#f7f7f7',
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