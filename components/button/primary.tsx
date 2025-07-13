import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import React, { Component } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

interface IButtonProps {
    Gradient?: boolean;
    title: string;
    onPress: () => void;
    Gold?: boolean;
    Grey?: boolean;
    loading?: boolean;
    disabled?: boolean;
}

export default class PrimaryButton extends Component<IButtonProps> {
    render() {
        const { Gradient, title, onPress, Gold, Grey, loading, disabled } = this.props;

        return (
            <Pressable onPress={onPress} disabled={disabled} style={{ width: "100%" }}>
                <LinearGradient
                    colors={
                        Gradient
                            ? ["#2B49AB", "#101C41"]
                            : Gold
                                ? ['#FBA91E', '#FBA91E']
                                : Grey
                                    ? ['#757575', '#757575']
                                    : ["#FFF", '#FFF']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{
                        x: Math.sin((93 * Math.PI) / 180),
                        y: Math.cos((93 * Math.PI) / 180),
                    }}
                    style={[
                        styles.buttonContainer,
                        Gradient && styles.gradientButton,
                        Grey && styles.greyButton,
                        Gold && styles.goldButton,
                        !Gold && { borderWidth: Gradient ? 0 : 1, borderColor: "#000000" }
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text
                            style={[Gradient ? styles.gradientbuttontext : styles.buttontext]}
                        >
                            {title}
                        </Text>
                    )}
                </LinearGradient>
            </Pressable>
        );
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        paddingHorizontal: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
    },
    gradientButton: {
        borderWidth: 0,
    },
    greyButton: {
        borderWidth: 0,
    },
    goldButton: {
        borderWidth: 0,
    },
    gradientbuttontext: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: '500',
        color: "#FFFFFF",
        fontFamily: 'AeonikMedium',
    },
    buttontext: {
        color: 'black',
        fontSize: 14,
        lineHeight: 16,
        fontFamily: 'AeonikRegular',
    },
});
