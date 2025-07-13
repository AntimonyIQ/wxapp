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

import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';

interface IProps {
    title: string;
    meetsCondition: boolean;
}

interface IState { }

export default class PasswordCondition extends React.Component<IProps, IState> {
    render() {
        const { title, meetsCondition } = this.props;
        return (
            <View style={styles.container}>
                {meetsCondition
                    ? <Image source={require("../assets/icons/positivecheck.svg")} style={{ width: 24, height: 24 }} />
                    : <Image source={require("../assets/icons/check.svg")} style={{ width: 24, height: 24 }} />}
                <Text style={styles.text}>{title}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    text: {
        fontSize: 10,
        fontFamily: 'AeonikRegular',
        color: '#757575',
        lineHeight: 12,
    },
});
