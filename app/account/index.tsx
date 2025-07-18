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
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { Appearance, ColorSchemeName, Platform, StyleSheet, TouchableOpacity } from "react-native";
import { IList, UserData, IUser } from "@/interface/interface";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import { StatusBar } from "expo-status-bar";

interface IProps { }

interface IState { }

export default class AccountScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Account Screen";
    private user: IUser;
    private readonly avatar = "https://api.dicebear.com/8.x/micah/svg";
    constructor(props: IProps) {
        super(props);
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
        this.user = this.session.user as IUser;
    }

    private DescriptionView = (list: Partial<IList>): React.JSX.Element => {
        return (
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, backgroundColor: "transparent" }}>
                <ThemedText
                    style={{ fontFamily: 'AeonikRegular', fontSize: 14, lineHeight: 16, color: '#757575', }}>
                    {list.name}
                </ThemedText>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ThemedText style={{ fontFamily: 'AeonikMedium', fontSize: 14, lineHeight: 16, }} >{list.description === "Yes" ? "Verified" : list.description === "No" ? "Not Verified" : list.description}</ThemedText>
                    {list.description === "Yes"
                        ? <Image source={require('../../assets/icons/verification.svg')} style={{ width: 24, height: 24 }} tintColor={Colors.blue} />
                        : list.description === "No"
                            ? <Image source={require('../../assets/icons/verification.svg')} style={{ width: 24, height: 24 }} tintColor={Colors.grey} />
                            : null
                    }
                </ThemedView>
            </ThemedView>
        );
    }

    render(): React.ReactNode {
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
                                tintColor={this.appreance === "dark" ? Colors.light.background : "#000000"} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.title}>Account details</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.content}>
                        <ThemedView style={styles.profileContainer}>
                            <Image
                                style={{ borderWidth: 1, borderColor: "#757575", borderRadius: 360, width: 90, height: 90 }}
                                source={{ uri: `${this.avatar}?seed=${encodeURIComponent(this.session.user?.fullName || "")}&backgroundColor=b6e3f4,c0aede,d1d4f9&backgroundType=gradientLinear,solid` }} />
                            <ThemedView style={styles.userInfo}>
                                <ThemedText style={styles.userName}>{this.user.fullName}</ThemedText>
                                <ThemedText style={styles.userUsername}>@{this.user.username}</ThemedText>
                            </ThemedView>
                        </ThemedView>
                        <ThemedView style={styles.detailsContainer}>
                            <ThemedView style={styles.detailsBox}>
                                <this.DescriptionView name={'Full Name'} description={this.user.fullName} />
                                <this.DescriptionView name={'Phone Number'} description={this.user.phoneNumber} />
                                <this.DescriptionView name={'Email Address'} description={this.user.email} />
                                <this.DescriptionView name={'Verification Complete'} description={this.user.isVerificationComplete ? "Yes" : "No"} />
                            </ThemedView>
                        </ThemedView>
                    </ThemedView>
                    <StatusBar style="dark" />
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
    },
    content: {
        marginTop: 46,
        marginHorizontal: 16,
    },
    profileContainer: {
        alignSelf: 'center',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
    },
    userInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontFamily: 'AeonikMedium',
    },
    userUsername: {
        fontSize: 14,
        fontFamily: 'AeonikRegular',
        color: '#757575',
        marginTop: 5,
    },
    detailsContainer: {
        marginTop: 43,
        gap: 12,
    },
    detailsBox: {
        padding: 8,
        borderRadius: 12,
        gap: 8,
        backgroundColor: '#F7F7F7',
    },
    deleteButton: {
        paddingHorizontal: 12,
        position: 'absolute',
        bottom: 45,
        alignSelf: 'center',
    },
    deleteButtonText: {
        fontSize: 16,
        lineHeight: 20,
        color: '#FF0000',
        textAlign: 'center',
        fontFamily: 'AeonikRegular',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});