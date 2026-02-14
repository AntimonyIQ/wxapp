import PrimaryButton from "@/components/button/primary";
import LoadingModal from "@/components/modals/loading";
import MessageModal from "@/components/modals/message";
import PinModal from "@/components/modals/pin";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import { Status } from "@/enums/enums";
import { ILocation, IMarket, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import {
    addNotificationReceivedListener,
    addNotificationResponseReceivedListener,
    registerForPushNotificationsAsync,
    removeNotificationSubscription,
    scheduleNotification
} from "@/notifications/notification";
import WalletService from "@/service/wallet";
import sessionManager from "@/session/session";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import Handshake from "../../handshake/handshake";
import Defaults from "../default/default";

interface IProps { }

interface IState {
    loading: boolean;
    error_modal: boolean;
    error_title: string;
    error_message: string;
    pin_modal: boolean;
    pin: string;
    expoPushToken: string;
    location: ILocation;
}

interface IDetails {
    icon: string;
    symbol: string;
    amount: string;
    price: string;
    float: Direction;
}

enum Direction {
    right = "right",
    left = "left",
}

export default class SwapConfirmScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Swap Confirm";
    private notificationListener: any;
    private responseListener: any;

    // Swap data from session params (set by index.tsx before navigating)
    private fromAsset: IMarket;
    private toAsset: IMarket;
    private fromValue: string;
    private toValue: string;
    private exchangeFee: number;

    constructor(props: IProps) {
        super(props);

        // Read swap params from session
        const params = this.session.params;
        this.fromAsset = params?.fromAsset || ({} as IMarket);
        this.toAsset = params?.toAsset || ({} as IMarket);
        this.fromValue = params?.fromValue || "0";
        this.toValue = params?.toValue || "0";
        this.exchangeFee = params?.exchangeFee || 0;

        this.state = {
            loading: false,
            error_modal: false,
            error_title: "",
            error_message: "",
            pin_modal: false,
            pin: "",
            expoPushToken: "",
            location: {
                country: "Unknown",
                city: "Unknown",
                ip: "Unknown",
            } as ILocation,
        };

        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        }
    }

    componentDidMount(): void {
        this.getLocationFromIP();
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
    }

    // ── Get Location From IP ──────────────────────────────────────────
    private getLocationFromIP = async () => {
        try {
            const response = await fetch("https://ipapi.co/json/");
            const data = await response.json();
            this.setState({ location: data });
        } catch (error) {
            console.log("Error getting location", error);
        }
    };

    // ── Format To Money String ────────────────────────────────────────
    private formatToMoneyString = (money: number = 0): string => {
        return money.toLocaleString(undefined, {
            minimumFractionDigits: Defaults.MIN_DECIMAL,
            maximumFractionDigits: Defaults.MAX_DECIMAL,
        });
    };

    // ── Handle Process Swap (Secure Handshake Flow) ───────────────────
    private handleProcessSwap = async (): Promise<void> => {
        const { pin, location } = this.state;

        try {
            this.setState({ loading: true });

            await Defaults.IS_NETWORK_AVAILABLE();

            const login = Defaults.LOGIN_STATUS();
            if (!login) {
                router.replace(this.session.passkeyEnabled ? "/passkey" : "/onboarding/login");
                return;
            }

            if (!pin || pin.length !== 4) {
                throw new Error("Invalid pin provided!");
            }

            // Step 1: Initialise transaction
            const initRes = await fetch(`${Defaults.API}/transaction/init`, {
                method: "GET",
                headers: {
                    ...Defaults.HEADERS,
                    "x-wealthx-handshake": this.session.client.publicKey,
                    "x-wealthx-deviceid": this.session.deviceid,
                    "x-wealthx-location": location.country && location.city ? `${location.city}, ${location.country}` : "Unknown",
                    "x-wealthx-ip": location?.ip || "Unknown",
                    "x-wealthx-devicename": this.session.devicename,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
            });

            const initData = await initRes.json();
            if (initData.status === "error") throw new Error(initData.message || initData.error);
            if (!initData.handshake) throw new Error("Unable to process transaction right now, please try again.");

            // Step 2: Build swap body data
            const bodyData = {
                fromCurrency: this.fromAsset.currency,
                toCurrency: this.toAsset.currency,
                fromValue: this.fromValue,
                toValue: this.toValue,
                fromNetwork: this.fromAsset.network,
                toNetwork: this.toAsset.network,
                pin,
            };

            // Step 3: Encrypt with handshake
            const secret = Handshake.secret(this.session.client.privateKey, initData.handshake);
            const transaction = Handshake.encrypt(JSON.stringify(bodyData), secret);

            // Step 4: Execute swap
            const swapRes = await fetch(`${Defaults.API}/wallet/swap`, {
                method: "POST",
                headers: {
                    ...Defaults.HEADERS,
                    "x-wealthx-handshake": this.session.client.publicKey,
                    "x-wealthx-deviceid": this.session.deviceid,
                    "x-wealthx-devicename": this.session.devicename,
                    "x-wealthx-txkey": initData.handshake,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
                body: JSON.stringify({ transaction }),
            });

            const result = await swapRes.json();

            if (result.status === "error") {
                throw new Error(result.message || result.error);
            }

            if (result.status === "success") {
                await scheduleNotification(
                    "Swap Successful",
                    `Your swap of ${this.fromValue} ${this.fromAsset.currency} to ${this.toAsset.currency} was successful.`,
                    { type: "success" },
                    2
                );

                await WalletService.fetchWalletData({ force: true, showLoading: false });
                this.setState({ loading: false });
                router.navigate("/swap/success");
            }
        } catch (error: any) {
            logger.error("Error processing swap: ", error);
            this.setState({
                error_modal: true,
                error_title: "Swap Error",
                error_message: error.message || "An error occurred while processing swap request",
            });
        } finally {
            this.setState({ loading: false });
        }
    };

    // ── Details View (Left / Right swap card) ─────────────────────────
    private DetailsView = (details: IDetails): React.JSX.Element => {
        return (
            <ThemedView style={[styles.detailsContainer, { alignItems: details.float === Direction.right ? "flex-end" : "flex-start" }]}>
                <ThemedView style={{
                    flexDirection: "row",
                    gap: 5,
                    backgroundColor: "white",
                    padding: 2,
                    paddingRight: 6,
                    borderRadius: 100,
                    alignItems: "center",
                }}>
                    <Image source={{ uri: details.icon }} style={{ height: 24, width: 24 }} />
                    <ThemedText
                        style={{
                            fontSize: 14,
                            fontWeight: "500",
                            fontFamily: "AeonikRegular",
                        }}
                    >
                        {details.symbol}
                    </ThemedText>
                </ThemedView>
                <ThemedText
                    style={{
                        fontSize: details.amount.length > 12 ? 22 : 24,
                        fontFamily: "AeonikBold",
                    }}
                >
                    {details.amount}
                </ThemedText>
                <ThemedText
                    style={{
                        fontSize: 12,
                        color: "#757575",
                        fontFamily: "AeonikRegular",
                        lineHeight: 14,
                    }}>
                    {details.price}
                </ThemedText>
            </ThemedView>
        );
    };

    // ── Description Row ───────────────────────────────────────────────
    private DescriptionView = ({ name, description }: { name: string; description: string }): React.JSX.Element => {
        return (
            <ThemedView style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, backgroundColor: "transparent" }}>
                <ThemedText
                    style={{ fontFamily: "AeonikRegular", fontSize: 14, lineHeight: 16, color: "#757575" }}>
                    {name}
                </ThemedText>
                <ThemedText style={{ fontFamily: "AeonikMedium", fontSize: 14, lineHeight: 16 }} >
                    {description}
                </ThemedText>
            </ThemedView>
        );
    };

    render(): React.ReactNode {
        const { error_modal, error_message, error_title, loading, pin_modal } = this.state;

        const fromAmount = this.formatToMoneyString(Number(this.fromValue));
        const toAmount = this.formatToMoneyString(Number(this.toValue));

        // Calculate USD value (without formatting yet)
        const commonUsdValue = Number(this.fromValue) * (this.fromAsset.price || 0);
        // Format as currency: "$1,234.56"
        const formattedUsdPrice = `$${commonUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
                        <ThemedText style={styles.title}>Swap</ThemedText>
                        <ThemedView style={{ width: 50 }} />
                    </ThemedView>

                    <ThemedView style={styles.content}>
                        {/* ── Swap Cards ── */}
                        <ThemedView
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                            <this.DetailsView
                                icon={this.fromAsset.icon}
                                symbol={this.fromAsset.currency}
                                amount={fromAmount}
                                price={formattedUsdPrice}
                                float={Direction.left}
                            />
                            <Image
                                source={require("../../assets/images/swap.png")}
                                style={{ marginHorizontal: -16, zIndex: 1, height: 40, width: 40 }} />
                            <this.DetailsView
                                float={Direction.right}
                                icon={this.toAsset.icon}
                                symbol={this.toAsset.currency}
                                amount={toAmount}
                                price={formattedUsdPrice}
                            />
                        </ThemedView>

                        {/* ── Info Section ── */}
                        <ThemedView
                            style={{
                                padding: 12,
                                backgroundColor: "#F7F7F7",
                                borderRadius: 12,
                                marginTop: 20,
                            }}
                        >
                            <this.DescriptionView
                                name={"Price"}
                                description={`${fromAmount} ${this.fromAsset.currency} = ${toAmount} ${this.toAsset.currency}`}
                            />
                            <this.DescriptionView
                                name={"Minimum after slippage"}
                                description={`${toAmount} ${this.toAsset.currency}`}
                            />
                            <this.DescriptionView
                                name={"Exchange fee"}
                                description={`${this.formatToMoneyString(this.exchangeFee)} ${this.fromAsset.currency}`}
                            />
                            <ThemedView
                                style={{
                                    height: 1,
                                    backgroundColor: "#E8E8E8",
                                    width: "100%",
                                    marginTop: 12,
                                    marginBottom: 12,
                                }}
                            />
                            <this.DescriptionView
                                name={"Expected Output"}
                                description={`${toAmount} ${this.toAsset.currency}`}
                            />
                        </ThemedView>
                    </ThemedView>

                    {/* ── Continue Button ── */}
                    <ThemedView
                        style={{
                            position: "absolute",
                            bottom: 40,
                            paddingHorizontal: 16,
                            width: "100%",
                        }}
                    >
                        <PrimaryButton Gradient title={"Continue"} onPress={() => this.setState({ pin_modal: true })} />
                    </ThemedView>

                    {/* ── Modals ── */}
                    {pin_modal && (
                        <PinModal
                            visible={pin_modal}
                            onClose={(): void => this.setState({ pin_modal: false })}
                            onComplete={(pin: string): void =>
                                this.setState({ pin_modal: false, pin }, async () => {
                                    await this.handleProcessSwap();
                                })
                            }
                        />
                    )}
                    {error_modal && (
                        <MessageModal
                            visible={error_modal}
                            type={Status.ERROR}
                            onClose={(): void => this.setState({ error_modal: false })}
                            message={{ title: error_title, description: error_message }}
                        />
                    )}
                    {loading && <LoadingModal loading={loading} />}
                    <StatusBar style={"dark"} />
                </ThemedSafeArea>
            </>
        );
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingVertical: Platform.OS === "android" ? 50 : Platform.OS === "web" ? 20 : 0,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "web" ? 10 : 0,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f7f7f7",
        borderRadius: 99,
        paddingVertical: 5,
        paddingRight: 20,
    },
    backIcon: {
        height: 24,
        width: 24,
    },
    backText: {
        fontFamily: "AeonikRegular",
        fontSize: 12,
        lineHeight: 14,
    },
    title: {
        fontSize: 16,
    },
    content: {
        marginTop: 46,
        marginHorizontal: 16,
    },
    detailsContainer: {
        gap: 8,
        backgroundColor: "#F2F2F2",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 16,
        width: "50%",
    },
});