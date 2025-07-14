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
import { Href, router, Stack } from "expo-router";
import { Appearance, ColorSchemeName, Linking, Platform, Share, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import DialogModal from "@/components/modals/dialog";
import ProfileButton from "@/components/button/profile";
import { UserData } from "@/interface/interface";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import { StatusBar } from "expo-status-bar";

interface IProps { }

interface IState {
    deleted: boolean;
}

export default class AccountSettingScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Account Screen";
    private readonly store_link = Platform.OS === "android"
        ? "https://play.google.com/store/apps/details?id=com.wealthx.app"
        : "https://apps.apple.com/us/app/wx-sell-btc-crypto/id6736343501";
    constructor(props: IProps) {
        super(props);
        this.state = { deleted: false };
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
    }

    render(): React.ReactNode {
        const { deleted } = this.state;
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
                        <ThemedText style={styles.title}>Account settings</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.content}>
                        <ThemedView style={{ marginTop: 21, gap: 12 }}>
                            <ThemedText>Account services</ThemedText>
                            <ThemedView
                                style={{
                                    padding: 8,
                                    borderRadius: 12,
                                    gap: 8,
                                    backgroundColor: this.appreance === "dark" ? '#090909' : '#F7F7F7'
                                }}>
                                <ProfileButton text={'Change Password'} onPress={() => router.navigate('/forget' as Href)} />
                                <ProfileButton text={'Disable Account'} onPress={() => router.navigate('/forget' as Href)} />
                                <ProfileButton text={'Setup Passkey Authentication'} onPress={() => this.setState({ deleted: true })} />
                                <ProfileButton text={'Biometric Authentication'} onPress={() => this.setState({ deleted: true })} />
                                <ProfileButton text={'2FA Authentication'} onPress={() => this.setState({ deleted: true })} />
                                <ProfileButton text={'Logout'} textColor={"#FF0000"} hideBorder={true} onPress={() => this.setState({ deleted: true })} />
                            </ThemedView>
                        </ThemedView>

                        <ThemedView style={{ gap: 12, marginTop: 40 }}>
                            <ThemedText>Other services</ThemedText>
                            <ThemedView
                                style={{
                                    padding: 8,
                                    borderRadius: 12,
                                    gap: 8,
                                    backgroundColor: this.appreance === "dark" ? '#090909' : '#F7F7F7'
                                }}
                            >
                                <ProfileButton text={'Rate WealthX'} onPress={() => Linking.openURL(this.store_link).catch((err) => console.error('Error opening URL:', err))} />
                                <ProfileButton text={'Share'} onPress={async () => {
                                    await Share.share({
                                        title: "Join WealthX and start trading your own cryptocurrency assets",
                                        message: this.store_link,
                                    });
                                }} />
                                <ProfileButton text={'Help'} onPress={() => {
                                    Linking.openURL('https://wealthx.app/faq').catch((err) => console.error('Error opening URL:', err));
                                }} />
                                <ProfileButton textColor={"#FF0000"} text={'Delete Account'} hideBorder={true} onPress={() => this.setState({ deleted: true })} />
                            </ThemedView>
                        </ThemedView>
                    </ThemedView>

                    <DialogModal
                        title='Confirm Account Delete'
                        message={<>
                            <ThemedText style={styles.dialogMessage}>Are you sure you want to delete your account? This action cannot be undone. </ThemedText>
                            <ThemedText style={styles.dialogMessage}>This will also remove all your data and access to your account. Do you want to proceed?</ThemedText>
                        </>}
                        visible={deleted}
                        onConfirm={() => this.setState({ deleted: !deleted }, async () => {
                            await sessionManager.logout();
                            router.dismissTo("/");
                        })}
                        onCancel={() => this.setState({ deleted: !deleted })} />
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
        paddingLeft: 5,
    },
    backIcon: {
        height: 23,
        width: 23,
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
    dialogMessage: {
        fontSize: 16,
        marginBottom: 20,
        fontFamily: 'AeonikRegular',
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
        backgroundColor: 'white',
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