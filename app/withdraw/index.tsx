import React from "react";
import sessionManager from "@/session/session";
import { UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { Platform, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import MessageModal from "@/components/modals/message";
import { Image } from "expo-image";
import PrimaryButton from "@/components/button/primary";
import LoadingModal from "@/components/modals/loading";
import { StatusBar } from "expo-status-bar";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import { Status } from "@/enums/enums";

interface IProps { }

interface IState {
    error_modal: boolean;
    message_type: Status;
    error_title: string;
    error_message: string;
    loading: boolean;
    amount: string;
}

export default class WithdrawScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Withdraw";
    constructor(props: IProps) {
        super(props);
        this.state = {
            error_modal: false,
            message_type: Status.ERROR,
            error_message: "",
            error_title: "",
            loading: false,
            amount: ""
        };
    }

    private navigateNext = async (): Promise<void> => {
        try {
            router.navigate("/withdraw/bank");
        } catch (error: any) {
            logger.error(error);
            this.setState({
                error_modal: true,
                message_type: Status.ERROR,
                error_title: "Input Error",
                error_message: error.message || "Unknown error, please try again."
            });
        }
    }

    render(): React.ReactNode {
        const { error_modal, message_type, error_title, error_message, loading, amount } = this.state;
        const balance: number = 0
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
                                tintColor={"#000000"} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.title}>{this.title}</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.content}>
                        <ThemedView style={styles.inputContainer}>
                            <ThemedView style={styles.inputRow}>
                                <ThemedText style={styles.inputLabel}>Enter Amount</ThemedText>
                            </ThemedView>
                            <TextInput
                                style={styles.amountInput}
                                keyboardType='number-pad'
                                value={amount}
                                onChangeText={(text) => this.setState({ amount: text })}
                                placeholder="₦0.00"
                                placeholderTextColor="#ffffff"
                            />
                        </ThemedView>
                        <ThemedView style={styles.optionsContainer}>
                            <ThemedView style={styles.optionRow}>
                                <ThemedText style={styles.optionText}>Balance ₦{balance.toLocaleString()}</ThemedText>
                            </ThemedView>
                        </ThemedView>
                        <ThemedView style={{ marginTop: 40 }}>
                            <PrimaryButton Gradient={true} title="Continue" onPress={this.navigateNext} />
                        </ThemedView>
                    </ThemedView>

                    <MessageModal
                        visible={error_modal}
                        type={message_type || Status.ERROR}
                        onClose={(): void => this.setState({ error_modal: !error_modal }, async () => {
                            if (message_type === Status.SUCCESS) {
                                router.dismissTo("/dashboard");
                            }
                        })}
                        message={{ title: error_title, description: error_message }} />
                    <LoadingModal loading={loading} />
                    <StatusBar style={"dark"} />
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
        backgroundColor: '#F7F7F7',
    },
    inputLabel: {
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        color: '#A5A5A5',
        lineHeight: 14,
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
        lineHeight: 14,
    },
});