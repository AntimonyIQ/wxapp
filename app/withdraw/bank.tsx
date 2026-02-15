import PrimaryButton from "@/components/button/primary";
import ListModal from "@/components/modals/list";
import MessageModal from "@/components/modals/message";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import SimpleToast, { ToastRef } from "@/components/toast/toast";
import { Coin, Status } from "@/enums/enums";
import { IBank, IList, IUser, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import sessionManager from "@/session/session";
import * as Clipboard from 'expo-clipboard';
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, TouchableOpacity, Vibration } from "react-native";
import banks from "../data/banks.json";
import Defaults from "../default/default";

interface IProps { }

interface IState {
    error_modal: boolean;
    message_type: Status;
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
    private readonly title = "Withdraw";
    private user: IUser;
    private withdrawal: IBank = {} as IBank;
    private toastRef = React.createRef<ToastRef>();

    constructor(props: IProps) {
        super(props);
        this.state = {
            error_modal: false,
            message_type: Status.ERROR,
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
        this.user = this.session.user as IUser;
    }

    componentDidMount(): void {
        this.fetchAccounts();
    }

    private copyToClipboard = async (): Promise<void> => {
        const { tagName } = this.user;
        await Clipboard.setStringAsync(tagName);

        const vibrationPattern = [0, 5];
        Vibration.vibrate(vibrationPattern, false);
        this.toastRef.current?.show("Copied user tag: " + tagName, "success");
    };


    private fetchAccounts = async (): Promise<void> => {
        try {
            this.setState({ loadingAccounts: true });

            await Defaults.IS_NETWORK_AVAILABLE();

            const res = await fetch(`${Defaults.API}/bank/`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client?.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-devicename': this.session.devicename,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
            });

            const data = await res.json();
            if (data.status === "error") throw new Error(data.message || data.error);

            if (data.status === "success") {
                if (!data.handshake) throw new Error('Unable to process login response right now, please try again.');

                // Decrypt data using Defaults.PARSE_DATA
                if (this.session.client?.privateKey) {
                    const parseData: Array<IBank> = Defaults.PARSE_DATA(data.data, this.session.client.privateKey, data.handshake);

                    // Format parsed data for the list modal
                    const formattedLists: Array<IList> = parseData.map((account) => {
                        const bankInfo = banks.find((b) => b.code === account.bankCode);
                        const logoUrl = (bankInfo && bankInfo.slug)
                            ? `https://cdn.jsdelivr.net/gh/supermx1/nigerian-banks-api@main/logos/${bankInfo.slug}.png`
                            : "http://wealthx.app/logo.png";

                        return {
                            name: account.accountName,
                            description: `●●●●●●${account.accountNumber.slice(-4)} ${account.bankName.slice(0, 20)}${account.bankName.length > 20 ? "..." : ""}`,
                            icon: logoUrl,
                            id: account._id
                        };
                    });

                    this.setState({ accounts: parseData, lists: formattedLists });
                }
            }
        } catch (error: any) {
            logger.log(error);
            const errMsg: string = (error as Error).message || "An error occurred while fetching transactions.";
            if (errMsg.trim() === "Session expired, please login") {
                router.replace(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            } else {
                logger.error("Error fetching transactions:", errMsg);
            }
            // Optionally show error toast
            this.toastRef.current?.show(error.message || "Something went wrong", "error");
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
                                source={require("../../assets/icons/chevron_right.svg")}
                                style={styles.backIcon}
                                tintColor={"#000000"} />
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
                                backgroundColor: '#F7F7F7',
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
                                    backgroundColor: '#F7F7F7',
                                }}
                            >
                                {selected ? (
                                    <ThemedView style={{ backgroundColor: 'transparent' }}>
                                        <ThemedText
                                            style={{
                                                fontSize: 14,
                                                lineHeight: 18,
                                                fontFamily: 'AeonikMedium',
                                                color: '#000000',
                                                marginBottom: 4,
                                                fontWeight: '500'
                                            }}
                                        >
                                            {selected.accountName}
                                        </ThemedText>
                                        <ThemedText
                                            style={{
                                                fontSize: 12,
                                                lineHeight: 14,
                                                fontFamily: 'AeonikRegular',
                                                color: '#757575',
                                            }}
                                        >
                                            {`●●●●●●${selected.accountNumber.slice(-4)} ${selected.bankName.slice(0, 20)}${selected.bankName.length > 20 ? "..." : ""}`}
                                        </ThemedText>
                                    </ThemedView>
                                ) : (
                                        <ThemedText
                                            style={{
                                                fontSize: 14,
                                                lineHeight: 16,
                                                fontFamily: 'AeonikRegular',
                                                color: '#757575',
                                                fontWeight: '400',
                                            }}
                                        >
                                            Select bank account
                                        </ThemedText>
                                )}
                            </Pressable>
                            <PrimaryButton
                                Gradient
                                disabled={!selected}
                                onPress={async (): Promise<void> => {
                                    if (selected) {
                                        this.session.params = { ...this.session.params, bank: selected };
                                        await sessionManager.updateSession(this.session);
                                        router.navigate("/withdraw/confirm");
                                    }
                                }}
                                title={'Continue'} />
                        </ThemedView>
                    </ThemedView>

                    <ListModal
                        visible={list_modal}
                        listChange={(list) => this.setState({ list_modal: false }, async () => {
                            const account: IBank | undefined = this.state.accounts.find((acc: IBank) => acc._id === list.id);
                            this.setState({ selected: account });
                        })}
                        onClose={() => this.setState({ list_modal: !list_modal })}
                        lists={lists}
                        loading={loadingAccounts}
                        showSearch={true}
                        title="Select Bank Account"
                    />
                    <MessageModal
                        visible={error_modal}
                        type={message_type || Status.ERROR}
                        onClose={(): void => this.setState({ error_modal: !error_modal }, async () => {
                            if (message_type === Status.SUCCESS) {
                                router.dismissTo("/dashboard");
                            }
                        })}
                        message={{ title: error_title, description: error_message }} />
                </ThemedSafeArea>
                <SimpleToast ref={this.toastRef} />
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
        backgroundColor: "transparent",
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
        backgroundColor: '#F7F7F7',
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        backgroundColor: '#FFF',
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
        color: '#000000',
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