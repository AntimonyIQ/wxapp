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

import { Colors } from '@/constants/Colors';
import React from 'react';
import { Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Appearance } from 'react-native';
import logger from '@/logger/logger';
import ThemedView from '../ThemedView';
import ThemedText from '../ThemedText';

interface LogoutDialogProps {
    visible: boolean;
    title: string;
    message: string | React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
}

export default class DialogModal extends React.Component<LogoutDialogProps> {

    componentDidMount(): void {
        logger.clear();
    }
    render(): React.ReactNode {
        const { visible, onConfirm, onCancel, title, message } = this.props;
        return (
            <Modal
                transparent={true}
                visible={visible}
                animationType="slide"
            >
                <TouchableWithoutFeedback onPress={onCancel}>
                    <ThemedView style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <ThemedView style={styles.dialogContainer}>
                                <ThemedText style={styles.dialogTitle}>{title}</ThemedText>
                                {typeof message === "string"
                                    ? <ThemedText style={styles.dialogMessage}>{message}</ThemedText>
                                    : (message)}
                                <ThemedView style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                                        <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.button} onPress={onConfirm}>
                                        <ThemedText style={styles.buttonText}>Confirm</ThemedText>
                                    </TouchableOpacity>
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    dialogContainer: {
        width: "80%",
        padding: 20,
        borderRadius: 10,
        alignItems: "flex-start",
        backgroundColor: "#FFFFFF"
    },
    dialogTitle: {
        fontSize: 18,
        marginBottom: 10,
        fontFamily: 'AeonikBold',
    },
    dialogMessage: {
        fontSize: 16,
        marginBottom: 20,
        fontFamily: 'AeonikRegular',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingTop: 20
    },
    button: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        borderRadius: 5,
        alignItems: 'center',
        backgroundColor: Colors.blue,
    },
    cancelButton: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        borderRadius: 5,
        alignItems: 'center',
        borderColor: "red",
        borderWidth: 1,
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#000000" : Colors.white,
    },
    buttonText: {
        color: 'white',
        fontFamily: 'AeonikRegular',
    },
    cancelButtonText: {
        color: "red",
        fontFamily: 'AeonikRegular',
    },
});
