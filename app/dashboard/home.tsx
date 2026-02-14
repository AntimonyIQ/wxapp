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

import MarketCardShimmer from '@/components/MarketCardShimmer';
import TransactionHistoryShimmer from '@/components/TransactionHistoryShimmer';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, FlatList, Image, ImageBackground, Platform, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

import Defaults from '@/app/default/default';
import Card from "@/components/card";
import ListModal from "@/components/modals/list";
import SimpleToast, { ToastRef } from '@/components/toast/toast';
import { Colors } from "@/constants/Colors";
import assetsList from '@/data/assets';
import { Coin } from "@/enums/enums";
import { IMarket, ITransaction, UserData } from "@/interface/interface";
import WalletService, { IWalletData } from '@/service/wallet';
import sessionManager from '@/session/session';

interface IProps { }

interface ICarouselData {
    title: string;
    subtitle?: string;
    action: string;
    backgroundImage: any; // string (uri) or number (require result)
}

interface IState {
    currencyModalVisible: boolean;
    assetModalVisible: boolean;
    payBillsModalVisible: boolean;
    tradeModalVisible: boolean;
    fiat: string; // 'USD' or 'NGN'
    refreshing: boolean;
    markets: IMarket[];
    transactions: ITransaction[];
    carouselData: ICarouselData[];
    hideBalance: boolean;
    loading: boolean;
    totalBalanceUsd: number;
    totalBalanceNgn: number;
    assetAction: string;
}

const { width } = Dimensions.get("window");

