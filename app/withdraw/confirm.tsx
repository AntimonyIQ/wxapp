import PrimaryButton from "@/components/button/primary";
import LoadingModal from "@/components/modals/loading";
import MessageModal from "@/components/modals/message";
import PinModal from "@/components/modals/pin";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import { Coin, Status } from "@/enums/enums";
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
import React from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import Handshake from "../../handshake/handshake";
import banks from "../data/banks.json";
import Defaults from "../default/default";

interface IProps { }

interface IState {
    error_modal: boolean;
    message_type: Status;
    error_title: string;
    error_message: string;
    loading: boolean;
    pin_modal: boolean;
    pin: string;
    expoPushToken: string;
    location: ILocation;
    asset: IMarket;
    otp: string;
}

export default class WithdrawConfirmScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Confirm Withdraw";
    private notificationListener: any;
    private responseListener: any;
    private readonly fee = 80;

    constructor(props: IProps) {
        super(props);
        this.state = {
            error_modal: false,
            message_type: Status.ERROR,
            error_message: "",
            error_title: "",
            loading: false,
            pin_modal: false,
            pin: "",
            expoPushToken: "",
            location: {
                country: "Unknown",
                city: "Unknown",
                ip: "Unknown",
            } as ILocation,
            asset: {} as IMarket,
            otp: ""
        };
    }

    componentDidMount(): void {
        this.filterByCurrency();
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
    };

    private filterByCurrency = (currency = "NGN") => {
        const market = this.session.markets.find((market) => market.currency === currency);
        if (market) {
            this.setState({ asset: market });
        }
    };

    private getLocationFromIP = async () => {
        try {
            const response = await fetch("https://ipapi.co/json/");
            const data = await response.json();
            this.setState({ location: data });
        } catch (error) {
            console.log("Error getting location", error);
        }
    };

    private localbanks = (code: string) => {
        const bank = banks.find((b) => b.code === code);
        return bank ? bank.slug : "";
    }

    private handleFundWithdrawal = async () => {
        const { pin, asset, location, otp, expoPushToken } = this.state;
        const amount = this.session.params?.amount;
        const bank = this.session.params?.bank;

        if (!pin) {
            this.setState({
                error_modal: true,
                message_type: Status.ERROR,
                error_title: "Validation Error",
                error_message: "Please enter your transaction PIN"
            });
            return;
        }

        try {
            this.setState({ loading: true });

            await Defaults.IS_NETWORK_AVAILABLE();

            const login = Defaults.LOGIN_STATUS();
            if (!login) {
                router.replace(this.session.passkeyEnabled ? "/passkey" : '/onboarding/login');
                return;
            }

            // Initialise transaction
            const res = await fetch(`${Defaults.API}/transaction/init`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-location': location.country && location.city ? `${location?.city}, ${location?.country}` : "Unknown",
                    'x-wealthx-ip': location?.ip || "Unknown",
                    'x-wealthx-devicename': this.session.devicename,
                    Authorization: `Bearer ${this.session.authorization}`,
                }
            });

            const data = await res.json();
            if (data.status === "error") throw new Error(data.message || data.error);
            if (data.status === "success") {
                if (!data.handshake) throw new Error('Unable to process transaction right now, please try again.');

                const bodyData = {
                    amount: parseFloat(amount?.toString() || "0"),
                    bank_id: bank?._id,
                    pin,
                    securityMethod: this.session.user?.twoFactorEnabled ? "TWO_FACTOR_AUTH" : "PIN",
                    securityCode: otp
                };

                const secret = Handshake.secret(this.session.client.privateKey, data.handshake);
                const transaction = Handshake.encrypt(JSON.stringify(bodyData), secret);

                const response = await fetch(`${Defaults.API}/wallet/withdraw`, {
                    method: 'POST',
                    headers: {
                        ...Defaults.HEADERS,
                        'x-wealthx-handshake': this.session.client.publicKey,
                        'x-wealthx-deviceid': this.session.deviceid,
                        'x-wealthx-devicename': this.session.devicename,
                        'x-wealthx-txkey': data.handshake,
                        Authorization: `Bearer ${this.session.authorization}`,
                    },
                    body: JSON.stringify({ transaction })
                });

                const result = await response.json();

                if (result.status === "error") {
                    throw new Error(result.message || result.error);
                }

                if (result.status === "success") {
                    scheduleNotification("Withdrawal Successful", `Your withdrawal of ₦${amount} was successful.`);
                    await WalletService.fetchWalletData({ force: true, showLoading: false });
                    router.replace("/withdraw/success");
                }
            }
        } catch (error: any) {
            console.log("Error: ", error);
            this.setState({
                error_modal: true,
                message_type: Status.ERROR,
                error_title: "Withdrawal Error",
                error_message: error.message || "An error occurred while processing withdrawal request"
            });
        } finally {
            this.setState({ loading: false });
        }
    };

    private DescriptionView = ({ name, description }: { name: string, description: string }): React.JSX.Element => {
        return (
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, backgroundColor: "transparent" }}>
                <ThemedText
                    style={{ fontFamily: 'AeonikRegular', fontSize: 14, lineHeight: 16, color: '#757575', }}>
                    {name}
                </ThemedText>
                <ThemedText style={{ fontFamily: 'AeonikMedium', fontSize: 14, lineHeight: 16, }} >
                    {description}
                </ThemedText>
            </ThemedView>
        )
    }

    render(): React.ReactNode {
        const { error_modal, loading, message_type, error_title, error_message, pin_modal } = this.state;
        const amount = parseFloat(this.session.params?.amount || "0");
        const bank = this.session.params?.bank;

        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.container}>

                    <ThemedView style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Image
                                source={require("../../assets/icons/chevron_right.svg")}
                                style={styles.backIcon}
                                tintColor={"#000000"} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.title}>{this.title}</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ThemedView style={{ marginTop: 50 }}>
                        <ThemedView
                            style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 16,
                                marginBottom: 44,
                            }}
                        >
                            <ThemedText
                                style={{
                                    fontSize: 14,
                                    color: '#757575',
                                    lineHeight: 14,
                                    fontFamily: 'AeonikRegular',
                                }}
                            >
                                You will receive
                            </ThemedText>
                            <ThemedText
                                style={{
                                    fontSize: 40,
                                    lineHeight: 40,
                                    fontFamily: 'AeonikBold',
                                }}>
                                ₦{(amount - this.fee).toLocaleString(undefined,
                                    {
                                        minimumFractionDigits: Defaults.MIN_DECIMAL,
                                        maximumFractionDigits: Defaults.MIN_DECIMAL
                                    }
                                )}
                            </ThemedText>
                        </ThemedView>

                        <ThemedView
                            style={{
                                padding: 12,
                                borderRadius: 12,
                                backgroundColor: '#F7F7F7',
                                marginHorizontal: 16,
                                gap: 8,
                                marginBottom: 12,
                            }}
                        >
                            <this.DescriptionView name={'Data'} description={'value'} />
                            <this.DescriptionView name={`${Coin.NGN} Value`} description={`₦${amount.toLocaleString(undefined,
                                { minimumFractionDigits: Defaults.MIN_DECIMAL, maximumFractionDigits: Defaults.MIN_DECIMAL }
                            )}`} />
                            <this.DescriptionView name={'Withdrawal fee'} description={`₦${(this.fee).toLocaleString(undefined,
                                { minimumFractionDigits: Defaults.MIN_DECIMAL, maximumFractionDigits: Defaults.MIN_DECIMAL }
                            )}`} />
                            <this.DescriptionView name={'Estimated Total'} description={`₦${(amount - this.fee).toLocaleString(undefined,
                                { minimumFractionDigits: Defaults.MIN_DECIMAL, maximumFractionDigits: Defaults.MIN_DECIMAL }
                            )}`} />
                        </ThemedView>

                        <ThemedView
                            style={{
                                padding: 12,
                                borderRadius: 12,
                                backgroundColor: '#F7F7F7',
                                marginHorizontal: 16,
                                gap: 8,
                            }}
                        >
                            <ThemedText
                                style={{
                                    fontFamily: 'AeonikRegular',
                                    fontSize: 14,
                                    lineHeight: 16,
                                    color: '#757575',
                                }}
                            >
                                Receiving Bank Account
                            </ThemedText>

                            <ThemedView style={{ backgroundColor: "transparent", flexDirection: "row", alignItems: "center", gap: 15, paddingTop: 10, }}>
                                <Image
                                    style={{ width: 30, height: 30, borderRadius: 99, }}
                                    source={{ uri: `https://cdn.jsdelivr.net/gh/supermx1/nigerian-banks-api@main/logos/${this.localbanks(bank?.bankCode || "")}.png` }} />
                                <ThemedView style={{ backgroundColor: 'transparent' }}>
                                    <ThemedText
                                        style={{
                                            fontSize: 14,
                                            lineHeight: 18,
                                            fontFamily: 'AeonikMedium',
                                            color: '#000000',
                                            marginBottom: 4,
                                            fontWeight: '500'
                                        }}
                                    >
                                        {bank?.accountName}
                                    </ThemedText>
                                    <ThemedText
                                        style={{
                                            fontSize: 12,
                                            lineHeight: 14,
                                            fontFamily: 'AeonikRegular',
                                            color: '#757575',
                                        }}
                                    >
                                        ●●●●●●{(bank?.accountNumber || "").slice(-4)} {bank?.bankName}
                                    </ThemedText>
                                </ThemedView>
                            </ThemedView>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView
                        style={{
                            position: 'absolute',
                            bottom: 40,
                            alignItems: 'center',
                            width: '100%',
                            gap: 15,
                        }}>
                        <ThemedView style={{ flexDirection: 'row', paddingHorizontal: 20, width: "100%" }}>
                            <Image
                                source={require("../../assets/icons/check.svg")}
                                style={styles.backIcon}
                                tintColor={"#000000"} />
                            <ThemedText
                                style={{
                                    fontFamily: 'AeonikRegular',
                                    fontSize: 14,
                                    lineHeight: 16,
                                    color: "#4a4a4a",
                                    paddingRight: 24,
                                    paddingLeft: 12,
                                    textAlign: "left"
                                }}>
                                I agree to the terms and conditions and understand that all information provided is accurate and complete.
                            </ThemedText>
                        </ThemedView>
                        <ThemedView style={{ width: '100%', paddingHorizontal: 16 }}>
                            <PrimaryButton
                                Gradient
                                title={'Continue'}
                                onPress={() => this.setState({ pin_modal: !pin_modal })}
                            />
                        </ThemedView>
                    </ThemedView>

                    <MessageModal
                        visible={error_modal}
                        type={message_type || Status.ERROR}
                        onClose={(): void => this.setState({ error_modal: !error_modal })}
                        message={{ title: error_title, description: error_message }} />
                    <PinModal
                        visible={pin_modal}
                        onClose={(): void => this.setState({ pin_modal: !pin_modal })}
                        onComplete={(pin: string): void => this.setState({ pin_modal: false, pin: pin }, async () => {
                            await this.handleFundWithdrawal();
                        })} />
                    <LoadingModal loading={loading} />
                </ThemedSafeArea>
            </>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 50 : Platform.OS === "web" ? 20 : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: "transparent"
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
        fontFamily: 'AeonikBold',
    },
    content: {
        marginTop: 46,
        marginHorizontal: 16,
    },
    inputContainer: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#F7F7F7',
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        backgroundColor: '#FFF',
    },
    inputLabel: {
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        color: '#A5A5A5',
        lineHeight: 14,
    },
    currencySelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        padding: 4,
        backgroundColor: 'white',
        gap: 4,
    },
    currencyIcon: {
        width: 12,
        height: 12,
    },
    amountInput: {
        fontSize: 40,
        fontFamily: 'AeonikMedium',
        color: '#000000',
    },
    optionsContainer: {
        marginTop: 14,
        gap: 24,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    optionText: {
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        color: '#A5A5A5',
        lineHeight: 14,
    },
    buyOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buyOption: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#F7F7F7',
        width: 99,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyOptionText: {
        fontFamily: 'AeonikMedium',
        color: '#1F1F1F',
        fontSize: 20,
    },
});