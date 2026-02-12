import { IMarket } from "@/interface/interface";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    TouchableWithoutFeedback
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import ThemedText from "../ThemedText";
import ThemedView from "../ThemedView";

interface GraphDialogProps {
    visible: boolean;
    asset: IMarket;
    onClose: () => void;
}

// Map currency symbols to CoinGecko IDs
const CURRENCY_ID_MAP: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'BUSD': 'binance-usd',
    'XRP': 'ripple',
    'DOGE': 'dogecoin',
    'BCH': 'bitcoin-cash',
    'TRX': 'tron',
    'SOL': 'solana',
    'MATIC': 'matic-network',
    'DAI': 'dai',
    'SHIB': 'shiba-inu',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'AVAX': 'avalanche-2',
    'WBTC': 'wrapped-bitcoin',
};

const RANGES = [
    { label: '1H', days: '0.0417', interval: null },
    { label: '1D', days: '1', interval: null },
    { label: '1W', days: '7', interval: null },
    { label: '1M', days: '30', interval: 'daily' },
    { label: '1Y', days: '365', interval: 'daily' },
    { label: 'All', days: 'max', interval: 'daily' },
];

const GraphShimmer = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [shimmerAnim]);

    const translateX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 300],
    });

    return (
        <ThemedView style={styles.shimmerContainer}>
            <ThemedView style={styles.shimmerGraphArea}>
                <ThemedView style={styles.shimmerGraphLine} />
                <Animated.View
                    style={[
                        styles.shimmerOverlay,
                        { transform: [{ translateX }] },
                    ]}
                />
            </ThemedView>
        </ThemedView>
    );
};

