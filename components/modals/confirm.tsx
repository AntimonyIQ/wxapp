import { ColorSchemeName, Modal, Platform, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import React from 'react';
import { IList, IMarket, UserData } from '@/interface/interface';
import sessionManager from '@/session/session';
import logger from '@/logger/logger';
import { router } from 'expo-router';
import Defaults from '@/app/default/default';
import { Image } from 'expo-image';
import { Coin } from '@/enums/enums';
import ThemedView from '../ThemedView';
import ThemedText from '../ThemedText';

interface IConfirm {
    visible: boolean;
    onConfirm: () => void;
    onClose: () => void;
    list?: Array<Partial<IList>>;
    amount: string;
    dollarEquiv: number;
    title?: string;
    message?: string;
    asset: IMarket;
}

export default class ConfirmModal extends React.Component<IConfirm> {
    private session: UserData = sessionManager.getUserData();
    constructor(props: IConfirm) {
        super(props);
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.navigate("/");
        };
    }

    componentDidMount() { logger.clear(); }

    private formatToMoneyString = (money: number) => {
        const { asset } = this.props;
        if (asset.currency === Coin.USDT || asset.currency === Coin.USDC) {
            return Number(money.toFixed(2)).toLocaleString(undefined, {
                minimumFractionDigits: Defaults.MIN_DECIMAL,
                maximumFractionDigits: Defaults.MIN_DECIMAL
            });
        } else {
            return money.toLocaleString(undefined, {
                minimumFractionDigits: Defaults.MIN_DECIMAL,
                maximumFractionDigits: Defaults.DECIMAL
            });
        }
    }

    render() {
        const { asset } = this.props;
        const { visible, onClose, onConfirm, list, dollarEquiv, amount, title, message } = this.props;
        return (
            <>
                <Modal
                    visible={visible}
                    transparent={true}
                    animationType='slide'
                    presentationStyle='overFullScreen'
                >
                    <TouchableWithoutFeedback onPress={onClose}>
                        <ThemedView style={styles.modalOverlay}>
                            <TouchableWithoutFeedback onPress={(): void => { }}>
                                <ThemedView style={styles.modalContent}>
                                    <ThemedView style={styles.header}>
                                        <ThemedText></ThemedText>
                                        <ThemedText style={styles.headerTitle}>
                                            {title ? title : "Confirm Transaction"}
                                        </ThemedText>
                                        <Pressable
                                            style={styles.closeButton}
                                            onPress={onClose}
                                        >
                                            <Image
                                                source={require("../../assets/icons/close.svg")}
                                                style={{ width: 24, height: 24 }}
                                                tintColor={"#000"} />
                                        </Pressable>
                                    </ThemedView>
                                    <ThemedView style={styles.separator} />
                                    <ThemedView style={styles.confirmContainer}>
                                        <ThemedView style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 5 }}>
                                            <ThemedText style={{ color: "#757575", fontSize: 12, fontFamily: 'AeonikRegular' }}>{message ? message : "You are about to send"}</ThemedText>
                                            <ThemedText style={{ fontSize: 32, lineHeight: 32, fontFamily: 'AeonikMedium' }}>{amount} {asset.currency}</ThemedText>
                                            <ThemedText style={{ color: "#757575", fontSize: 12, fontFamily: 'AeonikRegular' }}>${this.formatToMoneyString(dollarEquiv)}</ThemedText>
                                        </ThemedView>
                                        <ThemedView style={{ backgroundColor: '#F7F7F7', borderRadius: 12, width: '100%', padding: 13, flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
                                            {list && list.length > 0 && list.map((item, index) => (
                                                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: "100%" }}>
                                                    <ThemedText style={{ fontFamily: 'AeonikRegular', }}>{item.name}</ThemedText>
                                                    <ThemedText style={{ fontFamily: 'AeonikRegular', }}>{item.description}</ThemedText>
                                                </View>
                                            ))}
                                        </ThemedView>
                                    </ThemedView>
                                    <View style={styles.nextButtonContainer}>
                                        <Pressable
                                            style={[styles.nextButton, { backgroundColor: '#FBA91E' }]}
                                            onPress={onConfirm}>
                                            <Text style={styles.nextButtonText}> Continue </Text>
                                        </Pressable>
                                    </View>
                                </ThemedView>
                            </TouchableWithoutFeedback>
                        </ThemedView>
                    </TouchableWithoutFeedback>
                </Modal>
            </>
        );
    }
}

const styles = StyleSheet.create({
    modalOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
    },
    modalContent: {
        minHeight: Platform.OS === "web" ? '68%' : '58%',
        maxHeight: '80%',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        backgroundColor: "#FFFFFF"
    },
    header: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        height: 64,
    },
    headerTitle: {
        fontFamily: 'AeonikMedium',
        fontSize: 16,
        lineHeight: 20,
    },
    closeButton: {
        right: 0,
        padding: 4,
        borderRadius: 100,
        backgroundColor: '#E8E8E8',
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: '#E8E8E8',
    },
    confirmContainer: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 20,
        gap: 20
    },
    nextButtonContainer: {
        paddingHorizontal: 16,
        position: 'absolute',
        bottom: 32,
        width: '100%',
    },
    nextButton: {
        paddingHorizontal: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    nextButtonText: {
        color: '#1F1F1F',
        fontFamily: 'AeonikMedium',
        fontSize: 16,
        lineHeight: 20,
    },
    priceInfo: {
        marginTop: 20,
        paddingHorizontal: 16,
        gap: 8,
    },
    currentPriceLabel: {
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        color: '#757575',
        lineHeight: 14,
    },
    priceRow: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    },
    currentPrice: {
        fontFamily: 'AeonikMedium',
        fontSize: 24,
        color: '#1F1F1F',
    },
    percentChange: {
        fontFamily: 'AeonikMedium',
        fontSize: 12,
    },
    chartContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
});
