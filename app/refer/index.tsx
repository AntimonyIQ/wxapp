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

import React from "react";
import sessionManager from "@/session/session";
import { IList, IUser, UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { Appearance, ColorSchemeName, Platform, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import { LinearGradient } from 'expo-linear-gradient';
import PrimaryButton from "@/components/button/primary";
import { StatusBar } from "expo-status-bar";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";

interface IProps { }

interface IState { }

export default class ReferScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Refer Screen";
    private user: IUser;
    constructor(props: IProps) {
        super(props);
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
        this.user = this.session.user as IUser;
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
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <LinearGradient
                    colors={['#282560', '#3E34F4', '#292662']}
                    style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 50 : Platform.OS === "web" ? 20 : 0, }}
                    start={[0, 0.98]}
                    end={[1, 1]}>
                    <ThemedSafeArea
                        style={styles.container}>
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
                                    <this.ReferContent name={"Deposit Rewards"} description={"$0.00"} />
                                    <this.ReferContent name={"Trades Rewards"} description={"$0.00"} />
                                </View>
                            </View>
                        </ThemedView>

                        <View
                            style={{
                                paddingHorizontal: 16,
                                position: 'absolute',
                                bottom: 40,
                                width: '100%',
                            }}
                        >
                            <PrimaryButton onPress={async () => {
                                await Share.share({
                                    title: "Join WealthX and start trading",
                                    message: `Join WealthX and start trading today! 🚀\n\n` +
                                        `Getting started is easy:\n` +
                                        `1️⃣ Visit app.wealthx.app\n` +
                                        `2️⃣ Sign up for your account\n` +
                                        `3️⃣ Enter my referral code: ${this.user.username} in the referral field\n\n` +
                                        `Unlock exclusive benefits by joining through my referral. Let\'s trade smarter together! 📈🔥`,
                                });
                            }} title={'Share Link'} />

                        </View>

                    </ThemedSafeArea>
                    <StatusBar style='light' />
                </LinearGradient>
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
});