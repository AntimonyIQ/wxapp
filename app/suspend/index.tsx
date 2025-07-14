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
import { UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Appearance, ColorSchemeName, SafeAreaView, View } from "react-native";
import sessionManager from "@/session/session";

interface IProps { }

interface IState { }

export default class TemplateScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Template Screen";
    constructor(props: IProps) {
        super(props);

        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
    }

    componentDidMount(): void { }

    render(): React.ReactNode {
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <SafeAreaView>
                    <View></View>
                </SafeAreaView>
                <StatusBar style='light' />
            </>
        )
    }
}