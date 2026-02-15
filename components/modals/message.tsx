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

import { Modal, Pressable, StyleSheet, TouchableWithoutFeedback, Platform } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import logger from '@/logger/logger';
import ThemedView from '../ThemedView';
import ThemedText from '../ThemedText';
import { Status } from '@/enums/enums';

interface IMessage {
    title: string;
    description: string;
}

interface MessageModalProps {
    visible: boolean;
    onClose: () => void;
    message?: IMessage;
    type: Status;
}

export default class MessageModal extends React.Component<MessageModalProps, {}> {
    constructor(props: MessageModalProps) { super(props); }

    componentDidMount() {
        logger.clear();
    }

    render() {
        const { visible, onClose, message, type } = this.props;
        return (
            <Modal
                visible={visible}
                transparent={true}
                animationType='slide'
                presentationStyle='overFullScreen'
                statusBarTranslucent={true}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <ThemedView style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <ThemedView style={styles.modalContent}>
                                <ThemedView style={styles.header}>
                                    <ThemedText></ThemedText>
                                    <ThemedText style={styles.headerTitle}>
                                        {type === Status.ERROR ? "Error" : type === Status.SUCCESS ? "Success" : "Info"}
                                    </ThemedText>
                                    <Pressable
                                        style={styles.closeButton}
                                        onPress={onClose}
                                    >
                                        <Image
                                            source={require("../../assets/icons/close.svg")}
                                            style={{ width: 24, height: 24 }}
                                            tintColor={"#000"} />
                                    </Pressable>
                                </ThemedView>
                                <ThemedView style={styles.separator} />
                                <ThemedView style={styles.confirmContainer}>
                                    <ThemedView style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
                                        <Image
                                            source={require("../../assets/icons/info_blank.svg")}
                                            style={{ width: 54, height: 54 }}
                                            tintColor={type === Status.ERROR ? '#a20000' : type === Status.SUCCESS ? '#253E92' : '#b96900'} />
                                        <ThemedText style={{ fontSize: 24, fontFamily: 'AeonikMedium', textAlign: "center" }}>{message?.title || "message title"}</ThemedText>
                                        <ThemedText style={{ color: "#757575", fontSize: 15, fontFamily: 'AeonikRegular', textAlign: "center" }}>{message?.description || "message description"}</ThemedText>
                                    </ThemedView>
                                </ThemedView>
                                <ThemedView style={styles.nextButtonContainer}>
                                    <Pressable
                                        style={[styles.nextButton, { backgroundColor: type === Status.ERROR ? '#a20000' : type === Status.SUCCESS ? '#253E92' : '#b96900' }]}
                                        onPress={onClose}
                                    >
                                        <ThemedText style={styles.nextButtonText}>Close</ThemedText>
                                    </Pressable>
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
        height: Platform.OS === 'web' ? '55%' : '40%',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        backgroundColor: "#FFFFFF"
    },
    header: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        height: 64,
    },
    headerTitle: {
        fontFamily: 'AeonikMedium',
        fontSize: 16,
        lineHeight: 20,
    },
    closeButton: {
        right: 0,
        padding: 4,
        borderRadius: 100,
        backgroundColor: '#E8E8E8',
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: '#E8E8E8',
    },
    confirmContainer: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 20,
        gap: 20
    },
    nextButtonContainer: {
        paddingHorizontal: 16,
        position: 'absolute',
        bottom: 32,
        width: '100%',
    },
    nextButton: {
        paddingHorizontal: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    nextButtonText: {
        color: '#F5F5F5',
        fontFamily: 'AeonikMedium',
        fontSize: 16,
        lineHeight: 20,
    },
    priceInfo: {
        marginTop: 20,
        paddingHorizontal: 16,
        gap: 8,
    },
    currentPriceLabel: {
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        color: '#757575',
        lineHeight: 14,
    },
    priceRow: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    },
    currentPrice: {
        fontFamily: 'AeonikMedium',
        fontSize: 24,
        color: '#1F1F1F',
    },
    percentChange: {
        fontFamily: 'AeonikMedium',
        fontSize: 12,
    },
    chartContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
});
