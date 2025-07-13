import React from "react";
import sessionManager from "@/session/session";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { Appearance, ColorSchemeName, Platform, Pressable, StyleSheet, Vibration } from "react-native";
import { Image } from "expo-image";
import Defaults from "../default/default";
import * as Clipboard from 'expo-clipboard';
import Toast from "react-native-toast-message";
import PrimaryButton from "@/components/button/primary";
import { UserData } from "@/interface/interface";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import { Coin } from "@/enums/enums";

interface IProps { }

interface IState { }

export default class SendSuccessScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private coin: ISelectedCoin;
    private send: ISend;
    private readonly title = "Send Success";
    constructor(props: IProps) {
        super(props);
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
        this.coin = this.session.selectedCoin;
        this.send = this.session.sendTransaction;
    }

    componentDidMount(): void {
        logger.clear();
    }

    private copy = async () => {
        const { address } = this.send
        await Clipboard.setStringAsync(address);

        const vibrationPattern = [0, 5];
        Vibration.vibrate(vibrationPattern, false);

        Toast.show({
            type: 'success',
            text1: 'Copied',
            text2: `copied: ${address}`,
            text1Style: { fontSize: 16, fontFamily: 'AeonikBold' },
            text2Style: { fontSize: 12, fontFamily: 'AeonikRegular' },
        });
    };

    render(): React.ReactNode {
        const { currency } = this.coin;
        const { value, address } = this.send;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.container}>
                    <ThemedView style={styles.content}>

                        <ThemedView style={styles.iconContainer}>
                            <Image
                                source={require("../../assets/images/sales.png")}
                                style={{ width: 180, height: 180 }}
                                tintColor={this.appreance === "dark" ? "#f5f8ff" : "#111827"}
                                transition={500} />
                            <ThemedView style={styles.textContainer}>
                                <ThemedText style={styles.title}>
                                    Your transaction is being processed
                                </ThemedText>
                                <ThemedText style={styles.subtitle}>
                                    We'll notify you once it's completed. Thank you for your patience!
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>

                        <ThemedView style={styles.amountContainer}>
                            <ThemedText style={styles.label}>You sent</ThemedText>
                            <ThemedText style={styles.amount}>{(value ? value : 0).toLocaleString(undefined,
                                {
                                    minimumFractionDigits: Defaults.MIN_DECIMAL,
                                    maximumFractionDigits: currency.symbol === Coin.USDC || currency.symbol === Coin.USDT ? 2 : 8
                                })} {currency.symbol}</ThemedText>
                        </ThemedView>

                        <ThemedView style={styles.ethAddressContainer}>
                            <ThemedView style={styles.ethIconContainer}>
                                <Image
                                    source={{ uri: currency.logoUrl }}
                                    style={{ width: 16, height: 16 }} />
                                <ThemedText style={styles.ethLabel}>
                                    {currency.symbol} Destination Wallet {currency.symbol === "NGN" ? "tag" : "address"}
                                </ThemedText>
                            </ThemedView>
                            <Pressable
                                style={styles.addressPressable}
                                onPress={() => this.copy()}
                            >
                                <ThemedText style={styles.addressText}>{address}</ThemedText>
                                <ThemedView style={styles.copyButton}>
                                    <ThemedText>copy</ThemedText>
                                </ThemedView>
                            </Pressable>
                        </ThemedView>

                        <ThemedView style={styles.buttonContainer}>
                            <PrimaryButton onPress={(): void => { router.push("/dashboard"); }} Gradient title={'Done'} />
                        </ThemedView>

                    </ThemedView>
                </ThemedSafeArea>
            </>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Platform.OS === 'android' ? 50 : Platform.OS === "web" ? 20 : 0,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 44,
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    title: {
        fontSize: 20,
        fontFamily: 'AeonikBold',
        color: Appearance.getColorScheme() === "dark" ? '#f8faff' : '#111827',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: Appearance.getColorScheme() === "dark" ? '#a3adc2' : '#6B7280',
        lineHeight: 18,
        fontFamily: 'AeonikRegular',
        textAlign: 'center',
    },
    amountContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    label: {
        fontSize: 14,
        color: Appearance.getColorScheme() === "dark" ? '#d2d2d2' : '#757575',
        lineHeight: 14,
        fontFamily: 'AeonikRegular',
    },
    amount: {
        fontSize: 40,
        lineHeight: 48,
        fontFamily: 'AeonikBold',
        marginTop: 8,
    },
    ethAddressContainer: {
        marginTop: 24,
        width: '100%',
        paddingHorizontal: 16,
    },
    ethIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 4,
    },
    ethLabel: {
        fontSize: 12,
        lineHeight: 14,
        fontFamily: 'AeonikRegular',
    },
    addressPressable: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 21,
        width: '100%',
        backgroundColor: Appearance.getColorScheme() === "dark" ? '#010101' : '#F7F7F7',
        borderRadius: 12,
        marginTop: 12,
    },
    addressText: {
        fontFamily: 'AeonikRegular',
        fontSize: 12,
        fontStyle: 'normal',
        lineHeight: 14,
    },
    copyButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 99,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        paddingHorizontal: 16,
    },
});