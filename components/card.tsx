import React from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import { IMarket, IParams, UserData } from '@/interface/interface';
import { router } from 'expo-router';
import ThemedView from './ThemedView';
import ThemedText from './ThemedText';
import Defaults from '@/app/default/default';
import sessionManager from '@/session/session';

export interface ICard {
    item: IMarket;
}

class Card extends React.Component<ICard> {
    private session: UserData = sessionManager.getUserData();
    constructor(props: ICard) {
        super(props);
        this.calculatePercentageChange = this.calculatePercentageChange.bind(this);
    }

    calculatePercentageChange(percentChange: number): string {
        if (percentChange === undefined || percentChange === null) {
            return 'N/A';
        }
        return percentChange.toFixed(2) + '%';
    }

    private handleSelectedCoin = async () => {
        const { item } = this.props;
        const market: IMarket = Defaults.FIND_MARKET(item.currency, item.network);
        const params: IParams = { currency: market.currency, network: market.network };
        await sessionManager.updateSession({ ...this.session, params: params });
        router.navigate("/coin");
    }

    render() {
        const { item } = this.props;
        const volumeChange24h = this.calculatePercentageChange(item.percent_change_24h);

        return (
            <Pressable
                style={styles.cardContainer}
                onPress={this.handleSelectedCoin}>
                <Image source={{ uri: item.icon }} style={styles.logo} />
                <ThemedView style={styles.textContainer}>
                    <ThemedText style={styles.symbolText}>{item.currency}</ThemedText>
                    <ThemedText style={styles.priceText}>
                        {item.price.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                        })}
                    </ThemedText>
                    <ThemedView style={styles.changeContainer}>
                        {item.percent_change_24h >= 0 ? (
                            <Image
                                source={this.appreance === "dark"
                                    ? require("../assets/icons/positive.svg")
                                    : require("../assets/icons/positive.svg")}
                                style={{ width: 15, height: 15, transform: [{ rotate: "180deg" }] }} />
                        ) : (
                            <Image
                                source={this.appreance === "dark"
                                    ? require("../assets/icons/negative.svg")
                                    : require("../assets/icons/negative.svg")}
                                style={{ width: 15, height: 15, transform: [{ rotate: "180deg" }] }} />
                        )}
                        <ThemedText
                            style={{
                                color: item.percent_change_24h >= 0 ? '#28806F' : 'red',
                                ...styles.changeText,
                            }}
                        >
                            {volumeChange24h}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            </Pressable>
        );
    }
}

const styles = StyleSheet.create({
    cardContainer: {
        padding: 12,
        gap: 12,
        borderRadius: 12,
        width: '48%',
        margin: 4,
        flexDirection: "column",
        alignItems: "flex-start",
        backgroundColor: '#F5F5F5',
    },
    logo: {
        width: 20,
        height: 20,
    },
    textContainer: {
        gap: 4,
        backgroundColor: "transparent",
    },
    symbolText: {
        color: '#757575',
        fontSize: 10,
        fontFamily: 'AeonikRegular',
    },
    priceText: {
        fontFamily: 'AeonikMedium',
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: -0.16,
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: "transparent",
    },
    changeText: {
        fontFamily: 'AeonikRegular',
        fontSize: 10,
    },
});

export default Card;
