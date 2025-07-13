import React from "react";
import sessionManager from "@/session/session";
import { IList, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { Appearance, ColorSchemeName, Platform, StyleSheet, TouchableOpacity } from "react-native";
import MessageModal from "@/components/modals/message";
import { Image } from "expo-image";
import PrimaryButton from "@/components/button/primary";
import LoadingModal from "@/components/modals/loading";
import { Colors } from "@/constants/Colors";
import Defaults from "../default/default";
import banks from "../data/banks.json";
import PinModal from "@/components/modals/pin";
import {
    addNotificationReceivedListener,
    addNotificationResponseReceivedListener,
    registerForPushNotificationsAsync,
    removeNotificationSubscription,
    scheduleNotification
} from "@/notifications/notification";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import { Coin } from "@/enums/enums";

interface IProps { }

interface IState {
    error_modal: boolean;
    message_type: MessageModalType;
    error_title: string;
    error_message: string;
    loading: boolean;
    pin_modal: boolean;
    pin: string;
    expoPushToken: string;
}

export default class WithdrawConfirmScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Confirm Withdraw";
    private withdrawal: IWithdrawal;
    private notificationListener: any;
    private responseListener: any;
    constructor(props: IProps) {
        super(props);
        this.state = {
            error_modal: false,
            message_type: MessageModalType.ERROR,
            error_message: "",
            error_title: "",
            loading: false,
            pin_modal: false,
            pin: "",
            expoPushToken: "",
        };
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
        this.withdrawal = this.session.withdrawal;
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


    private localbanks = (code: string): ILocalBankData => {
        const bank = banks.find((bank) => bank.code === code);
        if (!bank) throw new Error(`Bank with code ${code} not found.`);
        return bank as ILocalBankData;
    }

    private handleFundWithdrawal = async () => {
        const { pin } = this.state;

        try {
            this.setState({ loading: true });

            const payload = JSON.stringify({
                pin: pin,
                amount: this.withdrawal.amount,
                bank_code: this.withdrawal.bank?.bankCode,
                bank_account_number: this.withdrawal.bank?.accountNumber,
                bank_name: this.withdrawal.bank?.bankName,
                account_name: this.withdrawal.bank?.accountName,
            });

            const response = await fetch(`${Defaults.API}/naira-wallet/withdrwal`, {
                method: "POST",
                headers: { ...Defaults.HEADERS, "Authorization": `Bearer ${this.session.accessToken}` },
                body: payload,
            });

            const data = await response.json();

            if (data.status === "success") {
                await scheduleNotification(
                    "Withdrawal Requested",
                    `Hey, A withdrawal of ${this.withdrawal.amount.toLocaleString()} ${Coin.NGN} was requested on your account. Contact support if this was not initiated by you.`,
                    { type: "success" },
                    2
                );

                router.navigate('/withdraw/success');
            } else {
                this.setState({ error_modal: true, error_title: "Withdrawal Error", error_message: data.message || "An error occurred while processing withdrawal request" });
            }

        } catch (error) {
            console.log("Error: ", error);
            this.setState({ error_modal: true, error_title: "Withdrawal Error", error_message: "An error occurred while processing withdrawal request" });
        } finally {
            this.setState({ loading: false });
        }
    };

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
        const { error_modal, loading, message_type, error_title, error_message, pin_modal } = this.state;
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
                                source={require("../../assets/icons/chevron-left.svg")}
                                style={styles.backIcon}
                                tintColor={this.appreance === "dark" ? Colors.light.background : "#000000"} />
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
                                You will get
                            </ThemedText>
                            <ThemedText
                                style={{
                                    fontSize: 40,
                                    lineHeight: 40,
                                    fontFamily: 'AeonikBold',
                                }}>
                                ₦{this.withdrawal.amount.toLocaleString(undefined,
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
                                backgroundColor: this.appreance === "dark" ? '#000000' : '#F7F7F7',
                                marginHorizontal: 16,
                                gap: 8,
                                marginBottom: 12,
                            }}
                        >
                            <this.DescriptionView name={'Data'} description={'value'} />
                            <this.DescriptionView name={`${Coin.NGN} Value`} description={`₦${(this.withdrawal.amount).toLocaleString(undefined,
                                { minimumFractionDigits: Defaults.MIN_DECIMAL, maximumFractionDigits: Defaults.MIN_DECIMAL }
                            )}`} />
                            <this.DescriptionView name={'Withdrawal fee'} description={`₦${(80).toLocaleString(undefined,
                                { minimumFractionDigits: Defaults.MIN_DECIMAL, maximumFractionDigits: Defaults.MIN_DECIMAL }
                            )}`} />
                            <this.DescriptionView name={'Estimated Total'} description={`₦${(this.withdrawal.amount - 80).toLocaleString(undefined,
                                { minimumFractionDigits: Defaults.MIN_DECIMAL, maximumFractionDigits: Defaults.MIN_DECIMAL }
                            )}`} />
                        </ThemedView>

                        <ThemedView
                            style={{
                                padding: 12,
                                borderRadius: 12,
                                backgroundColor: this.appreance === "dark" ? '#000000' : '#F7F7F7',
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
                                    source={{ uri: `https://cdn.jsdelivr.net/gh/supermx1/nigerian-banks-api@main/logos/${this.localbanks(this.withdrawal.bank?.bankCode || "").slug}.png` }} />
                                <ThemedText>******{(this.withdrawal.bank?.accountNumber || "").slice(-4)} {this.withdrawal.bank?.bankName}</ThemedText>
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
                                tintColor={this.appreance === "dark" ? Colors.light.background : "#000000"} />
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
                        type={message_type || MessageModalType.ERROR}
                        onClose={(): void => this.setState({ error_modal: !error_modal }, async () => {
                            if (message_type === MessageModalType.SUCCESS) {
                                router.dismissTo("/dashboard");
                            }
                        })}
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
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#000000" : '#f7f7f7',
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
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#000000" : '#F7F7F7',
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#000000" : '#FFF',
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
        color: Appearance.getColorScheme() === "dark" ? "#ffffff" : '#000000',
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