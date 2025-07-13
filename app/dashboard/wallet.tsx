import React from "react";
import sessionManager from "../../session/session";
import { IMarket, UserData } from "@/interface/interface";
import { ActivityIndicator, Appearance, ColorSchemeName, Platform, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import logger from "@/logger/logger";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Image, ImageBackground } from "expo-image";
import { Colors } from "@/constants/Colors";
import { createAvatar, Result } from "@dicebear/core";
import { micah } from "@dicebear/collection";
import MarketCard from "@/components/card/market";
import Defaults from "../default/default";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";

interface IProps { }

interface IState {
    hideBalance: boolean;
    marketsLoading: boolean;
    usdbal: number;
    markets: IMarket[];
    refreshing: boolean;
    NGN_BALANCE: number;
    addressLoading: boolean;
    totalBalances: {}
}

export default class WalletScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private avatar: Result;
    constructor(props: IProps) {
        super(props);
        this.state = { hideBalance: false, totalBalances: {}, usdbal: 0, NGN_BALANCE: 0, addressLoading: false, marketsLoading: false, markets: [], refreshing: false };
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };

        this.avatar = createAvatar(micah, {
            seed: this.session?.user?.fullName,
            radius: 50,
            backgroundColor: [Colors.blue, "#c0aede", Colors.blue],
            backgroundType: ["gradientLinear"],
        });
    }

    componentDidMount(): void {
        this.loadLocalSavedData();
        this.fetchMarkets();
        this.setState({ hideBalance: this.session.hideBalance || false });
    }


    loadLocalSavedData = () => {
        const addresses = this.session.addresses;
        const totalBalance = this.session.totalBalance;
        const markets = this.session.markets;
        const NGN_BALANCE = this.session.NGN_BALANCE;
        const usdbal = this.session.usdbal;
        this.setState({
            usdbal,
            hideBalance: this.session.hideBalance || false,
            markets: markets || [],
        });
    };

    private fetchMarkets = async () => {
        try {
            this.setState({ marketsLoading: true });

            const response = await fetch(`${Defaults.API}/markets`, {
                method: "GET",
                headers: { ...Defaults.HEADERS, "Authorization": `Bearer ${this.session.accessToken}` },
            });

            if (!response.ok) throw new Error("Failed to fetch markets " + response.status.toString());

            const data = await response.json();
            if (data.status === "success") {
                this.setState({
                    markets: data.data || [],
                });

                await sessionManager.updateSession({
                    ...this.session,
                    markets: data.data,
                });
            }
        } catch (error: any) {
            console.log(error);
            this.setState({ marketsLoading: false });
        } finally {
            this.setState({ marketsLoading: false });
        }
    };

    private onRefresh = async () => {
        this.setState({ refreshing: true });

        try {
            this.loadLocalSavedData();
            await this.fetchMarkets();
        } catch (err) {
            console.error('Error refreshing data:', err);
        } finally {
            this.setState({ refreshing: false });
        }
    };

    private handleSelectedCoin = async (market: IMarket) => {
        const { addressLoading } = this.state;
        if (addressLoading) return;

        await sessionManager.updateSession({ ...this.session, market });
        router.navigate("/coin");
    }

    render(): React.ReactNode {
        const { hideBalance, usdbal, marketsLoading, markets, refreshing } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: 'Wallet', headerShown: false }} />
                <ImageBackground source={require("../../assets/images/backgroundWallet.png")} style={styles.backgroundImage}>
                    <ThemedSafeArea style={styles.container}>
                        <ThemedView style={styles.header}>
                            <Image
                                source={this.avatar.toDataUri()}
                                style={{ width: 40, height: 40 }}
                            />
                            <Pressable style={styles.walletSelector}>
                                <ThemedText style={styles.walletSelectorText}>Main Wallet</ThemedText>
                                {/*<Image
                                    source={require("../../assets/icons/chevron-left.svg")}
                                    style={{ width: 10, right: 10, transform: [{ rotate: '270deg' }] }}
                                    tintColor={this.appreance === "dark" ? Colors.light.background : Colors.dark.background} />*/}
                            </Pressable>
                            <ThemedView></ThemedView>
                        </ThemedView>

                        <ThemedView style={styles.balanceContainer}>
                            <ThemedView style={styles.balanceDetails}>
                                <ThemedText style={styles.balanceTitle}>Portfolio Value</ThemedText>
                                <Pressable onPress={() => this.setState({ hideBalance: !hideBalance }, async () => {
                                    await sessionManager.updateSession({ ...this.session, hideBalance: !hideBalance });
                                })}>
                                    <Image
                                        source={!hideBalance ? require("../../assets/icons/eye.svg") : require("../../assets/icons/eyeoff.svg")}
                                        style={{ height: 24, width: 24 }}
                                        contentFit="contain" tintColor={this.appreance === "dark" ? Colors.dark.text : Colors.light.text}
                                        transition={500} />
                                </Pressable>
                            </ThemedView>
                            <ThemedView style={styles.balanceAmount}>
                                <ThemedText style={styles.balanceAmountText}>
                                    {hideBalance
                                        ? "******"
                                        : (usdbal || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </ThemedText>
                            </ThemedView>
                            <ThemedView style={styles.balancePercentage}>
                                <ThemedText style={styles.percentageText}>+ 0.00</ThemedText>
                            </ThemedView>
                        </ThemedView>

                        <ThemedView style={styles.marketplaceContainer}>
                            <Pressable style={styles.marketplaceLink}>
                                <ThemedText style={styles.marketplaceText}>Market Place</ThemedText>
                            </Pressable>
                            {marketsLoading &&
                                <ThemedView
                                    style={{ borderRadius: 8, backgroundColor: this.appreance === "dark" ? "#0f0f0f" : "#F5F5F5", height: 500, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                    <ActivityIndicator size={40} color={"#253E92"} />
                                </ThemedView>
                            }
                            {!marketsLoading && markets.length === 0 &&
                                <ThemedView
                                    style={{ borderRadius: 8, backgroundColor: this.appreance === "dark" ? "#0f0f0f" : "#F5F5F5", height: 500, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                    <ThemedText style={{ fontFamily: 'AeonikRegular', lineHeight: 16, fontSize: 16 }}>No markets available.</ThemedText>
                                </ThemedView>}
                            {!marketsLoading &&
                                <ScrollView
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={this.onRefresh}
                                        />
                                    }
                                    style={styles.transactionHistoryContainer}>
                                    {markets.length > 0 && markets.map((asset, index) => {

                                        return (
                                            <MarketCard
                                                key={index}
                                                hideBalance={hideBalance}
                                                market={{
                                                    key: String(asset.address),
                                                    icon: asset.icon,
                                                    wallet: true,
                                                    header: asset.name,
                                                    subHead: asset.currency,
                                                    price: asset.price.toLocaleString(),
                                                    percentage: Number(asset.percent_change_24h.toFixed(2)),
                                                    balanceAmount: (asset.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }), // Actual balance
                                                    balanceInUsd: String(asset.balanceUsd), // Dollar equivalent
                                                }}
                                                onPress={() => this.handleSelectedCoin(asset)}
                                            />
                                        );
                                    })}
                                </ScrollView>
                            }
                        </ThemedView>
                    </ThemedSafeArea>
                </ImageBackground>
                <StatusBar style={this.appreance === "dark" ? 'light' : "dark"} />
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        alignItems: 'center',
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
        paddingHorizontal: 8,
    },
    marketplaceLink: {
        marginBottom: 12,
        flexDirection: 'row',
        gap: 2,
    },
    marketplaceText: {
        fontFamily: 'AeonikMedium',
        fontSize: 14,
    },
    transactionHistoryContainer: {
        height: "100%",
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#0f0f0f" : "#F5F5F5",
        padding: 18,
        borderRadius: 12,
        gap: 12,
        marginBottom: 50,
    },
});