import { Colors } from '@/constants/Colors';
import React from 'react';
import { Modal, StyleSheet, TouchableWithoutFeedback, Appearance, Pressable, ColorSchemeName, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Image } from 'expo-image';
import logger from '@/logger/logger';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

interface PinProps {
    visible: boolean;
    onClose: () => void;
    onComplete: (pin: string) => void;
}

interface PinState {
    pins: Array<string>;
}

export default class PinModal extends React.Component<PinProps, PinState> {
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private inputRefs: React.RefObject<TextInput>[] = Array(4).fill(null).map(() => React.createRef<TextInput>());
    constructor(props: PinProps) { super(props); this.state = { pins: Array(4).fill("") } }
    componentDidMount(): void {
        logger.clear();
    }

    private handleInputChange = (text: string, index: number): void => {
        const newInputs: string[] = [...this.state.pins];
        newInputs[index] = text;
        this.setState({ pins: newInputs });

        if (text) {
            if (index < this.state.pins.length - 1) {
                this.inputRefs[index + 1].current?.focus();
            }
        } else {
            if (index > 0) {
                this.inputRefs[index - 1].current?.focus();
            }
        }
    };

    private handlePinInput = (value: string, index: number): void => {
        let { pins } = this.state;
        const newPin = [...pins];

        if (value === 'Backspace') {
            if (newPin[index]) {
                newPin[index] = "";
            } else if (index > 0) {
                newPin[index - 1] = "";
                this.inputRefs[index - 1].current?.focus();
            }
        } else {
            newPin[index] = value;
            if (index < newPin.length - 1) {
                this.inputRefs[index + 1].current?.focus();
            }
        }

        this.setState({ pins: newPin }, async () => {
            if (newPin.join("").length === 4) {
                this.props.onComplete(newPin.join(""));
            }
        });
    };

    private handleKeyPress = (e: any, index: number): void => {
        if (e.nativeEvent.key === 'Backspace' && !this.state.pins[index] && index > 0) {
            this.inputRefs[index - 1].current?.focus();
        }
    };

    private renderInputItem = ({ item, index }: { item: string, index: number }): React.JSX.Element => {
        return (
            <ThemedView style={{ alignItems: 'center', alignSelf: 'center' }}>
                <TextInput
                    style={styles.input}
                    value={item}
                    onChangeText={(text) => this.handleInputChange(text, index)}
                    keyboardType='numeric'
                    maxLength={1}
                    secureTextEntry={true}
                    ref={this.inputRefs[index]}
                    onKeyPress={(e) => this.handleKeyPress(e, index)}
                    showSoftInputOnFocus={false}
                    onFocus={(e) => {
                        if (Platform.OS === 'web') {
                            e.target.blur();
                        }
                    }}
                />
            </ThemedView>
        );
    };

    private renderKeypadItem = ({ item }: { item: any }): React.JSX.Element => (
        <TouchableOpacity
            style={styles.box}
            onPress={() => {
                const index = item === 'Backspace'
                    ? this.state.pins.findIndex(p => p === '') - 1
                    : this.state.pins.findIndex(p => !p);

                this.handlePinInput(item.toString(), index >= 0 ? index : this.state.pins.length - 1);
            }}>
            {item === 'Backspace'
                ? <MaterialCommunityIcons name="backspace" size={24} color="red" />
                : <ThemedText style={styles.buttonText}>{item}</ThemedText>}
        </TouchableOpacity>
    );

    render(): React.ReactNode {
        const { visible, onClose } = this.props;
        const { pins } = this.state;
        return (
            <Modal
                transparent={true}
                visible={visible}
                animationType="slide"
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <ThemedView style={styles.modalContainer}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <ThemedView style={styles.modalContent}>
                                <ThemedView style={styles.header}>
                                    <ThemedView style={styles.headerIconPlaceholder} />
                                    <ThemedText style={styles.headerText}>Enter Pin</ThemedText>
                                    <Pressable onPress={onClose}>
                                        <Image
                                            source={require("../../assets/icons/close.svg")}
                                            style={{ width: 24, height: 24 }}
                                            tintColor={this.appreance === "dark" ? "#FFF" : "#000"} />
                                    </Pressable>
                                </ThemedView>
                                <ThemedView style={{ flexDirection: "column", gap: 40 }}>
                                    <FlatList
                                        data={pins}
                                        renderItem={this.renderInputItem}
                                        keyExtractor={(_item, index) => index.toString()}
                                        horizontal={true}
                                        contentContainerStyle={styles.inputContainer}
                                    />
                                    <FlatList
                                        data={[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'Backspace']}
                                        renderItem={this.renderKeypadItem}
                                        keyExtractor={(item, index) => index.toString()}
                                        numColumns={3}
                                        contentContainerStyle={styles.keypad}
                                        style={{ paddingBottom: 20 }}
                                    />
                                </ThemedView>
                            </ThemedView>
                        </TouchableWithoutFeedback>
                    </ThemedView>
                </TouchableWithoutFeedback>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    modalContent: {
        padding: 20,
        borderRadius: 12,
        elevation: 5,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 16,
    },
    headerText: {
        fontSize: 16,
        fontFamily: 'AeonikMedium',
        lineHeight: 20,
    },
    headerIconPlaceholder: {
        height: 24,
        width: 24,
    },
    input: {
        width: 50,
        height: 50,
        color: Appearance.getColorScheme() === "dark" ? Colors.dark.text : Colors.light.text,
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#000" : '#F7F7F7',
        borderRadius: 10,
        fontSize: 24,
        textAlign: 'center',
        marginHorizontal: 5,
        alignSelf: 'center',
    },
    inputContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    box: {
        width: 90,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        marginVertical: 15,
        borderRadius: 10,
    },
    buttonText: {
        fontSize: 32,
        lineHeight: 32,
        fontFamily: 'AeonikMedium',
    },
    keypadContainer: {
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
    },
    keypad: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
