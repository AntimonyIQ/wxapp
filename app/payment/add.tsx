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

import PrimaryButton from "@/components/button/primary";
import TextField from "@/components/inputs/text";
import ListModal from "@/components/modals/list";
import LoadingModal from "@/components/modals/loading";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import { IBankList, IList, IResponse, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import WalletService from "@/service/wallet";
import sessionManager from "@/session/session";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Defaults from "../default/default";

interface IProps { }

interface IState {
    visible: boolean;
    selectedBank: IList;
    accountNumber: string;
    accountName: string;
    loading: boolean;
    lists: Array<IList>;
    list_modal: boolean;
    banks: Array<IBankList>
}

export default class PaymentAddScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Add Bank details";
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            lists: [],
            accountNumber: '',
            accountName: "",
            loading: false,
            selectedBank: {
                name: "",
                description: "",
                icon: ""
            },
            list_modal: false,
            banks: [],
        };
        const login: boolean = Defaults.LOGIN_STATUS();
        if (!login) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            return;
        };
    }

    componentDidMount(): void {
        this.fetchBanksList();
    }

    private handleConnectBank = async (): Promise<void> => {
        const { accountNumber, selectedBank, accountName } = this.state;

        try {
            if (!accountNumber || !selectedBank || accountNumber.length !== 10 || !accountName)
                throw new Error("Account number and selected bank are required.");

            this.setState({ loading: true });
            await Defaults.IS_NETWORK_AVAILABLE();
            const bank: IBankList = this.bank(selectedBank.description);

            const login: boolean = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            };

            const res = await fetch(`${Defaults.API}/bank/save`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-devicename': this.session.devicename,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
                body: JSON.stringify({ bankName: selectedBank.name, accountName, accountNumber, bankCode: bank.code }),
            });

            const data: IResponse = await res.json();
            if (data.status === "error") throw new Error(data.message || data.error);
            if (data.status === "success") {
                Defaults.TOAST('Bank Account Added successfully', 'Connect Bank', "success");
                await WalletService.fetchWalletData({ force: true, showLoading: false });
                router.navigate('/dashboard');
            }

        } catch (error: any) {
            Defaults.TOAST(error.message, 'Connect Bank');
        } finally {
            this.setState({ loading: false });
        }
    };

    private handleAccountResolve = async () => {
        const { accountNumber, selectedBank } = this.state;

        try {
            await Defaults.IS_NETWORK_AVAILABLE();
            if (!accountNumber || accountNumber.length !== 10) return;
            if (!selectedBank) throw new Error("Account number and selected bank are required.");
            const bank: IBankList = this.bank(selectedBank.description);

            const res = await fetch(`${Defaults.API}/bank/resolve`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-devicename': this.session.devicename,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
                body: JSON.stringify({ accountNumber, bankCode: bank.code }),
            });

            const data = await res.json();
            if (data.status === "error") throw new Error(data.message || data.error);
            if (data.status === "success") {
                if (!data.handshake) throw new Error('Unable to get banks list, please try again.');
                const parseData = Defaults.PARSE_DATA(data.data, this.session.client.privateKey, data.handshake);
                console.log({ parseData });
                this.setState({ accountName: parseData.account_name });
            }
        } catch (error) {
            logger.error(error);
        }
    };

    private bank = (slug: string): IBankList => {
        const bank: IBankList | undefined = this.state.banks.find((bank) => bank.slug === slug);
        if (!bank) throw new Error("Bank not found");
        return bank;
    }

    private fetchBanksList = async (): Promise<void> => {
        try {
            this.setState({ loading: true });

            await Defaults.IS_NETWORK_AVAILABLE();

            const login: boolean = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            };

            const res = await fetch(`${Defaults.API}/bank/list`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-devicename': this.session.devicename,
                    Authorization: `Bearer ${this.session.authorization}`,
                }
            });

            const data: IResponse = await res.json();
            if (data.status === "error") throw new Error(data.message || data.error);
            if (data.status === "success") {
                if (!data.handshake) throw new Error('Unable to get banks list, please try again.');
                const parseData: Array<IBankList> = Defaults.PARSE_DATA(data.data, this.session.client.privateKey, data.handshake);
                const lists: Array<IList> = parseData.map((bank: any) => ({
                    name: bank.name,
                    description: bank.slug,
                    icon: bank.icon
                }));
                this.setState({ lists: lists, banks: parseData });
            }
        } catch (error) {
            console.log(error);
        } finally {
            this.setState({ loading: false });
        }
    };

    private rgbaToHex = (r: number, g: number, b: number, a: number) => {
        const toHex = (value: number) => {
            const hex = Math.round(value).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        const alpha = Math.round(a * 255);
        return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
    }

    render(): React.ReactNode {
        const { selectedBank, list_modal, accountNumber, lists, accountName, loading } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.container}>
                    <ThemedView style={{ height: "100%" }}>
                        <ThemedView
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
                            <LinearGradient
                                colors={['#ffffff4d', '#40414e99']}
                                locations={[0.5, 1]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    width: '86%',
                                    height: '115%',
                                    position: 'absolute',
                                    top: '4.2%',
                                    borderTopRightRadius: 20,
                                    borderTopLeftRadius: 20,
                                }}
                            />
                            <LinearGradient
                                colors={['#ffffff4d', '#40414e99']}
                                locations={[0, 1]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    width: '80%',
                                    height: '110%',
                                    position: 'absolute',
                                    top: '3%',
                                    borderTopRightRadius: 20,
                                    borderTopLeftRadius: 20,
                                }}
                            />
                        </ThemedView>

                        <ThemedView style={styles.content}>
                            <Pressable
                                onPress={() => router.back()}
                                style={{
                                    padding: 4,
                                    borderRadius: 99,
                                    backgroundColor: '#e7e7e7',
                                    right: 10,
                                    alignSelf: 'flex-end',
                                }}>
                                <Image
                                    source={require("../../assets/icons/close.svg")}
                                    tintColor={"#000"}
                                    style={{ width: 20, height: 20 }} />
                            </Pressable>

                            <ThemedView style={{ marginTop: 53, gap: 24, paddingHorizontal: 16, backgroundColor: "transparent" }}>
                                <Image
                                    source={require("../../assets/images/commonLogo.png")}
                                    contentFit="contain"
                                    style={{ width: 30, height: 30, padding: 5 }} />

                                <ThemedView style={{ gap: 4, marginBottom: 24, backgroundColor: "transparent" }}>
                                    <ThemedText
                                        style={{
                                            fontSize: 20,
                                            fontFamily: 'AeonikMedium',
                                        }}
                                    >
                                        Connect Bank Account
                                    </ThemedText>
                                    <ThemedText
                                        style={{
                                            fontSize: 12,
                                            fontFamily: 'AeonikRegular',
                                            lineHeight: 14,
                                            color: '#A5A5A5',
                                        }}
                                    >
                                        Please enter your account details below
                                    </ThemedText>
                                </ThemedView>

                                <Pressable onPress={() => this.setState({ list_modal: true })}>
                                    <View pointerEvents="none">
                                        <TextField
                                            placeholder='Select Bank'
                                            showText={true}
                                            title="Select Bank"
                                            maxLength={300}
                                            textValue={selectedBank.name}
                                            onChangeText={() => { }}
                                            readonly={true}
                                            showPasteButton={false}
                                        />
                                    </View>
                                </Pressable>

                                <TextField
                                    placeholder='Add Account Number'
                                    maxLength={10}
                                    title="Add Account Number"
                                    showText={true}
                                    textValue={accountNumber}
                                    onChangeText={(text) => {
                                        const numericText = text.replace(/[^0-9]/g, '');
                                        this.setState({ accountNumber: numericText }, async () => {
                                            await this.handleAccountResolve();
                                        });
                                    }}
                                    showPasteButton={true}
                                    onFocus={() => this.setState({ list_modal: false })}
                                    keyboardType="numeric"
                                />

                                <TextField
                                    title="Bank Account Name"
                                    showText={true}
                                    placeholder={!accountName ? (!accountNumber ? 'Bank Account Name' : 'loading...') : 'Bank Account Name'}
                                    textValue={accountName}
                                    readonly={true}
                                    disable={true}
                                    onChangeText={(text) => this.setState({ accountName: text })} />

                                <PrimaryButton Gradient title={'Continue'} onPress={this.handleConnectBank} />
                            </ThemedView>
                        </ThemedView>
                    </ThemedView>
                    {list_modal && <ListModal
                        visible={list_modal}
                        listChange={(list) => this.setState({ selectedBank: list, list_modal: false }, async () => {
                            await this.handleAccountResolve();
                        })}
                        onClose={() => this.setState({ list_modal: false })}
                        lists={lists}
                        showSearch={true} />}
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
    content: {
        width: '100%',
        backgroundColor: "#FFFFFF",
        height: '98%',
        position: 'absolute',
        bottom: -30,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 16,
    }
});