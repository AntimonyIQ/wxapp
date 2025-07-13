import React from "react";
import sessionManager from "@/session/session";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Appearance, ColorSchemeName, Dimensions, Platform, Pressable, Share, StyleSheet, TouchableOpacity, Vibration } from "react-native";
import { IMarket, UserData } from "@/interface/interface";
import { Image } from "expo-image";
import Defaults from "../default/default";
import Toast from "react-native-toast-message";
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedText from "@/components/ThemedText";

interface IProps { }

interface IState { }

export default class ReceiveScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Receive Screen";
    private coin: IMarket;
    private readonly isDesktop: boolean = Platform.OS === 'web' && Dimensions.get('window').width > 600;
    constructor(props: IProps) {
        super(props);
        this.state = {};
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
        this.coin = this.session.selectedCoin;
    }

    private showNetwork = (symbol: string): string => {
        if (!symbol) throw new Error("pleas provide a symbol");
        return symbol.toUpperCase() === "USDT" || symbol.toUpperCase() === "USDC" ? "(BEP-20)" : "";
    }

    private share = async () => {
        const { currency, address } = this.coin;
        try {
            await Share.share({
                title: "Join WealthX and start trading",
                message: `Here is my ${currency.toUpperCase()} wallet address: ${address}`,
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Share Error',
                text2: error.message,
                text1Style: { fontSize: 16, fontFamily: 'AeonikBold' },
                text2Style: { fontSize: 12, fontFamily: 'AeonikRegular' },
            });
        }
    }

    private formatToMoneyString(money: number): string {
        return money.toLocaleString(undefined, {
            minimumFractionDigits: Defaults.MIN_DECIMAL,
            maximumFractionDigits: Defaults.DECIMAL
        });
    }

    private copyToClipboard = async () => {
        const { address } = this.coin;
        await Clipboard.setStringAsync(address);

        const vibrationPattern = [0, 5];
        Vibration.vibrate(vibrationPattern, false);
        Toast.show({
            type: 'success',
            text1: 'Copied',
            text2: 'Wallet address copied to clipboard',
            text1Style: { fontSize: 16, fontFamily: 'AeonikBold' },
            text2Style: { fontSize: 12, fontFamily: 'AeonikRegular' },
        });
    };

    render(): React.ReactNode {
        const { currency, address, balance, icon } = this.coin;
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
                                tintColor={this.appreance === "dark" ? "#ffffff" : "#000000"}
                                style={styles.backIcon} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>

                        <ThemedText style={styles.title}>Receive {currency}</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.content}>
                        <ThemedView style={styles.infoBox}>
                            <Image
                                source={require("../../assets/icons/info.svg")}
                                style={{ width: 16, height: 16 }}
                            />
                            <ThemedText style={styles.infoText}>
                                Only send {currency} {this.showNetwork(currency)} assets to this address. Any other assets
                                will be lost forever.
                            </ThemedText>
                        </ThemedView>

                        <ThemedView style={styles.qrCodeSection}>
                            <ThemedView style={styles.walletLabel}>
                                <Image source={{ uri: currency }} style={{ width: 20, height: 20 }} />
                                <ThemedText style={styles.walletLabelText}>
                                    {currency} wallet address
                                </ThemedText>
                            </ThemedView>
                            <ThemedView style={styles.qrCodeContainer}>
                                <QRCode
                                    value={address}
                                    size={this.isDesktop ? 230 : Dimensions.get('window').width * 0.6}
                                />
                            </ThemedView>

                            <Pressable style={styles.walletAddressContainer}>
                                <ThemedView style={styles.walletAddressInfo}>
                                    <ThemedText style={styles.walletAddressLabel}>
                                        Wallet Address
                                    </ThemedText>
                                    <ThemedText style={styles.walletAddress}>
                                        {address}
                                    </ThemedText>
                                </ThemedView>
                                <Pressable style={styles.clearButton} onPress={this.copyToClipboard}>
                                    <ThemedText style={styles.clearButtonText}>
                                        Copy
                                    </ThemedText>
                                </Pressable>
                            </Pressable>
                            <ThemedText style={{ fontFamily: 'AeonikMedium', }}>
                                Balance: {this.formatToMoneyString(balance)} {currency}
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.shareButtonContainer}>
                        <Pressable style={styles.shareButton} onPress={this.share}>
                            <ThemedText style={styles.shareButtonText}>
                                Share {currency} Address
                            </ThemedText>
                        </Pressable>
                    </ThemedView>
                </ThemedSafeArea>
                <StatusBar style='light' />
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
        fontFamily: 'AeonikBold',
    },
    placeholderIcon: {
        width: 24,
        height: 24,
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 30,
        alignItems: 'center',
    },
    infoBox: {
        paddingTop: 7,
        paddingBottom: 9,
        paddingHorizontal: 14,
        backgroundColor: '#FFFBF0',
        gap: 8,
        alignItems: 'flex-start',
        flexDirection: 'row',
        borderRadius: 4,
    },
    infoText: {
        fontSize: 10,
        lineHeight: 16,
        fontFamily: 'AeonikRegular',
        color: '#966422',
    },
    qrCodeSection: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 45,
    },
    walletLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    walletLabelText: {
        fontSize: 14,
        lineHeight: 14,
        fontFamily: 'AeonikRegular',
    },
    qrCodeContainer: {
        marginBottom: 40,
        padding: 10,
        backgroundColor: "#FFFFFF",
    },
    walletAddressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: Appearance.getColorScheme() === "dark" ? '#0d0d0d' : '#F7F7F7',
        paddingHorizontal: 12,
        paddingVertical: 21,
        borderRadius: 12,
        gap: 12,
        alignItems: 'center',
        width: '100%',
    },
    walletAddressInfo: {
        gap: 12,
        backgroundColor: "transparent",
    },
    walletAddressLabel: {
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        lineHeight: 14,
    },
    walletAddress: {
        fontSize: 12,
        lineHeight: 14,
        fontFamily: 'AeonikRegular',
    },
    clearButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    clearButtonText: {
        color: '#1F1F1F',
        fontSize: 12,
        lineHeight: 14,
        fontFamily: 'AeonikRegular',
    },
    shareButtonContainer: {
        paddingHorizontal: 16,
        position: 'absolute',
        bottom: 32,
        width: '100%',
    },
    shareButton: {
        paddingHorizontal: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FBA91E',
        borderRadius: 12,
    },
    shareButtonText: {
        color: '#1F1F1F',
        fontFamily: 'AeonikMedium',
        fontSize: 16,
        lineHeight: 20,
    },
});