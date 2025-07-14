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

SplashScreen.preventAutoHideAsync();

interface RootLayoutState {
    loaded: boolean;
}

const isDesktop: boolean = Platform.OS === 'web' && Dimensions.get('window').width > 600;

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
        { name: '+not-found', headerShown: false },
    ];
    constructor(props: {}) {
        super(props);
        this.state = { loaded: false };
    }

    async componentDidMount() {
        await this.loadFonts();
        this.setState({ loaded: true });
        SplashScreen.hideAsync();
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

    render() {
        if (!this.state.loaded) { return null; }

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