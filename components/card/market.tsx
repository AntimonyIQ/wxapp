import { Image } from 'expo-image';
import React, { Component } from 'react';
import { Appearance, ColorSchemeName, Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Colors } from '@/constants/Colors';

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
}

interface MarketProps {
    market: IMarket;
    onPress: () => void;
    hideBalance: boolean;
}

export default class MarketCard extends React.Component<MarketProps> {
    private appreance: ColorSchemeName = Appearance.getColorScheme();
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
                <ThemedView style={{ flexDirection: 'row', gap: 12, backgroundColor: "transparent" }}>
                    <Image source={{ uri: market.icon }} style={styles.logo} />
                    <ThemedView style={{ flexDirection: "column", gap: 10, backgroundColor: "transparent" }}>
                        <ThemedView style={{ flexDirection: "row", gap: 7, alignItems: "flex-start", backgroundColor: "transparent" }}>
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
                                    backgroundColor: this.appreance === "dark" ? Colors.dark.background : "#f1f1f1",
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
                                {market.price}
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
                        {hideBalance ? "****" : market.balanceAmount}
                    </ThemedText>
                    {market.wallet && (
                        <ThemedText
                            style={{
                                fontSize: 12,
                                fontFamily: 'AeonikRegular',
                                color: "#757575",
                                textAlign: 'right',
                            }}>
                            {hideBalance ? "****" : market.balanceInUsd}
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
    },
});

