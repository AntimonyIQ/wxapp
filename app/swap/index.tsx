import logger from '@/logger/logger';
import { router, Stack } from 'expo-router';
import React from 'react';
import { IList, IUser, UserData } from '@/interface/interface';
import { Appearance, ColorSchemeName, FlatList, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import sessionManager from '@/session/session';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import MessageModal from '@/components/modals/message';
import ListModal from '@/components/modals/list';
import LoadingModal from '@/components/modals/loading';
import SwapTextField from '@/components/inputs/swap';
import Defaults from '../default/default';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PrimaryButton from '@/components/button/primary';
import { StatusBar } from 'expo-status-bar';
import { Coin, UserType } from '@/enums/enums';
import ThemedText from '@/components/ThemedText';
import ThemedSafeArea from '@/components/ThemeSafeArea';
import ThemedView from '@/components/ThemedView';

interface SwapProps { }

export enum interaction {
    from = "from",
    to = "to",
};

interface SwapState {
    error_modal: boolean;
    error_title: string;
    error_message: string;
    fromCurrency: IList;
    toCurrency: IList;
    fromSwap: ISwap;
    toSwap: ISwap;
    swaps: Array<ISwap>;
    whom: interaction;
    trade_modal: boolean;
    loading: boolean;
    fee: number;
    fromValue: string;
    toValue: string;
    fromPrice: number;
    toPrice: number;
    remove: Array<string>;
}

export default class SwapScreen extends React.Component<SwapProps, SwapState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Swap Screen";
    private coin: any;
    private readonly trades: IList[] = [
        { name: 'Bitcoin', description: Coin.BTC, icon: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400" },
        { name: 'Ethereum', description: Coin.ETH, icon: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628" },
        { name: 'Tether USDT', description: Coin.USDT, icon: "https://coin-images.coingecko.com/coins/images/325/large/Tether.png?1696501661" },
        { name: 'USD Coin', description: Coin.USDC, icon: "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694" },
        { name: 'Naira', description: Coin.NGN, icon: "https://img.icons8.com/emoji/96/nigeria-emoji.png" },
    ];
    // private readonly emptyAddress: AddressDocument = { _id: '', address: '', privateKey: '', publicKey: '', currency: '', userId: '', balance: 0, createdAt: '', updatedAt: '' };
    private readonly emptySwap: ISwap = { name: '', symbol: Coin.BTC, icon: '', sellRate: 0, buyRate: 0, exchangeRate: 0, fee: 0, gas: 0, isActive: false, createdAt: new Date(), updatedAt: new Date() }
    private NGN_BALANCE: number;
    constructor(props: SwapProps) {
        super(props);
        this.state = {
            error_message: "",
            error_modal: false,
            error_title: "",
            fromCurrency: this.trades[0],
            toCurrency: this.trades[4],
            whom: interaction.from,
            trade_modal: false,
            loading: false,
            fee: 0,
            fromValue: "",
            toValue: "",
            fromSwap: this.emptySwap,
            toSwap: this.emptySwap,
            swaps: [],
            fromPrice: 0,
            toPrice: 0,
            remove: []
        };
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
        this.coin = this.session.selectedCoin;
        this.addresses = this.session.addresses;
        this.NGN_BALANCE = parseFloat(this.session.NGN_BALANCE || 0);
    }

    componentDidMount(): void {
        logger.clear();
        this.local();
        this.loadCurrencies();
    }

    private local = (): void => {
        const { currency } = this.coin;
        const from: IList = this.findTrade(currency.symbol);
        this.setState({ fromCurrency: from });
    }

    private findTrade = (symbol: string): IList => {
        const trade: IList | undefined = this.trades.find(trade => trade.description === symbol);
        if (!trade) throw new Error('Trade not found for symbol: ' + symbol);
        return trade;
    };

    private findAddress = (symbol: string): AddressDocument => {
        const address: AddressDocument | undefined = this.addresses.find(addr => addr.currency === symbol);
        if (!address) throw new Error('Address not found for symbol: ' + symbol);
        return address;
    };

    private findSwap = (symbol: Coin, currencies: Array<ISwap>): ISwap => {
        const swap: ISwap | undefined = currencies.find(swap => swap.symbol === symbol);
        if (!swap) throw new Error('Swap not found for symbol: ' + symbol);
        return swap;
    }

    private processSelectedTrade = async (trade: IList) => {
        const swaps: ISwap[] = this.state.swaps;
        logger.log("swap focus: ", this.state.whom);
        const fromSwap: ISwap = this.findSwap(trade.description as Coin, swaps);

        if (this.state.whom === interaction.from) {
            if (trade.description === this.state.toCurrency.description) {
                this.setState({ fromCurrency: this.state.toCurrency, toCurrency: this.state.fromCurrency, trade_modal: false, fromValue: "", toValue: "", fromPrice: 0, toPrice: 0, });
                await this.loadCurrencies();
                return;
            }

            this.setState({ fromCurrency: trade, fromSwap, toSwap: this.state.toSwap, trade_modal: false, fromValue: "", toValue: "", fromPrice: 0, toPrice: 0, });
        } else {
            const toSwap: ISwap = this.findSwap(trade.description as Coin, swaps);
            if (trade.description === this.state.fromCurrency.description) {
                this.setState({ fromCurrency: this.state.toCurrency, toCurrency: this.state.fromCurrency, trade_modal: false, fromValue: "", toValue: "", fromPrice: 0, toPrice: 0, });
                await this.loadCurrencies();
                return;
            }
            this.setState({ toCurrency: trade, toSwap, fromSwap: this.state.fromSwap, trade_modal: false, fromValue: "", toValue: "", fromPrice: 0, toPrice: 0, });
        }

        await this.loadCurrencies();
    };

    private toggleRouting = async () => {
        const { fromCurrency, toCurrency, fromSwap, toSwap } = this.state;
        this.setState({ fromCurrency: toCurrency, toCurrency: fromCurrency, fromSwap: toSwap, toSwap: fromSwap, fromValue: "", toValue: "", fromPrice: 0, toPrice: 0 });
        await this.loadCurrencies();
    }

    private loadCurrencies = async () => {
        try {
            this.setState({ loading: true });
            const response = await fetch(`${Defaults.API}/swap`, {
                method: "GET",
                headers: { ...Defaults.HEADERS, "Authorization": `Bearer ${this.session.accessToken}` },
            });

            if (!response.ok) throw new Error(`response failed with status: ${response.status}`);

            const data = await response.json();
            if (data.status === "success") {
                const { fromCurrency, toCurrency } = this.state;
                const swaps: ISwap[] = data.data || [];
                const fromSwap: ISwap = this.findSwap(fromCurrency.description as Coin, swaps);
                const toSwap: ISwap = this.findSwap(toCurrency.description as Coin, swaps);
                this.setState({ fromSwap, toSwap, fee: fromSwap.fee, swaps });
            }

        } catch (error: any) {
            if (error.response) {
                const data = error.response.data;
                logger.log("Error Response Data:", data);
            } else if (error.request) {
                logger.log("No Response Received:", error.request);
            } else {
                logger.log("Error:", error.message);
            }
        } finally {
            this.setState({ loading: false });
        }
    };

    private handleTextChanged = (text: string) => {
        const { whom, fromCurrency, toCurrency, fromSwap, toSwap } = this.state;
        const supported: Array<string> = [Coin.USDT, Coin.USDC, Coin.NGN];
        logger.log("textChanged focus: ", text);

        if (toCurrency.description === Coin.NGN) {
            const fromRate: number = fromSwap.sellRate;
            const eRate: number = fromSwap.exchangeRate;
            switch (this.state.whom) {
                case interaction.from:
                    const toPrice: number = parseFloat(text) * eRate;
                    const toValue: number = eRate * parseFloat(text) * fromRate;
                    this.setState({
                        fromValue: text,
                        toValue: supported.includes(toCurrency.description)
                            ? toValue.toFixed(2)
                            : toValue.toFixed(8),
                        toPrice: toPrice,
                        fromPrice: toPrice,
                    });
                    break;
                case interaction.to:
                    const fromPrice: number = parseFloat(text) / fromRate;
                    const fromValue: number = (1 / eRate) * (parseFloat(text) / fromRate);
                    this.setState({
                        toValue: text,
                        fromValue: supported.includes(fromCurrency.description)
                            ? fromValue.toFixed(2)
                            : fromValue.toFixed(8),
                        toPrice: fromPrice,
                        fromPrice: fromPrice,
                    });
                    break;
                default:
                    logger.log("Error processing input: ", text);
                    break;
            }
        } else if (fromCurrency.description === Coin.NGN) {
            const toRate: number = fromSwap.buyRate;
            const eRate: number = toSwap.exchangeRate;
            logger.log("Testing swap from NGN");
            switch (whom) {
                case interaction.from:
                    const toPrice: number = parseFloat(text) / toRate;
                    const toValue: number = (1 / eRate) * (parseFloat(text) / toRate);
                    logger.log("from Rate: ", { toRate, toPrice, eRate });
                    this.setState({
                        fromValue: text,
                        toValue: supported.includes(toCurrency.description)
                            ? toValue.toFixed(2)
                            : toValue.toFixed(8),
                        toPrice: toPrice,
                        fromPrice: toPrice,
                    });
                    break;
                case interaction.to:
                    const fromPrice: number = parseFloat(text) * toRate;
                    const fromValue: number = eRate * parseFloat(text) * toRate;
                    this.setState({
                        toValue: text,
                        fromValue: supported.includes(fromCurrency.description)
                            ? fromValue.toFixed(2)
                            : fromValue.toFixed(8),
                        toPrice: fromPrice,
                        fromPrice: fromPrice,
                    });
                    break;
                default:
                    logger.log("Error processing input: ", text);
                    break;
            }
        } else {
            logger.log("Testing swap between crypto");
            const fromRate: number = fromSwap.exchangeRate;
            const toRate: number = toSwap.exchangeRate;
            switch (whom) {
                case interaction.from:
                    const toPrice: number = parseFloat(text) * fromRate;
                    const toValue: number = supported.includes(toCurrency.description)
                        ? parseFloat(text) * fromRate
                        : parseFloat(text) / toRate;

                    this.setState({
                        fromValue: text,
                        toValue: supported.includes(toCurrency.description)
                            ? toValue.toFixed(2)
                            : toValue.toFixed(8),
                        toPrice: toPrice,
                        fromPrice: toPrice,
                    });
                    break;
                case interaction.to:
                    const fromPrice = parseFloat(text) * toRate;
                    const fromValue = supported.includes(toCurrency.description)
                        ? parseFloat(text) / fromRate
                        : parseFloat(text) * toRate;

                    this.setState({
                        fromValue: supported.includes(fromCurrency.description)
                            ? fromValue.toFixed(2)
                            : fromValue.toFixed(8),
                        toValue: text,
                        toPrice: fromPrice,
                        fromPrice: fromPrice,
                    });
                    this.setState({ toValue: text });
                    break;
                default:
                    logger.log("Error processing input: ", text);
                    break;
            }
        }
    };

    private renderKeypadItem = ({ item }: { item: any }): React.JSX.Element => (
        <TouchableOpacity
            style={styles.box}
            onPress={() => {
                let currentValue = this.state.whom === interaction.from ? this.state.fromValue : this.state.toValue;
                if (item === 'Backspace') {
                    currentValue = currentValue.slice(0, -1);

                    if (currentValue.length === 0) {
                        logger.log("currentValue length: ", currentValue.length);
                        this.setState({ fromValue: "", toValue: "", fromPrice: 0, toPrice: 0 });
                        return;
                    }
                } else {
                    currentValue += item;
                }
                this.handleTextChanged(currentValue);
            }}>
            {item === 'Backspace'
                ? <MaterialCommunityIcons name="backspace" size={24} color="red" />
                : <ThemedText style={styles.buttonText}>{item}</ThemedText>}
        </TouchableOpacity>
    );

    private next = async () => {
        try {
            const { fromValue, fromCurrency, fromSwap, fee, fromPrice, toValue, toCurrency, toSwap, toPrice } = this.state;
            const balance: number = fromCurrency.description === Coin.NGN ? this.NGN_BALANCE : this.findAddress(fromCurrency.description).balance;

            const user: IUser = this.session.user;

            if (user.userType === UserType.USER) {
                if (!fromValue || !toValue) throw new Error("Please provide swap amount");
                if (fromCurrency.description === toCurrency.description) throw new Error("You cannot swap the same currency");
                if (balance < Number(fromValue)) throw new Error(`Insufficient ${fromCurrency.description} balance to continue swap`);
            }
            const payload: ISwapPayload = {
                fromValue: Number(fromValue),
                toValue: Number(toValue),
                fromSwap: fromSwap,
                toSwap: toSwap,
                fees: fee,
                fromPrice,
                toPrice
            };

            await sessionManager.updateSession({ ...this.session, swapPayload: payload });
            router.navigate("/swap/confirm");
        } catch (error: any) {
            logger.error(error.message || error);
            this.setState({ error_modal: true, error_title: "Swap Error", error_message: error.message });
        }
    };

    render(): React.ReactNode {
        const { error_message, toPrice, fromPrice, error_modal, remove, error_title, fromValue, toValue, trade_modal, loading, fromCurrency, toCurrency } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.safeArea}>
                    <ThemedView style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}>
                            <Image
                                source={require("../../assets/icons/chevron-left.svg")}
                                style={styles.backIcon}
                                tintColor={this.appreance === "dark" ? Colors.light.background : "#000000"} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.title}>Swap</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.content}>
                        <ThemedView>

                            <SwapTextField
                                onChangeCoin={(): void => this.setState({ remove: [], whom: interaction.from, trade_modal: !trade_modal })}
                                onMaxPress={(): void => this.setState({ whom: interaction.from }, async () => {
                                    const balance: number = fromCurrency.description === Coin.NGN ? this.NGN_BALANCE : this.findAddress(fromCurrency.description).balance;
                                    this.handleTextChanged(String(balance));
                                })}
                                currency={fromCurrency}
                                onChangeText={this.handleTextChanged}
                                balance={fromCurrency.description === Coin.NGN ? this.NGN_BALANCE : this.findAddress(fromCurrency.description).balance}
                                value={fromValue}
                                onFocus={(e): void => this.setState({ whom: interaction.from })}
                                readOnly={false}
                                price={toPrice} />

                            <TouchableOpacity onPress={this.toggleRouting}>
                                <ThemedView style={{
                                    width: "100%",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    paddingVertical: 5,
                                }}>
                                    <ThemedView style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: 360,
                                        backgroundColor: this.appreance === "dark" ? "#000000" : "#F5F5F5",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}>
                                        <Image
                                            source={require("../../assets/icons/swap.svg")}
                                            style={{ width: 25, height: 25 }}
                                            transition={500}
                                            tintColor={this.appreance === "dark" ? "#FFF" : "#000"} />
                                    </ThemedView>
                                </ThemedView>
                            </TouchableOpacity>

                            <SwapTextField
                                onChangeCoin={(): void => this.setState({ remove: [Coin.BTC, Coin.ETH], whom: interaction.to, trade_modal: !trade_modal })}
                                onMaxPress={(): void => this.setState({ whom: interaction.to }, async () => {
                                    const balance: number = toCurrency.description === Coin.NGN ? this.NGN_BALANCE : this.findAddress(toCurrency.description).balance;
                                    this.handleTextChanged(String(balance));
                                })}
                                currency={toCurrency}
                                onChangeText={this.handleTextChanged}
                                balance={toCurrency.description === Coin.NGN ? this.NGN_BALANCE : this.findAddress(toCurrency.description).balance}
                                value={toValue}
                                onFocus={(): void => this.setState({ whom: interaction.to })}
                                readOnly={false}
                                price={fromPrice} />
                        </ThemedView>

                        <PrimaryButton Gradient title='Continue' onPress={this.next}></PrimaryButton>
                    </ThemedView>

                    <ThemedView style={styles.keypadContainer}>
                        <FlatList
                            data={[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'Backspace']}
                            renderItem={this.renderKeypadItem}
                            keyExtractor={(item, index) => index.toString()}
                            numColumns={3}
                            contentContainerStyle={styles.keypad}
                            style={{ paddingBottom: 20 }}
                        />
                    </ThemedView>

                    <ListModal
                        visible={trade_modal}
                        lists={this.trades.filter(trade => !remove.includes(trade.description))
                        }
                        listChange={this.processSelectedTrade}
                        onClose={() => this.setState({ trade_modal: !trade_modal })} />
                    <MessageModal
                        visible={error_modal}
                        type={"error"}
                        onClose={(): void => this.setState({ error_modal: !error_modal })}
                        message={{ title: error_title, description: error_message }} />
                    <LoadingModal loading={loading} />
                    <StatusBar style={this.appreance === "dark" ? 'light' : "dark"} />
                </ThemedSafeArea>
            </>
        );
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
        backgroundColor: Appearance.getColorScheme() === "dark" ? '#070707' : '#f7f7f7',
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
    },
    extraButton: {
        backgroundColor: 'white',
    },
    placeholderIcon: {
        width: 24,
        height: 24,
    },
    content: {
        marginTop: 26,
        marginHorizontal: 16,
        gap: 30
    },
    infoContainer: {
        padding: 12,
        backgroundColor: '#F7F7F7',
        borderRadius: 12,
        marginTop: 20,
    },
    swapButton: {
        // backgroundColor: Colors.primary,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
        marginHorizontal: 16,
    },
    swapButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    box: {
        width: 90,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        marginVertical: 15,
        borderRadius: 10,
    },
    buttonText: {
        fontSize: 32,
        lineHeight: 32,
        fontFamily: 'AeonikMedium',
    },
    keypadContainer: {
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
    },
    keypad: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});