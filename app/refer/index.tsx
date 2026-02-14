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
import LoadingModal from "@/components/modals/loading";
import MessageModal from "@/components/modals/message";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import SimpleToast from "@/components/toast/toast";
import { Status } from "@/enums/enums";
import { IList, IUser, UserData } from "@/interface/interface";
import sessionManager from "@/session/session";
import { Image } from "expo-image";
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, SafeAreaView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Defaults, { toastRef } from "../default/default";

interface IProps { }

interface IState {
    loading: boolean;
    referralData: {
        totalReferrals: number;
        earnings: number;
        referralId: string;
    };
    error_modal: boolean;
    error_title: string;
    error_message: string;
}

export default class ReferScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Refer Screen";
    private user: IUser;

    constructor(props: IProps) {
        super(props);
        this.user = this.session.user as IUser;
        this.state = {
            loading: false,
            referralData: {
                totalReferrals: 0,
                earnings: 0,
                referralId: "",
            },
            error_modal: false,
            error_title: "",
            error_message: "",
        };
    }

    componentDidMount(): void {
        this.fetchReferralDetails();
    }

    private fetchReferralDetails = async (): Promise<void> => {
        try {
            this.setState({ loading: true });

            await Defaults.IS_NETWORK_AVAILABLE();

            const login = Defaults.LOGIN_STATUS();
            if (!login) {
                router.dismissTo(this.session.passkeyEnabled ? "/passkey" : "/onboarding/login");
                return;
            }

            const res = await fetch(`${Defaults.API}/user/referral`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-devicename': this.session.devicename,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
            });

            const data = await res.json();

            if (data.status === "error") throw new Error(data.message || data.error);
            if (data.status === "success") {
                if (!data.handshake) throw new Error('Invalid response');
                const parseData = Defaults.PARSE_DATA(data.data, this.session.client.privateKey, data.handshake);
                this.setState({ referralData: parseData });
            }
        } catch (error: any) {
            console.log("Error getting referrals data: ", error);
            toastRef.current?.show(error.message || "Failed to load referral data", "error");
        } finally {
            this.setState({ loading: false });
        }
    }

    private withdrawEarnings = async (): Promise<void> => {
        const { referralData } = this.state;

        // Check if earnings are too low
        if (referralData.earnings <= 0) {
            toastRef.current?.show("Referral earning too low for withdrawal, refer to earn more", "warning");
            return;
        }

        try {
            this.setState({ loading: true });

            await Defaults.IS_NETWORK_AVAILABLE();

            const login = Defaults.LOGIN_STATUS();
            if (!login) {
                router.dismissTo(this.session.passkeyEnabled ? "/passkey" : "/onboarding/login");
                return;
            }

            const res = await fetch(`${Defaults.API}/user/referral/withdraw`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-devicename': this.session.devicename,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
            });

            const data = await res.json();

            if (data.status === "error") throw new Error(data.message || data.error);
            if (data.status === "success") {
                await this.fetchReferralDetails();
                toastRef.current?.show("Earnings withdrawn successfully", "success");
                return;
            }
        } catch (error: any) {
            console.log("Error withdrawing earnings: ", error);
            this.setState({
                error_modal: true,
                error_title: "Withdrawal Error",
                error_message: error.message || "Failed to withdraw earnings"
            });
        } finally {
            this.setState({ loading: false });
        }
    }

    private ReferContent = (list: Partial<IList>): React.ReactNode => {
        return (
            <View
                style={{
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                    gap: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.10)',
                    width: "50%",
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Text
                    style={{
                        fontSize: 14,
                        fontFamily: 'AeonikMedium',
                        color: '#FFFFFFB2',
                    }}
                >
                    {list.name}
                </Text>
                <Text
                    style={{
                        fontSize: 20,
                        fontFamily: 'AeonikMedium',
                        color: 'white',
                    }}
                >
                    {list.description}
                </Text>
            </View>
        );
    }

    render(): React.ReactNode {
        const { loading, referralData, error_modal, error_title, error_message } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <LinearGradient
                    colors={['#282560', '#3E34F4', '#292662']}
                    style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 50 : Platform.OS === "web" ? 20 : 0, }}
                    start={[0, 0.98]}
                    end={[1, 1]}>
                    <SafeAreaView
                        style={styles.container}>
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
                            <ThemedText style={styles.title}>Refer and Earn</ThemedText>
                            <ThemedView></ThemedView>
                        </ThemedView>

                        <ThemedView style={{ alignItems: 'center', justifyContent: "flex-start", flexDirection: "column", gap: 10, marginTop: 50, backgroundColor: "transparent" }}>
                            <Image
                                source={require("../../assets/images/referral.png")}
                                style={{ width: 200, height: 200 }} />
                            <View
                                style={{
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                    gap: 8,
                                    paddingHorizontal: 40,
                                    marginTop: 24,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 20,
                                        fontFamily: 'AeonikMedium',
                                        color: 'white',
                                    }}
                                >
                                    Refer & Earn{' '}
                                </Text>
                                <Text
                                    style={{
                                        color: 'white',
                                        fontSize: 14,
                                        lineHeight: 18,
                                        fontFamily: 'AeonikRegular',
                                        textAlign: 'center',
                                    }}
                                >
                                    Earn $0.50 for every initial deposit of $100 made using the direct referral link and $1.00 for every $1,000 in total trades made using the referral link.
                                </Text>
                            </View>
                            <View style={{ marginTop: 10, width: "100%" }}>
                                <Text
                                    style={{
                                        color: 'white',
                                        fontSize: 16,
                                        textAlign: "center",
                                        fontFamily: 'AeonikMedium',
                                        paddingLeft: 16,
                                    }}
                                >
                                    Your referrals
                                </Text>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: "space-between",
                                        width: "100%",
                                        paddingHorizontal: 26,
                                        gap: 8,
                                        marginTop: 16,
                                    }}
                                >
                                    <this.ReferContent name={"Total Referrals"} description={referralData.totalReferrals.toString()} />
                                    <this.ReferContent name={"Total Rewards"} description={referralData.earnings.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                                </View>
                            </View>
                        </ThemedView>

                        <View
                            style={{
                                paddingHorizontal: 16,
                                position: 'absolute',
                                bottom: 40,
                                width: '100%',
                                gap: 8,
                            }}
                        >
                            <PrimaryButton
                                onPress={this.withdrawEarnings}
                                title={'Withdraw Earnings'}
                                Gold
                            />
                            <PrimaryButton onPress={async () => {
                                await Share.share({
                                    title: "Join WealthX",
                                    message: `Hey! I'm using WealthX to trade and manage my crypto. Join me and use my referral code "${referralData.referralId}" when you sign up!`,
                                });
                            }} title={'Share Link'} />

                        </View>

                    </SafeAreaView>
                    <StatusBar style='light' />
                </LinearGradient>
                {loading && <LoadingModal loading={loading} />}
                {error_modal && (
                    <MessageModal
                        visible={error_modal}
                        type={Status.ERROR}
                        onClose={() => this.setState({ error_modal: false })}
                        message={{ title: error_title, description: error_message }}
                    />
                )}
                <SimpleToast ref={toastRef} />
            </>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
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
        height: 20,
        width: 20,
    },
    backText: {
        fontFamily: 'AeonikRegular',
        fontSize: 12,
        lineHeight: 14,
    },
    title: {
        fontSize: 16,
        fontFamily: 'AeonikBold',
        color: "#FFF"
    },
    content: {
        marginTop: 46,
        marginHorizontal: 16,
    },
});