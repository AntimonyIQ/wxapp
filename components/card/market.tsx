import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, } from 'react-native';
import ThemedText from '../ThemedText';
import ThemedView from '../ThemedView';

interface IMarket {
    key: string;
    icon: string;
    subHead: string;
    header: string;
    price: string;
    wallet?: boolean;
    percentage: number;
    balanceAmount: string;
    balanceInUsd?: string;
    isToken?: boolean;
    networkLogoURI?: string;
}

interface MarketProps {
    market: IMarket;
    onPress: () => void;
    hideBalance: boolean;
}

export default class MarketCard extends React.Component<MarketProps> {
    render() {
        const { market, onPress, hideBalance } = this.props;

        return (
            <Pressable
                onPress={onPress}
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 9,
                    alignItems: 'center',
                }}>
                <ThemedView style={{ flexDirection: 'row', gap: 12, backgroundColor: "transparent", alignItems: "center" }}>
                    {/* Render icon with network overlay for tokens */}
                    {market.isToken && market.networkLogoURI ? (
                        <ThemedView style={{ position: 'relative', width: 35, height: 35, backgroundColor: "transparent" }}>
                            <Image source={{ uri: market.icon }} style={styles.logo} />
                            <Image
                                source={{ uri: market.networkLogoURI }}
                                style={styles.networkIconOverlay}
                            />
                        </ThemedView>
                    ) : (
                        <Image source={{ uri: market.icon }} style={styles.logo} />
                    )}
                    <ThemedView style={{ flexDirection: "column", gap: 0, backgroundColor: "transparent" }}>
                        <ThemedView style={{ flexDirection: "row", gap: 3, alignItems: "flex-start", backgroundColor: "transparent" }}>
                            <ThemedText
                                style={{
                                    fontSize: 14,
                                    fontFamily: 'AeonikMedium',
                                }}>
                                {market.subHead}
                            </ThemedText>
                            <ThemedText
                                style={{
                                    fontSize: 9,
                                    fontFamily: 'AeonikRegular',
                                    borderRadius: 4,
                                    backgroundColor: "#f1f1f1",
                                    padding: 2,
                                    paddingHorizontal: 5
                                }}
                            >
                                {market.header}
                            </ThemedText>
                        </ThemedView>
                        <ThemedView style={{ flexDirection: "row", gap: 5, alignItems: "center", backgroundColor: "transparent" }}>
                            <ThemedText
                                style={{
                                    fontSize: 12,
                                    fontFamily: 'AeonikMedium',
                                    color: "#8E8E93"
                                }}
                            >
                                ${market.price}
                            </ThemedText>
                            {market.wallet && (
                                <ThemedText
                                    style={{
                                        fontSize: 12,
                                        fontFamily: 'AeonikRegular',
                                        color: market.percentage >= 0 ? '#0A7826' : 'red',
                                        textAlign: 'right',
                                    }} >
                                    {market.percentage >= 0 && '+'}
                                    {market.percentage}%
                                </ThemedText>
                            )}
                        </ThemedView>
                    </ThemedView>
                </ThemedView>

                <ThemedView style={{ gap: 7, flexDirection: "column", alignItems: "flex-end", justifyContent: "flex-end", backgroundColor: "transparent" }}>
                    <ThemedText
                        style={{
                            fontSize: 14,
                            fontFamily: 'AeonikMedium',
                        }}>
                        {hideBalance ? "● ● ● ● ●" : `${market.balanceAmount} ${market.subHead}`}
                    </ThemedText>
                    {market.wallet && (
                        <ThemedText
                            style={{
                                fontSize: 12,
                                fontFamily: 'AeonikRegular',
                                color: "#757575",
                                textAlign: 'right',
                            }}>
                            {hideBalance ? "● ● ● ● ●" : `$${market.balanceInUsd}`}
                        </ThemedText>
                    )}
                </ThemedView>
            </Pressable >
        );
    }
}

const styles = StyleSheet.create({
    logo: {
        width: 35,
        height: 35,
        marginBottom: 10,
        borderRadius: 17.5,
    },
    networkIconOverlay: {
        width: 16,
        height: 16,
        borderRadius: 8,
        position: 'absolute',
        right: -2,
        bottom: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
});

