import React from "react";
import sessionManager from "@/session/session";
import { IBank, IList, IUser, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { Appearance, ColorSchemeName, Platform, StyleSheet, TouchableOpacity, Vibration } from "react-native";
import MessageModal from "@/components/modals/message";
import { Image } from "expo-image";
import PrimaryButton from "@/components/button/primary";
import LoadingModal from "@/components/modals/loading";
import { Colors } from "@/constants/Colors";
import { Pressable } from "react-native";
import * as Clipboard from 'expo-clipboard';
import Toast from "react-native-toast-message";
import Defaults from "../default/default";
import banks from "../data/banks.json";
import ListModal from "@/components/modals/list";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import { Coin } from "@/enums/enums";

interface IProps { }

interface IState {
    error_modal: boolean;
    message_type: MessageModalType;
    error_title: string;
    error_message: string;
    loading: boolean;
    amount: string;
    accounts: Array<IBank>;
    lists: Array<IList>;
    loadingAccounts: boolean;
    list_modal: boolean;
    selected: IBank | undefined;
}

export default class WithdrawAccountScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Withdraw";
    private user: IUser;
    private withdrawal: IWithdrawal;
    constructor(props: IProps) {
        super(props);
        this.state = {
            error_modal: false,
            message_type: MessageModalType.ERROR,
            error_message: "",
            error_title: "",
            loading: false,
            amount: "",
            accounts: [],
            lists: [],
            loadingAccounts: true,
            list_modal: false,
            selected: undefined,
        };
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
        this.user = this.session.user as IUser;
        this.withdrawal = this.session.withdrawal;
    }

    componentDidMount(): void {
        this.fetchAccounts();
    }

    private copyToClipboard = async (): Promise<void> => {
        const { tagName } = this.user;
        await Clipboard.setStringAsync(tagName);

        const vibrationPattern = [0, 5];
        Vibration.vibrate(vibrationPattern, false);
        Toast.show({
            type: 'success',
            text1: 'Copied',
            text2: 'copied user tag: ' + tagName,
            text1Style: { fontSize: 16, fontFamily: 'AeonikBold' },
            text2Style: { fontSize: 12, fontFamily: 'AeonikRegular' },
        });
    };

    private localbanks = (code: string): ILocalBankData => {
        const bank = banks.find((bank) => bank.code === code);
        if (!bank) throw new Error(`Bank with code ${code} not found.`);
        return bank as ILocalBankData;
    }

    private fetchAccounts = async (): Promise<void> => {
        try {
            this.setState({ loadingAccounts: true });

            const response = await fetch(`${Defaults.API}/banking/accounts/`, {
                method: "GET",
                headers: { ...Defaults.HEADERS, "Authorization": `Bearer ${this.session.accessToken}` },
            });

            if (!response.ok) throw new Error("response failed with status: " + response.status);

            const data = await response.json();

            if (data.status === "success") {
                const accounts: IBank[] = data.data || [];
                const lists: IList[] = accounts.map((account: IBank) => ({
                    name: account.bankName,
                    description: account.accountNumber,
                    icon: `https://cdn.jsdelivr.net/gh/supermx1/nigerian-banks-api@main/logos/${this.localbanks(account.bankCode).slug}.png`
                }));
                this.setState({ lists: lists, accounts });
            }
        } catch (error: any) {
            logger.log(error);
        } finally {
            this.setState({ loadingAccounts: false, });
        }
    };

    render(): React.ReactNode {
        const { error_modal, selected, loadingAccounts, list_modal, lists, message_type, error_title, error_message, loading, amount } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.container}>

                    <ThemedView style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Image
                                source={require("../../assets/icons/chevron-left.svg")}
                                style={styles.backIcon}
                                tintColor={this.appreance === "dark" ? Colors.light.background : "#000000"} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.title}>{this.title}</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.content}>
                        <ThemedView
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                                padding: 4,
                            }}
                        >
                            <Image source={{ uri: "https://img.icons8.com/emoji/96/nigeria-emoji.png" }} style={{ width: 15, height: 15 }} />
                            <ThemedText
                                style={{
                                    fontSize: 12,
                                    lineHeight: 14,
                                    fontFamily: 'AeonikRegular',
                                }}
                            >
                                {Coin.NGN} Withdrawal Wallet
                            </ThemedText>
                        </ThemedView>
                        <Pressable
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingHorizontal: 12,
                                paddingVertical: 21,
                                backgroundColor: this.appreance === "dark" ? '#000000' : '#F7F7F7',
                                borderRadius: 12,
                            }}
                        >
                            <ThemedText
                                style={{
                                    fontFamily: 'AeonikRegular',
                                    fontSize: 12,
                                    fontStyle: 'normal',
                                    lineHeight: 14,
                                }}
                            >
                                {this.user.tagName}
                            </ThemedText>

                            <Pressable
                                style={{
                                    paddingVertical: 4,
                                    paddingHorizontal: 8,
                                    borderRadius: 99,
                                    backgroundColor: 'white',
                                }}
                                onPress={this.copyToClipboard}>
                                <ThemedText style={{ color: "#000000" }}>copy</ThemedText>
                            </Pressable>
                        </Pressable>
                    </ThemedView>

                    <ThemedView style={{ marginTop: 40 }}>
                        <ThemedView style={{ gap: 4, paddingHorizontal: 16 }}>
                            <ThemedText
                                style={{
                                    fontSize: 20,
                                    fontFamily: 'AeonikMedium',
                                }}
                            >
                                Select Bank account
                            </ThemedText>
                            <ThemedText
                                style={{
                                    color: '#757575',
                                    fontSize: 14,
                                    fontFamily: 'AeonikRegular',
                                    lineHeight: 16,
                                }}>
                                Choose the account you wish to receive your funds to
                            </ThemedText>
                        </ThemedView>
                        <ThemedView style={{ marginTop: 20, marginHorizontal: 16, gap: 26 }}>
                            <Pressable
                                onPress={(): void => this.setState({ list_modal: true })}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 20,
                                    borderRadius: 12,
                                    backgroundColor: this.appreance === "dark" ? '#000000' : '#F7F7F7',
                                }}
                            >
                                <ThemedText
                                    style={{
                                        fontSize: 14,
                                        lineHeight: 16,
                                        fontFamily: 'AeonikRegular',
                                        color: '#757575',
                                        fontWeight: '400',
                                    }}
                                >
                                    {selected ? "******" + selected.accountNumber.slice(-4) + " " + selected.bankName : "Select bank account"}
                                </ThemedText>
                            </Pressable>
                            <PrimaryButton
                                Gradient
                                onPress={async (): Promise<void> => {
                                    const withdrawal: IWithdrawal = { ...this.withdrawal, bank: selected };
                                    await sessionManager.updateSession({ withdrawal: withdrawal });
                                    router.navigate("/withdraw/confirm");
                                }}
                                title={'Continue'} />
                        </ThemedView>
                    </ThemedView>

                    <ListModal
                        visible={list_modal}
                        listChange={(list) => this.setState({ list_modal: false }, async () => {
                            const account: IBank | undefined = this.state.accounts.find((acc: IBank) => acc.accountNumber === list.description);
                            this.setState({ selected: account });
                        })}
                        onClose={() => this.setState({ list_modal: !list_modal })}
                        lists={lists}
                        showSearch={true} />
                    <MessageModal
                        visible={error_modal}
                        type={message_type || MessageModalType.ERROR}
                        onClose={(): void => this.setState({ error_modal: !error_modal }, async () => {
                            if (message_type === MessageModalType.SUCCESS) {
                                router.dismissTo("/dashboard");
                            }
                        })}
                        message={{ title: error_title, description: error_message }} />
                    <LoadingModal loading={loadingAccounts} />
                </ThemedSafeArea>
            </>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 50 : Platform.OS === "web" ? 20 : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: "transparent"
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#000000" : '#f7f7f7',
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
        fontFamily: 'AeonikBold',
    },
    content: {
        marginTop: 46,
        marginHorizontal: 16,
    },
    inputContainer: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#000000" : '#F7F7F7',
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#000000" : '#FFF',
    },
    inputLabel: {
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        color: '#A5A5A5',
        lineHeight: 14,
    },
    currencySelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        padding: 4,
        backgroundColor: 'white',
        gap: 4,
    },
    currencyIcon: {
        width: 12,
        height: 12,
    },
    amountInput: {
        fontSize: 40,
        fontFamily: 'AeonikMedium',
        color: Appearance.getColorScheme() === "dark" ? "#ffffff" : '#000000',
    },
    optionsContainer: {
        marginTop: 14,
        gap: 24,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    optionText: {
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        color: '#A5A5A5',
        lineHeight: 14,
    },
    buyOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buyOption: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#F7F7F7',
        width: 99,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyOptionText: {
        fontFamily: 'AeonikMedium',
        color: '#1F1F1F',
        fontSize: 20,
    },
});