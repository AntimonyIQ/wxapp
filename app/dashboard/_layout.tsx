import { router, Stack, Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import sessionManager from '../../session/session';
import logger from '@/logger/logger';
import { Image } from 'expo-image';
import { UserData } from '@/interface/interface';
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
                        tabBarActiveTintColor: Colors['light'].tint,
                        headerShown: false,
                        tabBarPosition: "bottom",
                        tabBarButton: HapticTab,
                        tabBarShowLabel: false,
                        tabBarBackground: TabBarBackground,
                        tabBarStyle: Platform.select({
                            ios: {
                                // Use a transparent background on iOS to show the blur effect
                                position: 'absolute',
                            },
                            default: {},
                        }),
                    }}>
                    <Tabs.Screen
                        name="index"
                        options={{
                            tabBarIcon: ({ focused }) =>
                                !focused
                                    ? <Image source={require("../../assets/icons/home.svg")} style={{ width: 28, height: 28 }} contentFit="contain" transition={1000} />
                                    : <Image source={require("../../assets/icons/home_active.svg")} style={{ width: 28, height: 28 }} contentFit="contain" transition={1000} />
                        }}
                    />
                    <Tabs.Screen
                        name="wallet"
                        options={{
                            tabBarIcon: ({ focused }) =>
                                !focused
                                    ? <Image source={require("../../assets/icons/wallet.svg")} style={{ width: 28, height: 28 }} contentFit="contain" transition={1000} />
                                    : <Image source={require("../../assets/icons/wallet_active.svg")} style={{ width: 28, height: 28 }} contentFit="contain" transition={1000} />
                        }}
                    />
                    {/*}
                    <Tabs.Screen
                        name="p2p"
                        options={{
                            tabBarIcon: ({ focused }) =>
                                !focused
                                    ? <Image source={require("../../assets/icons/coin_exchange.svg")} style={{ width: 28, height: 28 }} contentFit="contain" transition={1000} />
                                    : <Image source={require("../../assets/icons/coin-exchange_active.svg")} style={{ width: 28, height: 28 }} contentFit="contain" transition={1000} />
                        }}
                    />*/}
                    <Tabs.Screen
                        name="profile"
                        options={{
                            tabBarIcon: ({ focused }) =>
                                !focused
                                    ? <Image source={require("../../assets/icons/user.svg")} style={{ width: 28, height: 28 }} contentFit="contain" transition={1000} />
                                    : <Image source={require("../../assets/icons/user_active.svg")} style={{ width: 28, height: 28 }} contentFit="contain" transition={1000} />
                        }}
                    />
                </Tabs>
            </>
        );
    }
}
