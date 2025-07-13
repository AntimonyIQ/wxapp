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

import React, { Component } from 'react';
import { Text, StyleSheet, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
    type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export default class ThemedText extends Component<ThemedTextProps> {
    render() {
        const { style, type = 'default', ...rest } = this.props;

        const typeStyle =
            type === 'title'
                ? styles.title
                : type === 'defaultSemiBold'
                    ? styles.defaultSemiBold
                    : type === 'subtitle'
                        ? styles.subtitle
                        : type === 'link'
                            ? styles.link
                            : styles.default;

        return (
            <Text
                style={[
                    { fontFamily: 'AeonikRegular' },
                    typeStyle,
                    style,
                ]}
                {...rest}
            />
        );
    }
}

const styles = StyleSheet.create({
    default: {
        fontSize: 16,
        lineHeight: 24,
    },
    defaultSemiBold: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '600',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 32,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    link: {
        lineHeight: 30,
        fontSize: 16,
        color: '#0a7ea4',
    },
});
