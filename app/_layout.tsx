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

import 'react-native-reanimated';
import * as Font from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import Toast from 'react-native-toast-message';
import { Appearance, Platform, Dimensions, View, Text } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { addNotificationReceivedListener, addNotificationResponseReceivedListener, registerForPushNotificationsAsync, scheduleNotification } from '@/notifications/notification';
import logger from '@/logger/logger';
import Defaults from './default/default';
import sessionManager from '@/session/session';
import { INotification, IResponse, UserData } from '@/interface/interface';
import { Status } from '@/enums/enums';

SplashScreen.preventAutoHideAsync();

interface RootLayoutState {
    loaded: boolean;
    expoPushToken: string;
}

const isDesktop: boolean = Platform.OS === 'web' && Dimensions.get('window').width > 600;
const NOTIFICATION_TASK_IDENTIFIER = 'notification-task';

TaskManager.defineTask(NOTIFICATION_TASK_IDENTIFIER, async () => {
    try {
        await Defaults.IS_NETWORK_AVAILABLE();
        const session: UserData = sessionManager.getUserData();
        const res = await fetch(`${Defaults.API}/notification/user/${session.user?._id}`, {
            method: 'GET',
            headers: {
                ...Defaults.HEADERS,
                'x-wealthx-handshake': session.client?.publicKey,
                'x-wealthx-deviceid': session.deviceid,
            },
        });

        const data: IResponse = await res.json();
        if (data.status === Status.ERROR) throw new Error(data.message || data.error);
        if (data.status === Status.SUCCESS) {
            if (!data.handshake) throw new Error('Unable to process data right now, please try again.');
            const notifications: Array<INotification> = Defaults.PARSE_DATA(data.data, session.client?.privateKey, data.handshake);
            console.log(notifications);
            for (const notification of notifications) {
                await scheduleNotification(
                    notification.title,
                    notification.body,
                    { type: "info" },
                    2
                );
            }
        }

        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        console.error("Background fetch failed:", error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

export default class RootLayout extends React.Component<{}, RootLayoutState> {
    private readonly routes: Array<{ name: string, headerShown: boolean }> = [
        { name: 'index', headerShown: false },
        { name: 'onboarding', headerShown: false },
        { name: 'dashboard', headerShown: false },
        { name: 'register', headerShown: false },
        { name: 'verify', headerShown: false },
        { name: 'passkey', headerShown: false },
        { name: 'coin', headerShown: false },
        { name: 'send', headerShown: false },
        { name: 'swap', headerShown: false },
        { name: 'account', headerShown: false },
        { name: 'refer', headerShown: false },
        { name: 'payment', headerShown: false },
        { name: 'withdraw', headerShown: false },
        { name: 'transaction', headerShown: false },
        { name: 'test', headerShown: false },
        { name: 'chat', headerShown: false },
        { name: 'phone', headerShown: false },
        { name: '2fa', headerShown: false },
        { name: 'pin', headerShown: false },
        { name: '+not-found', headerShown: false },
    ];
    private notificationListener: any;
    private responseListener: any;
    constructor(props: {}) {
        super(props);
        this.state = { loaded: false, expoPushToken: "" };
    }

    public async componentDidMount() {
        try {
            await SplashScreen.preventAutoHideAsync();

            await this.loadFonts();
            this.setState({ loaded: true });
            await SplashScreen.hideAsync();

            this.tasks();

            const token = await registerForPushNotificationsAsync();
            this.setState({ expoPushToken: token ?? "" });

            this.notificationListener = addNotificationReceivedListener(notification => {
                logger.log("notification: ", notification);
            });

            this.responseListener = addNotificationResponseReceivedListener(response => {
                logger.log("response: ", response);
            });
        } catch (err) {
            console.error("❌ Error during app init:", err);
            this.setState({ loaded: true });
            await SplashScreen.hideAsync();
        }
    }

    async loadFonts() {
        await Font.loadAsync({
            AeonikAir: require('../assets/fonts/Aeonik-Air.otf'),
            AeonikBlack: require('../assets/fonts/Aeonik-Black.otf'),
            AeonikBold: require('../assets/fonts/Aeonik-Bold.otf'),
            AeonikLight: require('../assets/fonts/Aeonik-Light.otf'),
            AeonikMedium: require('../assets/fonts/Aeonik-Medium.otf'),
            AeonikRegular: require('../assets/fonts/Aeonik-Regular.otf'),
            AeonikThin: require('../assets/fonts/Aeonik-Thin.otf'),
        });
    }

    private tasks = async (): Promise<void> => {
        try {
            const status = await BackgroundFetch.getStatusAsync();
            console.log("Background fetch status:", status);

            if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
                const isRegistered = await TaskManager.isTaskRegisteredAsync(NOTIFICATION_TASK_IDENTIFIER);
                if (!isRegistered) {
                    await BackgroundFetch.registerTaskAsync(NOTIFICATION_TASK_IDENTIFIER, {
                        minimumInterval: 900, // 15 mins
                        stopOnTerminate: false,
                        startOnBoot: true,
                    });
                    console.log("✅ Background fetch task registered.");
                } else {
                    console.log("ℹ️ Background fetch already registered.");
                }
            } else {
                console.warn("⚠️ Background fetch is unavailable.");
            }
        } catch (error) {
            console.error("Failed to register background fetch:", error);
        }
    };

    render() {
        if (!this.state.loaded) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Loading...</Text>
                </View>
            );
        }

        return (
            <ThemeProvider value={Appearance.getColorScheme() === 'dark' ? DarkTheme : DefaultTheme}>
                {isDesktop ?
                    <View>
                        <Text>Not supported</Text>
                    </View>
                    :
                    <Stack>
                        {this.routes.map((r, i) => (
                            <Stack.Screen key={i} name={r.name} options={{ headerShown: r.headerShown }} />
                        ))}
                    </Stack>
                }
                <StatusBar style='auto' />
                <Toast />
            </ThemeProvider>
        );
    }
}