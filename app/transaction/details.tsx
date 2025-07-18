import React from "react";
import sessionManager from "@/session/session";
import { IMarket, ITransaction, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Appearance, ColorSchemeName, Platform, Pressable, ScrollView, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import { Image } from "react-native";
import Defaults from "../default/default";
import { Coin, TransactionType } from "@/enums/enums";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import * as WebBrowser from 'expo-web-browser';

interface IProps { }

interface IState {
    rate: number;
    transaction: ITransaction;
}

export default class TransactionDetailsScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Transaction Details";
    private readonly transactiontypesupport: Array<string> = ["p2p", "normal", "buy", "sell", "transfer", "deposit", "sweep", "send", "withdrawal"];
    private markets: IMarket[];
    constructor(props: IProps) {
        super(props);
        this.state = { rate: 0, transaction: {} as ITransaction };
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
        this.markets = this.session.markets || [];
    }

    componentDidMount(): void { }

    private openLink = async () => {
        const { transaction } = this.state;
        const explorerUrls: Partial<Record<Coin, string>> = {
            [Coin.BTC]: "https://www.blockchain.com/btc/tx/",
            [Coin.ETH]: "https://etherscan.io/tx/",
            [Coin.USDC]: "https://bscscan.com/tx/",
            [Coin.USDT]: "https://bscscan.com/tx/",
        };

        const currency: Coin | undefined = transaction.fromCurrency as Coin;
        const transactionHash = transaction.hash;

        if (!currency || !transactionHash) {
            logger.error("Invalid transaction data:", { currency, transactionHash });
            return;
        }

        const baseUrl = explorerUrls[currency];

        if (!baseUrl) {
            logger.error("Unsupported currency:", currency);
            return;
        }

        const url = `${baseUrl}${transactionHash}`;

        await WebBrowser.openBrowserAsync(url);
    };

    render(): React.ReactNode {
        const { rate, transaction } = this.state;
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

                        <ThemedText style={styles.title}>{this.title}</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ScrollView
                        horizontal={false}
                        showsVerticalScrollIndicator={false}>
                        <ThemedView style={styles.infoContainer}>
                            <ThemedView style={styles.balanceContainer}>
                                <ThemedText style={styles.balanceText}>{transaction.type === TransactionType.TRANSFER ? "-" : "+"}{transaction.amount} {transaction.fromCurrency}</ThemedText>
                                <ThemedText style={styles.balanceValue}>
                                    ≈ {(transaction.amount * rate).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })}
                                </ThemedText>
                            </ThemedView>

                            <ThemedView style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 15, width: '100%', backgroundColor: '#000', padding: 16, borderRadius: 12 }}>
                                <ThemedView style={{ backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                    <ThemedText style={styles.infoLabel}>Date</ThemedText>
                                    <ThemedText style={styles.infoLabelText}>{Defaults.FORMAT_DATE(transaction.createdAt.toString())}</ThemedText>
                                </ThemedView>
                                <ThemedView style={{ backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                    <ThemedText style={styles.infoLabel}>Status</ThemedText>
                                    <ThemedText style={styles.infoLabelText}>{transaction.status}</ThemedText>
                                </ThemedView>
                                <ThemedView style={{ backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                    <ThemedText style={styles.infoLabel}>Recipient</ThemedText>
                                    <ThemedText style={styles.infoLabelText}>
                                        {transaction.to.startsWith('0x')
                                            ? `${transaction.to.slice(0, 10)}...${transaction.to.slice(-10)}`
                                            : transaction.to}
                                    </ThemedText>
                                </ThemedView>
                            </ThemedView>

                            <ThemedView style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 15, width: '100%', backgroundColor: '#000', padding: 16, borderRadius: 12 }}>
                                <ThemedView style={{ backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                    <ThemedText style={styles.infoLabel}>Type</ThemedText>
                                    <ThemedText style={styles.infoLabelText}>{transaction.type}</ThemedText>
                                </ThemedView>
                                <ThemedView style={{ backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                    <ThemedText style={styles.infoLabel}>Fees</ThemedText>
                                    <ThemedText style={styles.infoLabelText}>{transaction.fees} {transaction.fromCurrency}</ThemedText>
                                </ThemedView>
                            </ThemedView>

                            {transaction.type.includes(transaction.type.toLowerCase()) &&
                                <Pressable onPress={this.openLink} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 15, width: '100%', backgroundColor: '#000', padding: 16, borderRadius: 12 }}>
                                    <ThemedView style={{ backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                        <ThemedText style={styles.infoLabel}>More Details</ThemedText>
                                        <Image
                                            source={require("../../assets/icons/chevron-left.svg")}
                                            tintColor={this.appreance === "dark" ? "#ffffff" : "#000000"}
                                            style={[styles.backIcon, { transform: [{ rotate: "180deg" }] }]} />
                                    </ThemedView>
                                </Pressable>
                            }
                        </ThemedView>
                    </ScrollView>

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
    infoContainer: {
        marginTop: 42,
        paddingHorizontal: 16,
        flexDirection: 'column',
        gap: 20,
    },
    balanceContainer: {
        alignItems: 'center',
        marginBottom: 24,
        gap: 8
    },
    infoLabel: {
        color: '#757575',
        fontSize: 12,
        lineHeight: 14,
        fontFamily: 'AeonikRegular',
    },
    infoLabelText: {
        fontSize: 14,
        fontFamily: 'AeonikRegular',
        textTransform: "capitalize"
    },
    balanceText: {
        fontFamily: 'AeonikMedium',
        fontSize: 20,
        textTransform: "uppercase"
    },
    balanceValue: {
        color: '#757575',
        fontSize: 12,
        lineHeight: 14,
        fontFamily: 'AeonikMedium',
    },
});