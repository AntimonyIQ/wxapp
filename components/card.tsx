import Defaults from '@/app/default/default';
import { IMarket, IParams, UserData } from '@/interface/interface';
import sessionManager from '@/session/session';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import ThemedText from './ThemedText';
import ThemedView from './ThemedView';
import { getAssetLogoURI } from '@/data/assets';

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
        // Use legacy logic for displayed change value if desired, or stick to percent_change_24h formatted nicely.
        // Card.js uses item.volume_change_24h.toFixed(2).
        // Card.tsx previously used percent_change_24h.toFixed(2) + '%'.
        // I will follow Card.js visual structure but improve the data if needed.
        // Legacy Card.js Code: {Number(item?.volume_change_24h || 0).toFixed(2)}

        // However, usually volume change is large number, percent change is small. 
        // Based on "item.percent_change_24h >= 0" check for color, it implies we want to show percent change or something related to it.
        // I'll stick to item.volume_change_24h to match legacy EXACTLY as requested ("USE IT TO CORRECT THE CARD.TSX").

        const changeValue = Number(item.volume_change_24h || 0).toFixed(2);

        return (
            <Pressable
                style={styles.cardContainer}
                onPress={this.handleSelectedCoin}>
                <Image source={{ uri: getAssetLogoURI(item.currency) || item.icon }} style={styles.logo} />
                <ThemedView style={styles.textContainer}>
                    <ThemedText style={styles.nameText}>{item.name}</ThemedText>
                    <ThemedView style={styles.priceVolumeRow}>
                        <ThemedText style={styles.priceText}>
                            {Number(item.price || 0).toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                            })}
                        </ThemedText>
                        <ThemedView style={styles.changeContainer}>
                            {item.percent_change_24h >= 0 ? (
                                <Image
                                    source={require("../assets/icons/positive.svg")}
                                    style={{ width: 14, height: 14 }} />
                            ) : (
                                <Image
                                    source={require("../assets/icons/negative.svg")}
                                    style={{ width: 14, height: 14 }} />
                            )}
                            <ThemedText
                                style={{
                                    color: item.percent_change_24h >= 0 ? '#28806F' : 'red',
                                    ...styles.changeText,
                                }}
                            >
                                {changeValue}
                            </ThemedText>
                        </ThemedView>
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
        backgroundColor: 'white',
        width: 160,
        marginRight: 8,
    },
    logo: {
        width: 20,
        height: 20,
    },
    textContainer: {
        gap: 4,
        backgroundColor: 'transparent',
    },
    nameText: {
        color: '#757575',
        fontSize: 10,
        fontFamily: 'AeonikRegular',
        textTransform: 'uppercase',
    },
    priceVolumeRow: {
        flexDirection: 'row',
        alignItems: "flex-end",
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
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
        backgroundColor: 'transparent',
    },
    changeText: {
        fontFamily: 'AeonikRegular',
        fontSize: 10,
    },
});

export default Card;
