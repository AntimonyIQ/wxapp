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
import WalletShimmer from "@/components/WalletShimmer";
import ListModal from "@/components/modals/list";
import SimpleToast, { ToastRef } from '@/components/toast/toast';
import { Colors } from "@/constants/Colors";
import { getAssetLogoURI } from "@/data/assets";
import { IMarket, IParams, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import WalletService, { IWalletData } from "@/service/wallet";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { FlatList, Image, ImageBackground, Platform, Pressable, RefreshControl, StyleSheet } from "react-native";
import sessionManager from "../../session/session";
import Defaults from "../default/default";

interface IProps { }

interface IState {
    hideBalance: boolean;
    marketsLoading: boolean;
    markets: IMarket[];
    refreshing: boolean;
    totalBalances: {};
    totalBalanceUsd: number;
    assetModalVisible: boolean;
    assetAction: string;
    loadingAssets: boolean;
    assets: Array<IAsset>;
}

interface IAsset {
    id: string;
    name: string;
    symbol: string;
    logoURI: string;
    networkLogoURI: string;
    isToken: boolean;
    network: string;
    disabled: boolean;
    contractAddress?: string;
    decimals?: number;
}

export default class WalletScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly avatar = "https://api.dicebear.com/9.x/micah/png";
    private unsubscribeWallet: (() => void) | null = null;
    private unsubscribeHideBalance: (() => void) | null = null;
    private toastRef = React.createRef<ToastRef>();

    constructor(props: IProps) {
        super(props);
        this.state = { hideBalance: false, totalBalanceUsd: 0, totalBalances: {}, marketsLoading: false, markets: [], refreshing: false, assetModalVisible: false, assetAction: "", loadingAssets: false, assets: [] };
        const login: boolean = Defaults.LOGIN_STATUS();
        if (!login) {
            router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            return;
        };
    }

    componentDidMount(): void {
        // Load cached data first
        // const cachedData = WalletService.getWalletData();
        // if (cachedData.markets.length > 0) {
        //     const mkt: Array<IMarket> = Defaults.FILTER_MARKET(cachedData.markets, ["USDC", 'USDT']);
        //     this.setState({
        //         markets: mkt,
        //         totalBalanceUsd: cachedData.totalBalanceUsd,
        //         marketsLoading: false
        //     });
        // } else {
        //     this.setState({ marketsLoading: true });
        // }
        this.setState({ marketsLoading: true });

        this.unsubscribeWallet = WalletService.subscribe((data: IWalletData) => {
            const mkt: Array<IMarket> = Defaults.FILTER_MARKET(data.markets, ["USDC", 'USDT']);
            this.setState({
                markets: mkt,
                totalBalanceUsd: data.totalBalanceUsd,
                // Only show loading if we had no markets before and service says it's loading
                marketsLoading: false,
            });
        });

        this.unsubscribeHideBalance = WalletService.subscribeToHideBalance((hideBalance: boolean) => {
            this.setState({ hideBalance });
        });

        // Trigger initial fetch if needed
        WalletService.fetchWalletData({ showLoading: true, force: true });
    }

    componentWillUnmount(): void {
        if (this.unsubscribeWallet) {
            this.unsubscribeWallet();
        }
        if (this.unsubscribeHideBalance) {
            this.unsubscribeHideBalance();
        }
    }

    private onRefresh = async () => {
        this.setState({ refreshing: true });
        await WalletService.refreshWalletData();
        this.setState({ refreshing: false });
    };

    private handleSelectedCoin = async (item: IMarket) => {
        const market: IMarket = Defaults.FIND_MARKET(item.currency, item.network);
        const params: IParams = { currency: market.currency, network: market.network };
        await sessionManager.updateSession({ ...this.session, params: params });
        router.navigate("/coin");
    }

    private getAssets = async () => {
        try {
            await Defaults.IS_NETWORK_AVAILABLE();

            this.setState({ loadingAssets: true });

            const response = await fetch(`${Defaults.API}/wallet/asset`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client?.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'Authorization': `Bearer ${this.session.authorization}`,
                },
            });

            const data = await response.json();
            if (data.status === "error") throw new Error(data.message || data.error);
            if (data.status === "success") {
                if (!data.handshake) throw new Error('Invalid response');
                const parseData: Array<IAsset> = Defaults.PARSE_DATA(data.data, this.session.client?.privateKey, data.handshake);
                this.setState({ assets: parseData });
            }
        } catch (error) {
            const errMsg: string = (error as Error).message || "An error occurred while fetching transactions.";
            if (errMsg.trim() === "Session expired, please login") {
                router.replace(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            } else {
                logger.error("Error fetching assets:", errMsg);
            }
        } finally {
            this.setState({ loadingAssets: false });
        }
    };

    render(): React.ReactNode {
        const { hideBalance, marketsLoading, markets, refreshing, totalBalanceUsd } = this.state;

        const uniqueMarkets = WalletService.getUniqueMarkets();

        return (
            <>
                <Stack.Screen options={{ title: 'Wallet', headerShown: false }} />
                <ImageBackground source={require("../../assets/images/backgroundWallet.png")} style={styles.backgroundImage}>
                    <ThemedSafeArea style={styles.container}>
                        <ThemedView style={styles.header}>
                            <Image
                                source={{ uri: `${this.avatar}?seed=${this.session.user?.fullName}&size=92&radius=50` }}
                                style={styles.avatar}
                            />
                            <Pressable style={styles.walletSelector}>
                                <ThemedText style={styles.walletSelectorText}>Main Wallet</ThemedText>
                            </Pressable>

                            <Pressable
                                style={styles.addAssetButton}
                                onPress={() => {
                                    this.setState({ assetModalVisible: true });
                                    this.getAssets();
                                }}
                            >
                                <MaterialIcons name="add" size={20} color="#253E92" />
                            </Pressable>
                        </ThemedView>

                        <ThemedView style={styles.balanceContainer}>
                            <ThemedView style={styles.balanceDetails}>
                                <ThemedText style={styles.balanceTitle}>Portfolio Value</ThemedText>
                                <Pressable onPress={() => WalletService.toggleHideBalance()}>
                                    <Image
                                        source={!hideBalance ? require("../../assets/icons/eye.svg") : require("../../assets/icons/eyeoff.svg")}
                                        style={{ height: 24, width: 24, tintColor: Colors.light.text }}
                                        resizeMode="contain"
                                    />
                                </Pressable>
                            </ThemedView>
                            <ThemedView style={styles.balanceAmount}>
                                <ThemedText style={styles.balanceAmountText}>
                                    {hideBalance
                                        ? "● ● ● ● ●"
                                        : (totalBalanceUsd || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </ThemedText>
                            </ThemedView>
                            <ThemedView style={styles.balancePercentage}>
                                <ThemedText style={styles.percentageText}>+ 0.00</ThemedText>
                            </ThemedView>
                        </ThemedView>

                        <ThemedView style={styles.marketplaceContainer}>
                            <Pressable style={[styles.marketplaceLink, { paddingHorizontal: 20 }]}>
                                <ThemedText style={styles.marketplaceText}>Your Assets</ThemedText>
                            </Pressable>
                            {marketsLoading && (
                                <WalletShimmer />
                            )}
                            {!marketsLoading && markets.length === 0 &&
                                <ThemedView
                                    style={{ borderRadius: 8, backgroundColor: "#F5F5F5", height: 500, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginHorizontal: 20 }}>
                                    <ThemedText style={{ fontFamily: 'AeonikRegular', lineHeight: 16, fontSize: 16 }}>No markets available.</ThemedText>
                                </ThemedView>
                            }
                            {!marketsLoading &&
                                <FlatList
                                    data={uniqueMarkets}
                                    keyExtractor={(asset, index) => `${asset.currency}-${index}`}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={this.onRefresh}
                                        />
                                    }
                                contentContainerStyle={{
                                    // padding: 18, // Removed general padding to allow border to span full width if needed, but usually list items have padding inside or container has padding.
                                    // Figma "width 298" implies some inset. Let's keep container padding but remove gap.
                                    paddingHorizontal: 18,
                                    paddingBottom: 100, // Ensure content isn't cut off at bottom
                                    flexGrow: 1, // Ensures content can stretch
                                }}
                                showsVerticalScrollIndicator={false}
                                style={styles.transactionHistoryContainer}
                                renderItem={({ item: asset, index }) => {
                                    const logoURI = getAssetLogoURI(asset.currency) || asset.icon;
                                    const balanceAmount = (asset.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
                                    const balanceInUsd = asset.balanceUsd.toLocaleString(undefined, { maximumFractionDigits: 2 });
                                    const percent = Number(asset.percent_change_24h.toFixed(2));
                                    const isPositive = percent >= 0; return (
                                        <Pressable
                                                key={index}
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                paddingVertical: 12,
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#F3F4F6',
                                                backgroundColor: '#FFFFFF',
                                                height: 60,
                                                }}
                                                onPress={() => this.handleSelectedCoin(asset)}
                                        >
                                            {/* Left Side */}
                                            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                {/* Icon */}
                                                <ThemedView style={{ width: 32, height: 32 }}>
                                                    <Image
                                                        source={{ uri: logoURI }}
                                                        style={{ width: 32, height: 32, borderRadius: 16 }}
                                                    />
                                                    {asset.isToken && asset.networkLogoURI && (
                                                        <Image
                                                            source={{ uri: asset.networkLogoURI }}
                                                            style={{
                                                                width: 14,
                                                                height: 14,
                                                                borderRadius: 7,
                                                                position: 'absolute',
                                                                right: -2,
                                                                bottom: 0,
                                                                backgroundColor: '#FFFFFF',
                                                                borderWidth: 1,
                                                                borderColor: '#FFFFFF',
                                                            }}
                                                        />
                                                    )}
                                                </ThemedView>

                                                {/* Name & Balance */}
                                                <ThemedView style={{ flexDirection: 'column', gap: 2 }}>
                                                    <ThemedText style={{
                                                        fontFamily: 'AeonikMedium',
                                                        fontSize: 14,
                                                        lineHeight: 18,
                                                        color: '#000000',
                                                    }}>
                                                        {asset.name}
                                                    </ThemedText>
                                                    <ThemedText style={{
                                                        fontFamily: 'AeonikRegular',
                                                        fontSize: 12,
                                                        lineHeight: 14,
                                                        color: '#757575',
                                                    }}>
                                                        {hideBalance ? "● ● ● ●" : `${balanceAmount} ${asset.currency}`}
                                                    </ThemedText>
                                                </ThemedView>
                                            </ThemedView>

                                            {/* Right Side */}
                                            <ThemedView style={{ alignItems: 'flex-end', flexDirection: 'column', gap: 2 }}>
                                                {/* Value */}
                                                <ThemedText style={{
                                                    fontFamily: 'AeonikMedium',
                                                    fontSize: 14,
                                                    lineHeight: 18,
                                                    color: '#000000',
                                                }}>
                                                    {hideBalance ? "● ● ● ●" : `$${balanceInUsd}`}
                                                </ThemedText>
                                                {/* Change */}
                                                <ThemedText style={{
                                                    fontFamily: 'AeonikRegular',
                                                    fontSize: 12,
                                                    lineHeight: 14,
                                                    color: isPositive ? '#0A7826' : '#DF1C41',
                                                }}>
                                                    {isPositive ? '+' : ''}{percent}%
                                                </ThemedText>
                                            </ThemedView>
                                        </Pressable>
                                        );
                                }}
                            />
                            }
                        </ThemedView>
                    </ThemedSafeArea>
                </ImageBackground>

                <ListModal
                    visible={this.state.assetModalVisible}
                    onClose={() => this.setState({ assetModalVisible: false })}
                    title="Select Asset"
                    showSearch={true}
                    loading={this.state.loadingAssets}
                    lists={(() => {
                        const assets = this.state.assets;

                        return assets.map((asset: IAsset) => {
                            return {
                                name: asset.name,
                                icon: asset.logoURI,
                                description: asset.symbol,
                                market: asset
                            };
                        });
                    })()}
                    listChange={(item) => {
                        this.setState({ assetModalVisible: false });
                        this.toastRef.current?.show(`Selected ${item.name}`, "success");
                    }}
                />

                <SimpleToast ref={this.toastRef} />
                <StatusBar style={"dark"} />
            </>
        )
    }
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
    },
    container: {
        paddingTop: Platform.OS === 'android' ? 50 : 0,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "web" ? 20 : 10,
        alignItems: 'center',
    },
    avatar: {
        width: 30, height: 30, borderWidth: 1, borderColor: "#757575", backgroundColor: "#EEEEEE", borderRadius: 360
    },
    walletSelector: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    walletSelectorText: {
        fontFamily: 'AeonikBold',
        lineHeight: 12,
        fontSize: 12,
    },
    iconsContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    balanceContainer: {
        alignItems: 'center',
        gap: 10,
        padding: 8,
        marginTop: 41,
    },
    balanceDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginBottom: 10,
    },
    balanceTitle: {
        fontSize: 14,
        color: '#757575',
        fontFamily: 'AeonikRegular',
    },
    balanceAmount: {
        flexDirection: 'row',
    },
    balanceAmountText: {
        fontSize: 40,
        lineHeight: 40,
        fontFamily: 'AeonikBold',
    },
    balanceDecimal: {
        top: 5,
        fontSize: 24,
        color: '#525252',
    },
    balancePercentage: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    percentageText: {
        color: '#28806F',
        fontFamily: 'AeonikRegular',
        fontSize: 14,
        letterSpacing: -0.1,
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'space-evenly',
        paddingVertical: 24,
        gap: 4,
    },
    button: {
        height: 48,
        width: 129,
        backgroundColor: '#E6E6E6',
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 14,
        lineHeight: 16,
        fontFamily: 'AeonikMedium',
        color: '#070707',
    },
    marketplaceContainer: {
        flex: 1, // Allow this container to grow and take available space
        width: "100%", // Ensure full width usage
        marginTop: 24, // Add some top margin for spacing
    },
    marketplaceLink: {
        marginBottom: 12,
        alignItems: 'center', // Center content
    },
    marketplaceText: {
        fontFamily: 'AeonikMedium',
        fontSize: 20,
        lineHeight: 24,
        textAlign: 'center',
        color: '#000000',
    },
    addAssetButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EBF1FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionHistoryContainer: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        flex: 1,
        overflow: 'hidden',
    },
});