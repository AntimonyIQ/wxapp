import React from "react";
import sessionManager from "@/session/session";
import logger from "@/logger/logger";
import { Href, router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Appearance, ColorSchemeName, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { IMarket, ITransaction, UserData } from "@/interface/interface";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import GraphModal from "@/components/modals/graph";
import Defaults from "../default/default";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { Coin, TransactionType } from "@/enums/enums";

interface IProps { }

interface IState {
    NGN_BALANCE: number;
    loading: boolean;
    transactions: Array<ITransaction>;
    refreshing: boolean;
    bottomsheet: boolean;
}

export default class CoinScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Coin Screen";
    private coin: IMarket;
    constructor(props: IProps) {
        super(props);
        this.state = { NGN_BALANCE: 0, loading: false, transactions: [], refreshing: false, bottomsheet: false, };
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
        this.coin = this.session.selectedCoin;
    }

    componentDidMount(): void {
        const NGN_BALANCE: number = parseFloat(this.session.NGN_BALANCE || 0);
        this.setState({ NGN_BALANCE: NGN_BALANCE });
        this.fetchTransactionsData();
    }

    private showNetwork = (symbol: Coin): string => (symbol.toUpperCase() === Coin.USDT || symbol.toUpperCase() === Coin.USDC) ? "(BEP20)" : "";

    private onRefresh = async () => {
        this.setState({ refreshing: true });
        await this.fetchTransactionsData();
        this.setState({ refreshing: false });
    };

    private capitalizeFirstLetter(str: string): string {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    private fetchTransactionsData = async () => {
        try {
            this.setState({ loading: true });
            const { currency } = this.coin;

            const response = await fetch(`${Defaults.API}/transactions/user/?page=1&limit=50&currency=${currency}`, {
                method: "GET",
                headers: { ...Defaults.HEADERS, "Authorization": `Bearer ${this.session.accessToken}` },
            });

            if (!response.ok) logger.log("response failed with status: ", response.status)

            const data = await response.json();

            if (data.status === "success") {
                this.setState({
                    transactions: data.data || [],
                });
            }
        } catch (error: any) {
            logger.log(error);
        } finally {
            this.setState({ loading: false });
        }
    };

    render(): React.ReactNode {
        const { currency, address, balance, price, icon, name, percent_change_24h } = this.coin;
        const { NGN_BALANCE, loading, transactions, refreshing, bottomsheet } = this.state;
        const dollarval: string = (balance * price).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
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
                        <ThemedText style={styles.title}>{name}</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.infoContainer}>
                        <ThemedView style={styles.balanceContainer}>
                            <Image source={{ uri: icon }} style={{ width: 25, height: 25 }} />
                            <ThemedText style={styles.infoLabel}>{name} {this.showNetwork(currency as Coin)}</ThemedText>
                            <ThemedText style={styles.balanceText}>{balance} {currency}</ThemedText>
                            <ThemedText style={styles.balanceValue}>
                                ≈ {dollarval}
                            </ThemedText>
                        </ThemedView>

                        <ThemedView style={styles.actionsContainer}>
                            {currency === Coin.NGN ? null :
                                <>
                                    <TouchableOpacity style={styles.actionButtonContainer} onPress={() => router.navigate(`/send/input`)}>
                                        <ThemedView style={styles.actionButton}>
                                            <Image
                                                source={require("../../assets/icons/arrow-up.svg")}
                                                style={styles.backIcon}
                                                tintColor={this.appreance === "dark" ? Colors.light.background : "#000000"} />
                                        </ThemedView>
                                        <ThemedText style={styles.actionText}>Send</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => router.navigate('/coin/receive')}
                                        style={styles.actionButtonContainer}>
                                        <ThemedView style={styles.actionButton}>
                                            <Image
                                                source={require("../../assets/icons/arrow-down.svg")}
                                                style={styles.backIcon}
                                                tintColor={this.appreance === "dark" ? Colors.light.background : "#000000"} />
                                        </ThemedView>
                                        <ThemedText style={styles.actionText}>Receive</ThemedText>
                                    </TouchableOpacity>
                                </>
                            }
                            <TouchableOpacity onPress={() => router.navigate('/swap')} style={styles.actionButtonContainer}>
                                <ThemedView style={styles.actionButton}>
                                    <Image
                                        source={require("../../assets/icons/refresh.svg")}
                                        style={[styles.backIcon]}
                                        tintColor={this.appreance === "dark" ? Colors.light.background : "#000000"} />
                                </ThemedView>
                                <ThemedText style={styles.actionText}>Swap</ThemedText>
                            </TouchableOpacity>
                        </ThemedView>

                        <ThemedView style={{ width: '100%', height: 1, backgroundColor: this.appreance === "dark" ? '#202020' : '#E8E8E8' }} />

                        <ThemedView style={{ marginTop: 25, paddingHorizontal: 16, paddingBottom: 10 }}>
                            <ThemedText
                                style={{
                                    fontFamily: 'AeonikMedium',
                                    fontSize: 14,
                                }}
                            >
                                Transactions History
                            </ThemedText>
                        </ThemedView>

                        {loading && (
                            <ThemedView
                                style={{
                                    height: "50%",
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                <ActivityIndicator size={40} color={"#253E92"} />
                            </ThemedView>
                        )}

                        {!loading && transactions.length === 0 &&
                            <ThemedView
                                style={{
                                    height: "50%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                <Image
                                    source={require("../../assets/icons/bank.svg")}
                                    style={{ width: 100, height: 100 }} />
                                <ThemedText style={{ fontFamily: 'AeonikMedium', fontSize: 16, }}>Your transactions would appear here.</ThemedText>
                            </ThemedView>
                        }

                        {!loading && transactions.length > 0 &&
                            <ScrollView
                                style={{ width: "100%" }}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{
                                    paddingVertical: 5,
                                    paddingBottom: 50,
                                }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={this.onRefresh}
                                    />
                                }>
                                {transactions.reverse().map((transaction, index) => (
                                    <Pressable
                                        key={index}
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            paddingVertical: 3,
                                            width: "100%",
                                            alignItems: 'center',
                                        }} onPress={() => router.navigate('/transactiondetails' as Href)} >
                                        <ThemedView
                                            style={{
                                                width: "100%",
                                                flexDirection: "row",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                paddingVertical: 7,
                                                paddingHorizontal: 10,
                                            }}
                                        >
                                            <ThemedView style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                                                <ThemedView
                                                    style={{
                                                        borderRadius: 360,
                                                        backgroundColor: transaction.type === TransactionType.TRANSFER ? "#96132C" : "#28806F",
                                                        width: 40,
                                                        height: 40,
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <Image
                                                        source={transaction.type === TransactionType.TRANSFER ? require("../../assets/icons/transfercoin.svg") : require("../../assets/icons/deposit.svg")}
                                                        style={styles.backIcon}
                                                        tintColor={"#ffffff"} />
                                                </ThemedView>
                                                <ThemedView
                                                    style={{
                                                        flexDirection: "column",
                                                        gap: 1,
                                                        alignItems: "flex-start",
                                                    }}
                                                >
                                                    <ThemedText
                                                        style={{
                                                            fontSize: 14,
                                                            fontFamily: 'AeonikMedium',
                                                        }}
                                                    >
                                                        {this.capitalizeFirstLetter(transaction.type)} {transaction.fromCurrency}
                                                    </ThemedText>
                                                    <ThemedText
                                                        style={{
                                                            fontSize: 11,
                                                            textTransform: "capitalize",
                                                            color: "#757575",
                                                            fontFamily: 'AeonikRegular',
                                                        }}
                                                    >
                                                        {Defaults.FORMAT_DATE(String(transaction.createdAt))}
                                                    </ThemedText>
                                                </ThemedView>
                                            </ThemedView>
                                            <ThemedView
                                                style={{
                                                    flexDirection: "column",
                                                    gap: 1,
                                                    alignItems: "flex-end",
                                                }}
                                            >
                                                <ThemedText
                                                    style={{
                                                        fontSize: 14,
                                                        color: transaction.type === TransactionType.TRANSFER ? "#96132C" : "#28806F",
                                                        fontFamily: 'AeonikMedium',
                                                        textTransform: "uppercase",
                                                    }}
                                                >
                                                    {transaction.type === TransactionType.TRANSFER ? "-" : "+"}
                                                    {(transaction.amount * price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                                </ThemedText>
                                                <ThemedText
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#757575",
                                                        fontFamily: 'AeonikRegular',
                                                    }}
                                                >
                                                    {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 8 })} {currency}
                                                </ThemedText>
                                            </ThemedView>
                                        </ThemedView>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        }

                    </ThemedView>

                    <Pressable
                        onPress={() => this.setState({ bottomsheet: !bottomsheet })}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            width: '100%',
                            backgroundColor: "#FFF"
                        }}>
                        <ThemedView style={{ width: '100%', height: 1, backgroundColor: this.appreance === "dark" ? '#202020' : '#E8E8E8' }} />
                        <ThemedView
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 16,
                            }}>
                            <ThemedView>
                                <ThemedText
                                    style={{
                                        fontSize: 12,
                                        fontFamily: 'AeonikRegular',
                                        lineHeight: 14,
                                    }}>
                                    Current {currency} price
                                </ThemedText>
                                <ThemedView
                                    style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                                    <ThemedText
                                        style={{
                                            fontFamily: 'AeonikMedium',
                                            fontSize: 24,
                                        }}>
                                        {price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </ThemedText>
                                    <ThemedText
                                        style={{
                                            fontFamily: 'AeonikMedium',
                                            fontSize: 12,
                                            color: percent_change_24h >= 0 ? '#0A7826' : 'red',
                                        }}
                                    >
                                        {percent_change_24h >= 0 && '+'}{percent_change_24h}%
                                    </ThemedText>
                                </ThemedView>
                            </ThemedView>
                            <Pressable onPress={() => this.setState({ bottomsheet: !bottomsheet })} style={{ top: -10 }}>
                                <Image
                                    source={require("../../assets/icons/chevron-left.svg")}
                                    style={[styles.backIcon, { transform: [{ rotate: "90deg" }] }]}
                                    tintColor={this.appreance === "dark" ? Colors.light.background : "#000000"} />
                            </Pressable>
                        </ThemedView>
                        <GraphModal currency={this.coin} visible={bottomsheet} onClose={() => this.setState({ bottomsheet: false })} />
                    </Pressable>

                    <StatusBar style={this.appreance === "dark" ? 'light' : "dark"} />
                </ThemedSafeArea>
            </>
        )
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
    placeholderIcon: {},
    infoContainer: {
        marginTop: 42,
        paddingHorizontal: 16,
    },
    balanceContainer: {
        alignItems: 'center',
        marginBottom: 24,
        gap: 8
    },
    infoLabel: {
        color: Appearance.getColorScheme() === "dark" ? '#F5F5F5' : '#757575',
        fontSize: 12,
        lineHeight: 14,
        fontFamily: 'AeonikRegular',
    },
    balanceText: {
        color: Appearance.getColorScheme() === "dark" ? '#F5F5F5' : '#1F1F1F',
        fontFamily: 'AeonikMedium',
        fontSize: 20,
    },
    balanceValue: {
        color: Appearance.getColorScheme() === "dark" ? '#b0b0b0' : '#757575',
        fontSize: 12,
        lineHeight: 14,
        fontFamily: 'AeonikMedium',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    actionButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 12,
    },
    actionButton: {
        padding: 14,
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#000000" : '#f7f7f7',
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        fontSize: 10,
        fontFamily: 'AeonikRegular',
    },
});