export default class DashboardScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly avatar = "https://api.dicebear.com/9.x/notionists/png";
    private unsubscribeWallet: (() => void) | null = null;
    private unsubscribeHideBalance: (() => void) | null = null;
    private toastRef = React.createRef<ToastRef>();

    constructor(props: IProps) {
        super(props);
        this.state = {
            currencyModalVisible: false,
            assetModalVisible: false,
            payBillsModalVisible: false,
            tradeModalVisible: false,
            fiat: Coin.USD,
            refreshing: false,
            markets: [],
            transactions: [],
            carouselData: [],
            hideBalance: false,
            loading: true,
            totalBalanceUsd: 0,
            totalBalanceNgn: 0,
            assetAction: '',
        };

        const login: boolean = Defaults.LOGIN_STATUS();
        if (!login) {
            router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            return;
        }
    }

    async componentDidMount(): Promise<void> {
        this.defineCarouselData();

        // Check cache first to prevent "Loading forever" if cache is fresh
        // const cachedData = WalletService.getWalletData();
        // if (cachedData.markets.length > 0) {
        //     this.setState({
        //         markets: this.processMarkets(cachedData.markets),
        //         totalBalanceUsd: cachedData.totalBalanceUsd,
        //         totalBalanceNgn: cachedData.totalBalanceNgn,
        //         transactions: cachedData.transactions,
        //         loading: false,
        //     });
        // }

        // Subscribe to WalletService
        this.unsubscribeWallet = WalletService.subscribe((data: IWalletData) => {
            this.setState({
                markets: this.processMarkets(data.markets),
                totalBalanceUsd: data.totalBalanceUsd,
                totalBalanceNgn: data.totalBalanceNgn,
                transactions: data.transactions,
                // Only use loading from service if we current have no data or if it's explicitly initial load
                loading: false,
            });
        });

        this.unsubscribeHideBalance = WalletService.subscribeToHideBalance((hideBalance: boolean) => {
            this.setState({ hideBalance: hideBalance });
        });

        // Initial fetch
        await WalletService.fetchWalletData({ showLoading: true, force: true });
    }

    componentWillUnmount(): void {
        if (this.unsubscribeWallet) {
            this.unsubscribeWallet();
        }
        if (this.unsubscribeHideBalance) {
            this.unsubscribeHideBalance();
        }
    }

    private defineCarouselData = () => {
        // Using graphic banner images with all design details included
        const data: ICarouselData[] = [
            {
                action: "/dashboard",
                subtitle: "",
                title: "",
                backgroundImage: require("@/assets/images/banner1.png"),
            },
            {
                action: "/passkey/new",
                subtitle: "",
                title: "",
                backgroundImage: require("@/assets/images/banner2.png"),
            },
            {
                action: "/phone",
                subtitle: "",
                title: "",
                backgroundImage: require("@/assets/images/banner3.png"),
            }
        ];

        this.setState({ carouselData: data });
    };

    private onRefresh = async () => {
        this.setState({ refreshing: true });
        await WalletService.refreshWalletData();
        this.setState({ refreshing: false });
    };

    private toggleBalance = () => {
        WalletService.toggleHideBalance();
    };

    private processCarouselClick = (to: string) => {
        if (!to) return;
        router.navigate(to as Href);
    };

    private renderCarouselItem = ({ item, index }: { item: ICarouselData; index: number }): React.JSX.Element => {
        const imageSource = typeof item.backgroundImage === 'string'
            ? { uri: item.backgroundImage }
            : item.backgroundImage;

        return (
            <Pressable
                onPress={() => this.processCarouselClick(item.action)}
                style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 16,
                    overflow: 'hidden',
                }}
                key={index}
            >
                <ImageBackground
                    source={imageSource}
                    resizeMode="cover"
                    style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 16,
                        overflow: 'hidden',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    imageStyle={{ borderRadius: 16 }}
                >
                    {(item.title || item.subtitle) && (
                        <View style={styles.marketplaceTextContainer}>
                            {item.subtitle && <Text style={styles.marketplaceSubtitle}>{item.subtitle}</Text>}
                            {item.title && <Text style={styles.marketplaceTitle}>{item.title}</Text>}
                        </View>
                    )}
                </ImageBackground>
            </Pressable>
        );
    };

    private renderTransactionCard = ({ transaction }: { transaction: ITransaction }) => {
        const params: string = JSON.stringify(transaction);
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
            // For swap transactions, show overlay of two currency icons
            if (transactionType === "swap" && transaction.fromCurrency && transaction.toCurrency) {
                const fromLogoURI = getAssetLogoURI(transaction.fromCurrency);
                const toLogoURI = getAssetLogoURI(transaction.toCurrency);

                if (fromLogoURI && toLogoURI) {
                    return (
                        <View style={{ position: 'relative', width: 50, height: 40 }}>
                            {/* From currency - top left */}
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
                                }}
                                resizeMode="contain"
                            />
                            {/* To currency - bottom right, overlapping */}
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
                                }}
                                resizeMode="contain"
                            />
                        </View>
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
                        resizeMode="contain"
                    />
                );
            }

            // Fallback to default icons based on transaction type
            if (transactionType === "send") {
                return (
                    <Image
                        source={require("../../assets/icons/transfercoin.svg")}
                        style={{ width: 24, height: 24 }}
                        resizeMode="contain"
                    />
                );
            } else {
                return (
                    <Image
                        source={require("../../assets/icons/deposit.svg")}
                        style={{ width: 24, height: 24 }}
                        resizeMode="contain"
                    />
                );
            }
        };

        const renderIconContainer = () => {
            const logoURI = getAssetLogoURI(transaction.fromCurrency);
            const isSwap = transactionType === "swap" && transaction.fromCurrency && transaction.toCurrency;
            const hasLogo = isSwap ? (getAssetLogoURI(transaction.fromCurrency) && getAssetLogoURI(transaction.toCurrency)) : logoURI;

            if (hasLogo) {
                const containerWidth = isSwap ? 50 : 40;
                return (
                    <View style={{ width: containerWidth, height: 40, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        {renderTransactionIcon()}
                    </View>
                );
            } else {
                return (
                    <View style={{ borderRadius: 360, backgroundColor: "#253E92", width: 40, height: 40, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        {renderTransactionIcon()}
                    </View>
                );
            }
        };

        return (
            <Pressable
                onPress={async (): Promise<void> => router.navigate({ pathname: "/transaction/details", params: { params } })}
                style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 15, paddingHorizontal: 15, }}
            >
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                    {renderIconContainer()}

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
                        <Text style={{ fontSize: 11, color: "#757575", fontFamily: 'AeonikRegular', }}>{Defaults.FORMAT_DATE(createdAt.toString())}</Text>
                    </View>
                </View>

                <View style={{ flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 14, color: "#1F1F1F", fontFamily: 'AeonikMedium', textTransform: "uppercase" }}>{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {currency}</Text>
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

    private getFormattedBalanceComponents(balance: number, fiat: string) {
        const formattedBalance = balance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        // If balance is hidden, return masked values
        if (this.state.hideBalance) {
            const masked = "*".repeat(formattedBalance.length);
            return { symbol: fiat === "NGN" ? "₦" : "$", wholePart: masked, decimalPart: "" };
        }

        const parts = formattedBalance.split('.');
        const wholePart = parts[0];
        const decimalPart = parts[1] || '00';
        const symbol = fiat === "NGN" ? "₦" : "$";
        return { symbol, wholePart, decimalPart };
    }

    private processMarkets = (markets: IMarket[]) => {
        const supported = ["BTC", "ETH", "USDT", "USDC"];
        const result: IMarket[] = [];

        supported.forEach((currency) => {
            const found = markets.filter((m) => m.currency === currency);
            if (found.length > 0) {
                const bsc = found.find((m) => m.network === "BSC");
                result.push(bsc || found[0]);
            }
        });

        return result;
    };

    render(): React.ReactNode {
        const { fiat, markets, hideBalance, transactions, refreshing, totalBalanceUsd, carouselData, totalBalanceNgn, loading } = this.state;

        return (
            <>
                <Stack.Screen options={{ title: 'Dashboard', headerShown: false, }} />
                <SafeAreaView style={styles.safeAreaView}>
                    <View style={styles.header}>
                        <Image
                            style={styles.avatar}
                            source={{ uri: `${this.avatar}?seed=${this.session?.user?.fullName}&size=92&radius=50` }}
                        />
                        <Pressable onPress={() => this.setState({ currencyModalVisible: true })} style={styles.currencySelector}>
                            {fiat === "NGN"
                                ? <Image source={require("../../assets/icons/ngsmall.svg")} style={styles.ngSmallIcon} />
                                : <Image source={require("../../assets/icons/usd.svg")} style={styles.ngSmallIcon} />
                            }
                            <Text style={styles.currencyText}>{fiat === "NGN" ? "Nigerian naira" : "United States dollar"}</Text>
                            <Image source={require("../../assets/icons/arrow-down.svg")} style={{ width: 14, height: 14 }} tintColor={"#FFF"} />
                        </Pressable>
                        <View style={styles.headerIcons}>
                            <Pressable onPress={() => router.navigate('/dashboard/notification' as Href)}>
                                <Image source={require("../../assets/icons/bell.svg")} style={{ width: 24, height: 24 }} />
                            </Pressable>
                            <Image source={require("../../assets/icons/gift.svg")} style={{ width: 24, height: 24 }} />
                        </View>
                    </View>

                    <View style={styles.mainContainer}>
                        <View style={styles.balanceWrapper}>
                            <LinearGradient
                                colors={['rgba(255, 255, 255, 0.3)', 'rgba(64, 65, 78, 0.6)']}
                                locations={[0.5, 1]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientBackground1}
                            />
                            <LinearGradient
                                colors={['rgba(255, 255, 255, 0.3)', 'rgba(64, 65, 78, 0.6)']}
                                locations={[0, 1]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientBackground2}
                            />
                        </View>

                        <View style={styles.contentContainer}>
                            <FlatList
                                data={[{ key: 'dummy' }]}
                                renderItem={() => null}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={this.onRefresh}
                                    />
                                }
                                showsHorizontalScrollIndicator={false}
                                showsVerticalScrollIndicator={false}
                                style={{ width: "100%" }}
                                ListHeaderComponent={() => (
                                    <View style={{ width: "100%" }}>
                                        <View style={styles.balanceContainer}>
                                            <ImageBackground source={require("../../assets/images/background.png")} style={styles.backgroundImage} resizeMode="cover">
                                                <View style={styles.balanceDetails}>
                                                    <View style={styles.balanceTitleContainer}>
                                                        <Text style={styles.balanceTitle}>Current Balance</Text>
                                                        <Pressable>
                                                            <Image source={require("../../assets/icons/eye.svg")} style={{ width: 16, height: 16 }} />
                                                        </Pressable>
                                                    </View>

                                                    <Pressable onPress={this.toggleBalance} style={styles.balanceAmountContainer}>
                                                        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                                                            {!hideBalance && (() => {
                                                                const balance = fiat === "NGN" ? totalBalanceNgn : totalBalanceUsd;
                                                                const { symbol, wholePart, decimalPart } = this.getFormattedBalanceComponents(balance, fiat);

                                                                return (
                                                                    <>
                                                                        <Text style={[styles.balanceAmount, { fontSize: 20, alignSelf: "flex-start", marginTop: 8, color: '#1F1F1F' }]}>
                                                                            {symbol}
                                                                        </Text>
                                                                        <Text style={[styles.balanceAmount, { color: '#1F1F1F' }]}>
                                                                            {wholePart}
                                                                        </Text>
                                                                        <Text style={[styles.balanceAmount, { fontSize: 24, color: "#757575" }]}>
                                                                            .{decimalPart}
                                                                        </Text>
                                                                    </>
                                                                );
                                                            })()}
                                                            {hideBalance && (
                                                                <Text style={[styles.balanceAmount, { color: '#1F1F1F' }]}>● ● ● ● ●</Text>
                                                            )}
                                                        </View>
                                                    </Pressable>
                                                </View>

                                                <View style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 20, paddingHorizontal: 40 }}>
                                                    <Pressable
                                                        disabled={loading}
                                                        onPress={() => this.setState({ assetModalVisible: true, assetAction: 'deposit' })}
                                                        style={styles.actionBtn}>
                                                        <View style={styles.actionBtnCircle}>
                                                            <Image source={require("../../assets/icons/deposit.svg")} style={{ width: 24, height: 24 }} />
                                                        </View>
                                                        <Text style={styles.actionBtnText}>Deposit</Text>
                                                    </Pressable>

                                                    <Pressable
                                                        disabled={loading}
                                                        onPress={() => router.navigate({ pathname: '/withdraw', params: { fiat: 'NGN' } })}
                                                        style={styles.actionBtn}>
                                                        <View style={styles.actionBtnCircle}>
                                                            <Image source={require("../../assets/icons/bank.svg")} style={{ width: 24, height: 24 }} />
                                                        </View>
                                                        <Text style={styles.actionBtnText}>Withdrawal</Text>
                                                    </Pressable>

                                                    <Pressable
                                                        disabled={loading}
                                                        onPress={() => router.navigate('/swap')}
                                                        style={styles.actionBtn}>
                                                        <View style={styles.actionBtnCircle}>
                                                            <Image source={require("../../assets/icons/swap.svg")} style={{ width: 24, height: 24 }} />
                                                        </View>
                                                        <Text style={styles.actionBtnText}>Swap</Text>
                                                    </Pressable>

                                                    <Pressable
                                                        disabled={loading}
                                                        onPress={() => this.setState({ payBillsModalVisible: true })}
                                                        style={styles.actionBtn}>
                                                        <View style={styles.actionBtnCircle}>
                                                            <Image source={require("../../assets/icons/bill.svg")} style={{ width: 24, height: 24 }} />
                                                        </View>
                                                        <Text style={styles.actionBtnText}>Pay bills</Text>
                                                    </Pressable>
                                                </View>
                                            </ImageBackground>
                                        </View>

                                        <View style={{ width: "100%", height: 110, marginVertical: 10, paddingLeft: 8 }}>
                                            {Array.isArray(carouselData) && carouselData.length > 0 ? (
                                                <Carousel
                                                    loop={true}
                                                    autoPlay={true}
                                                    autoPlayInterval={5000}
                                                    width={width - 16}
                                                    height={110}
                                                    data={carouselData}
                                                    renderItem={this.renderCarouselItem}
                                                />
                                            ) : null}
                                        </View>

                                        <View>
                                            <Pressable onPress={() => router.navigate('/dashboard/wallet')} style={styles.marketPlaceLink}>
                                                <Text style={styles.marketplaceLinkText}>Market Place</Text>
                                                <Image source={require("../../assets/icons/chevron_right.svg")} style={{ width: 13, height: 13, transform: [{ rotate: '180deg' }] }} />
                                            </Pressable>
                                            {loading && <MarketCardShimmer />}
                                            {!loading && markets.length === 0 &&
                                                <View style={styles.emptyStateBox}>
                                                    <Image source={require("../../assets/icons/welcome.svg")} style={{ width: 40, height: 40 }} />
                                                    <Text style={{ fontFamily: 'AeonikRegular', fontSize: 16, marginTop: 20 }}>Market Not available.</Text>
                                                </View>
                                            }
                                            {!loading && markets.length > 0 &&
                                                <FlatList
                                                    data={this.processMarkets(markets).slice(0, 4)}
                                                    renderItem={({ item }) => <Card item={item} />}
                                                    keyExtractor={(item, index) => index.toString()}
                                                    horizontal
                                                    showsHorizontalScrollIndicator={false}
                                                    contentContainerStyle={{ paddingHorizontal: 0 }}
                                                />
                                            }
                                        </View>

                                        <View style={{ paddingBottom: 10 }}>
                                            <Pressable style={styles.marketPlaceLink} onPress={() => router.navigate('/transaction' as Href)}>
                                                <Text style={styles.marketplaceLinkText}>Transaction History</Text>
                                                <Image source={require("../../assets/icons/chevron_right.svg")} style={{ width: 16, height: 16, transform: [{ rotate: '180deg' }] }} />
                                            </Pressable>
                                            {loading && <TransactionHistoryShimmer />}
                                            {!loading && transactions.length === 0 &&
                                                <View style={styles.emptyStateBox}>
                                                    <Image source={require("../../assets/icons/welcome.svg")} style={{ width: 40, height: 40 }} />
                                                    <Text style={{ fontFamily: 'AeonikRegular', fontSize: 16, marginTop: 20 }}>No transactions found</Text>
                                                </View>
                                            }
                                            {!loading && transactions.length > 0 &&
                                                <View style={{ backgroundColor: "#FFFFFF", borderRadius: 8 }}>
                                                    <FlatList
                                                        data={transactions.slice(0, 4)}
                                                        renderItem={({ item }) => this.renderTransactionCard({ transaction: item })}
                                                        keyExtractor={(item) => item.transactionId || Math.random().toString()}
                                                        numColumns={1}
                                                        contentContainerStyle={[styles.marketplaceContent, { backgroundColor: "#FFFFFF", borderRadius: 8 }]}
                                                    />
                                                </View>
                                            }
                                        </View>

                                    </View>
                                )}
                            />
                        </View>
                    </View>

                    <ListModal
                        visible={this.state.assetModalVisible}
                        onClose={() => this.setState({ assetModalVisible: false })}
                        title="Select Asset"
                        showSearch={true}
                        lists={(() => {
                            const session = sessionManager.getUserData();
                            const markets = (session && Array.isArray(session.markets)) ? session.markets : [];

                            // Use central logic to get unique markets (preferring BSC)
                            const uniqueMarkets = WalletService.getUniqueMarkets();

                            // Apply Home-specific filters (e.g. hiding NGN for certain actions)
                            const filteredMarkets = uniqueMarkets.filter((market: any) => {
                                if ((this.state.assetAction === 'swap' || this.state.assetAction === 'deposit') && market.currency === 'NGN') {
                                    return false;
                                }
                                return true;
                            });

                            return filteredMarkets.map((market: any) => {
                                const currencyNetwork = String(market.network).toUpperCase();
                                const currencySymbol = String(market.currency).toUpperCase();
                                const matchedAsset = assetsList.find(
                                    a => a.symbol.toUpperCase() === currencySymbol &&
                                        a.network.toUpperCase() === currencyNetwork
                                );
                                const icon = matchedAsset ? matchedAsset.logoURI : String(market.icon);

                                return {
                                    name: market.name,
                                    icon: icon,
                                    description: market.currency,
                                    market: market
                                };
                            });
                        })()}
                        listChange={async (item: any) => {
                            this.setState({ assetModalVisible: false });
                            if (this.state.assetAction === 'swap') {
                                router.navigate('/swap');
                            } else {
                                const params: any = { currency: item.market.currency, network: item.market.network };
                                await sessionManager.updateSession({ ...this.session, params: params });
                                router.navigate("/coin");
                            }
                        }}
                    />

                    {this.state.currencyModalVisible &&
                        <ListModal
                            visible={true}
                            onClose={() => this.setState({ currencyModalVisible: false })}
                            title="Select Currency"
                            lists={[
                                { name: 'United States Dollar', description: 'USD', icon: 'https://flagcdn.com/w80/us.png' },
                                { name: 'Nigerian Naira', description: 'NGN', icon: 'https://flagcdn.com/w80/ng.png' }
                            ]}
                            listChange={(item) => {
                                this.setState({ fiat: item.description, currencyModalVisible: false });
                            }}
                        />
                    }

                    {this.state.payBillsModalVisible &&
                        <ListModal
                            visible={true}
                            onClose={() => this.setState({ payBillsModalVisible: false })}
                            title="Pay Bills"
                            lists={[
                                { name: 'Airtime', description: 'Top up airtime for any network instantly', icon: require("../../assets/icons/phone.svg") },
                                { name: 'Data Bundle', description: 'Purchase data plans for all networks', icon: require("../../assets/icons/wifi.svg") },
                                { name: 'Cable TV', description: 'Pay for DSTV, GOTV, Startimes & Showmax', icon: require("../../assets/icons/tv.svg") },
                                { name: 'Electricity', description: 'Pay electricity bills (Prepaid/Postpaid)', icon: require("../../assets/icons/home.svg") },
                                { name: 'Betting', description: 'Fund your betting wallets instantly', icon: require("../../assets/icons/betting.svg") },
                            ]}
                            listChange={(item) => {
                                this.setState({ payBillsModalVisible: false });
                                this.toastRef.current?.show("Not available right now", "info");
                            }}
                        />
                    }

                    <SimpleToast ref={this.toastRef} />
                    <StatusBar style='light' />
                </SafeAreaView>
            </>
        )
    }
}

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 30 : 0,
        backgroundColor: Platform.OS === "web" ? "transparent" : '#F5F5F5'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "web" ? 20 : 10,
        paddingBottom: 10,
        alignItems: 'center',
        backgroundColor: Platform.OS === "web" ? "rgba(41,38,98,1.00)" : '#ffffff'
    },
    avatar: {
        width: 30, height: 30, borderWidth: 1, borderColor: "#757575", backgroundColor: "#EEEEEE", borderRadius: 360
    },
    currencySelector: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ngSmallIcon: {
        width: 16,
        height: 16,
    },
    currencyText: {
        lineHeight: 12,
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        color: "#ffffffff"
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 8,
    },
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.darkBlue
    },
    balanceWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.darkBlue
    },
    gradientBackground1: {
        width: '86%',
        height: '100%',
        position: 'absolute',
        top: '4.2%',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
    },
    gradientBackground2: {
        width: '80%',
        height: '98%',
        position: 'absolute',
        top: '3%',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
    },
    contentContainer: {
        width: '100%',
        backgroundColor: '#F5F5F5',
        height: '94%',
        position: 'absolute',
        bottom: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 8,
        paddingTop: 16,
    },
    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        overflow: 'hidden'
    },
    backgroundImage: {
        height: 239,
        width: '100%'
    },
    balanceDetails: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: 25,
        backgroundColor: 'transparent',
    },
    balanceTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginBottom: 1,
        backgroundColor: "transparent",
        marginTop: 20
    },
    balanceTitle: {
        fontSize: 14,
        fontFamily: 'AeonikRegular',
        color: '#1F1F1F'
    },
    balanceAmount: {
        fontSize: 40,
        lineHeight: 40,
        fontFamily: 'AeonikBold',
        color: '#1F1F1F'
    },
    balanceAmountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        flexDirection: "column", alignItems: "center", gap: 8
    },
    actionBtnCircle: {
        width: 56, height: 56, borderRadius: 360, backgroundColor: "#253E92", flexDirection: "column", alignItems: "center", justifyContent: "center"
    },
    actionBtnText: {
        fontFamily: 'AeonikRegular', fontSize: 14, color: "#1F1F1F"
    },
    marketplaceContainer: {
        width: '100%',
        height: 110,
        alignItems: 'center',
        alignSelf: 'center',
        borderRadius: 16,
    },
    gradientBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        borderRadius: 16,
        overflow: 'hidden'
    },
    marketplaceTextContainer: {
        paddingLeft: 20,
    },
    marketplaceSubtitle: {
        fontSize: 8,
        lineHeight: 10,
        textTransform: 'capitalize',
        color: '#FFFFFFBF',
        fontFamily: 'AeonikBold',
    },
    marketplaceTitle: {
        width: '60%',
        fontSize: 14,
        lineHeight: 16,
        fontFamily: 'AeonikMedium',
        color: 'white',
    },
    marketPlaceLink: {
        marginTop: 24,
        marginBottom: 12,
        flexDirection: 'row',
        gap: 2,
        alignItems: 'center'
    },
    marketplaceLinkText: {
        fontFamily: 'AeonikMedium',
        fontSize: 14,
        fontWeight: '500',
        color: '#1F1F1F'
    },
    marketplaceContent: {
        paddingBottom: 20,
    },
    emptyStateBox: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        width: "100%",
        height: 300,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    }
});