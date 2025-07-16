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

import { ColorValue, Pressable } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import ThemedText from '../ThemedText';
import { Colors } from '@/constants/Colors';

interface ProfileButtonProps {
    text: string;
    textColor?: ColorValue;
    onPress: () => void;
    hideBorder?: boolean;
}

export default class VerifiedButton extends React.Component<ProfileButtonProps> {
    render() {
        const { text, onPress, hideBorder, textColor } = this.props;
        return (
            <Pressable
                onPress={onPress}
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
                <Image
                    source={require("../../assets/icons/verification.svg")}
                    style={{ width: 20, height: 20 }}
                    tintColor={Colors.blue} />
            </Pressable>
        );
    }
}
