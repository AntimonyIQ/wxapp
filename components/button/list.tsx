import React from 'react';
import { Pressable, StyleSheet, Text, View, Image, Appearance } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

interface IListBtnProps {
    icon: string;
    name: string;
    description: string;
    onPress: () => void;
}

export default class ListButton extends React.Component<IListBtnProps, {}> {
    constructor(props: IListBtnProps) { super(props); }
    render() {
        const { icon, name, description, onPress } = this.props;

        return (
            <Pressable
                onPress={onPress}
                style={styles.container}
            >
                <Image
                    source={{ uri: icon }}
                    style={styles.icon}
                />
                <ThemedView>
                    <ThemedText style={styles.nameText}>
                        {name}
                    </ThemedText>
                    <ThemedText style={styles.abbText}>
                        {description}
                    </ThemedText>
                </ThemedView>
            </Pressable>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 8,
        marginBottom: 8,
    },
    icon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    nameText: {
        fontSize: 14,
        fontFamily: 'AeonikMedium',
        lineHeight: 16,
    },
    abbText: {
        color: Appearance.getColorScheme() === "dark" ? "#cdcdcd" : '#757575',
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        lineHeight: 16,
    },
});
