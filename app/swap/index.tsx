import PrimaryButton from '@/components/button/primary';
import DiapadKeyPad from '@/components/DiapadKeyPad';
import SwapTextField from '@/components/inputs/swap';
import ListModal from '@/components/modals/list';
import MessageModal from '@/components/modals/message';
import ThemedText from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';
import ThemedSafeArea from '@/components/ThemeSafeArea';
import { getAssetLogoURI } from '@/data/assets';
import { BlockchainNetwork, Coin, Fiat, Status, WalletType } from '@/enums/enums';
import { IList, IMarket, IResponse, UserData } from '@/interface/interface';
import logger from '@/logger/logger';
import WalletService from '@/service/wallet';
import sessionManager from '@/session/session';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Defaults from '../default/default';

interface SwapProps { }

export enum interaction {
    from = "from",
    to = "to",
}

interface SwapState {
    error_modal: boolean;
    error_title: string;
    error_message: string;
    fromCurrency: IMarket;
    toCurrency: IMarket;
    whom: interaction;
    trade_modal: boolean;
    loading: boolean;
    exchangeFee: number;
    fromDollarEquivalent: number;
    fromValue: string;
    toValue: string;
    lists: Array<IList>;
    countdownSeconds: number;
    countdownActive: boolean;
    continueBtnDisabled: boolean;
    focusedInput: interaction;
}

const emptyMarket: IMarket = {
    currency: Coin.BTC,
    name: '',
    categorie: WalletType.CRYPTO,
    network: BlockchainNetwork.ETHEREUM,
    address: '',
    price: 0,
    balance: 0,
    balanceUsd: 0,
    icon: '',
    percent_change_24h: 0,
    volume_change_24h: 0,
    market_cap: 0,
    active: false
};

