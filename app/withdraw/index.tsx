import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import LoadingModal from "@/components/modals/loading";
import MessageModal from "@/components/modals/message";
import SimpleToast, { ToastRef } from '@/components/toast/toast';
import { Status } from "@/enums/enums";
import { UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import sessionManager from "@/session/session";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Animated, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import DiapadKeyPad from "../../components/DiapadKeyPad";
import Defaults from "../default/default";

interface IProps { }

interface IState {
    error_modal: boolean;
    message_type: Status;
    error_title: string;
    error_message: string;
    loading: boolean;
    amount: string;
    fiat: string;
    rawAmount: number;
    nibssStatus: string;
}

export default class WithdrawScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Withdraw";
    private toastRef = React.createRef<ToastRef>();
    private pulseAnim = new Animated.Value(1);

    constructor(props: IProps) {
        super(props);
        this.state = {
            error_modal: false,
            message_type: Status.ERROR,
            error_message: "",
            error_title: "",
            loading: false,
            amount: "",
            fiat: "NGN",
            rawAmount: 0,
            nibssStatus: "Up"
        };
    }

    componentDidMount(): void {
        const params = this.session.params as any;
        if (params && params.fiat) {
            this.setState({ fiat: params.fiat });
        }
        this.fetchNibssStatus();
        this.startPulseAnimation();
    }

    startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(this.pulseAnim, {
                    toValue: 1.4,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(this.pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    fetchNibssStatus = async () => {
        try {
            await Defaults.IS_NETWORK_AVAILABLE();

            const response = await fetch(`${Defaults.API}/provider/nibss/status`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client?.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-devicename': this.session.devicename,
                    Authorization: `Bearer ${this.session.authorization}`,
                }
            });
            const data = await response.json();
            if (data.status === "success" && this.session.client?.privateKey) {
                const parseData = Defaults.PARSE_DATA(data.data, this.session.client.privateKey, data.handshake);
                this.setState({ nibssStatus: parseData.result });
            }
        } catch (error) {
            console.log(error);
        }
    };

    inputNumber = (number: string | number) => {
        const { amount } = this.state;
        const raw = amount.replace(/,/g, '');
        this.handleAmountChange(raw + number.toString());
    };

    handleBackspacePress = () => {
        const { amount } = this.state;
        const raw = amount.replace(/,/g, '');
        this.handleAmountChange(raw.slice(0, -1));
    };

    private formatAmount = (value: string): string => {
        if (!value) return '';

        // Split into integer and decimal parts
        const parts = value.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1] || '';

        // Format integer part with commas
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        // Combine parts
        return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
    }; private handleAmountChange = (text: string) => {
        // Allow only numbers and decimal point
        const cleanedText = text.replace(/[^0-9.]/g, '');

        // Prevent multiple decimal points
        const parts = cleanedText.split('.');
        let sanitizedText = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleanedText;

        // Limit to 2 decimal places
        if (parts.length === 2 && parts[1].length > 2) {
            sanitizedText = `${parts[0]}.${parts[1].substring(0, 2)}`;
        }

        // Parse to number for rawAmount
        const numericValue = parseFloat(sanitizedText);
        const rawAmount = isNaN(numericValue) ? 0 : numericValue;

        // Format for display
        const formattedAmount = this.formatAmount(sanitizedText);

        this.setState({ amount: formattedAmount, rawAmount });
    }; private handleMaxPress = () => {
        const { fiat } = this.state;
        const balance: number = fiat === 'NGN' ? this.session.totalBalanceNgn : this.session.totalBalanceUsd;
        // Limit to 2 decimal places
        const limitedBalance = Math.floor(balance * 100) / 100;
        const formattedAmount = this.formatAmount(limitedBalance.toString());
        this.setState({ amount: formattedAmount, rawAmount: limitedBalance });
    }; private navigateNext = async (): Promise<void> => {
        const { rawAmount, fiat } = this.state;
        const balance: number = fiat === 'NGN' ? this.session.totalBalanceNgn : this.session.totalBalanceUsd;

        if (rawAmount < 500) {
            this.toastRef.current?.show("Minimum withdrawal amount is ₦500", "error");
            return;
        }

        if (rawAmount > balance) {
            this.toastRef.current?.show("Insufficient Balance", "error");
            return;
        }

        try {
            // Pass the rawAmount in params or session
            await sessionManager.updateSession({ ...this.session, params: { ...this.session.params, amount: rawAmount.toString() } });
            router.navigate("/withdraw/bank");
        } catch (error: any) {
            logger.error(error);
            this.setState({
                error_modal: true,
                message_type: Status.ERROR,
                error_title: "Input Error",
                error_message: error.message || "Unknown error, please try again."
            });
        }
    }

    render(): React.ReactNode {
        const { error_modal, message_type, error_title, error_message, loading, amount, fiat, nibssStatus, rawAmount } = this.state;
        const balance: number = fiat === 'NGN' ? this.session.totalBalanceNgn : this.session.totalBalanceUsd;
        const symbol = fiat === 'NGN' ? '₦' : '$';

        const statusText = nibssStatus ? String(nibssStatus) : '';
        const isUp = statusText.trim().toLowerCase() === 'up';
        const statusColor = isUp ? '#28a745' : '#dc3545';
        const statusTextStyle = { color: statusColor, fontFamily: 'AeonikMedium' };

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
                        <View>
                            {nibssStatus && (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Animated.View style={[
                                        {
                                            width: 8,
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: statusColor,
                                            marginRight: 6,
                                        },
                                        isUp && {
                                            transform: [{ scale: this.pulseAnim }],
                                        }
                                    ]} />
                                    <ThemedText style={[statusTextStyle, { fontSize: 12 }]}>
                                        {isUp ? 'Live' : 'Down'}
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    </ThemedView>

                    <ThemedView style={[styles.content, { flex: 1 }]}>
                        <ThemedView>
                            <ThemedView style={styles.inputContainer}>
                                <ThemedView style={styles.inputRow}>
                                    <ThemedText style={styles.inputLabel}>Enter Amount</ThemedText>
                                    <TouchableOpacity
                                        style={styles.maxButton}
                                        onPress={this.handleMaxPress}
                                    >
                                        <ThemedText style={styles.maxButtonText}>MAX</ThemedText>
                                    </TouchableOpacity>
                                </ThemedView>
                                <TextInput
                                    style={styles.amountInput}
                                    keyboardType='number-pad'
                                    value={amount}
                                    onChangeText={this.handleAmountChange}
                                    placeholder={`${symbol}0.00`}
                                    placeholderTextColor="#bcbcbcff"
                                    showSoftInputOnFocus={false}
                                />
                            </ThemedView>
                            <ThemedView style={styles.optionsContainer}>
                                <ThemedView style={styles.optionRow}>
                                    <ThemedText style={styles.optionText}>Balance {symbol}{balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</ThemedText>
                                </ThemedView>
                            </ThemedView>
                        </ThemedView>
                    </ThemedView>

                    <DiapadKeyPad
                        inputNumber={this.inputNumber}
                        onBackspacePress={this.handleBackspacePress}
                        button={true}
                        onContinuePress={this.navigateNext}
                        btndisabled={!rawAmount || rawAmount <= 0}
                    />

                    <MessageModal
                        visible={error_modal}
                        type={message_type || Status.ERROR}
                        onClose={(): void => this.setState({ error_modal: !error_modal }, async () => {
                            if (message_type === Status.SUCCESS) {
                                router.dismissTo("/dashboard");
                            }
                        })}
                        message={{ title: error_title, description: error_message }} />
                    <LoadingModal loading={loading} />
                    <StatusBar style={"dark"} />
                </ThemedSafeArea>
                <SimpleToast ref={this.toastRef} />
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
        backgroundColor: '#F7F7F7',
    },
    inputLabel: {
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        color: '#A5A5A5',
        lineHeight: 14,
    },
    maxButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#253E92',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    maxButtonText: {
        fontSize: 10,
        fontFamily: 'AeonikMedium',
        color: '#253E92',
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
        lineHeight: 14,
    },
});