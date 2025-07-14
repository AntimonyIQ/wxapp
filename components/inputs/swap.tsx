import {
    Appearance,
    ColorSchemeName,
    Image,
    NativeSyntheticEvent,
    Pressable,
    StyleSheet,
    TextInput,
    TextInputFocusEventData,
    View,
} from 'react-native';
import React from 'react';
import { IMarket } from '@/interface/interface';
import ThemedView from '../ThemedView';
import ThemedText from '../ThemedText';

interface SwapInputProps {
    onChangeCoin: () => void;
    onMaxPress: () => void;
    asset: IMarket;
    onChangeText: (text: string) => void;
    value: string;
    onFocus: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
    readOnly: boolean;
}

export default class SwapTextField extends React.Component<SwapInputProps> {
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    constructor(props: SwapInputProps) {
        super(props);
    }

    render() {
        const { onChangeCoin, asset, onMaxPress, onChangeText, value, onFocus, readOnly } = this.props;

        return (
            <ThemedView style={styles.container}>
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder='_'
                        style={styles.input}
                        onChangeText={onChangeText}
                        value={value}
                        showSoftInputOnFocus={false}
                        onFocus={onFocus}
                        readOnly={readOnly || false}
                        keyboardAppearance='dark'
                        keyboardType='phone-pad'
                        enablesReturnKeyAutomatically={false}
                    />
                    <ThemedText style={styles.priceText}>
                        {(Number(value) * asset.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </ThemedText>
                </View>
                <View>
                    <View style={styles.currencyContainer}>
                        <Pressable onPress={onChangeCoin} style={styles.currencyButton}>
                            <Image source={{ uri: asset.icon }} style={styles.currencyIcon} />
                            <ThemedText style={styles.currencyText}>
                                {asset.currency}
                            </ThemedText>
                            <Image
                                source={require("../../assets/icons/chevron-left-white.svg")}
                                style={styles.chevronIcon}
                                tintColor={this.appreance === "dark" ? "#FFF" : "#000000"} />
                        </Pressable>
                        <View style={styles.balanceContainer}>
                            <ThemedText style={styles.balanceText}>
                                Balance: {asset.balance}
                            </ThemedText>
                            <Pressable style={styles.maxButton} onPress={onMaxPress}>
                                <ThemedText style={{ fontFamily: 'AeonikRegular', fontSize: 12 }}>Max</ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </ThemedView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 18,
        paddingLeft: 20,
        paddingRight: 13,
        borderRadius: 12,
        backgroundColor: Appearance.getColorScheme() === "dark" ? '#060606' : '#F2F2F2',
        flexDirection: 'row',
    },
    inputContainer: {
        flex: 1,
        gap: 8,
    },
    input: {
        fontSize: 24,
        color: Appearance.getColorScheme() === "dark" ? '#ffffff' : '#1F1F1F',
        fontFamily: 'AeonikMedium',
    },
    priceText: {
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        lineHeight: 14,
    },
    currencyContainer: {
        gap: 13,
    },
    currencyButton: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
        gap: 5,
        backgroundColor: Appearance.getColorScheme() === "dark" ? '#272727' : 'white',
        padding: 2,
        paddingRight: 6,
        borderRadius: 100,
        alignItems: 'center',
    },
    currencyIcon: {
        height: 14,
        width: 14,
    },
    currencyText: {
        fontSize: 14,
        fontFamily: 'AeonikRegular',
    },
    chevronIcon: {
        height: 14,
        width: 14,
        transform: [{ rotate: "270deg" }]
    },
    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    balanceText: {
        fontSize: 10,
        fontFamily: 'AeonikMedium',
    },
    maxButton: {
        paddingHorizontal: 8,
        borderRadius: 99,
        backgroundColor: '#1d6bf199',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
