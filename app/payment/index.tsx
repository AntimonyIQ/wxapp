import React from "react";
import sessionManager from "@/session/session";
import { IBank, IBankList, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { Appearance, ColorSchemeName, FlatList, Platform, RefreshControl, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";
import PrimaryButton from "@/components/button/primary";
import Defaults from "../default/default";
import LoadingModal from "@/components/modals/loading";
import BackButton from "@/components/button/back";
import banks from "../data/banks.json";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import ThemedSafeArea from "@/components/ThemeSafeArea";

interface IProps { }

interface IState {
    accounts: Array<IBank>;
    loading: boolean;
    refreshing: boolean;
}

export default class PaymentScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Payment Screen";
    constructor(props: IProps) {
        super(props);
        this.state = {
            accounts: [],
            loading: true,
            refreshing: false,
        };
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
    }

    componentDidMount(): void {
        this.fetchAccounts();
    }

    private account = (code: string): IBankList => {
        const bank = banks.find((bank) => bank.code === code);
        if (!bank) throw new Error(`Bank with code ${code} not found.`);
        return bank;
    }

    private fetchAccounts = async (): Promise<void> => {
        try {
            this.setState({ loading: true });

            const response = await fetch(`${Defaults.API}/banking/accounts/`, {
                method: "GET",
                headers: { ...Defaults.HEADERS, "Authorization": `Bearer ${this.session.accessToken}` },
            });

            if (!response.ok) throw new Error("response failed with status: " + response.status);

            const data = await response.json();

            if (data.status === "success") {
                this.setState({ accounts: data.data || [] });
            }
        } catch (error: any) {
            logger.log(error);
        } finally {
            this.setState({ loading: false, refreshing: false });
        }
    };

    private onRefresh = () => {
        this.setState({ refreshing: true });
        this.fetchAccounts();
    };

    private BankAccountView = ({ item }: { item: IBank }): React.JSX.Element => {
        const bank = this.account(item.bankCode);
        return (
            <ThemedView style={styles.bankAccountItem}>
                <Image
                    source={{ uri: `https://cdn.jsdelivr.net/gh/supermx1/nigerian-banks-api@main/logos/${bank.slug}.png` }}
                    style={{ borderRadius: 360, width: 24, height: 24 }} />
                <ThemedText style={styles.bankAccountInfo}>{`********${item.accountNumber.slice(-2)} ${item.bankName}`}</ThemedText>
            </ThemedView>
        );
    };

    render(): React.ReactNode {
        const { accounts, loading, refreshing } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.container}>
                    <ThemedView style={styles.header}>
                        <BackButton
                            title={'Payment Methods'}
                            subtitle={'You have your cards stored to make transactions easy'}
                        />
                    </ThemedView>

                    <ThemedView style={styles.tabContainer}>
                        <ThemedView
                            style={[styles.tabButton, styles.tabButtonActive]}>
                            <ThemedText style={[styles.tabText]}>
                                Added Bank Accounts
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView style={{ flexDirection: "column", alignItems: "center", width: "100%", padding: 20, }}>
                        {!loading && accounts.length === 0 && <Text style={styles.emptyText}>No bank accounts available. Add a new bank account.</Text>}

                        {!loading && accounts.length > 0 && (
                            <FlatList
                                data={accounts} style={{ width: "100%" }}
                                renderItem={this.BankAccountView}
                                keyExtractor={(item) => item.accountNumber}
                                contentContainerStyle={styles.listContainer}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={this.onRefresh}
                                    />
                                }
                            />
                        )}

                        {!loading && <PrimaryButton Gradient title="Add Bank Account" onPress={() => router.navigate("/payment/info")}></PrimaryButton>}
                    </ThemedView>

                    <LoadingModal loading={loading} />
                </ThemedSafeArea>
            </>
        )
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
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    tabButton: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
    },
    tabButtonActive: {
        borderRadius: 99,
    },
    tabText: {
        fontSize: 16,
        fontFamily: 'AeonikMedium',
    },
    tabTextActive: {
        color: '#1F1F1F',
    },
    listContainer: {
        flexGrow: 1,
        marginBottom: 20,
        width: "100%"
    },
    addButton: {
        padding: 15,
        backgroundColor: '#000',
        borderRadius: 10,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'AeonikMedium',
    },
    emptyText: {
        textAlign: 'center',
        marginVertical: 20,
        fontSize: 16,
        color: '#888',
    },
    cardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F0F0F0',
    },
    cardInfo: {
        marginLeft: 12,
    },
    cardInfoText: {
        fontSize: 14,
        fontFamily: 'AeonikMedium',
        color: '#1F1F1F',
    },
    cardInfoSubText: {
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        color: '#757575',
    },
    bankAccountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 12,
        borderRadius: 10,
        width: "100%",
        backgroundColor: Appearance.getColorScheme() === "dark" ? '#0e0e0e' : '#F0F0F0',
    },
    bankAccountInfo: {
        marginLeft: 12,
        fontSize: 14,
        fontFamily: 'AeonikMedium',
    },
});