import React from "react";
import sessionManager from "@/session/session";
import { IList, ITransaction, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import Defaults from "../default/default";
import MessageModal from "@/components/modals/message";
import LoadingModal from "@/components/modals/loading";
import PinModal from "@/components/modals/pin";
import {
    addNotificationReceivedListener,
    addNotificationResponseReceivedListener,
    registerForPushNotificationsAsync,
    removeNotificationSubscription,
    scheduleNotification
} from "@/notifications/notification";
import PrimaryButton from "@/components/button/primary";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import ThemedSafeArea from "@/components/ThemeSafeArea";

interface IProps { }

interface IState {
    NGN_BALANCE: number;
    loading: boolean;
    transactions: ITransaction[];
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

interface IDetails {
    icon: string;
    symbol: string;
    amount: number;
    price: number;
    float: Direction;
}

enum Direction {
    right = "right",
    left = "left",
}

export default class SwapConfirmScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Swap Confirm Screen";
    private swap: ISwapPayload;
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
            wealthxFee: 0
        };
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
        this.swap = this.session.swapPayload;
    }

    componentDidMount(): void {
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

    private exchange = async (): Promise<void> => {
        try {
            const { fromSwap, fromValue, toSwap, toValue } = this.swap;
            this.setState({ loading: true });

            await Defaults.IS_NETWORK_AVAILABLE();
            if (!this.state.pin && this.state.pin.length === 4) throw new Error("Invalid pin provided!");


            const payload: string = JSON.stringify({
                fromCoin: fromSwap.symbol,
                toCoin: toSwap.symbol,
                amount: fromValue,
                toAmount: toValue,
                pin: this.state.pin,
            });

            const response = await fetch(`${Defaults.API}/blockchain/swap-coin`, {
                method: 'POST',
                headers: { ...Defaults.HEADERS, "Authorization": `Bearer ${this.session.accessToken}` },
                body: payload,
            });

            const data: Record<string, any> = await response.json();

            if (data.success === true) {
                await scheduleNotification(
                    "Swap transaction successful",
                    data.message,
                    { type: "success" },
                    2
                );

                this.setState({ loading: false });
                router.navigate("/swap/success");
            } else {
                await scheduleNotification(
                    "Swap transaction failed",
                    `Swap trade for ${fromSwap.symbol} -> ${toSwap.symbol} has failed, please try again!`,
                    { type: "success" },
                    2
                );

                throw new Error(data.message || "swap failed please try again.")
            }
        } catch (error: any) {
            logger.error("Error exchanging: ", error);
            this.setState({ error_modal: true, error_title: "Swap Error", error_message: error.message });
        } finally {
            this.setState({ loading: false });
        }
    };

    private DetailsView = (details: IDetails): React.JSX.Element => {
        logger.log(`DetailsView: ${details.symbol} = ${details.amount}`);
        return (
            <ThemedView style={[styles.detailsContainer, { alignItems: details.float === Direction.right ? 'flex-end' : 'flex-start' }]}>
                <ThemedView style={{
                    flexDirection: 'row',
                    gap: 5,
                    backgroundColor: 'white',
                    padding: 2,
                    paddingRight: 6,
                    borderRadius: 100,
                    alignItems: 'center',
                }}>
                    <Image source={{ uri: details.icon }} style={{ height: 24, width: 24 }} />
                    <ThemedText
                        style={{
                            fontSize: 14,
                            fontWeight: '500',
                            fontFamily: 'AeonikRegular',
                        }}
                    >
                        {details.symbol}
                    </ThemedText>
                </ThemedView>
                <ThemedText
                    style={{
                        fontSize: String(details.amount).length > 12 ? 22 : 24,
                        fontFamily: 'AeonikBold',
                    }}
                >
                    {details.amount.toLocaleString()}
                </ThemedText>
                <ThemedText
                    style={{
                        fontSize: 12,
                        color: '#757575',
                        fontFamily: 'AeonikRegular',
                        lineHeight: 14,
                    }}>
                    {details.price.toLocaleString()}
                </ThemedText>
            </ThemedView>
        )
    }

    private DescriptionView = (list: Partial<IList>): React.JSX.Element => {
        return (
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, backgroundColor: "transparent" }}>
                <ThemedText
                    style={{ fontFamily: 'AeonikRegular', fontSize: 14, lineHeight: 16, color: '#757575', }}>
                    {list.name}
                </ThemedText>
                <ThemedText style={{ fontFamily: 'AeonikMedium', fontSize: 14, lineHeight: 16, }} >
                    {list.description}
                </ThemedText>
            </ThemedView>
        )
    }

    render(): React.ReactNode {
        const { error_modal, error_message, error_title, loading, pin_modal } = this.state;
        const { fromSwap, fromValue, fromPrice, toSwap, toValue, toPrice, fees } = this.swap;
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
                                tintColor={"#000000"} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.title}>Swap</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.content}>
                        <ThemedView
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            <this.DetailsView
                                icon={fromSwap.icon}
                                symbol={fromSwap.symbol}
                                amount={fromValue}
                                price={fromPrice}
                                float={Direction.left}
                            />
                            <Image
                                source={require("../../assets/images/swap.png")}
                                style={{ marginHorizontal: -16, zIndex: 1, height: 40, width: 40 }} />
                            <this.DetailsView
                                float={Direction.right}
                                icon={toSwap.icon}
                                symbol={toSwap.symbol}
                                amount={toValue}
                                price={toPrice}
                            // price={toSwap.symbol === Coin.NGN ? (1 / toSwap.exchangeRate) : toSwap.exchangeRate}
                            />
                        </ThemedView>
                        <ThemedView
                            style={{
                                padding: 12,
                                backgroundColor: '#F7F7F7',
                                borderRadius: 12,
                                marginTop: 20,
                            }}
                        >
                            <this.DescriptionView name={'Price'} description={`${fromValue.toLocaleString()} ${fromSwap.symbol} = ${toValue} ${toSwap.symbol}`} />
                            <this.DescriptionView name={'Minimum after slippage'} description={`${toValue.toLocaleString()} ${fromSwap.symbol}`} />
                            <this.DescriptionView name={'Transaction fee'} description={`${fromSwap.gas.toLocaleString()} ${fromSwap.symbol}`} />
                            <this.DescriptionView name={'Exchange fee'} description={`${fees.toLocaleString()} ${fromSwap.symbol}`} />
                            <ThemedView
                                style={{
                                    height: 1,
                                    backgroundColor: '#E8E8E8',
                                    width: '100%',
                                    marginTop: 12,
                                    marginBottom: 12,
                                }}
                            />
                            <this.DescriptionView name={'Expected Output'} description={`${toValue.toLocaleString()} ${toSwap.symbol}`} />
                        </ThemedView>
                    </ThemedView>

                    <ThemedView
                        style={{
                            position: 'absolute',
                            bottom: 40,
                            paddingHorizontal: 16,
                            width: '100%',
                        }}
                    >
                        <PrimaryButton Gradient title={'Continue'} onPress={() => this.setState({ pin_modal: true })} />
                    </ThemedView>

                    {pin_modal && <PinModal
                        visible={pin_modal}
                        onClose={(): void => this.setState({ pin_modal: !pin_modal })}
                        onComplete={(pin: string): void => this.setState({ pin_modal: false, pin: pin }, async () => {
                            await this.exchange();
                        })} />}
                    {error_modal && <MessageModal
                        visible={error_modal}
                        type={MessageModalType.ERROR}
                        onClose={(): void => this.setState({ error_modal: !error_modal })}
                        message={{ title: error_title, description: error_message }} />}
                    {loading && <LoadingModal loading={loading} />}
                    <StatusBar style={"dark"} />
                </ThemedSafeArea>
            </>
        )
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
    },
    extraButton: {
        backgroundColor: 'white',
    },
    placeholderIcon: {
        width: 24,
        height: 24,
    },
    content: {
        marginTop: 46,
        marginHorizontal: 16,
    },
    detailsContainer: {
        gap: 8,
        backgroundColor: '#F2F2F2',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 16,
        width: '50%',
    },
});