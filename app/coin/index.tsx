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

import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import GraphModal from "@/components/modals/graph";
import ListModal from "@/components/modals/list";
import SimpleToast, { ToastRef } from "@/components/toast/toast";
import { getAssetBySymbolAndNetwork, getAssetLogoURI } from "@/data/assets";
import { BlockchainNetwork, Coin, Fiat, Status, TransactionStatus, TransactionType, WalletType } from "@/enums/enums";
import { IMarket, IResponse, ITransaction, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import sessionManager from "@/session/session";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, FlatList, Platform, Pressable, RefreshControl, StyleSheet, TouchableOpacity } from "react-native";
import Defaults from "../default/default";

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
    private toastRef = React.createRef<ToastRef>();

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
        const asset: IMarket = this.filterByCurrencyAndNetwork(currency, network);
        console.log("assets: ", asset);

        this.setState({ asset }, () => {
            if (asset.currency === Coin.NGN) this.fetchNgnRate();
            this.fetchTransactionsData();
        });
    }

    private fetchNgnRate = async () => {
        try {
            const url = 'https://open.er-api.com/v6/latest/USD';
            const res = await fetch(url);
            const data = await res.json();

            if (!data || data.result !== 'success' || !data.rates || !data.rates.NGN) {
                return;
            }

            const rateNgn = Number(data.rates.NGN);
            if (!rateNgn || Number.isNaN(rateNgn) || rateNgn <= 0) {
                return;
            }

            // data.rates.NGN is NGN per 1 USD. We need USD per 1 NGN -> 1 / rateNgn
            const usdPerNgn = 1 / rateNgn;

            this.setState((prev) => ({
                asset: {
                    ...prev.asset,
                    price: usdPerNgn,
                    balanceUsd: prev.asset.balance * usdPerNgn
                }
            }));
        } catch (error) {
            console.warn('Failed to fetch NGN rate:', error);
            this.setState((prev) => ({ asset: { ...prev.asset, price: 0, balanceUsd: 0 } }));
        }
    };


    private filterByCurrencyAndNetwork = (currency: Coin | Fiat, network?: BlockchainNetwork): IMarket => {
        const session = sessionManager.getUserData();
        let market = session.markets.find((market) =>
            market.currency === currency && market.network === network
        );

        // If not found and network is BSC, prioritize BSC version
        if (!market && network === BlockchainNetwork.BSC) {
            market = session.markets.find((market) =>
                market.currency === currency && market.network === BlockchainNetwork.BSC
            );
        }

        // Fallback to just currency match
        if (!market) {
            // Prioritize BSC if available
            market = session.markets.find((market) => market.currency === currency && market.network === BlockchainNetwork.BSC);

            // If still not found, take first available
            if (!market) {
                market = session.markets.find((market) => market.currency === currency);
            }
        }

        if (!market) throw new Error(`Error finding ${currency} wallet on ${network} network`);
        return market;
    };

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

    private getAmountColor = (transaction: ITransaction, type: string) => {
        if (transaction.status === TransactionStatus.FAILED) return "#96132C";
        if (type === TransactionType.TRANSFER || type === TransactionType.WITHDRAWAL) return "#96132C";
        if (type === TransactionType.DEPOSIT) return "#28806F";
        return "#1F1F1F"; // For swap
    };

    private renderTransactionIcon = (transaction: ITransaction) => {
        // For swap transactions, show overlay of two currency icons
        if (transaction.type === TransactionType.SWAP && transaction.fromCurrency && transaction.toCurrency) {
            const fromLogoURI = getAssetLogoURI(transaction.fromCurrency);
            const toLogoURI = getAssetLogoURI(transaction.toCurrency);

            if (fromLogoURI && toLogoURI) {
                return (
                    <ThemedView style={{ position: 'relative', width: 50, height: 40, backgroundColor: 'transparent' }}>
                        <Image
                            source={{ uri: fromLogoURI }}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                backgroundColor: '#FFFFFF',
                                borderWidth: 2,
                                borderColor: '#FFFFFF',
                            }}
                            contentFit="contain"
                        />
                        <Image
                            source={{ uri: toLogoURI }}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                position: 'absolute',
                                right: 0,
                                bottom: 0,
                                backgroundColor: '#FFFFFF',
                                borderWidth: 2,
                                borderColor: '#FFFFFF',
                            }}
                            contentFit="contain"
                        />
                    </ThemedView>
                );
            }
        }

        // For all other transaction types, try to get currency icon
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

        // Fallback to default icon
        return (
            <ThemedView style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#253E92',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <ThemedText style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'AeonikBold' }}>
                    {transaction.fromCurrency.substring(0, 1)}
                </ThemedText>
            </ThemedView>
        );
    };

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
                if (!data.handshake) throw new Error('Invalid Response');
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
                        {/* Updated Balance Container Logic from CoinScreen.js */}
                        <ThemedView style={styles.balanceContainer}>
                            <ThemedView style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <Image source={{ uri: asset.icon }} style={{ width: 40, height: 40, borderRadius: 360 }} />
                                {asset.isToken && asset.networkLogoURI && (
                                    <Image
                                        source={{ uri: getAssetLogoURI(asset.currency) || asset.networkLogoURI }}
                                        style={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: 8,
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 24,
                                            backgroundColor: '#FFFFFF',
                                            borderWidth: 1,
                                            borderColor: '#FFFFFF',
                                        }}
                                    />
                                )}
                            </ThemedView>

                            <ThemedText style={styles.infoLabel}>{asset.name} {this.showNetwork(asset.currency as Coin)}</ThemedText>

                            <ThemedText style={styles.balanceText}>
                                {asset.balance.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: ['USDC', 'USDT', 'BUSD', 'NGN'].includes((asset.currency || "").toUpperCase()) ? 2 : 6
                                })} {asset.currency}
                            </ThemedText>

                            <ThemedText style={styles.balanceValue}>
                                ≈ {dollarval}
                            </ThemedText>
                        </ThemedView>

                        <ThemedView style={styles.actionsContainer}>
                            {asset.currency === Coin.NGN ?
                                (
                                    <>
                                        {/* NGN Specific Buttons like Withdraw */}
                                        <TouchableOpacity
                                            onPress={() => router.navigate({ pathname: '/withdraw', params: { fiat: 'NGN' } })}
                                            style={styles.actionButtonContainer}>
                                            <ThemedView style={styles.actionButton}>
                                                <Image
                                                    source={require("../../assets/icons/arrow-up-right.svg")}
                                                    style={styles.backIcon}
                                                    tintColor={"#000000"} />
                                            </ThemedView>
                                            <ThemedText style={styles.actionText}>Withdrawal</ThemedText>
                                        </TouchableOpacity>
                                    </>
                                ) :
                                <>
                                    <TouchableOpacity
                                        style={styles.actionButtonContainer}
                                        onPress={() => {
                                            if (Platform.OS === 'web') {
                                                this.toastRef.current?.show("Send cryptocurrency is disabled on the web, please download Wealthx app to use this feature.", "info");
                                                return;
                                            }

                                            if (this.session.user?.isPhoneNumberVerified === false) {
                                                router.navigate("/phone/welcome");
                                                return;
                                            }

                                            // Check if this currency exists on multiple networks
                                            const currencyWallets = this.session.markets.filter(m => m.currency === asset.currency);

                                            if (currencyWallets.length > 1) {
                                                this.setState({ visible: true, whichnav: "send" });
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
                                            // Check if this currency exists on multiple networks
                                            const currencyWallets = this.session.markets.filter(m => m.currency === asset.currency);

                                            if (currencyWallets.length > 1) {
                                                this.setState({ visible: true, whichnav: "receive" });
                                                return;
                                            }

                                            if (!asset.active) {
                                                this.toastRef.current?.show(`Deposit for ${asset.currency} (${asset.network}) Disabled at this time`, "error");
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
                            <TouchableOpacity
                                onPress={() => {
                                    if (asset.currency === Coin.NGN) {
                                        // For NGN, swap is usually buying BTC or swapping to other crypto
                                        // The legacy logic seems to swap to BTC or passed currency
                                        // We will default to swap page which likely handles defaults or we can pass params
                                        router.push({ pathname: '/swap', params: { from: Coin.NGN } });
                                    } else {
                                        router.push({ pathname: '/swap', params: { from: asset.currency, network: asset.network } });
                                    }
                                }}
                                style={styles.actionButtonContainer}>
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
                            <FlatList
                                data={transactions}
                                keyExtractor={(_, index) => index.toString()}
                                style={{ width: "100%", flex: 1 }}
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
                                }
                            renderItem={({ item: transaction }) => (
                                <Pressable
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            paddingVertical: 3,
                                            width: "100%",
                                            alignItems: 'center',
                                        }} onPress={() => router.navigate({ pathname: "/transaction/details", params: { params: JSON.stringify(transaction) } })} >
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
                                                {this.renderTransactionIcon(transaction)}
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
                                                        color: this.getAmountColor(transaction, transaction.type),
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
                            )}
                        />
                        }

                    </ThemedView>

                    <ListModal
                        visible={visible}
                        title={"Select Network"}
                        lists={(() => {
                            const currencyWallets = this.session.markets.filter((m) => m.currency === asset.currency);
                            return currencyWallets.map((wallet) => {
                                const networkNames: Record<string, string> = {
                                    [BlockchainNetwork.ETHEREUM]: 'Ethereum Network',
                                    [BlockchainNetwork.BSC]: 'Binance Smart Chain',
                                    [BlockchainNetwork.TRON]: 'TRON Blockchain network',
                                    [BlockchainNetwork.BTC]: 'Bitcoin Network',
                                    [BlockchainNetwork.XRP]: 'XRP Ledger',
                                };

                                const matchedAsset = getAssetBySymbolAndNetwork(wallet.currency, wallet.network);

                                return {
                                    name: networkNames[wallet.network] || wallet.network,
                                    description: wallet.network,
                                    icon: matchedAsset ? matchedAsset.networkLogoURI : wallet.icon
                                };
                            });
                        })()}
                        onClose={() => this.setState({ visible: false })}
                        listChange={async (item) => {
                            const { whichnav } = this.state;
                            this.setState({ visible: false });

                            if (this.session.user?.isPhoneNumberVerified === false) {
                                router.navigate("/phone/welcome");
                                return;
                            }

                            const selectedNetwork = item.description as BlockchainNetwork;

                            if (whichnav === "send") {
                                await sessionManager.updateSession({ ...this.session, params: { currency: asset.currency, network: selectedNetwork } })
                                router.navigate('/send/input');
                            } else {
                                const selectedWallet = this.session.markets.find(m => m.currency === asset.currency && m.network === selectedNetwork);
                                if (selectedWallet && selectedWallet.active) {
                                    await sessionManager.updateSession({ ...this.session, params: { currency: asset.currency, network: selectedNetwork } })
                                    router.navigate('/coin/receive');
                                } else {
                                    this.toastRef.current?.show(`Deposit for ${asset.currency} (${selectedNetwork}) Disabled at this time`, "error");
                                    return;
                                }
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
                                    style={[styles.backIcon, { transform: [{ rotate: "270deg" }] }]}
                                    tintColor={"#000000"} />
                            </Pressable>
                        </ThemedView>
                        <GraphModal asset={asset} visible={bottomsheet} onClose={() => this.setState({ bottomsheet: false })} />
                    </Pressable>

                    <StatusBar style={"dark"} />
                </ThemedSafeArea>
                <SimpleToast ref={this.toastRef} />
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
        paddingTop: Platform.OS === "web" ? 20 : 0
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
        flex: 1,
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