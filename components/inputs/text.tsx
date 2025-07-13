import { Colors } from '@/constants/Colors';
import React from 'react';
import {
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Vibration,
    KeyboardTypeOptions,
    Appearance,
    Platform,
} from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';

interface IProps {
    placeholder?: string;
    showText?: boolean;
    showEye?: boolean;
    textValue?: string;
    title?: string;
    secureTextEntry?: boolean;
    onPress?: () => void;
    showPasteButton?: boolean;
    onClear?: () => void;
    onChangeText: (text: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    keyboardType?: KeyboardTypeOptions;
    readonly?: boolean;
    disable?: boolean;
    maxLength?: number;
}

interface IState {
    toggleEye: boolean;
}

export default class TextField extends React.Component<IProps, IState> {
    private appreance = Appearance.getColorScheme();
    constructor(props: IProps) {
        super(props);
        this.state = { toggleEye: false };
        this.handlePaste = this.handlePaste.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
    }

    async handlePaste(): Promise<void> {
        try {
            const vibrationPattern = [0, 5];
            Vibration.vibrate(vibrationPattern, false);

            const clipboardContent: string = await Clipboard.getStringAsync();
            this.props.onChangeText(clipboardContent);
        } catch (error) {
            console.error('Error pasting from clipboard:', error);
        }
    }

    handleFocus(): void {
        if (this.props.onFocus) {
            this.props.onFocus();
        }
    }

    handleBlur(): void {
        if (this.props.onBlur) {
            this.props.onBlur();
        }
    }

    render(): React.ReactNode {
        const {
            placeholder,
            showText,
            textValue,
            title,
            secureTextEntry,
            onPress,
            showPasteButton,
            onClear,
            keyboardType,
            showEye,
            readonly,
            disable,
            maxLength,
        } = this.props;
        const { toggleEye } = this.state;

        return (
            <ThemedView
                style={[
                    styles.container,
                    { paddingVertical: 4 }
                ]}
            >
                {showText && (
                    <ThemedText style={styles.labelText}>{title}</ThemedText>
                )}
                <ThemedView style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder={placeholder}
                        value={textValue}
                        onChangeText={this.props.onChangeText}
                        onBlur={this.handleBlur}
                        onFocus={this.handleFocus}
                        autoCorrect={false}
                        secureTextEntry={secureTextEntry && !toggleEye}
                        onPressIn={onPress}
                        keyboardType={keyboardType}
                        editable={!readonly &&!disable}
                        maxLength={maxLength}
                    />
                    {showText && !showPasteButton && (
                        <Pressable onPress={onClear} style={styles.clearButton}>
                            <ThemedText style={styles.clearText}>Clear</ThemedText>
                        </Pressable>
                    )}
                    {showPasteButton && (
                        <Pressable onPress={this.handlePaste} style={styles.pasteButton}>
                            <ThemedText style={styles.pasteText}>Paste</ThemedText>
                        </Pressable>
                    )}
                    {showEye && (
                        <Pressable onPress={() => this.setState({ toggleEye: !toggleEye })}>
                            <Image
                                source={!toggleEye ? require("../../assets/icons/eye.svg") : require("../../assets/icons/eyeoff.svg")}
                                style={{ height: 24, width: 24 }}
                                contentFit="contain" tintColor={this.appreance === "dark" ? Colors.dark.text : Colors.light.text}
                                transition={1000} />
                        </Pressable>
                    )}
                </ThemedView>
            </ThemedView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#000" : "#F7f7f7",
        borderRadius: 10,
        marginBottom: 16,
        width: "100%",
    },
    labelText: {
        paddingBottom: 6,
        fontFamily: 'AeonikRegular',
        fontSize: 10,
        color: Appearance.getColorScheme() === "dark"? Colors.dark.text : Colors.light.text,
        lineHeight: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#000" : "#F7f7f7",
    },
    input: {
        flex: 1,
        fontFamily: 'AeonikMedium',
        fontSize: 16,
        color: Appearance.getColorScheme() === "dark"? Colors.dark.text : Colors.light.text,
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#000" : "#F7f7f7",
        outlineColor: 'transparent',
        paddingVertical: 10,
        // ...(Platform.OS === 'web' ? { outline: "none" } : {})
    },
    clearButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#f7f7f7",
        borderRadius: 99,
        paddingHorizontal: 6,
        paddingVertical: 5,
        marginLeft: 8,
    },
    clearText: {
        fontFamily: 'AeonikRegular',
        fontSize: 12,
        color: 'black',
        lineHeight: 14,
    },
    pasteButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.dark.tint,
        borderRadius: 99,
        paddingHorizontal: 12,
        paddingVertical: 5,
        marginLeft: 8,
    },
    pasteText: {
        fontFamily: 'AeonikRegular',
        fontSize: 12,
        color: 'black',
        lineHeight: 14,
    },
});