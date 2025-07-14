import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Appearance } from 'react-native';
import { Coin } from '@/enums/enums';
import ThemedText from '../ThemedText';
import { IMarket } from '@/interface/interface';

interface AmountFieldProps {
    onFocus: Function;
    onBlur: Function;
    onChangeText: Function;
    coinRate: Function;
    placeholder: string;
    showText: boolean;
    value: string;
    title: string;
    maxLength: number;
    symbol: string;
    rate: number;
    balance: number;
    currencyName: string;
    asset: IMarket;
}

interface AmountFieldState {
    rate: number;
    equivalentAmount: number;
    exchangeRate: number;
}

export default class AmountField extends React.Component<AmountFieldProps, AmountFieldState> {
    constructor(props: AmountFieldProps) {
        super(props);
        this.state = { equivalentAmount: 0, exchangeRate: 0, rate: 0, };
        this.handleBlur = this.handleBlur.bind(this);
    }

    private handleFocus = () => {
        const { onFocus } = this.props;
        onFocus();
    };

    private handleBlur = () => {
        const { onBlur } = this.props;
        onBlur();
    };

    private validateAndFormatInput = (text: string) => {
        const regex = /^\d*\.?\d*$/;

        if (regex.test(text)) {
            const parts = text.split('.');

            if (parts.length > 2) {
                return parts[0] + '.' + parts.slice(1).join('');
            }

            return text;
        } else {
            let validText = '';
            let decimalFound = false;

            for (let char of text) {
                if (char >= '0' && char <= '9') {
                    validText += char;
                } else if (char === '.' && !decimalFound) {
                    validText += char;
                    decimalFound = true;
                }
            }

            return validText;
        }
    };

    private handleTextChange = (text = "") => {
        const { onChangeText } = this.props;

        const formattedText = this.validateAndFormatInput(text);
        onChangeText(formattedText);
    }

    private handleMaxTextChange = (text = "") => {
        const { onChangeText, rate } = this.props;
        const amt: string = (parseFloat(text) * rate).toFixed(2);
        const formattedText = this.validateAndFormatInput(amt.toString());
        onChangeText(formattedText);
    }

    render() {
        const {
            placeholder,
            showText,
            value,
            title,
            maxLength,
            symbol,
            asset,
        } = this.props;

        return (
            <View
                style={[
                    styles.container,
                    { paddingVertical: this.props.onFocus || value ? 20 : 11 },
                ]}>
                <View style={styles.inputSecondary}>
                    {showText && (
                        <ThemedText style={styles.labelText}>{title}</ThemedText>
                    )}
                    <Pressable onPress={() => this.handleMaxTextChange(asset.balance.toString())} style={{ paddingHorizontal: 10, paddingVertical: 2, borderWidth: 1, borderColor: "#253E92", borderRadius: 360, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontFamily: 'AeonikRegular', fontSize: 11, color: "#253E92" }}>Max</Text>
                    </Pressable>
                </View>
                <View style={styles.inputContainer}>
                    <ThemedText style={styles.dollar}>$</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder={placeholder}
                        value={value}
                        onChangeText={(text) => this.handleTextChange(text)}
                        onBlur={this.handleBlur}
                        onFocus={this.handleFocus}
                        autoCorrect={false}
                        secureTextEntry={false}
                        keyboardType="decimal-pad"
                        maxLength={maxLength || undefined}
                    />
                </View>
                <View style={styles.inputSecondary}>
                    <Text style={styles.inputSecondaryTextLeft}>
                        Approx {(Number(value) / asset.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: (asset.currency === Coin.USDC || asset.currency === Coin.USDT) ? 2 : 6 }) || "n/a"} {symbol}
                    </Text>
                    <Text style={styles.inputSecondaryTextRight}>1 {symbol} = {asset.price.toFixed(2) || "n/a"} USD</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        backgroundColor: Appearance.getColorScheme() === "dark" ? '#090909' : '#f7f7f7',
        borderRadius: 10,
        marginBottom: 16,
        width: "100%"
    },
    labelText: {
        paddingBottom: 6,
        fontFamily: 'AeonikRegular',
        fontSize: 10,
        lineHeight: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        height: 104,
    },
    dollar: {
        fontFamily: 'AeonikMedium',
        fontSize: 40,
        lineHeight: 40,
    },
    input: {
        flex: 1,
        fontFamily: 'AeonikMedium',
        fontSize: 40,
        lineHeight: 40,
        color: Appearance.getColorScheme() === "dark" ? '#f1f1f1' : '#1F1F1F',
        textDecorationLine: "none",
        width: "100%"
    },
    inputSecondary: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    inputSecondaryTextLeft: {
        fontSize: 12,
        color: '#757575',
        fontFamily: 'AeonikMedium',
    },
    inputSecondaryTextRight: {
        color: '#253E92',
        fontSize: 12,
        fontFamily: 'AeonikMedium',
        paddingHorizontal: 10
    }
});