export default function GraphModal({ visible, asset, onClose }: GraphDialogProps): React.ReactNode {
    const [isLoading, setIsLoading] = useState(true);
    const [chartData, setChartData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedRange, setSelectedRange] = useState('1D');
    const [graphColor, setGraphColor] = useState('#0A7826'); // Default green
    const [percentageChange, setPercentageChange] = useState(0);

    const getCoinGeckoId = (): string => {
        const symbol = String(asset.currency || "").toUpperCase();
        if (CURRENCY_ID_MAP[symbol]) return CURRENCY_ID_MAP[symbol];

        const name = String(asset.name || "").toLowerCase().trim();
        if (name.includes('tether') || name.includes('usdt')) return 'tether';
        if (name.includes('usd coin') || name === 'usdc') return 'usd-coin';
        if (name.includes('binance usd') || name === 'busd') return 'binance-usd';
        if (name.includes('bitcoin cash') || name === 'bch') return 'bitcoin-cash';
        if (name.includes('wrapped bitcoin') || name === 'wbtc') return 'wrapped-bitcoin';
        if (name === 'bitcoin' || name === 'btc') return 'bitcoin';
        if (name === 'ethereum' || name === 'eth') return 'ethereum';
        if (name === 'binance' || name === 'bnb') return 'binancecoin';
        if (name === 'ripple' || name === 'xrp') return 'ripple';
        if (name === 'dogecoin' || name === 'doge') return 'dogecoin';
        if (name === 'tron' || name === 'trx') return 'tron';
        if (name === 'solana' || name === 'sol') return 'solana';

        return name.replace(/\s+/g, '-');
    };

    const fetchChartData = async (rangeLabel: string = selectedRange) => {
        setIsLoading(true);
        setError(null);

        try {
            const coinId = getCoinGeckoId();
            const range = RANGES.find(r => r.label === rangeLabel) || RANGES[1];

            const paramsOb: any = {
                vs_currency: 'usd',
                days: range.days,
            };
            if (range.interval) paramsOb.interval = range.interval;

            const params = new URLSearchParams(paramsOb).toString();
            const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?${params}`;

            const response = await fetch(url, { method: 'GET' });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Chart data not available for this currency');
                }
                throw new Error(`Failed to fetch chart data`);
            }

            const data = await response.json();

            if (!data.prices || data.prices.length === 0) {
                throw new Error('No price data available');
            }

            const prices = data.prices;

            // Calculate trend and color
            const startPrice = prices[0][1];
            const endPrice = prices[prices.length - 1][1];
            // Calculate percentage change for the selected period
            const change = ((endPrice - startPrice) / startPrice) * 100;
            const isPositive = change >= 0;

            setGraphColor(isPositive ? '#0A7826' : '#DC2626'); // Green or Red
            setPercentageChange(change);

            const datasetData: number[] = [];
            // Sample data to max ~50 points for performance and smoothness
            const maxPoints = 50;
            const step = Math.max(1, Math.floor(prices.length / maxPoints));

            for (let i = 0; i < prices.length; i += step) {
                datasetData.push(prices[i][1]);
            }

            // Always include the very last price point to be accurate
            if (datasetData[datasetData.length - 1] !== endPrice) {
                datasetData.push(endPrice);
            }

            setChartData({
                labels: [], // No labels as requested
                datasets: [{ data: datasetData }],
            });

        } catch (error: any) {
            console.error('Error fetching chart data:', error);
            setError(error.message || 'Unable to load chart data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (visible && asset) {
            fetchChartData(selectedRange);
        }
    }, [visible, asset, selectedRange]);

    if (!visible) return null;

    // Use current stored price or calculate from last fetch? 
    // Usually asset.price is the live price from dashboard.
    const currentPrice = asset.price || 0;

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
            presentationStyle='overFullScreen'
            statusBarTranslucent={true}>
            <TouchableWithoutFeedback onPress={onClose}>
                <ThemedView style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <ThemedView style={styles.dialogContainer}>
                            <ThemedView style={styles.header}>
                                <ThemedView style={styles.headerIconPlaceholder} />
                                <ThemedText style={styles.headerText}>{asset.name} ({String(asset.currency).toUpperCase()})</ThemedText>
                                <Pressable onPress={onClose}>
                                    <Image
                                        source={require("../../assets/icons/close.svg")}
                                        style={{ width: 24, height: 24 }}
                                        tintColor={"#fff"} />
                                </Pressable>
                            </ThemedView>

                            <ThemedView style={styles.priceInfoCentered}>
                                <ThemedText style={styles.currentPriceLarge}>
                                    {currentPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </ThemedText>
                                <ThemedText
                                    style={{
                                        ...styles.percentChangeLarge,
                                        color: graphColor,
                                    }}
                                >
                                    {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%
                                </ThemedText>
                            </ThemedView>

                            <ThemedView style={styles.chartContainer}>
                                {isLoading ? (
                                    <GraphShimmer />
                                ) : error ? (
                                    <ThemedView style={styles.errorContainer}>
                                        <ThemedText style={styles.errorText}>{error}</ThemedText>
                                        <Pressable onPress={() => fetchChartData(selectedRange)} style={styles.retryButton}>
                                            <ThemedText style={styles.retryText}>Retry</ThemedText>
                                        </Pressable>
                                    </ThemedView>
                                ) : chartData ? (
                                    <LineChart
                                                data={chartData}
                                                width={Dimensions.get('window').width * 0.9} // 90% width
                                                height={220}
                                                withDots={false}
                                                getDotColor={() => graphColor}
                                                withInnerLines={false}
                                                withOuterLines={false}
                                                withVerticalLabels={false}
                                                withHorizontalLabels={false}
                                                withVerticalLines={false}
                                                withHorizontalLines={false}
                                                withShadow={true}
                                                chartConfig={{
                                            backgroundColor: '#ffffff',
                                            backgroundGradientFrom: '#ffffff',
                                            backgroundGradientTo: '#ffffff',
                                            decimalPlaces: 2,
                                                    // @ts-ignore
                                                    color: (opacity = 1) => graphColor,
                                                    // @ts-ignore
                                                    labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
                                                    propsForDots: { r: '0' },
                                                    fillShadowGradient: graphColor,
                                                    fillShadowGradientOpacity: 0.1,
                                                    fillShadowGradientFrom: graphColor,
                                                    fillShadowGradientTo: '#ffffff',
                                                }}
                                                bezier
                                                style={styles.chart}
                                            />
                                ) : null}
                            </ThemedView>

                            <ThemedView style={styles.rangeSelector}>
                                {RANGES.map((range) => (
                                    <Pressable
                                        key={range.label}
                                        style={[
                                            styles.rangeButton,
                                            selectedRange === range.label && { backgroundColor: '#F3F4F6' }
                                        ]}
                                        onPress={() => setSelectedRange(range.label)}
                                    >
                                        <ThemedText style={[
                                            styles.rangeText,
                                            selectedRange === range.label && { color: '#1F1F1F', fontFamily: 'AeonikBold' }
                                        ]}>
                                            {range.label}
                                        </ThemedText>
                                    </Pressable>
                                ))}
                            </ThemedView>

                        </ThemedView>
                    </TouchableWithoutFeedback>
                </ThemedView>
            </TouchableWithoutFeedback>
        </Modal>
    );
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
        height: "55%", // Increased height to fit new UI
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: "center", // Centered content
        backgroundColor: "#000"
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
        color: "white"
    },
    headerIconPlaceholder: {
        height: 24,
        width: 24,
    },
    priceInfoCentered: {
        alignItems: 'center',
        marginBottom: 20,
    },
    currentPriceLarge: {
        fontSize: 32,
        fontFamily: 'AeonikBold',
        color: 'white',
    },
    percentChangeLarge: {
        fontSize: 14,
        fontFamily: 'AeonikMedium',
        marginTop: 4,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 220,
        width: '100%',
    },
    chart: {
        paddingRight: 0,
        paddingLeft: 0,
        borderRadius: 16
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: '#ff4d4d',
        marginBottom: 10,
        fontFamily: 'AeonikRegular',
    },
    retryButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#333',
        borderRadius: 8,
    },
    retryText: {
        color: 'white',
        fontFamily: 'AeonikMedium',
    },
    rangeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
        backgroundColor: '#1A1A1A', // Dark background for selector
        borderRadius: 12,
        padding: 4,
    },
    rangeButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    rangeText: {
        fontSize: 12,
        color: 'white', // Default text color
        fontFamily: 'AeonikRegular',
    },
    // Shimmer styles
    shimmerContainer: {
        height: 200,
        width: '100%',
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shimmerGraphArea: {
        width: '90%',
        height: '60%',
        backgroundColor: '#2A2A2A',
        borderRadius: 8,
        overflow: 'hidden',
    },
    shimmerGraphLine: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#333',
    },
    shimmerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
});
