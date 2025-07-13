import React from 'react';
import { Modal, StyleSheet, TouchableWithoutFeedback, Appearance, Pressable, ColorSchemeName, ActivityIndicator, Dimensions } from 'react-native';
import { IMarket } from '@/interface/interface';
import logger from '@/logger/logger';
import { Image } from 'expo-image';
import { Colors } from '@/constants/Colors';
import { LineChart } from 'react-native-chart-kit';
import { Coin } from '@/enums/enums';
import ThemedView from '../ThemedView';
import ThemedText from '../ThemedText';

interface GraphDialogProps {
    visible: boolean;
    currency: IMarket;
    onClose: () => void;
}

interface GraphDialogState {
    loading: boolean;
    chartData: number[];
    labels: string[];
}

export default class GraphModal extends React.Component<GraphDialogProps, GraphDialogState> {
    private appearance: ColorSchemeName = Appearance.getColorScheme();

    constructor(props: GraphDialogProps) {
        super(props);
        this.state = { loading: true, chartData: [], labels: [] };
    }

    componentDidMount(): void {
        this.getChartData();
    }

    private getChartData = async (): Promise<void> => {
        try {
            this.setState({ loading: true });

            const symbol: Coin = this.props.currency.currency as Coin;
            const id: string = this.getCoinGeckoId(symbol);
            if (!id) throw new Error("Unsupported coin symbol");

            const API_ENDPOINT = `https://api.coingecko.com/api/v3/coins/${id}/market_chart`;
            const params = new URLSearchParams({
                vs_currency: 'usd',
                days: '30', // Fetch last 30 days data
                interval: 'daily'
            }).toString();

            const url = `${API_ENDPOINT}?${params}`;
            const response = await fetch(url, { method: 'GET' });

            if (!response.ok) throw new Error(`Error fetching chart data: ${response.status}`);
            const data = await response.json();
            const prices = data.prices;

            const labels: string[] = [];
            const chartData: number[] = [];

            for (let i = 0; i < prices.length; i += Math.floor(prices.length / 6)) {
                labels.push(new Date(prices[i][0]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
                chartData.push(prices[i][1]);
            }

            this.setState({ chartData, labels });
        } catch (error: any) {
            logger.error(error);
        } finally {
            this.setState({ loading: false });
        }
    };

    private getCoinGeckoId(symbol: Coin): string {
        const mapping: Partial<Record<Coin, string>> = {
            BTC: "bitcoin",
            ETH: "ethereum",
            USDC: "usd-coin",
            USDT: "tether",
        };
        return mapping[symbol] || "";
    }

    render(): React.ReactNode {
        const { visible, onClose, currency } = this.props;
        const { loading, chartData, labels } = this.state;
        const screenWidth = Dimensions.get("window").width;

        return (
            <Modal transparent={true} visible={visible} animationType="slide">
                <TouchableWithoutFeedback onPress={onClose}>
                    <ThemedView style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <ThemedView style={styles.dialogContainer}>
                                <ThemedView style={styles.header}>
                                    <ThemedView style={styles.headerIconPlaceholder} />
                                    <ThemedText style={styles.headerText}>{currency.currency} Overview</ThemedText>
                                    <Pressable onPress={onClose}>
                                        <Image
                                            source={require("../../assets/icons/close.svg")}
                                            style={{ width: 24, height: 24 }}
                                            tintColor={this.appearance === "dark" ? "#FFF" : "#000"} />
                                    </Pressable>
                                </ThemedView>

                                <ThemedView>
                                    {loading && <ActivityIndicator size={20} color={Colors.blue} />}
                                    {!loading && (
                                        <LineChart
                                            data={{
                                                labels: labels,
                                                datasets: [{ data: chartData }]
                                            }}
                                            width={screenWidth * 0.9}
                                            height={200}
                                            yAxisLabel="$"
                                            chartConfig={{
                                                backgroundColor: "transparent",
                                                backgroundGradientFrom: "transparent",
                                                backgroundGradientTo: "transparent",
                                                decimalPlaces: 2,
                                                color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
                                                labelColor: (opacity = 1) => `rgba(225, 225, 225, ${opacity})`,
                                                style: { borderRadius: 10 },
                                                propsForDots: { r: "4", strokeWidth: "2", stroke: "#007bff" }
                                            }}
                                            bezier
                                            style={{ marginVertical: 8, borderRadius: 10, backgroundColor: "transparent", }}
                                        />
                                    )}
                                </ThemedView>

                            </ThemedView>
                        </TouchableWithoutFeedback>
                    </ThemedView>
                </TouchableWithoutFeedback>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    dialogContainer: {
        width: "100%",
        height: "35%",
        padding: 20,
        borderRadius: 10,
        alignItems: "flex-start",
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 16,
        width: "100%"
    },
    headerText: {
        fontSize: 16,
        fontFamily: 'AeonikMedium',
        lineHeight: 20,
    },
    headerIconPlaceholder: {
        height: 24,
        width: 24,
    },
});
