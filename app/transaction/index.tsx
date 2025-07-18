import React from "react";
import sessionManager from "@/session/session";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import Defaults from "../default/default";
import { ITransaction, UserData } from "@/interface/interface";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";

interface IProps { }

enum Tabs {
    all = "all",
    success = "success",
    failed = "failed",
    pending = "pending",
}

interface IState {
    refreshing: boolean;
    loading: boolean;
    selectedTab: Tabs,
    transactions: Array<ITransaction>;
}

enum TStatus {
    all = "all",
    success = "success",
    failed = "failed",
    pending = "pending"
}

export default class TransactionScreen extends React.Component<IProps, IState> {
    private readonly tabs: Array<string> = Object.keys(Tabs);
    private session: UserData = sessionManager.getUserData();
    private readonly status: Array<string> = ["all", "success", "failed", "pending"];
    private readonly title = "Transactions";
    private transaction: ITransaction = {} as ITransaction;
    constructor(props: IProps) {
        super(props);
        this.state = {
            selectedTab: Tabs.all,
            loading: true,
            refreshing: false,
            transactions: []
        }
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
    }

    componentDidMount(): void {
        logger.log("tabs loaded", this.tabs);
        // this.fetchTransactionsData();
    }

    private fetchTransactionsData = async () => {
        try {
            this.setState({ loading: true });
        } catch (error) {
            logger.log(error);
        } finally {
            this.setState({ loading: false });
        }
    };

    private onRefresh = () => {
        this.setState({ refreshing: true });
        setTimeout(() => {
            this.setState({ refreshing: false }, async () => {
                await this.fetchTransactionsData();
            });
        }, 2000);
    }

    render(): React.ReactNode {
        const ts: Array<string> = Object.keys(TStatus);
        const { loading, selectedTab } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.safeArea}>
                    <ThemedView style={styles.header}>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}>
                            <Image
                                source={require("../../assets/icons/chevron-left.svg")}
                                tintColor={"#000000"}
                                style={styles.backIcon} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>

                        <ThemedText style={styles.title}>{this.title}</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <ThemedView style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, paddingHorizontal: 20, paddingVertical: 10, width: "100%" }}>
                            {ts.map((s, i) => (
                                <Pressable key={i} style={{ backgroundColor: "#F0F0F0", paddingHorizontal: 8, borderRadius: 8, display: "flex", flexDirection: "row", alignItems: "center", }}>
                                    <ThemedText
                                        style={{
                                            textTransform: "capitalize",
                                            color: "#000000",
                                            padding: 8,
                                            paddingHorizontal: 20,
                                            fontSize: 12,
                                            borderRadius: 20,
                                            textAlign: "center",
                                            fontFamily: 'AeonikRegular',
                                        }}
                                    >{s}</ThemedText>
                                </Pressable>
                            ))}
                        </ThemedView>
                    </ScrollView>

                    <ScrollView horizontal={false} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                        <ThemedView style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, width: "100%", }}>

                        </ThemedView>
                    </ScrollView>

                </ThemedSafeArea>
                <StatusBar style='light' />
            </>
        )
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 50 : Platform.OS === "web" ? 20 : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
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
    placeholderIcon: {
        width: 24,
        height: 24,
    },
    infoContainer: {
        marginTop: 42,
        paddingHorizontal: 16,
        flexDirection: 'column',
        gap: 20,
    },
    balanceContainer: {
        alignItems: 'center',
        marginBottom: 24,
        gap: 8
    },
    infoLabel: {
        color: '#757575',
        fontSize: 12,
        lineHeight: 14,
        fontFamily: 'AeonikRegular',
    },
    infoLabelText: {
        fontSize: 14,
        fontFamily: 'AeonikRegular',
        textTransform: "capitalize"
    },
    balanceText: {
        fontFamily: 'AeonikMedium',
        fontSize: 20,
        textTransform: "uppercase"
    },
    balanceValue: {
        color: '#757575',
        fontSize: 12,
        lineHeight: 14,
        fontFamily: 'AeonikMedium',
    },
});