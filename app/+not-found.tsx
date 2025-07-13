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

import { Link, Stack } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface IProps { }

interface IState { }

export default class NotFoundScreen extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }

    render(): React.ReactNode {
        return (
            <>
                <Stack.Screen options={{ title: "Oops!" }} />
                <View style={styles.container}>
                    <Text>This screen does not exist.</Text>
                    <Link href="/" style={styles.link}>
                        <Text>Go to home screen!</Text>
                    </Link>
                </View>
            </>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
});
