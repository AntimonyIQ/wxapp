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

import ProfileButton from '@/components/button/profile';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import ThemedText from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';
import { IUser, UserData } from '@/interface/interface';
import logger from '@/logger/logger';
import { micah } from '@dicebear/collection';
import { createAvatar, Result } from '@dicebear/core';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Appearance, Linking, StyleSheet } from 'react-native';
import sessionManager from '../../session/session';

interface IProps { }

interface IState {
}

export default class TabTwoScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private avatar: Result;
    constructor(props: IProps) {
        super(props);
        this.state = {
            logout: false,
        };
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
        this.avatar = createAvatar(micah, {
            seed: this.session?.user?.fullName,
        });
    }

    componentDidMount(): void {
        logger.clear();
    }

    render() {
        return (
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
                headerImage={
                    <Image
                        source={this.avatar.toDataUri()}
                        style={styles.headerImage}
                    />
                }>
                <ThemedView style={styles.section}>
                    <ThemedText style={{ fontFamily: 'AeonikRegular' }}>Account services</ThemedText>
                    <ThemedView style={styles.servicesContainer}>
                        <ProfileButton
                            text={'Account details'}
                            onPress={() => router.navigate('/account')}
                        />
                        <ProfileButton
                            text={'Payment methods'}
                            onPress={() => router.navigate('/payment')}
                        />
                        <ProfileButton
                            text={'Refer and Earn'}
                            onPress={() => router.navigate('/refer')}
                        />
                        <ProfileButton
                            text={'Settings'}
                            onPress={() => router.navigate('/account/setting')}
                            hideBorder={true}
                        />
                    </ThemedView>
                </ThemedView>

                <ThemedView style={styles.section}>
                    <ThemedText style={{ fontFamily: 'AeonikRegular' }}>Others</ThemedText>
                    <ThemedView style={styles.servicesContainer}>
                        <ProfileButton text={'Legal'} onPress={() => {
                            Linking.openURL('https://wealthx.app/privacy').catch((err) => console.error('Failed to open URL:', err))
                        }} />
                        <ProfileButton text={'Chat With Us'} onPress={() => router.navigate('/chat')} />
                        <ProfileButton text={'Get Help'} hideBorder={true} onPress={() => Linking.openURL('https://wealthx.app/faq').catch((err) => console.error('Failed to open URL:', err))} />
                    </ThemedView>
                </ThemedView>
            </ParallaxScrollView>
        );
    }
}

const styles = StyleSheet.create({
    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -25,
        position: 'absolute',
        width: 250,
        height: 250
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
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
        color: "red",
        lineHeight: 14,
    },
    title: {
        fontSize: 16,
        fontFamily: 'AeonikBold',
    },
    settingsButton: {
        padding: 6,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    content: {
        marginTop: 46,
        marginHorizontal: 16,
    },
    profileContainer: {
        paddingHorizontal: 24,
        paddingVertical: 23,
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
    },
    profileInfo: {
        flex: 1,
        gap: 12,
    },
    avatar: {
        height: 48,
        width: 48,
    },
    userTag: {
        fontSize: 12,
        color: '#253E92',
        lineHeight: 14,
        fontFamily: 'AeonikRegular',
    },
    section: {
        gap: 8,
    },
    servicesContainer: {
        padding: 18,
        borderRadius: 12,
        gap: 8,
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#0f0f0f" : "#F5F5F5",
    },
    dialogMessage: {
        fontSize: 16,
        marginBottom: 20,
        fontFamily: 'AeonikRegular',
    },
});
