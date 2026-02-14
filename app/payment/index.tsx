// This is part for the Wealthx Mobile Application.
// Copyright © 2023 WealthX. All rights reserved.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import BackButton from "@/components/button/back";
import PrimaryButton from "@/components/button/primary";
import LoadingModal from "@/components/modals/loading";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import { Status } from "@/enums/enums";
import { IBank, IResponse, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import sessionManager from "@/session/session";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import React from "react";
import { FlatList, Platform, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import banks from "../data/banks.json";
import Defaults from "../default/default";

interface IProps { }

interface IState {
    accounts: Array<IBank>;
    loading: boolean;
    refreshing: boolean;
    searchQuery: string;
}

export default class PaymentScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Payment Screen";
    constructor(props: IProps) {
        super(props);
        this.state = {
            accounts: [],
            loading: true,
            refreshing: false,
            searchQuery: "",
        };
        const login: boolean = Defaults.LOGIN_STATUS();
        if (!login) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            return;
        };
    }

    componentDidMount(): void {
        this.fetchAccounts();
    }

    private account = (code: string) => {
        const bank = banks.find((bank) => bank.code === code);
        return bank;
    }

    private fetchAccounts = async (): Promise<void> => {
        try {
            this.setState({ loading: true });
            await Defaults.IS_NETWORK_AVAILABLE();

            const login: boolean = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            };

            const res = await fetch(`${Defaults.API}/bank/`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-location': this.session.location,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process login response right now, please try again.');
                const parseData: Array<IBank> = Defaults.PARSE_DATA(data.data, this.session.client.privateKey, data.handshake);
                this.setState({ accounts: parseData });
            };
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

    private handleSearch = (text: string) => {
        this.setState({ searchQuery: text });
    };

    private BankAccountView = ({ item }: { item: IBank }): React.JSX.Element => {
        const bank = this.account(item.bankCode);
        const safeAccount = item.accountNumber ? `********${item.accountNumber.slice(Math.max(0, item.accountNumber.length - 2))}` : '********';
        const logoUri = bank ? `https://cdn.jsdelivr.net/gh/supermx1/nigerian-banks-api@main/logos/${bank.slug}.png` : undefined;

        return (
            <ThemedView style={styles.bankAccountItem}>
                {bank ? (
                    <Image source={{ uri: logoUri }} style={{ width: 34, height: 34, borderRadius: 360 }} />
                ) : (
                    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#D9D9D9' }} />
                )}
                <View style={styles.bankTextContainer}>
                    <ThemedText style={styles.bankAccountTitle}>{item.accountName || 'N/A'}</ThemedText>
                    <ThemedText style={styles.bankAccountSubtitle}>{`${safeAccount} • ${item.bankName || ''}`}</ThemedText>
                </View>
            </ThemedView>
        );
    };

    render(): React.ReactNode {
        const { accounts, loading, refreshing, searchQuery } = this.state;
        const filteredAccounts = accounts.filter((account) =>
            account.accountName.toLowerCase().includes(searchQuery.toLowerCase())
        );
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
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search account name"
                            placeholderTextColor="#8F92A1"
                            value={searchQuery}
                            onChangeText={this.handleSearch}
                        />

                        {!loading && filteredAccounts.length === 0 && <Text style={styles.emptyText}>{searchQuery ? "No account found matching your search." : "No bank accounts available. Add a new bank account."}</Text>}

                        {!loading && filteredAccounts.length > 0 && (
                            <FlatList
                                data={filteredAccounts} style={{ width: "100%" }}
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
        backgroundColor: '#F0F0F0',
    },
    bankTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    bankAccountTitle: {
        fontSize: 14,
        fontFamily: 'AeonikMedium',
        color: '#1F1F1F',
    },
    bankAccountSubtitle: {
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        color: '#757575',
        marginTop: 2,
    },
    searchInput: {
        width: '100%',
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
        padding: 12,
        fontFamily: 'AeonikRegular',
        fontSize: 14,
        color: '#1F1F1F',
        marginBottom: 15,
    },
});