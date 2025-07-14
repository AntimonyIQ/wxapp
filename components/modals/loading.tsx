import React from 'react';
import { Modal, ActivityIndicator, StyleSheet, } from 'react-native';
import { Colors } from '@/constants/Colors';
import ThemedView from '../ThemedView';

interface IProps {
    loading: boolean;
}

export default class LoadingModal extends React.Component<IProps, {}> {
    render() {
        const { loading } = this.props;

        return (
            <Modal
                transparent={true}
                animationType='none'
                visible={loading}
                onRequestClose={() => { }}
            >
                <ThemedView style={styles.modalBackground}>
                    <ThemedView style={styles.activityIndicatorWrapper}>
                        <ActivityIndicator animating={loading} size="large" color={Colors.white} />
                    </ThemedView>
                </ThemedView>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    activityIndicatorWrapper: {
        height: 100,
        width: 100,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "black"
    }
});
