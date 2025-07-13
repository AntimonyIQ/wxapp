import { Appearance, ColorSchemeName, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ThemedText } from '../ThemedText';
interface BackButtonProps {
    title: string;
    subtitle?: string;
    content?: string;
    p1?: boolean;
    p2?: boolean;
    p3?: boolean;
    p4?: boolean;
    showProgress?: boolean;
}

class BackButton extends React.Component<BackButtonProps> {
    private appreance: ColorSchemeName = Appearance.getColorScheme();

    render(): React.ReactNode {
        const { title, subtitle, content, p1, p2, p3, p4, showProgress } = this.props;

        return (
            <View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 24,
                    }}
                >
                    <TouchableOpacity
                        style={styles.backbutton}
                        onPress={() => router.back()}
                    >
                        <Image 
                            source={require("../../assets/icons/chevron-left.svg")} 
                            style={{ height: 24, width: 24 }}
                            contentFit="contain" tintColor={this.appreance === "dark" ? "white" : "black"}
                            transition={1000} />
                        <ThemedText style={styles.backtext}>Back</ThemedText>
                    </TouchableOpacity>
                    {showProgress && (
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                            <View
                                style={[
                                    styles.progress,
                                    { backgroundColor: p1 ? Colors.blue : '#D9D9D9' },
                                ]}
                            />
                            <View
                                style={[
                                    styles.progress,
                                    { backgroundColor: p2 ? Colors.blue : '#D9D9D9' },
                                ]}
                            />
                            <View
                                style={[
                                    styles.progress,
                                    { backgroundColor: p3 ? Colors.blue : '#D9D9D9' },
                                ]}
                            />
                            <View
                                style={[
                                    styles.progress,
                                    { backgroundColor: p4 ? Colors.blue : '#D9D9D9' },
                                ]}
                            />
                        </View>
                    )}
                </View>

                <View style={{ gap: 8, paddingRight: 60 }}>
                    <ThemedText style={styles.title}>{title}</ThemedText>
                    <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
                    <ThemedText style={[styles.subtitle]}>
                        {content}
                    </ThemedText>
                </View>
            </View>
        );
    }
}

export default BackButton;

const styles = StyleSheet.create({
    backbutton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#000000" : '#f7f7f7',
        borderRadius: 99,
        paddingLeft: 6,
        paddingVertical: 5,
        justifyContent: 'center',
        alignSelf: 'flex-start',
        paddingRight: 20,
    },
    title: {
        fontFamily: 'AeonikBold',
        fontSize: 24,
    },
    backtext: {
        fontFamily: 'AeonikRegular',
        fontSize: 12,
        lineHeight: 14,
    },
    subtitle: {
        fontFamily: 'AeonikRegular',
        fontSize: 14,
        lineHeight: 14,
    },
    progress: {
        padding: 1.5,
        width: 24,
        borderRadius: 100,
    },
});
