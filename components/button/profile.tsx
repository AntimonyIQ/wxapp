import { Appearance, ColorSchemeName, Pressable, Text } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import { ThemedText } from '../ThemedText';
import { Colors } from '@/constants/Colors';

interface ProfileButtonProps {
    text: string;
    onPress: () => void;
    hideBorder?: boolean;
}

export default class ProfileButton extends React.Component<ProfileButtonProps> {
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    render() {
        const { text, onPress, hideBorder } = this.props;
        return (
            <Pressable
                onPress={onPress}
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    borderBottomWidth: hideBorder === true ? 0 : 1,
                    borderBottomColor: this.appreance === "dark" ? Colors.dark.background : '#E8E8E8',
                    alignItems: 'center',
                }}
            >
                <ThemedText
                    style={{
                        fontSize: 14,
                        fontFamily: 'AeonikMedium',
                        lineHeight: 16,
                    }}
                >
                    {text}
                </ThemedText>
                <Image 
                    source={require("../../assets/icons/chevron-left.svg")} 
                    style={{ width: 10, right: 10, transform: [{ rotate: '180deg' }] }}
                    tintColor={this.appreance === "dark" ? Colors.light.background : Colors.dark.background } />
            </Pressable>
        );
    }
}
