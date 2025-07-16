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
import { IParams, IResponse, ITransaction, UserData } from "@/interface/interface";
import { ActivityIndicator, Dimensions, FlatList, Platform, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, View } from "react-native";
import logger from "@/logger/logger";
import { Href, router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { IList, IMarket } from "@/interface/interface";
import Defaults from "../default/default";
import { Image, ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import Carousel from 'react-native-reanimated-carousel';
import Card from "@/components/card";
import { createAvatar } from "@dicebear/core";
import { micah } from "@dicebear/collection";
import ListModal from "@/components/modals/list";
import { Coin, Status, TransactionStatus, TransactionType } from "@/enums/enums";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";

interface IProps { }

interface ICaroselData {
    title: string;
    image: string;
    description: string;
    action: Href;
}

interface IState {
    currency_modal: boolean;
    bills_modal: boolean;
    trade_modal: boolean;
    fiat: Coin;
    rate: number;
    totalBalanceNgn: number;
    totalBalanceUsd: number;
    refreshing: boolean;
    markets: Array<IMarket>;
    loading: boolean;
    transactions: Array<ITransaction>;
    hide_balance: boolean;
    progress: number;
    carosel_data: Array<ICaroselData>;
    trade: boolean;
    trades: Array<IList>;
}

const { width } = Dimensions.get("window");
export default class DashboardScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private avatar: any;

    constructor(props: IProps) {
        super(props);
        this.state = {
            currency_modal: false,
            bills_modal: false,
            trade_modal: false,
            fiat: Coin.USD,
            rate: 0,
            totalBalanceNgn: 0,
            totalBalanceUsd: 0,
            refreshing: false,
            markets: [],
            loading: false,
            trade: false,
            transactions: [],
            carosel_data: [],
            trades: [],
            hide_balance: false,
            progress: 0,
        }

        const login: boolean = Defaults.LOGIN_STATUS();
        if (!login) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            return;
        };

        this.avatar = createAvatar(micah, {
            seed: this.session?.user?.fullName || "",
        });
    }

    async componentDidMount(): Promise<void> {
        this.defineCarouselData();
        this.loadLocalData();
        await this.fetchMarkets();
    };

    async componentWillUnmount(): Promise<void> {
        this.loadLocalData();
        await this.fetchMarkets();
    }

    private defineCarouselData = () => {
        if (!this.session.user) return;
        const { isPhoneNumberVerified, twoFactorEnabled, biometricType, passkey } = this.session.user;
        const data: Array<ICaroselData> = [];

        !Boolean(isPhoneNumberVerified) && data.push({
            action: "/dashboard", // "phoneinit",
            description: "Phone number not verirfied",
            title: "Verify your phone number to unlock unlimited possiblities",
            image: "https://api.dicebear.com/9.x/glass/png?radius=40&size=32&seed=Cryptocurrency&backgroundColor=4500ff,c0aede,4600ff",
        });

        !Boolean(twoFactorEnabled) && data.push({
            action: "/dashboard",
            description: "Enable 2FA",
            title: "Secure your account and transactions, Enable 2FA to secure transaction",
            image: "https://api.dicebear.com/9.x/glass/png?radius=40&size=32&seed=Cryptocurrency&backgroundColor=6000ff,c0aede,6900ff",
        });

        String(biometricType) === "NONE" && data.push({
            action: "/dashboard",
            description: "Enable Biometric",
            title: "Enable Biometric authentication for faster login",
            image: "https://api.dicebear.com/9.x/glass/png?radius=40&size=32&seed=Cryptocurrency&backgroundColor=5500ff,c0aede,5600ff&shape1=g",
        });

        (!passkey || passkey === undefined) && data.push({
            action: '/passkey/new', // "addpasskey",
            description: "Enable Passkey",
            title: "Enable passkey authentication for faster login to your account",
            image: "https://api.dicebear.com/9.x/glass/png?radius=40&size=32&seed=Cryptocurrency&backgroundColor=6000ff,c0aede,6900ff",
        });

        data.push({
            action: "/dashboard",
            description: "Unlock the Future",
            title: "Discover the Power of Cryptocurrency",
            image: "https://api.dicebear.com/9.x/glass/png?radius=40&size=32&seed=Cryptocurrency&backgroundColor=0000ff,c0aede,0000ff",
        });

        this.setState({ carosel_data: data });
    };

    private loadLocalData = () => {
        const { markets, transactions, hideBalance, totalBalanceNgn, totalBalanceUsd } = this.session;
        const mkt: Array<IMarket> = Defaults.FILTER_MARKET(markets ? markets : [], ["USDC", 'USDT']);

        const trades: Array<IList> = mkt.map((market, _index) => ({
            name: market.name,
            description: market.currency,
            icon: market.icon,
        }));
        this.setState({
            markets: markets ? markets : [],
            transactions: transactions ? transactions : [],
            hide_balance: hideBalance ? hideBalance : false,
            totalBalanceNgn: totalBalanceNgn ? totalBalanceNgn : 0,
            totalBalanceUsd: totalBalanceUsd ? totalBalanceUsd : 0,
            trades: mkt.length > 0 ? trades : [],
        });
    }

    private fetchMarkets = async () => {
        try {
            this.setState({ loading: true });

            await Defaults.IS_NETWORK_AVAILABLE();

            const login: boolean = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            };

            const res = await fetch(`${Defaults.API}/wallet`, {
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
                if (!data.handshake) throw new Error('Unable to process data right now, please try again.');
                const parseData = Defaults.PARSE_DATA(data.data, this.session.client?.privateKey, data.handshake);
                const mkt: Array<IMarket> = Defaults.FILTER_MARKET(parseData.markets, ["USDC", 'USDT']);

                const trades: Array<IList> = mkt.map((market, _index) => ({
                    name: market.name,
                    description: market.currency,
                    icon: market.icon,
                }));

                this.setState({
                    transactions: parseData.transactions,
                    markets: mkt,
                    totalBalanceUsd: parseData.totalBalanceUsd,
                    totalBalanceNgn: parseData.totalBalanceNgn,
                    trades: trades,
                });

                await sessionManager.updateSession({
                    ...this.session,
                    markets: parseData.markets,
                    transactions: parseData.transactions,
                    totalBalanceNgn: parseData.totalBalanceNgn,
                    totalBalanceUsd: parseData.totalBalanceUsd,
                });
            };

        } catch (error: any) {
            console.error('Error:', error.message);
        } finally {
            this.setState({ loading: false });
        }
    };

    private onRefresh = async () => {
        this.setState({ refreshing: true });
        await this.fetchMarkets();
        this.setState({ refreshing: false });
    };

    private toggleBalance = async () => {
        const { hide_balance } = this.state;
        this.setState({ hide_balance: !hide_balance });
        await sessionManager.updateSession({ ...this.session, hideBalance: !hide_balance });
    };

    private renderCarouselItem = ({ item, index }: { item: ICaroselData; index: number }): React.JSX.Element => {
        return (
            <Pressable onPress={() => router.navigate(item.action)} style={styles.marketplaceContainer} key={index}>
                <ImageBackground source={{ uri: item.image }} style={styles.gradientBackground}>
                    <View style={styles.marketplaceTextContainer}>
                        <Text style={styles.marketplaceSubtitle}>{item.description}</Text>
                        <Text style={styles.marketplaceTitle}>{item.title}</Text>
                    </View>
                </ImageBackground>
            </Pressable>
        );
    }

    private renderTransactionCard = ({ transaction }: { transaction: ITransaction }) => {
        const params: string = JSON.stringify(transaction);
        return (
            <Pressable
                style={{
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    paddingVertical: 15,
                    paddingHorizontal: 10,
                    borderRadius: 12,
                    backgroundColor: '#F5F5F5',
                }}
                onPress={async (): Promise<void> => router.navigate({ pathname: "/transaction/details", params: { params }, })}>
                <ThemedView style={{ flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: "transparent", width: "45%" }}>
                    <ThemedView style={{ borderRadius: 360, backgroundColor: Colors.blue, width: 40, height: 40, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        {transaction.type === TransactionType.TRANSFER
                            ? <Image source={require("../../assets/icons/transfercoin.svg")} style={{ width: 24, height: 24 }} />
                            : <Image source={require("../../assets/icons/deposit.svg")} style={{ width: 24, height: 24 }} />
                        }
                    </ThemedView>
                    <ThemedView style={{ flexDirection: "column", gap: 4, alignItems: "flex-start", backgroundColor: "transparent" }}>
                        <ThemedText style={{ fontSize: 14, fontFamily: 'AeonikMedium', textTransform: "capitalize" }}>{transaction.type}</ThemedText>
                        <ThemedText style={{ fontSize: 11, textTransform: "capitalize", color: transaction.status === TransactionStatus.FAILED ? "#96132C" : "#28806F", fontFamily: 'AeonikRegular', }}>{transaction.status}</ThemedText>
                    </ThemedView>
                </ThemedView>
                <ThemedView style={{ flexDirection: "column", gap: 4, alignItems: "flex-end", backgroundColor: "transparent", width: "50%" }}>
                    <ThemedText style={{ fontSize: 14, color: "#0F0F0F", fontFamily: 'AeonikMedium', textTransform: "uppercase" }}>{transaction.amount.toFixed(2)} {transaction.fromCurrency}</ThemedText>
                    <ThemedText style={{ fontSize: 11, color: "#757575", fontFamily: 'AeonikRegular', }}>{Defaults.FORMAT_DATE(transaction.createdAt.toString())}</ThemedText>
                </ThemedView>
            </Pressable>
        );
    }

    private processSelectedTrade = async (trade: IList) => {
        this.setState({ trade: false });
        const market: IMarket = Defaults.FIND_MARKET(trade.description as Coin);
        const params: IParams = { currency: market.currency, network: market.network };
        await sessionManager.updateSession({ ...this.session, params: params });
        router.navigate("/coin");
    }

    render(): React.ReactNode {
        const { trade, fiat, trades, loading, hide_balance, carosel_data, refreshing, markets, transactions, totalBalanceNgn, totalBalanceUsd } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: 'Dashboard', headerShown: false }} />
                <SafeAreaView style={[styles.safeAreaView, { backgroundColor: "#292662" }]}>
                    <ThemedView style={[styles.header, { backgroundColor: "#292662" }]}>
                        <Image
                            style={{ width: 30, height: 30, borderWidth: 1, borderColor: "#757575", backgroundColor: "#EEEEEE", borderRadius: 360 }}
                            source={this.avatar.toDataUri()}
                        />
                        <Pressable onPress={() => this.setState({ currency_modal: true })} style={styles.currencySelector}>
                            {/*{fiat === Coin.NGN
                                ? <Image source={{ uri: "https://img.icons8.com/emoji/96/nigeria-emoji.png" }} style={styles.ngSmallIcon} />
                                : <Image source={require("../../assets/icons/usd.svg")} style={styles.ngSmallIcon} />
                            }*/}
                            <ThemedText style={styles.currencyText}>{fiat === Coin.NGN ? "Nigerian naira" : "United States dollar"}</ThemedText>
                            <Image
                                source={require("../../assets/icons/chevron-left.svg")}
                                tintColor="#ffffff"
                                style={{ width: 20, height: 20, transform: [{ rotate: "90deg" }] }} />
                        </Pressable>
                        <View style={styles.headerIcons}>
                            {loading && <ActivityIndicator size={16} color={"#FFF"} />}
                        </View>
                    </ThemedView>
                    <ThemedView style={[styles.mainContainer, { backgroundColor: Colors.darkBlue }]}>
                        <ThemedView style={styles.balanceWrapper}>
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
                        </ThemedView>
                        <ThemedView style={styles.contentContainer}>
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
                                    <ThemedView style={{ width: "100%", backgroundColor: "transparent" }}>
                                        <ThemedView style={styles.balanceContainer}>
                                            <ImageBackground source={require("../../assets/icons/crown.svg")} style={styles.backgroundImage} contentFit="cover">
                                                <ThemedView style={styles.balanceDetails}>
                                                    <ThemedView style={styles.balanceTitleContainer}>
                                                        <ThemedText style={styles.balanceTitle}>Current Balance</ThemedText>
                                                        <Pressable>
                                                            <Image
                                                                source={require("../../assets/icons/eye.svg")}
                                                                style={{ width: 15, height: 15 }}
                                                                tintColor={"#000"} />
                                                        </Pressable>
                                                    </ThemedView>
                                                    <Pressable onPress={this.toggleBalance} style={styles.balanceAmountContainer}>
                                                        <View style={{ backgroundColor: "transparent" }}>
                                                            {!hide_balance &&
                                                                <ThemedText style={styles.balanceAmount}>
                                                                    {fiat === Coin.NGN ?
                                                                        totalBalanceNgn.toLocaleString("en-US", { style: "currency", currency: Coin.NGN })
                                                                        :
                                                                        totalBalanceUsd.toLocaleString("en-US", { style: "currency", currency: "USD" })
                                                                    }
                                                                </ThemedText>
                                                            }
                                                            {hide_balance && (
                                                                <ThemedText style={styles.balanceAmount}>******</ThemedText>
                                                            )}
                                                        </View>
                                                    </Pressable>
                                                </ThemedView>
                                                <View style={styles.quickLinksContainer}>
                                                    <Pressable
                                                        disabled={loading}
                                                        onPress={() => this.setState({ trade: true })}
                                                        style={{ paddingHorizontal: 30, paddingVertical: 15, borderRadius: 99, backgroundColor: "#E6E6E6" }}>
                                                        <Text style={{ fontFamily: 'AeonikRegular', fontSize: 14 }}>Trade</Text>
                                                    </Pressable>
                                                    <Pressable
                                                        disabled={loading}
                                                        onPress={() => {
                                                            if (this.session.user?.isPhoneNumberVerified === false) {
                                                                router.navigate("/phone/welcome");
                                                                return;
                                                            }
                                                            router.navigate('/withdraw');
                                                        }}
                                                        style={{ paddingHorizontal: 30, paddingVertical: 15, borderRadius: 99, backgroundColor: "#E6E6E6" }}>
                                                        <Text style={{ fontFamily: 'AeonikRegular', fontSize: 14 }}>Withdraw</Text>
                                                    </Pressable>
                                                    <Pressable
                                                        onPress={() => {
                                                            if (this.session.user?.isPhoneNumberVerified === false) {
                                                                router.navigate("/phone/welcome");
                                                                return;
                                                            }
                                                            router.navigate('/withdraw');
                                                        }}
                                                        style={{ paddingHorizontal: 30, paddingVertical: 15, borderRadius: 99, backgroundColor: "#E6E6E6" }}>
                                                        <Text style={{ fontFamily: 'AeonikRegular', fontSize: 14, }}>Pay bills</Text>
                                                    </Pressable>
                                                </View>
                                            </ImageBackground>
                                        </ThemedView>
                                        <ThemedView style={{ width: "100%", height: 100, }}>
                                            <Carousel
                                                loop={true}
                                                mode="parallax"
                                                modeConfig={{
                                                    parallaxScrollingScale: 0.9,
                                                    parallaxScrollingOffset: 50,
                                                    parallaxAdjacentItemScale: 0.8,
                                                }}
                                                snapEnabled={true}
                                                autoPlay={false}
                                                width={width}
                                                data={carosel_data}
                                                renderItem={this.renderCarouselItem}
                                                scrollAnimationDuration={1000} />
                                        </ThemedView>
                                        <ThemedView>
                                            <Pressable onPress={() => router.navigate('/dashboard/wallet')} style={styles.marketPlaceLink}>
                                                <ThemedText style={styles.marketplaceLinkText}>Market Place</ThemedText>
                                                <Image
                                                    source={require("../../assets/icons/chevron-left.svg")}
                                                    style={{ width: 20, height: 20, }} />
                                            </Pressable>
                                            {markets.length === 0 &&
                                                <ThemedView style={{ backgroundColor: "#FFF", borderRadius: 8, width: "100%", height: 300, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                    <Image
                                                        source={require("../../assets/icons/welcome.svg")}
                                                        style={{ width: 25, height: 25, transform: [{ rotate: "180deg" }] }} />
                                                    <ThemedText style={{ fontFamily: 'AeonikRegular', fontSize: 16, marginTop: 20 }}>Market's Not available.</ThemedText>
                                                </ThemedView>
                                            }
                                            {markets.length > 0 &&
                                                <FlatList
                                                    data={markets.slice(0, 4)}
                                                    renderItem={({ item }) => <Card item={item} />}
                                                    keyExtractor={(item) => item.address}
                                                    numColumns={2}
                                                    contentContainerStyle={styles.marketplaceContent}
                                                />
                                            }
                                        </ThemedView>
                                        <ThemedView style={{ paddingBottom: 10 }}>
                                            <Pressable style={styles.marketPlaceLink} onPress={() => router.navigate('/transaction' as Href)}>
                                                <ThemedText style={styles.marketplaceLinkText}>Transaction History</ThemedText>
                                                <Image
                                                    source={require("../../assets/icons/chevron-left.svg")}
                                                    style={{ width: 20, height: 20 }} />
                                            </Pressable>
                                            {/**{loading &&
                                                <View style={{ backgroundColor: this.appreance === "dark" ? "#000" : "#FFF", borderRadius: 8, width: "100%", height: 300, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                    <ActivityIndicator size={40} color={Colors.blue} />
                                                </View>}*/}
                                            {transactions.length === 0 &&
                                                <View style={{ backgroundColor: "#FFF", borderRadius: 8, width: "100%", height: 300, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                    <Image
                                                        source={require("../../assets/icons/bank.svg")}
                                                        style={{ width: 125, height: 125, }} />
                                                    <ThemedText style={{ fontFamily: 'AeonikRegular', fontSize: 16, marginTop: 20 }}>Your transactions would appear here.</ThemedText>
                                                </View>
                                            }
                                            {transactions.length > 0 &&
                                                <View style={{ backgroundColor: "transparent", borderRadius: 8 }}>
                                                    <FlatList
                                                        data={transactions.slice(0, 4)}
                                                        renderItem={({ item }) => this.renderTransactionCard({ transaction: item })}
                                                        keyExtractor={(item) => item.amount.toString()}
                                                        numColumns={1}
                                                        contentContainerStyle={[styles.marketplaceContent, { backgroundColor: "#FFFFFF", borderRadius: 8 }]}
                                                    />
                                                </View>
                                            }
                                        </ThemedView>
                                    </ThemedView>
                                )} />
                        </ThemedView>
                    </ThemedView>
                    <ListModal
                        visible={trade}
                        lists={trades}
                        listChange={this.processSelectedTrade}
                        onClose={() => this.setState({ trade: !trade })} />
                </SafeAreaView>
                <StatusBar style='light' />
            </>
        )
    }
}

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
        paddingTop: Platform.OS === 'android'
            ? 50
            : Platform.OS === "web" ? 10 : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        alignItems: 'center',
    },
    currencySelector: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ngSmallIcon: {
        width: 12,
        height: 12,
    },
    currencyText: {
        lineHeight: 12,
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        color: "#FFF"
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 8,
    },
    mainContainer: {
        flex: 1,
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
        backgroundColor: '#f5f5f5f5',
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
    },
    balanceTitle: {
        fontSize: 14,
        fontFamily: 'AeonikRegular',
    },
    chevronIcon: {
        width: 16,
        height: 16,
    },
    currencySymbol: {
        top: 10,
        fontSize: 12,
        color: '#A5A5A5',
        fontFamily: 'AeonikMedium',
        fontWeight: '500',
    },
    balanceAmount: {
        fontSize: 40,
        lineHeight: 40,
        fontFamily: 'AeonikBold',
    },
    quickLinksContainer: {
        flexDirection: 'row',
        gap: 15,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    marketplaceContainer: {
        width: '100%',
        height: 84,
        marginTop: 24,
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: 'center',
        borderRadius: 16,
    },
    gradientBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        borderRadius: 16,
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
    },
    marketplaceLinkText: {
        fontFamily: 'AeonikMedium',
        fontSize: 14,
        fontWeight: '500',
    },
    marketplaceContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 20,
    },
    balanceAmountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});