// This is part for the Wealthx Mobile Applicati                        tabBarStyle: {
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { UserData } from '@/interface/interface';
import logger from '@/logger/logger';
import { Image } from 'expo-image';
import { router, Stack, Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import sessionManager from '../../session/session';
import Defaults from '../default/default';

export default class TabLayout extends React.Component<{}, {}> {
    private session: UserData = sessionManager.getUserData();
    constructor(props: {}) {
        super(props);

        const login: boolean = Defaults.LOGIN_STATUS();
        if (!login) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            return;
        };
    }

    componentDidMount(): void {
        logger.clear();
    }

    render() {

        return (
            <>
                <Stack.Screen options={{ title: 'Home', headerShown: false }} />
                <Tabs
                    screenOptions={{
                        tabBarActiveTintColor: "#283C8D",
                        headerShown: false,
                        tabBarShowLabel: true,
                        tabBarStyle: {
                            backgroundColor: '#FFFFFF',
                            borderTopWidth: 1,
                            borderTopColor: '#F5F5F5',
                            height: Platform.OS === 'android' ? 65 : Platform.OS === 'ios' ? 95 : 70,
                            paddingTop: Platform.OS === 'android' ? 0 : Platform.OS === 'ios' ? 10 : 0,
                            paddingBottom: Platform.OS === 'android' ? 10 : Platform.OS === 'ios' ? 30 : 0,
                        },
                        tabBarLabelStyle: {
                            fontSize: 11,
                            fontFamily: 'AeonikRegular',
                            marginBottom: Platform.OS === 'android' ? 0 : 0,
                            lineHeight: 14,
                        },
                        tabBarIconStyle: {
                            marginTop: Platform.OS === 'android' ? 0 : 4,
                        },
                    }}>
                    <Tabs.Screen
                        name="home"
                        options={{
                            title: "Home",
                            tabBarIcon: ({ focused }) =>
                                !focused
                                    ? <Image source={require("../../assets/icons/home.svg")} style={{ width: 24, height: 24 }} contentFit="contain" transition={1000} />
                                    : <Image source={require("../../assets/icons/home_active.svg")} style={{ width: 24, height: 24 }} contentFit="contain" transition={1000} />
                        }}
                    />
                    <Tabs.Screen
                        name="wallet"
                        options={{
                            title: "Wallet",
                            tabBarIcon: ({ focused }) =>
                                !focused
                                    ? <Image source={require("../../assets/icons/wallet.svg")} style={{ width: 24, height: 24 }} contentFit="contain" transition={1000} />
                                    : <Image source={require("../../assets/icons/wallet_active.svg")} style={{ width: 24, height: 24 }} contentFit="contain" transition={1000} />
                        }}
                    />
                    <Tabs.Screen
                        name="support"
                        options={{
                            title: "Support",
                            tabBarIcon: ({ focused }) =>
                                !focused
                                    ? <Image source={require("../../assets/icons/support.svg")} style={{ width: 24, height: 24 }} contentFit="contain" transition={1000} />
                                    : <Image source={require("../../assets/icons/support_active.svg")} style={{ width: 24, height: 24 }} contentFit="contain" transition={1000} />
                        }}
                    />
                    <Tabs.Screen
                        name="profile"
                        options={{
                            title: "Account",
                            tabBarIcon: ({ focused }) =>
                                !focused
                                    ? <Image source={require("../../assets/icons/user.svg")} style={{ width: 24, height: 24 }} contentFit="contain" transition={1000} />
                                    : <Image source={require("../../assets/icons/user_active.svg")} style={{ width: 24, height: 24 }} contentFit="contain" transition={1000} />
                        }}
                    />
                    <Tabs.Screen
                        name="index"
                        options={{
                            href: null,
                        }}
                    />
                </Tabs>
            </>
        );
    }
}
