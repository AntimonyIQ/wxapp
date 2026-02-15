import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import SimpleToast, { ToastRef } from "@/components/toast/toast";
import assetsList from "@/data/assets";
import { Coin } from "@/enums/enums";
import { ITransaction, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import sessionManager from "@/session/session";
import * as Clipboard from 'expo-clipboard';
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from 'expo-web-browser';
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Defaults from "../default/default";
// import ShareReceiptModal from "@/components/Modals/ShareReceiptModal"; // Placeholder if you plan to create it
// import ImageReceipt from "@/components/Transaction/ImageReceipt"; // Placeholder

interface IProps {
    params?: any;
}

interface IState {
    transaction: ITransaction;
    shareModalVisible: boolean;
}

class TransactionDetailsContent extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Transaction Details";
    private toastRef = React.createRef<ToastRef>();

    constructor(props: IProps) {
        super(props);
        let initialTransaction = {} as ITransaction;

        if (props.params && props.params.params) {
            try {
                initialTransaction = JSON.parse(props.params.params as string);
            } catch (error) {
                logger.error("Error parsing transaction params", error);
            }
        }

        this.state = {
            transaction: initialTransaction,
            shareModalVisible: false,
        };

        if (!this.session || !this.session.isLoggedIn) {
            router.dismissTo("/");
        }
    }

    componentDidUpdate(prevProps: IProps) {
        if (this.props.params !== prevProps.params) {
            if (this.props.params && this.props.params.params) {
                try {
                    const transactionData = JSON.parse(this.props.params.params as string);
                    this.setState({ transaction: transactionData });
                } catch (error) {
                    logger.error("Error parsing updated transaction params", error);
                }
            }
        }
    }

    // Copy Reference Logic
    private copyReference = async () => {
        const { transaction } = this.state;
        if (transaction.reference) {
            await Clipboard.setStringAsync(transaction.reference);
            this.toastRef.current?.show("Reference copied to clipboard", "success");
        }
    };

    // Open Link Logic
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
            return;
        }

        const baseUrl = explorerUrls[currency];
        if (!baseUrl) {
            return;
        }

        const url = `${baseUrl}${transactionHash}`;
        await WebBrowser.openBrowserAsync(url);
    };

    // Helper to get Asset Logo
    private getAssetLogoURI = (symbol: string) => {
        const asset = assetsList.find(a => a.symbol === symbol);
        return asset ? asset.logoURI : null;
    };

    renderTransactionIcon = () => {
        const { transaction } = this.state;
        if (!transaction || !transaction.type) return null;

        const transactionType = String(transaction.type);

        // For swap transactions, show overlay of two currency icons
        if (transactionType === "swap" && transaction.fromCurrency && transaction.toCurrency) {
            return (
                <View style={{
                    width: 70,
                    height: 70,
                    position: 'relative',
                    marginBottom: 16,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Image
                        source={{ uri: this.getAssetLogoURI(transaction.fromCurrency) || "" }}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            position: 'absolute',
                            left: 0,
                            top: 15,
                            zIndex: 2,
                            backgroundColor: '#fff',
                            borderWidth: 2,
                            borderColor: '#fff'
                        }}
                        contentFit="contain"
                    />
                    <Image
                        source={{ uri: this.getAssetLogoURI(transaction.toCurrency) || "" }}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            position: 'absolute',
                            right: 0,
                            top: 15,
                            zIndex: 1,
                            backgroundColor: '#fff',
                            opacity: 0.8
                        }}
                        contentFit="contain"
                    />
                </View>
            );
        }

        // For all other transaction types, try to get currency icon
        const logoURI = this.getAssetLogoURI(transaction.fromCurrency);
        if (logoURI) {
            return (
                <Image
                    source={{ uri: logoURI }}
                    style={{ width: 70, height: 70, borderRadius: 35, marginBottom: 16 }}
                    contentFit="contain"
                />
            );
        }

        // Fallback to default icon
        return (
            <View style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: '#253E92',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
            }}>
                <ThemedText style={{ color: '#FFFFFF', fontSize: 24, fontFamily: 'AeonikBold' }}>
                    {transaction.fromCurrency ? transaction.fromCurrency.substring(0, 1) : "?"}
                </ThemedText>
            </View>
        );
    };

    render(): React.ReactNode {
        const { transaction } = this.state;

        // Return null or loading state if transaction is empty (initial render)
        if (!transaction.type) {
            return null;
        }

        const transactionType = String(transaction.type);
        const isSwap = transactionType === "swap";
        const amount = Number(transaction.amount);
        const swapToAmount = Number(transaction.swapToAmount || 0);
        const status = String(transaction.status);
        const fees = Number(transaction.fees || 0);

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
                                tintColor={"#000000"}
                                style={styles.backIcon} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.title}>{this.title}</ThemedText>
                        {/* Placeholder for symmetry */}
                        <View style={{ width: 60 }} />
                    </ThemedView>

                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 90 }}
                        showsVerticalScrollIndicator={false}>

                        <ThemedView style={styles.infoContainer}>
                            <View style={styles.iconContainer}>
                                {this.renderTransactionIcon()}
                            </View>

                            {isSwap && (
                                <ThemedText style={styles.swapLabel}>You Swapped</ThemedText>
                            )}

                            {isSwap ? (
                                <View style={styles.swapAmountContainer}>
                                    <View style={styles.amountRow}>
                                        <ThemedText style={styles.amountLabel}>{transaction.fromCurrency}</ThemedText>
                                        <ThemedText style={styles.amountValue}>
                                            {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={styles.swapArrow}>{`→`}</ThemedText>
                                    <View style={styles.amountRow}>
                                        <ThemedText style={styles.amountLabel}>{transaction.toCurrency}</ThemedText>
                                        <ThemedText style={styles.amountValue}>
                                            {swapToAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                                        </ThemedText>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.balanceContainer}>
                                    <ThemedText style={styles.balanceText}>
                                        {transactionType === "deposit" || transactionType === "receive" ? "+" : "-"}
                                        {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} {transaction.fromCurrency}
                                    </ThemedText>
                                </View>
                            )}

                            <View style={styles.detailsContainer}>
                                {transactionType === "bills" && (
                                    <View style={styles.detailRow}>
                                        <ThemedText style={styles.infoLabel}>Bill Type</ThemedText>
                                        <ThemedText style={styles.infoLabelText}>{String(transaction.billType || 'N/A').toUpperCase()}</ThemedText>
                                    </View>
                                )}

                                {transactionType === "bills" && (
                                    <View style={styles.detailRow}>
                                        <ThemedText style={styles.infoLabel}>Network</ThemedText>
                                        <ThemedText style={styles.infoLabelText}>{String(transaction.billDetails?.service_id || 'N/A').toUpperCase()}</ThemedText>
                                    </View>
                                )}

                                {transactionType !== "bills" && (
                                    <View style={styles.detailRow}>
                                        <ThemedText style={styles.infoLabel}>Network</ThemedText>
                                        <ThemedText style={styles.infoLabelText}>
                                            {transactionType === "swap" ? "Multi Chain" : String(transaction.network || 'N/A').toUpperCase()}
                                        </ThemedText>
                                    </View>
                                )}

                                <View style={styles.detailRow}>
                                    <ThemedText style={styles.infoLabel}>Transaction Fee</ThemedText>
                                    <ThemedText style={styles.infoLabelText}>
                                        {transaction.type === "deposit"
                                            ? (0.00).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })
                                            : fees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })
                                        } {transaction.fromCurrency}
                                    </ThemedText>
                                </View>

                                <View style={styles.detailRow}>
                                    <ThemedText style={styles.infoLabel}>Status</ThemedText>
                                    <View style={{
                                        paddingHorizontal: 8,
                                        paddingVertical: 3,
                                        borderRadius: 4,
                                        backgroundColor: status === "FAILED"
                                            ? "#FEE2E2"
                                            : status === "PENDING"
                                                ? "#FEF3C7"
                                                : "#D1FAE5"
                                    }}>
                                        <ThemedText style={{
                                            fontSize: 12,
                                            fontFamily: 'AeonikMedium',
                                            textTransform: "capitalize",
                                            color: status === "FAILED"
                                                ? "#96132C"
                                                : status === "PENDING"
                                                    ? "#965913"
                                                    : "#28806F"
                                        }}>
                                            {status}
                                        </ThemedText>
                                    </View>
                                </View>

                                <View style={styles.detailRow}>
                                    <ThemedText style={styles.infoLabel}>Time</ThemedText>
                                    <ThemedText style={styles.infoLabelText}>{Defaults.FORMAT_DATE(String(transaction.createdAt))}</ThemedText>
                                </View>

                                {transaction.from && (
                                    <View style={styles.detailRow}>
                                        <ThemedText style={styles.infoLabel}>From</ThemedText>
                                        <ThemedText style={styles.infoLabelText}>
                                            {transaction.from.slice(0, 10)}...{transaction.from.slice(-10)}
                                        </ThemedText>
                                    </View>
                                )}

                                {transaction.to &&
                                    !(transactionType === "swap" && transaction.toCurrency === "NGN") &&
                                    transactionType !== "withdrawal" && (
                                        <View style={styles.detailRow}>
                                            <ThemedText style={styles.infoLabel}>To</ThemedText>
                                            <ThemedText style={styles.infoLabelText}>
                                                {transactionType === "bills"
                                                    ? transaction.to
                                                    : `${transaction.to.slice(0, 10)}...${transaction.to.slice(-10)}`
                                                }
                                            </ThemedText>
                                        </View>
                                    )}
                            </View>

                            <Pressable onPress={this.copyReference} style={styles.copyReferenceButton}>
                                <ThemedText style={styles.copyReferenceText}>Copy Reference</ThemedText>
                            </Pressable>

                        </ThemedView>
                    </ScrollView>

                    <View style={styles.shareButtonContainer}>
                        <Pressable onPress={() => this.toastRef.current?.show("Share Receipt failed, please try again", "error")} style={styles.shareButton}>
                            <ThemedText style={styles.shareButtonText}>Share Receipt</ThemedText>
                        </Pressable>
                    </View>

                </ThemedSafeArea>
                <SimpleToast ref={this.toastRef} />
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
        marginBottom: 24,
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
    placeholderIcon: {
        width: 24,
        height: 24,
    },
    infoContainer: {
        paddingHorizontal: 16,
        flexDirection: 'column',
        alignItems: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 8,
    },
    swapLabel: {
        fontSize: 16,
        fontFamily: 'AeonikMedium',
        color: '#1F1F1F',
        marginBottom: 24,
    },
    balanceContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    balanceText: {
        color: '#1F1F1F',
        fontFamily: 'AeonikBold',
        fontSize: 28,
        textTransform: "uppercase"
    },
    balanceValue: {
        color: '#757575',
        fontSize: 12,
        lineHeight: 14,
        fontFamily: 'AeonikMedium',
    },
    swapAmountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 32,
    },
    amountRow: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
    },
    amountLabel: {
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        color: '#757575',
        textTransform: 'uppercase',
    },
    amountValue: {
        fontSize: 20,
        fontFamily: 'AeonikBold',
        color: '#1F1F1F',
    },
    swapArrow: {
        fontSize: 20,
        color: '#757575',
    },
    detailsContainer: {
        width: '100%',
        backgroundColor: '#F5F5F5',
        padding: 16,
        borderRadius: 12,
        gap: 16,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    infoLabel: {
        color: '#757575',
        fontSize: 13,
        fontFamily: 'AeonikRegular',
    },
    infoLabelText: {
        color: '#1F1F1F',
        fontSize: 13,
        lineHeight: 16,
        fontFamily: 'AeonikMedium',
        textTransform: "uppercase",
        maxWidth: '60%',
        textAlign: 'right',
    },
    copyReferenceButton: {
        paddingVertical: 12,
        marginBottom: 16,
    },
    copyReferenceText: {
        color: '#253E92',
        fontSize: 14,
        fontFamily: 'AeonikMedium',
        textAlign: 'center',
    },
    shareButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 8,
    },
    shareButton: {
        width: '100%',
        backgroundColor: '#253E92',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'AeonikBold',
    },
});
export default function TransactionDetailsScreen() {
    const params = useLocalSearchParams();
    return <TransactionDetailsContent params={params} />;
}
