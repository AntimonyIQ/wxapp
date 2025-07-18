import logger from '@/logger/logger';
import { router, Stack } from 'expo-router';
import React from 'react';
import { IList, IMarket, IResponse, UserData } from '@/interface/interface';
import { Appearance, ColorSchemeName, FlatList, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import sessionManager from '@/session/session';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import MessageModal from '@/components/modals/message';
import ListModal from '@/components/modals/list';
import LoadingModal from '@/components/modals/loading';
import SwapTextField from '@/components/inputs/swap';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PrimaryButton from '@/components/button/primary';
import { StatusBar } from 'expo-status-bar';
import { BlockchainNetwork, Coin, Fiat, Status, WalletType } from '@/enums/enums';
import ThemedText from '@/components/ThemedText';
import ThemedSafeArea from '@/components/ThemeSafeArea';
import ThemedView from '@/components/ThemedView';
import Defaults from '../default/default';

interface SwapProps { }

export enum interaction {
    from = "from",
    to = "to",
};

interface SwapState {
    error_modal: boolean;
    error_title: string;
    error_message: string;
    fromCurrency: IMarket;
    toCurrency: IMarket;
    whom: interaction;
    trade_modal: boolean;
    loading: boolean;
    fee: number;
    fromValue: string;
    toValue: string;
    lists: Array<IList>;
}

export default class SwapScreen extends React.Component<SwapProps, SwapState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Swap Screen";
    constructor(props: SwapProps) {
        super(props);
        this.state = {
            error_message: "",
            error_modal: false,
            error_title: "",
            fromCurrency: {
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
            },
            toCurrency: {
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
            },
            whom: interaction.from,
            trade_modal: false,
            loading: false,
            fee: 0,
            fromValue: "",
            toValue: "",
            lists: []
        };
        const login: boolean = Defaults.LOGIN_STATUS();
        if (!login) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            return;
        };
    }

    componentDidMount(): void {
        logger.clear();
        this.local();
    }

    private local = (): void => {
        const { currency, network } = this.session.params;
        const toCurrency: IMarket = Defaults.FIND_MARKET(Fiat.NGN, BlockchainNetwork.NONE);
        const fromCurrency: IMarket = Defaults.FIND_MARKET(currency, network);

        const mkt: Array<IMarket> = Defaults.FILTER_MARKET(this.session.markets, [Coin.USDC, Coin.USDT]);

        const lists: Array<IList> = mkt.map((market, _index) => ({
            name: market.name,
            description: market.currency,
            icon: market.icon,
        }));

        this.setState({ toCurrency: toCurrency, fromCurrency: fromCurrency, lists });
    }

    private estimate = async () => {
        try {
            this.setState({ loading: true });
            await Defaults.IS_NETWORK_AVAILABLE();

            const login: boolean = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            };

            const { fromCurrency, toCurrency, whom, fromValue, toValue } = this.state;

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
                    isFrom: whom === interaction.from ? true : false,
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
                });
            };

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
        const { whom } = this.state;
        whom === interaction.from
            ? this.setState({ fromValue: text })
            : this.setState({ toValue: text });

        this.estimate();
    };

    private processSelectedTrade = (list: IList) => {
        const { fromCurrency, toCurrency, whom } = this.state;
        if (whom === interaction.from && list.description === toCurrency.currency) return;
        if (whom === interaction.to && list.description === fromCurrency.currency) return;
        if (whom === interaction.from && list.description === fromCurrency.currency) return;
        if (whom === interaction.to && list.description === toCurrency.currency) return;
        if (whom === interaction.from) {
            const fromCurrency: IMarket = Defaults.FIND_MARKET(list.description as Coin);
            this.setState({ fromCurrency: fromCurrency, trade_modal: false, fromValue: "", toValue: "" });
        } else {
            const toCurrency: IMarket = Defaults.FIND_MARKET(list.description as Coin);
            this.setState({ toCurrency: toCurrency, trade_modal: false, fromValue: "", toValue: "" });
        }
    }

    private renderKeypadItem = ({ item }: { item: any }): React.JSX.Element => (
        <TouchableOpacity
            style={styles.box}
            onPress={() => {
                let currentValue = this.state.whom === interaction.from ? this.state.fromValue : this.state.toValue;
                if (item === 'Backspace') {
                    currentValue = currentValue.slice(0, -1);

                    if (currentValue.length === 0) {
                        logger.log("currentValue length: ", currentValue.length);
                        this.setState({ fromValue: "", toValue: "" });
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

            router.navigate("/swap/confirm");
        } catch (error: any) {
            logger.error(error.message || error);
            this.setState({ error_modal: true, error_title: "Swap Error", error_message: error.message });
        }
    };

    private toggleRouting = () => {
        const { fromCurrency, toCurrency } = this.state;
        this.setState({ fromCurrency: toCurrency, toCurrency: fromCurrency, toValue: "", fromValue: "" });
    }

    render(): React.ReactNode {
        const { error_message, lists, error_modal, error_title, fromValue, toValue, trade_modal, loading, fromCurrency, toCurrency } = this.state;
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
                                style={styles.backIcon}
                                tintColor={"#000000"} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.title}>Swap</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.content}>
                        <ThemedView>

                            <SwapTextField
                                onChangeCoin={(): void => this.setState({ whom: interaction.from, trade_modal: !trade_modal })}
                                onMaxPress={(): void => this.setState({ whom: interaction.from }, () => {
                                    this.handleTextChanged(fromCurrency.balance.toString());
                                })}
                                asset={fromCurrency}
                                onChangeText={this.handleTextChanged}
                                value={fromValue}
                                onFocus={(e): void => this.setState({ whom: interaction.from })}
                                readOnly={false} />

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
                                        backgroundColor: "#F5F5F5",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}>
                                        <Image
                                            source={require("../../assets/icons/swap.svg")}
                                            style={{ width: 25, height: 25 }}
                                            transition={500}
                                            tintColor={"#000"} />
                                    </ThemedView>
                                </ThemedView>
                            </TouchableOpacity>

                            <SwapTextField
                                onChangeCoin={(): void => this.setState({ whom: interaction.to, trade_modal: !trade_modal })}
                                onMaxPress={(): void => this.setState({ whom: interaction.to }, () => {
                                    this.handleTextChanged(toCurrency.balance.toString());
                                })}
                                asset={toCurrency}
                                onChangeText={this.handleTextChanged}
                                value={toValue}
                                onFocus={(): void => this.setState({ whom: interaction.to })}
                                readOnly={false} />
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
                        lists={lists}
                        listChange={this.processSelectedTrade}
                        onClose={() => this.setState({ trade_modal: !trade_modal })} />
                    <MessageModal
                        visible={error_modal}
                        type={Status.ERROR}
                        onClose={(): void => this.setState({ error_modal: !error_modal })}
                        message={{ title: error_title, description: error_message }} />
                    <LoadingModal loading={loading} />
                    <StatusBar style={"dark"} />
                </ThemedSafeArea>
            </>
        );
    }
}

const styles = StyleSheet.create({
    safeArea: {
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