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

import { FlatList, Modal, Pressable, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import React from 'react';
import logger from '@/logger/logger';
import ThemedView from '../ThemedView';
import ThemedText from '../ThemedText';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface IMessage {
    title: string;
    description: string;
}

interface MessageModalProps {
    visible: boolean;
    onClose: () => void;
    onPinComplete: (pin: string) => void;
}

interface IState {
    code: string;
}

export default class TwoFAModal extends React.Component<MessageModalProps, IState> {
    constructor(props: MessageModalProps) {
        super(props);
        this.state = {
            code: ''
        }
    }

    componentDidMount() {
        logger.clear();
    }

    private inputNumber = (number: number) => {
        const { code } = this.state;
        if (code.length < 10) {
            this.setState({ code: code + number.toString() });
        }
    };

    private clearLastInput = () => {
        const { code } = this.state;
        if (code.length > 0) {
            this.setState({ code: code.slice(0, -1) });
        }
    };

    private renderKeypadItem = ({ item }: { item: string | number }) => {
        if (item === 'backspace') {
            return (
                <TouchableOpacity style={styles.box} onPress={this.clearLastInput}>
                    <MaterialCommunityIcons name='backspace' size={24} color='red' />
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity style={styles.box} onPress={() => this.inputNumber(Number(item))}>
                    <ThemedText style={styles.buttonText}>{item}</ThemedText>
                </TouchableOpacity>
            );
        }
    };

    render() {
        const { visible, onClose, onPinComplete } = this.props;
        const { code } = this.state;
        return (
            <Modal
                visible={visible}
                transparent={true}
                animationType='slide'
                presentationStyle='overFullScreen'
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <ThemedView style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <ThemedView style={styles.modalContent}>

                                <ThemedView style={styles.modalContent}>
                                    <ThemedView style={styles.header}>
                                        <ThemedView style={styles.headerIconPlaceholder} />
                                        <ThemedText style={styles.headerText}>2FA Authentication</ThemedText>
                                        <Pressable onPress={onClose}>
                                            <Image
                                                source={require("../../assets/icons/close.svg")}
                                                style={{ width: 24, height: 24 }}
                                                tintColor={"#000"} />
                                        </Pressable>
                                    </ThemedView>

                                    <ThemedView
                                        style={{
                                            height: 1,
                                            width: '100%',
                                            backgroundColor: '#E8E8E8',
                                            marginBottom: 24,
                                        }}
                                    />

                                    <ThemedView style={styles.container}>
                                        <TextInput
                                            style={styles.input}
                                            value={code}
                                            editable={false}
                                            keyboardType='numeric'
                                            secureTextEntry={true}
                                            placeholder="Enter Code"
                                            placeholderTextColor="#aaa"
                                        />

                                        <TouchableOpacity
                                            style={styles.continueButton}
                                            onPress={() => onPinComplete(code)}>
                                            <ThemedText style={styles.continueText}>Continue</ThemedText>
                                        </TouchableOpacity>

                                        <ThemedText
                                            style={{
                                                textAlign: 'center',
                                                fontSize: 12,
                                                fontFamily: 'Aeonik-Regular',
                                                fontWeight: '400',
                                                lineHeight: 14,
                                                marginTop: 16,
                                                color: '#757575',
                                            }}>
                                            Enter 2FA code from your registered authentication app.
                                        </ThemedText>

                                        <FlatList
                                            data={[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'backspace']}
                                            renderItem={this.renderKeypadItem}
                                            keyExtractor={(item, index) => index.toString()}
                                            numColumns={3}
                                            contentContainerStyle={styles.keypad}
                                            style={{ marginBottom: 20, marginTop: 40 }}
                                        />
                                    </ThemedView>
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
    modalOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
    },
    modalContent: {
        height: 570,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    headerText: {
        fontSize: 16,
        fontFamily: 'Aeonik-Medium',
        lineHeight: 20,
        color: 'black',
        fontWeight: '500',
    },
    headerIconPlaceholder: {
        height: 24,
        width: 24,
    },
    container: {
        alignItems: 'center',
        padding: 20
    },
    input: {
        width: '100%',
        height: 42,
        backgroundColor: '#F7F7F7',
        borderRadius: 10,
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'Aeonik-Medium',
    },
    continueButton: {
        backgroundColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginBottom: 10,
        width: '100%',
        height: 42,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueText: {
        color: '#fff',
        fontSize: 16,
        lineHeight: 20,
        fontFamily: 'Aeonik-Medium',
    },
    keypad: {
        justifyContent: 'center',
        alignItems: 'center',
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
        lineHeight: 36,
        fontWeight: '500',
        fontFamily: 'Aeonik-Medium',
    },
});
