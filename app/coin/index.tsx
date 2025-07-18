// This is part for the Wealthx Mobile Application.
// Copyright © 2023 WealthX. All rights reserved.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";
import sessionManager from "@/session/session";
import logger from "@/logger/logger";
import { Href, router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { IMarket, IResponse, ITransaction, UserData } from "@/interface/interface";
import { Image } from "expo-image";
import GraphModal from "@/components/modals/graph";
import Defaults from "../default/default";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { BlockchainNetwork, Coin, Status, TransactionType, WalletType } from "@/enums/enums";
import ListModal from "@/components/modals/list";

interface IProps { }

interface IState {
    loading: boolean;
    transactions: Array<ITransaction>;
    refreshing: boolean;
    bottomsheet: boolean;
    asset: IMarket;
    visible: boolean;
    whichnav: "send" | "receive";
}

export default class CoinScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Coin Screen";
    constructor(props: IProps) {
        super(props);
        this.state = {
            loading: false,
            transactions: [],
            refreshing: false,
            bottomsheet: false,
            asset: {
                currency: Coin.BTC,
                name: "",
                categorie: WalletType.CRYPTO,
                network: BlockchainNetwork.ETHEREUM,
                address: "",
                price: 0,
                balance: 0,
                balanceUsd: 0,
                icon: "",
                percent_change_24h: 0,
                volume_change_24h: 0,
                market_cap: 0,
                active: false
            },
            visible: false,
            whichnav: "send",
        };

        const login: boolean = Defaults.LOGIN_STATUS();
        if (!login) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            return;
        };
    }

    componentDidMount(): void {
        const { currency, network } = this.session.params;
        const asset: IMarket = Defaults.FIND_MARKET(currency, network);
        this.setState({ asset });
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
            await Defaults.IS_NETWORK_AVAILABLE();

            const login: boolean = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            };

            const res = await fetch(`${Defaults.API}/transaction/?page=1&limit=50&fromCurrency=${this.session.params.currency}`, {
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
                if (!data.handshake) throw new Error('Unable to process transactions right now, please try again.');
                const parseData = Defaults.PARSE_DATA(data.data, this.session.client?.privateKey, data.handshake);

                this.setState({
                    transactions: parseData,
                });
            };
        } catch (error: any) {
            logger.log(error);
        } finally {
            this.setState({ loading: false });
        }
    };

    render(): React.ReactNode {
        const { loading, transactions, refreshing, bottomsheet, asset, visible } = this.state;
        const dollarval: string = (asset.balance || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
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
                        <ThemedText style={styles.title}>{asset.name}</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.infoContainer}>
                        <ThemedView style={styles.balanceContainer}>
                            <Image source={{ uri: asset.icon }} style={{ width: 25, height: 25 }} />
                            <ThemedText style={styles.infoLabel}>{asset.name} {this.showNetwork(asset.currency as Coin)}</ThemedText>
                            <ThemedText style={styles.balanceText}>{asset.balance} {asset.currency}</ThemedText>
                            <ThemedText style={styles.balanceValue}>
                                ≈ {dollarval}
                            </ThemedText>
                        </ThemedView>

                        <ThemedView style={styles.actionsContainer}>
                            {asset.currency === Coin.NGN ? null :
                                <>
                                    <TouchableOpacity
                                        style={styles.actionButtonContainer}
                                        onPress={() => {
                                            if (asset.currency === Coin.USDC || asset.currency === Coin.USDT) {
                                                this.setState({ visible: true, whichnav: "send" });
                                                return;
                                            }

                                            if (this.session.user?.isPhoneNumberVerified === false) {
                                                router.navigate("/phone/welcome");
                                                return;
                                            }

                                            router.navigate(`/send/input`);
                                        }}>
                                        <ThemedView style={styles.actionButton}>
                                            <Image
                                                source={require("../../assets/icons/arrow-up.svg")}
                                                style={styles.backIcon}
                                                tintColor={"#000000"} />
                                        </ThemedView>
                                        <ThemedText style={styles.actionText}>Send</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (asset.currency === Coin.USDC || asset.currency === Coin.USDT) {
                                                this.setState({ visible: true, whichnav: "receive" });
                                                return;
                                            }
                                            router.navigate('/coin/receive');
                                        }}
                                        style={styles.actionButtonContainer}>
                                        <ThemedView style={styles.actionButton}>
                                            <Image
                                                source={require("../../assets/icons/arrow-down.svg")}
                                                style={styles.backIcon}
                                                tintColor={"#000000"} />
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
                                        tintColor={"#000000"} />
                                </ThemedView>
                                <ThemedText style={styles.actionText}>Swap</ThemedText>
                            </TouchableOpacity>
                        </ThemedView>

                        <ThemedView style={{ width: '100%', height: 1, backgroundColor: '#E8E8E8' }} />

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
                                                    {(transaction.amount * asset.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                                </ThemedText>
                                                <ThemedText
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#757575",
                                                        fontFamily: 'AeonikRegular',
                                                    }}
                                                >
                                                    {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 8 })} {asset.currency}
                                                </ThemedText>
                                            </ThemedView>
                                        </ThemedView>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        }

                    </ThemedView>

                    <ListModal
                        visible={visible}
                        lists={[
                            { name: "TRON Blockchain network", description: BlockchainNetwork.TRON, icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png" },
                            { name: "Binance Smart Chain", description: BlockchainNetwork.BSC, icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png" }
                        ]}
                        onClose={() => this.setState({ visible: false })}
                        listChange={async (item) => {
                            const { whichnav } = this.state;
                            this.setState({ visible: false });
                            if (this.session.user?.isPhoneNumberVerified === false) {
                                router.navigate("/phone/welcome");
                                return;
                            }

                            if (whichnav === "send") {
                                await sessionManager.updateSession({ ...this.session, params: { currency: asset.currency, network: item.description as BlockchainNetwork } })
                                router.navigate('/send/input');
                            } else {
                                await sessionManager.updateSession({ ...this.session, params: { currency: asset.currency, network: item.description as BlockchainNetwork } })
                                router.navigate('/coin/receive');
                            }
                        }}
                        showSearch={true} />

                    <Pressable
                        onPress={() => this.setState({ bottomsheet: !bottomsheet })}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            width: '100%',
                            backgroundColor: "#FFF"
                        }}>
                        <ThemedView style={{ width: '100%', height: 1, backgroundColor: '#E8E8E8' }} />
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
                                    Current {asset.currency} price
                                </ThemedText>
                                <ThemedView
                                    style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                                    <ThemedText
                                        style={{
                                            fontFamily: 'AeonikMedium',
                                            fontSize: 24,
                                        }}>
                                        {asset.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </ThemedText>
                                    <ThemedText
                                        style={{
                                            fontFamily: 'AeonikMedium',
                                            fontSize: 12,
                                            color: asset.percent_change_24h >= 0 ? '#0A7826' : 'red',
                                        }}
                                    >
                                        {asset.percent_change_24h >= 0 && '+'}{asset.percent_change_24h}%
                                    </ThemedText>
                                </ThemedView>
                            </ThemedView>
                            <Pressable onPress={() => this.setState({ bottomsheet: !bottomsheet })} style={{ top: -10 }}>
                                <Image
                                    source={require("../../assets/icons/chevron-left.svg")}
                                    style={[styles.backIcon, { transform: [{ rotate: "90deg" }] }]}
                                    tintColor={"#000000"} />
                            </Pressable>
                        </ThemedView>
                        <GraphModal asset={asset} visible={bottomsheet} onClose={() => this.setState({ bottomsheet: false })} />
                    </Pressable>

                    <StatusBar style={"dark"} />
                </ThemedSafeArea>
            </>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: Platform.OS === 'android' ? 50 : Platform.OS === "web" ? 20 : 0,
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
        height: 20,
        width: 20,
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
        color: '#757575',
        fontSize: 12,
        lineHeight: 14,
        fontFamily: 'AeonikRegular',
    },
    balanceText: {
        color: '#1F1F1F',
        fontFamily: 'AeonikMedium',
        fontSize: 20,
    },
    balanceValue: {
        color: '#757575',
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
        backgroundColor: '#f7f7f7',
        borderRadius: 99,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        fontSize: 10,
        fontFamily: 'AeonikRegular',
    },
});