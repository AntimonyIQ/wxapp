import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import TransactionShimmer from "@/components/TransactionShimmer";
import assetsList from "@/data/assets";
import { IResponse, ITransaction, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import sessionManager from "@/session/session";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Defaults from "../default/default";
import { Status } from "@/enums/enums";

interface IProps { }

enum Tabs {
    all = "all",
    success = "success",
    failed = "failed",
    pending = "pending",
}

interface IState {
    refreshing: boolean;
    loading: boolean;
    selectedTab: Tabs,
    transactions: Array<ITransaction>;
}

enum TStatus {
    all = "all",
    success = "success",
    failed = "failed",
    pending = "pending"
}

export default class TransactionScreen extends React.Component<IProps, IState> {
    private readonly tabs: Array<string> = Object.keys(Tabs);
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Transactions";

    constructor(props: IProps) {
        super(props);
        this.state = {
            selectedTab: Tabs.all,
            loading: true,
            refreshing: false,
            transactions: []
        }
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
    }

    componentDidMount(): void {
        this.fetchTransactionsData();
    }

    private fetchTransactionsData = async () => {
        try {
            this.setState({ loading: true });

            // Ensure network connectivity
            await Defaults.IS_NETWORK_AVAILABLE();

            const url = `${Defaults.API}/transaction?page=1&limit=50${this.state.selectedTab === "all" ? '' : `&status=${this.state.selectedTab.toUpperCase()}`}`;

            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client?.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Invalid Response');
                const parseData = Defaults.PARSE_DATA(data.data, this.session.client?.privateKey, data.handshake);
                this.setState({
                    transactions: parseData
                });
            }

        } catch (error) {
            const errMsg: string = (error as Error).message || "An error occurred while fetching transactions.";
            if (errMsg.trim() === "Session expired, please login") {
                router.replace(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            } else {
                logger.error("Error fetching transactions:", errMsg);
            }
        } finally {
            this.setState({ loading: false });
        }
    };

    private onRefresh = () => {
        this.setState({ refreshing: true });
        setTimeout(() => {
            this.setState({ refreshing: false }, async () => {
                await this.fetchTransactionsData();
            });
        }, 1500);
    }

    private groupTransactionsByDate = (transactions: ITransaction[]) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const groups = {
            today: [] as ITransaction[],
            yesterday: [] as ITransaction[],
            other: {} as { [key: string]: ITransaction[] }
        };

        transactions.forEach(transaction => {
            const transactionDate = new Date(transaction.createdAt);
            const transactionDateString = transactionDate.toDateString();

            if (transactionDateString === today.toDateString()) {
                groups.today.push(transaction);
            } else if (transactionDateString === yesterday.toDateString()) {
                groups.yesterday.push(transaction);
            } else {
                if (!groups.other[transactionDateString]) {
                    groups.other[transactionDateString] = [];
                }
                groups.other[transactionDateString].push(transaction);
            }
        });

        return groups;
    };

    private renderTransactionItem = (transaction: ITransaction, index: number, showBorder: boolean) => {
        const amount = Number(transaction.amount);
        const currency = String(transaction.fromCurrency);
        const status = String(transaction.status);
        const createdAt = new Date(transaction.createdAt);
        const transactionType = String(transaction.type);

        const getAssetLogoURI = (symbol: string) => {
            const asset = assetsList.find(a => a.symbol === symbol);
            return asset ? asset.logoURI : null;
        };

        const renderTransactionIcon = () => {
            if (transactionType === "swap" && transaction.fromCurrency && transaction.toCurrency) {
                return (
                    <View style={{ width: 44, height: 40, position: 'relative' }}>
                        <Image
                            source={{ uri: getAssetLogoURI(transaction.fromCurrency) || "" }}
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: 15,
                                position: 'absolute',
                                left: 0,
                                top: 5,
                                zIndex: 2,
                                backgroundColor: '#fff'
                            }}
                            contentFit="contain"
                        />
                        <Image
                            source={{ uri: getAssetLogoURI(transaction.toCurrency) || "" }}
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: 15,
                                position: 'absolute',
                                right: 0,
                                top: 5,
                                zIndex: 1,
                                backgroundColor: '#fff',
                                opacity: 0.8
                            }}
                            contentFit="contain"
                        />
                    </View>
                );
            }

            const logoURI = getAssetLogoURI(transaction.fromCurrency);
            if (logoURI) {
                return (
                    <Image
                        source={{ uri: logoURI }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                        contentFit="contain"
                    />
                );
            }

            // Fallback
            return (
                <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#253E92',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <ThemedText style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'AeonikBold' }}>
                        {transaction.fromCurrency ? transaction.fromCurrency.substring(0, 1) : "?"}
                    </ThemedText>
                </View>
            );
        }

        return (
            <Pressable
                key={index}
                onPress={() => router.navigate({ pathname: "/transaction/details", params: { params: JSON.stringify(transaction) } })}
                style={{
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 15,
                    paddingHorizontal: 15,
                    borderBottomWidth: showBorder ? 1 : 0,
                    borderBottomColor: "#F5F5F5",
                }}
            >
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                    <View style={{ width: transactionType === "swap" ? 50 : 40 }}>
                        {renderTransactionIcon()}
                    </View>

                    <View style={{ flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                        {transactionType === "swap" && transaction.toCurrency ? (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                <Text style={{ fontSize: 14, color: "#1F1F1F", fontFamily: 'AeonikMedium', textTransform: "uppercase" }}>
                                    {transaction.fromCurrency}
                                </Text>
                                <Text style={{ fontSize: 12, color: "#757575" }}>→</Text>
                                <Text style={{ fontSize: 14, color: "#1F1F1F", fontFamily: 'AeonikMedium', textTransform: "uppercase" }}>
                                    {transaction.toCurrency}
                                </Text>
                                <View style={{
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 4,
                                    backgroundColor: "#F3E8FF"
                                }}>
                                    <Text style={{
                                        fontSize: 10,
                                        fontFamily: 'AeonikMedium',
                                        textTransform: "capitalize",
                                        color: "#7C3AED"
                                    }}>
                                        swap
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <Text style={{ fontSize: 14, color: "#1F1F1F", fontFamily: 'AeonikMedium', textTransform: "uppercase" }}>
                                    {currency}
                                </Text>
                                <View style={{
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 4,
                                    backgroundColor: transactionType === "send" ? "#E8F5F1" : "#E8F3FF"
                                }}>
                                    <Text style={{
                                        fontSize: 10,
                                        fontFamily: 'AeonikMedium',
                                        textTransform: "capitalize",
                                        color: transactionType === "send" ? "#28806F" : "#2563EB"
                                    }}>
                                        {transactionType}
                                    </Text>
                                </View>
                            </View>
                        )}
                        <Text style={{ fontSize: 11, color: "#757575", fontFamily: 'AeonikRegular' }}>
                            {Defaults.FORMAT_DATE(createdAt.toString())}
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 14, color: "#1F1F1F", fontFamily: 'AeonikMedium', textTransform: "uppercase" }}>
                        {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {currency}
                    </Text>
                    <View style={{
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        backgroundColor: status === "FAILED"
                            ? "#FEE2E2"
                            : status === "PENDING"
                                ? "#FEF3C7"
                                : "#D1FAE5",
                        alignSelf: "flex-end"
                    }}>
                        <Text style={{
                            fontSize: 10,
                            fontFamily: 'AeonikMedium',
                            textTransform: "capitalize",
                            color: status === "FAILED"
                                ? "#96132C"
                                : status === "PENDING"
                                    ? "#965913"
                                    : "#28806F"
                        }}>
                            {status}
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    }

    render(): React.ReactNode {
        const ts: Array<string> = Object.keys(TStatus);
        const { loading, selectedTab, transactions, refreshing } = this.state;
        const groupedTransactions = this.groupTransactionsByDate(transactions);

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
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        width: "100%"
                    }}>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#F5F5F5",
                            borderRadius: 360,
                            padding: 4,
                            width: "100%",
                        }}>
                            {ts.map((s, i) => (
                                <Pressable
                                    key={i}
                                    onPress={() => this.setState({ selectedTab: s as Tabs }, () => this.fetchTransactionsData())}
                                    style={{
                                        flex: 1,
                                        backgroundColor: selectedTab === s ? "#FFFFFF" : "transparent",
                                        paddingVertical: 10,
                                        borderRadius: 360,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        shadowColor: selectedTab === s ? "#000" : "transparent",
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: selectedTab === s ? 0.1 : 0,
                                        shadowRadius: 2,
                                        elevation: selectedTab === s ? 2 : 0,
                                    }}>
                                    <Text
                                        style={{
                                            textTransform: "capitalize",
                                            color: selectedTab === s ? "#1F1F1F" : "#757575",
                                            fontSize: 13,
                                            textAlign: "center",
                                            fontFamily: selectedTab === s ? 'AeonikMedium' : 'AeonikRegular',
                                        }}>{s}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={this.onRefresh}
                            />
                        }
                    >
                        <View style={{ flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start", paddingHorizontal: 20, width: "100%", paddingBottom: 20 }}>
                            {loading && <TransactionShimmer />}

                            {!loading && transactions.length === 0 &&
                                <View style={{ backgroundColor: "#FFFFFF", padding: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", gap: 20, paddingTop: 100 }}>
                                    <View style={{ width: 70, height: 70, backgroundColor: "#F0F0F0", borderRadius: 360, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                        <Image source={require("../../assets/icons/info_blank.svg")} style={{ width: 48, height: 48 }} />
                                    </View>
                                    <ThemedText
                                        style={{
                                            textTransform: "capitalize",
                                            color: "#757575",
                                            padding: 8,
                                            paddingHorizontal: 20,
                                            fontSize: 14,
                                            borderRadius: 20,
                                            textAlign: "center",
                                            fontFamily: 'AeonikRegular',
                                        }}>Sorry no Transaction found at the moment, please try again!</ThemedText>
                                </View>
                            }

                            {!loading && transactions.length > 0 && (
                                <View style={{ flexDirection: "column", alignItems: 'flex-start', paddingHorizontal: 0, width: "100%", gap: 16 }}>

                                    {/* Today's Transactions */}
                                    {groupedTransactions.today.length > 0 && (
                                        <View style={styles.transactionGroup}>
                                            <Text style={styles.groupHeader}>Today</Text>
                                            {groupedTransactions.today.map((transaction, index) =>
                                                this.renderTransactionItem(transaction, index, index < groupedTransactions.today.length - 1)
                                            )}
                                        </View>
                                    )}

                                    {/* Yesterday's Transactions */}
                                    {groupedTransactions.yesterday.length > 0 && (
                                        <View style={styles.transactionGroup}>
                                            <Text style={styles.groupHeader}>Yesterday</Text>
                                            {groupedTransactions.yesterday.map((transaction, index) =>
                                                this.renderTransactionItem(transaction, index, index < groupedTransactions.yesterday.length - 1)
                                            )}
                                        </View>
                                    )}

                                    {/* Other Dates */}
                                    {Object.keys(groupedTransactions.other).map(dateKey => (
                                        <View key={dateKey} style={styles.transactionGroup}>
                                            <Text style={styles.groupHeader}>{dateKey}</Text>
                                            {groupedTransactions.other[dateKey].map((transaction, index) =>
                                                this.renderTransactionItem(transaction, index, index < groupedTransactions.other[dateKey].length - 1)
                                            )}
                                        </View>
                                    ))}

                                </View>
                            )}
                        </View>
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
    transactionGroup: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    groupHeader: {
        fontSize: 14,
        fontFamily: 'AeonikBold',
        color: "#1F1F1F",
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 10,
    }
});