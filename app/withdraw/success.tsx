import PrimaryButton from "@/components/button/primary";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import SimpleToast, { ToastRef } from "@/components/toast/toast";
import { IMarket, UserData } from "@/interface/interface";
import sessionManager from "@/session/session";
import * as Clipboard from 'expo-clipboard';
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, Vibration } from "react-native";
import Defaults from "../default/default";

interface IProps { }

interface IState {
    asset: IMarket;
}

export default class WithdrawSuccessScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Withdraw Success";
    private toastRef = React.createRef<ToastRef>();

    constructor(props: IProps) {
        super(props);
        this.state = {
            asset: {} as IMarket,
        };
    }

    componentDidMount(): void {
        this.filterByCurrency();
    }

    private filterByCurrency = (currency = "NGN") => {
        const market = this.session.markets.find((market) => market.currency === currency);
        if (market) {
            this.setState({ asset: market });
        }
    };

    private copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        const vibrationPattern = [0, 5];
        Vibration.vibrate(vibrationPattern, false);
        this.toastRef.current?.show(`Accoun number to clipboard`, "success");
    };

    render(): React.ReactNode {
        const { asset } = this.state;
        const amount = parseFloat(this.session.params?.amount || "0");
        const bank = this.session.params?.bank;

        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.container}>
                    <ThemedView style={styles.content}>
                        <ThemedView style={styles.iconContainer}>
                            <Image
                                source={require("../../assets/images/sales.png")}
                                style={{ width: 150, height: 150 }}
                                contentFit="contain"
                            />
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
                            <ThemedText style={styles.label}>You will get</ThemedText>
                            <ThemedText style={styles.amount}>
                                ₦{(amount).toLocaleString(undefined, { minimumFractionDigits: Defaults.MIN_DECIMAL, maximumFractionDigits: Defaults.MIN_DECIMAL })}
                            </ThemedText>
                        </ThemedView>

                        <ThemedView style={styles.ethAddressContainer}>
                            <ThemedView style={styles.ethIconContainer}>
                                <Image source={{ uri: asset.icon || "" }} style={{ width: 15, height: 15 }} />
                                <ThemedText style={styles.ethLabel}>
                                    {asset.currency} Destination Account
                                </ThemedText>
                            </ThemedView>
                            <TouchableOpacity
                                style={styles.addressPressable}
                                onPress={() => this.copyToClipboard(bank?.accountNumber || "")}>
                                <ThemedView style={{ flex: 1, backgroundColor: "transparent", paddingRight: 10 }}>
                                    <ThemedText style={[styles.addressText, { marginBottom: 4, fontFamily: 'AeonikBold' }]}>{bank?.accountName || ""}</ThemedText>
                                    <ThemedText style={[styles.addressText, { color: '#757575', fontSize: 12 }]}>
                                        {`●●●●●●${bank?.accountNumber.slice(-4)} ${bank?.bankName.slice(0, 20)}${(bank?.bankName || "").length > 20 ? "..." : ""}`}
                                    </ThemedText>
                                </ThemedView>
                                <ThemedView style={styles.copyButton}>
                                    <ThemedText style={{ fontSize: 10, fontFamily: "AeonikRegular" }}>copy</ThemedText>
                                </ThemedView>
                            </TouchableOpacity>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.buttonContainer}>
                        <PrimaryButton onPress={() => router.dismissTo("/dashboard")} Gradient title={'Done!'} />
                    </ThemedView>
                </ThemedSafeArea>
                <SimpleToast ref={this.toastRef} />
                <StatusBar style='dark' />
            </>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 50 : Platform.OS === "web" ? 20 : 0,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: "transparent"
    },
    textContainer: {
        marginTop: 20,
        alignItems: 'center',
        backgroundColor: "transparent"
    },
    title: {
        fontSize: 20,
        fontFamily: 'AeonikMedium',
        textAlign: 'center',
        marginBottom: 10,
        color: '#000000',
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'AeonikRegular',
        textAlign: 'center',
        color: '#6B7280',
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    amountContainer: {
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: "transparent"
    },
    label: {
        fontSize: 14,
        fontFamily: 'AeonikRegular',
        color: '#757575',
        marginBottom: 5,
    },
    amount: {
        fontSize: 32,
        fontFamily: 'AeonikBold',
        color: '#000000',
    },
    ethAddressContainer: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
    },
    ethIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: "transparent",
        gap: 8,
    },
    ethLabel: {
        fontSize: 12,
        fontFamily: 'AeonikMedium',
        color: '#757575',
    },
    addressPressable: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    addressText: {
        fontSize: 14,
        fontFamily: 'AeonikRegular',
        color: '#000000',
    },
    copyButton: {
        backgroundColor: '#E5E7EB',
        borderRadius: 360,
        paddingVertical: 2,
        paddingHorizontal: 13,
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 16,
        marginBottom: 20,
    },
});