export default class SwapScreen extends React.Component<SwapProps, SwapState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Swap Screen";
    private estimateInterval: any | null = null;
    private initTimeout: any | null = null;

    constructor(props: SwapProps) {
        super(props);
        this.state = {
            error_message: "",
            error_modal: false,
            error_title: "",
            fromCurrency: { ...emptyMarket },
            toCurrency: { ...emptyMarket },
            whom: interaction.from,
            trade_modal: false,
            loading: false,
            exchangeFee: 0,
            fromDollarEquivalent: 0,
            fromValue: "",
            toValue: "",
            lists: [],
            countdownSeconds: 10,
            countdownActive: false,
            continueBtnDisabled: true,
            focusedInput: interaction.from,
        };
        const login: boolean = Defaults.LOGIN_STATUS();
        if (!login) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            return;
        }
    }

    componentDidMount(): void {
        logger.clear();
        this.initTimeout = setTimeout(() => {
            this.init();
            this.startCountdownTimer();
        }, 0);
    }

    componentWillUnmount(): void {
        if (this.estimateInterval) {
            clearInterval(this.estimateInterval);
        }
        if (this.initTimeout) {
            clearTimeout(this.initTimeout);
        }
    }

    // ── Init ──────────────────────────────────────────────────────────
    private init = (): void => {
        const { currency, network } = this.session.params;
        const markets = WalletService.getUniqueMarkets();

        const toCurrencyParam = currency === "NGN" ? "USDT" : "NGN";
        let fromMarket: IMarket | undefined = undefined;

        // 1. Exact match with network
        if (network) {
            fromMarket = markets.find((m) => m.currency === currency && m.network === network);
        }
        // 2. BSC priority
        if (!fromMarket) {
            fromMarket = markets.find((m) => m.currency === currency && m.network === 'BSC');
        }
        // 3. Fallback
        if (!fromMarket) {
            fromMarket = markets.find((m) => m.currency === currency);
        }

        const toMarket = markets.find((m) => m.currency === toCurrencyParam);

        if (!fromMarket || !toMarket) {
            logger.error(`Error finding ${currency} wallet`);
            return;
        }

        this.setState({ fromCurrency: fromMarket, toCurrency: toMarket });
    }

    // ── Countdown Timer ───────────────────────────────────────────────
    private startCountdownTimer = () => {
        this.setState({ countdownSeconds: 10, countdownActive: true });

        if (this.estimateInterval) {
            clearInterval(this.estimateInterval);
        }

        this.estimateInterval = setInterval(() => {
            this.setState((prevState) => {
                const newSeconds = prevState.countdownSeconds - 1;

                if (newSeconds <= 0) {
                    // Reset countdown and call estimate
                    setTimeout(() => this.estimate(), 0);
                    return { ...prevState, countdownSeconds: 10, countdownActive: true };
                }

                return { ...prevState, countdownSeconds: newSeconds };
            });
        }, 1000);
    }

    private resetCountdownTimer = () => {
        this.setState({ countdownSeconds: 10, countdownActive: true });
        // Restart the interval
        this.startCountdownTimer();
    }

    // ── Toggle Currency Modal / Filtered Lists ────────────────────────
    private toggleCurrencyModal = (isFromCurrency: boolean = true) => {
        const uniqueMarkets = WalletService.getUniqueMarkets();
        let filteredMarkets: IMarket[] = [];

        if (isFromCurrency) {
            // FROM: all crypto except NGN
            filteredMarkets = uniqueMarkets.filter(market => market.currency !== Fiat.NGN);
        } else {
            // TO: only stablecoins + NGN
            const allowedToCurrencies = ["USDT", "USDC", "BUSD", "NGN"];
            filteredMarkets = uniqueMarkets.filter(market => allowedToCurrencies.includes(market.currency));
        }

        const lists: Array<IList> = filteredMarkets.map((market) => ({
            name: market.name,
            description: market.currency,
            icon: getAssetLogoURI(market.currency) || market.icon,
            market: market
        } as any));

        this.setState({
            lists,
            whom: isFromCurrency ? interaction.from : interaction.to,
            trade_modal: true,
        });
    }

    // ── Format Money ──────────────────────────────────────────────────
    private formatToMoneyString = (money: number = 0): string => {
        return money.toLocaleString(undefined, {
            minimumFractionDigits: Defaults.MIN_DECIMAL,
            maximumFractionDigits: Defaults.MAX_DECIMAL,
        });
    }

    // ── Format Balance Display ────────────────────────────────────────
    // USDT, USDC, BUSD, NGN → max 2 decimals, money-like format
    // All others → use Defaults.MIN_DECIMAL / MAX_DECIMAL
    private static readonly TWO_DECIMAL_CURRENCIES = ["USDT", "USDC", "BUSD", "NGN"];

    private formatBalanceDisplay = (asset: IMarket): string => {
        if (SwapScreen.TWO_DECIMAL_CURRENCIES.includes(asset.currency)) {
            return asset.balance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        }
        return this.formatToMoneyString(asset.balance);
    }

    // ── Cap decimals for stablecoins input ────────────────────────────
    // USDT, USDC, BUSD → max 2 decimal places when typing
    private capDecimalsIfNeeded = (text: string, currency: string): string => {
        if (!SwapScreen.TWO_DECIMAL_CURRENCIES.includes(currency) || currency === "NGN") return text;
        const dotIndex = text.indexOf('.');
        if (dotIndex === -1) return text;
        // Allow only 2 digits after the dot
        const decimals = text.substring(dotIndex + 1);
        if (decimals.length > 2) {
            return text.substring(0, dotIndex + 3);
        }
        return text;
    }

    // ── Estimate ──────────────────────────────────────────────────────
    private estimate = async () => {
        try {
            const { fromCurrency, toCurrency, focusedInput, fromValue, toValue } = this.state;
            const isFrom = focusedInput === interaction.from;

            // Guards matching legacy exactly
            if (!fromValue && !toValue) {
                this.setState({ continueBtnDisabled: true, loading: false });
                return;
            }
            if (isFrom && (!fromValue || Number(fromValue) === 0)) {
                this.setState({ continueBtnDisabled: true, loading: false });
                return;
            }
            if (!isFrom && (!toValue || Number(toValue) === 0)) {
                this.setState({ continueBtnDisabled: true, loading: false });
                return;
            }

            this.setState({ loading: true });
            await Defaults.IS_NETWORK_AVAILABLE();

            const login: boolean = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            }

            const res = await fetch(`${Defaults.API}/wallet/swap/estimate`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client?.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
                body: JSON.stringify({
                    fromCurrency: fromCurrency.currency,
                    toCurrency: toCurrency.currency,
                    fromValue,
                    toValue,
                    isFrom,
                }),
            });

            const data: IResponse = await res.json();

            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process login response right now, please try again.');
                const parseData = Defaults.PARSE_DATA(data.data, this.session.client?.privateKey, data.handshake);

                this.setState({
                    toValue: String(Number(parseData.toValue).toFixed(2)),
                    fromValue: String(parseData.fromValue),
                    loading: false,
                    continueBtnDisabled: false,
                    exchangeFee: parseData.fee || 0,
                    fromDollarEquivalent: parseData.fromDollarEquivalent || 0,
                });
            }
        } catch (error: any) {
            if (error.response) {
                logger.log("Error Response Data:", error.response.data);
            } else if (error.request) {
                logger.log("No Response Received:", error.request);
            } else {
                logger.log("Error:", error.message);
            }
            this.setState({ loading: false });
        }
    };

    // ── Handle Text Change ────────────────────────────────────────────
    private handleTextChange = (text: string, isFromCurrency: boolean = true) => {
        // Cap decimals for stablecoins (USDT, USDC, BUSD) on FROM input
        let processedText = text;
        if (isFromCurrency) {
            processedText = this.capDecimalsIfNeeded(text, this.state.fromCurrency.currency);
            this.setState({ fromValue: processedText });
        } else {
            this.setState({ toValue: processedText });
        }

        // Enable/disable continue button based on input
        this.setState((currentState) => {
            const newFromValue = isFromCurrency ? processedText : currentState.fromValue;
            const newToValue = isFromCurrency ? currentState.toValue : processedText;

            const hasValidValues = newFromValue && newToValue &&
                Number(newFromValue) > 0 && Number(newToValue) > 0;

            return { continueBtnDisabled: !hasValidValues };
        });

        // Reset timer when user changes input
        this.resetCountdownTimer();
    }

    // ── Change Currency (with isSameCurrency auto-swap) ───────────────
    private changeCurrency = (list: any) => {
        const { fromCurrency, toCurrency, whom } = this.state;
        const allowedToCurrencies = ["USDT", "USDC", "BUSD", "NGN"];
        const isSelectingFromCurrency = whom === interaction.from;

        // Use the market object directly from the list item if available
        const currency: IMarket = list.market || Defaults.FIND_MARKET(list.description as Coin);

        const isSameCurrency = currency.currency === (isSelectingFromCurrency ? toCurrency.currency : fromCurrency.currency);

        let newState: Partial<SwapState> = {
            fromValue: '',
            toValue: '',
            trade_modal: false,
        };

        if (isSelectingFromCurrency) {
            newState.fromCurrency = currency;

            if (isSameCurrency) {
                // If the old fromCurrency is an allowed TO currency, swap them
                if (allowedToCurrencies.includes(fromCurrency.currency)) {
                    newState.toCurrency = fromCurrency;
                } else {
                    // Find a new TO currency that isn't the same as selected
                    const markets = WalletService.getUniqueMarkets();
                    const availableTo = allowedToCurrencies.filter(c => c !== currency.currency);
                    const newToAsset = markets.find(m => availableTo.includes(m.currency) && m.network === 'BSC')
                        || markets.find(m => availableTo.includes(m.currency));
                    if (newToAsset) {
                        newState.toCurrency = newToAsset;
                    }
                }
            }
        } else {
            newState.toCurrency = currency;

            if (isSameCurrency) {
                if (toCurrency.currency !== "NGN") {
                    newState.fromCurrency = toCurrency;
                } else {
                    const markets = WalletService.getUniqueMarkets();
                    const newFromAsset = markets.find(m => m.currency !== "NGN" && m.currency !== currency.currency);
                    if (newFromAsset) {
                        newState.fromCurrency = newFromAsset;
                    }
                }
            }
        }

        this.setState(newState as any);
        this.resetCountdownTimer();
    }

    // ── Input Number (keypad) ─────────────────────────────────────────
    private inputNumber = (number: string | number) => {
        const { fromValue } = this.state;
        // Always target FROM input only — TO is read-only
        const newValue = fromValue + number;
        this.handleTextChange(newValue, true);
    }

    // ── Handle Backspace ──────────────────────────────────────────────
    private handleBackspace = () => {
        const fromValue = String(this.state.fromValue || "0");

        // Always target FROM input only — TO is read-only
        const newValue = fromValue.length > 1 ? fromValue.slice(0, -1) : "";
        this.setState({ fromValue: newValue, toValue: "" });
        if (fromValue.length > 1) {
            this.handleTextChange(newValue, true);
        }
    }

    // ── Handle Navigation (Continue) ──────────────────────────────────
    private handleNavigation = async () => {
        const { fromCurrency, toCurrency, fromValue, toValue } = this.state;
        const allowedToCurrencies = ["USDT", "USDC", "BUSD", "NGN"];

        if (fromCurrency.currency === toCurrency.currency) {
            this.setState({ error_modal: true, error_title: "Swap Error", error_message: "You cannot swap the same currency" });
            return;
        }

        if (fromCurrency.currency === "NGN") {
            this.setState({ error_modal: true, error_title: "Swap Error", error_message: "Unsupported swap currency" });
            return;
        }

        if (!allowedToCurrencies.includes(toCurrency.currency)) {
            this.setState({ error_modal: true, error_title: "Swap Error", error_message: "Unsupported swap currency" });
            return;
        }

        if (!fromValue || !toValue) {
            this.setState({ error_modal: true, error_title: "Swap Error", error_message: "Please enter a valid amount to swap" });
            return;
        }

        if (fromCurrency.balance < Number(fromValue)) {
            this.setState({ error_modal: true, error_title: "Swap Error", error_message: `Insufficient ${fromCurrency.currency} balance to continue swap` });
            return;
        }

        // Clear interval before navigating
        if (this.estimateInterval) {
            clearInterval(this.estimateInterval);
        }

        const { exchangeFee } = this.state;

        // Update session params with the swap details so confirm screen can read them
        await sessionManager.updateSession({
            ...this.session,
            params: {
                ...this.session.params,
                fromAsset: fromCurrency,
                toAsset: toCurrency,
                fromValue,
                toValue,
                exchangeFee,
            }
        });

        router.navigate("/swap/confirm");
    }

    // ── Handle Toggle Switch Swap ─────────────────────────────────────
    private handleToggleSwitchSwap = () => {
        const { fromCurrency, toCurrency } = this.state;

        // Ensure FROM is never NGN
        if (fromCurrency.currency === "NGN" || toCurrency.currency === "NGN") {
            this.setState({
                error_modal: true,
                error_title: "Swap Error",
                error_message: `Swap from ${toCurrency.currency} to ${fromCurrency.currency} currently not supported`,
            });
            return;
        }

        this.setState({
            fromCurrency: toCurrency,
            toCurrency: fromCurrency,
            fromValue: '',
            toValue: '',
        });

        this.resetCountdownTimer();
    }

    // ── Render ────────────────────────────────────────────────────────
    render(): React.ReactNode {
        const {
            error_message, error_modal, error_title,
            fromValue, toValue, trade_modal, loading,
            fromCurrency, toCurrency, lists,
            exchangeFee, fromDollarEquivalent,
            continueBtnDisabled, countdownSeconds,
        } = this.state;

        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.safeArea}>
                    {/* ── Header ─────────────────────────────────────── */}
                    <ThemedView style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}>
                            <Image
                                source={require("../../assets/icons/chevron_right.svg")}
                                style={styles.backIcon}
                                tintColor={"#000000"} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.title}>Swap</ThemedText>
                        <TouchableOpacity style={[styles.backButton, styles.extraButton]} onPress={this.resetCountdownTimer}>
                            <ThemedView style={styles.countdownContainer}>
                                <ThemedView style={styles.countdownCircle}>
                                    <ThemedText style={[styles.countdownText, {
                                        color: countdownSeconds <= 3 ? '#FF6B6B' : countdownSeconds <= 6 ? '#FFB347' : '#283fa5ff'
                                    }]}>
                                        {countdownSeconds}
                                    </ThemedText>
                                </ThemedView>
                                <ThemedView style={styles.countdownLabels}>
                                    <ThemedText style={styles.countdownLabel}>Reset</ThemedText>
                                </ThemedView>
                            </ThemedView>
                        </TouchableOpacity>
                    </ThemedView>

                    {/* ── Content ─────────────────────────────────────── */}
                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? 450 : 100 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <ThemedView>
                            {/* FROM Input */}
                            <SwapTextField
                                onChangeCoin={(): void => this.toggleCurrencyModal(true)}
                                onMaxPress={(): void => this.handleTextChange(fromCurrency.balance.toString(), true)}
                                asset={fromCurrency}
                                onChangeText={(text: string) => this.handleTextChange(text, true)}
                                value={fromValue}
                                onFocus={(): void => this.setState({ focusedInput: interaction.from, fromValue: '', toValue: '' })}
                                readOnly={false}
                                balanceDisplay={this.formatBalanceDisplay(fromCurrency)} />

                            {/* Center swap button (disabled, shows spinner when loading) */}
                            <TouchableOpacity disabled={true} onPress={this.handleToggleSwitchSwap}>
                                <ThemedView style={{
                                    width: "100%",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    paddingVertical: 5,
                                    opacity: 0.5
                                }}>
                                    <ThemedView style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: 360,
                                        backgroundColor: "#F5F5F5",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}>
                                        {loading ? (
                                            <ActivityIndicator size={10} color="#000000" />
                                        ) : (
                                                <Image
                                                    source={require("../../assets/icons/swap.svg")}
                                                    style={{ width: 25, height: 25 }}
                                                    transition={500}
                                                    tintColor={"#000"} />
                                        )}
                                    </ThemedView>
                                </ThemedView>
                            </TouchableOpacity>

                            {/* TO Input */}
                            <SwapTextField
                                onChangeCoin={(): void => this.toggleCurrencyModal(false)}
                                onMaxPress={(): void => { }}
                                asset={toCurrency}
                                onChangeText={(): void => { }}
                                value={toValue}
                                onFocus={(): void => { }}
                                readOnly={true}
                                balanceDisplay={this.formatBalanceDisplay(toCurrency)} />
                        </ThemedView>

                        {/* ── Info Container ─────────────────────────── */}
                        <ThemedView style={styles.infoContainer}>
                            {/*
                            <ThemedView style={styles.infoRow}>
                                <ThemedText style={styles.infoLabel}>Exchange fees</ThemedText>
                                <ThemedText style={styles.infoValue}>
                                    {this.formatToMoneyString(exchangeFee)} {fromCurrency.currency} (~${this.formatToMoneyString(fromDollarEquivalent)})
                                </ThemedText>
                            </ThemedView>
                            */}
                            <PrimaryButton
                                Gold
                                title='Preview'
                                onPress={this.estimate}
                                disabled={loading}
                            />
                        </ThemedView>
                    </ScrollView>

                    {/* ── Keypad ──────────────────────────────────────── */}
                    <DiapadKeyPad
                        button={!loading}
                        btndisabled={continueBtnDisabled}
                        inputNumber={this.inputNumber}
                        onBackspacePress={this.handleBackspace}
                        onContinuePress={this.handleNavigation}
                    />

                    {/* ── Modals ──────────────────────────────────────── */}
                    {trade_modal && (
                        <ListModal
                            visible={trade_modal}
                            title={this.state.whom === interaction.from ? "Select From Asset" : "Select To Asset"}
                            lists={lists}
                            listChange={this.changeCurrency}
                            showSearch={true}
                            onClose={() => this.setState({ trade_modal: false })} />
                    )}
                    <MessageModal
                        visible={error_modal}
                        type={Status.ERROR}
                        onClose={(): void => this.setState({ error_modal: !error_modal })}
                        message={{ title: error_title, description: error_message }} />
                    <StatusBar style={"dark"} />
                </ThemedSafeArea>
            </>
        );
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 50 : 0,
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
        fontWeight: '500',
        lineHeight: 14,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    extraButton: {
        backgroundColor: 'white',
        paddingRight: 0,
    },
    countdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'transparent',
    },
    countdownCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#283fa5ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    countdownText: {
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'AeonikBold',
    },
    countdownLabels: {
        alignItems: 'flex-start',
        backgroundColor: 'transparent',
    },
    countdownLabel: {
        fontSize: 10,
        fontWeight: '600',
        fontFamily: 'AeonikMedium',
        lineHeight: 12,
    },
    content: {
        marginTop: 26,
        marginHorizontal: 16,
    },
    infoContainer: {
        // padding: 12,
        // backgroundColor: '#F7F7F7',
        // borderRadius: 12,
        marginTop: 15,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        backgroundColor: 'transparent',
    },
    infoLabel: {
        fontSize: 13,
        fontFamily: 'AeonikRegular',
    },
    infoValue: {
        fontSize: 13,
        fontFamily: 'AeonikMedium',
    },
});