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

import React from 'react';
import { ColorValue, Switch } from 'react-native';
import ThemedText from '../ThemedText';
import ThemedView from '../ThemedView';

interface ISwitchProps {
    text: string;
    textColor?: ColorValue;
    onValueChange: () => void;
    hideBorder?: boolean;
    isEnabled: boolean;
}

export default class ProfileSwitch extends React.Component<ISwitchProps> {

    render() {
        const { text, onValueChange, hideBorder, textColor, isEnabled } = this.props;
        return (
            <ThemedView
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    borderBottomWidth: hideBorder === true ? 0 : 1,
                    borderBottomColor: '#E8E8E8',
                    alignItems: 'center',
                }}
            >
                <ThemedText
                    style={{
                        fontSize: 14,
                        fontFamily: 'AeonikMedium',
                        lineHeight: 16,
                        color: textColor ? textColor : '#000000',
                    }}
                >
                    {text}
                </ThemedText>
                <Switch
                    trackColor={{ false: '#767577', true: '#043C9C' }}
                    thumbColor={isEnabled ? '#F0B237' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={onValueChange}
                    value={isEnabled}
                />
            </ThemedView>
        );
    }
}
