import PrimaryButton from '@/components/button/primary';
import { Ionicons } from '@expo/vector-icons';
import React, { Component } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface IProps {
    inputNumber: (number: string | number) => void;
    onBackspacePress: () => void;
    onContinuePress?: () => void;
    onPress?: () => void; // Legacy support
    button?: boolean;
    btndisabled?: boolean;
}

class DiapadKeyPad extends Component<IProps> {
    constructor(props: IProps) {
        super(props);
        this.renderKeypadItem = this.renderKeypadItem.bind(this);
    }

    renderKeypadItem({ item }: { item: string | number }) {
        if (item === 'backspace') {
            return (
                <TouchableOpacity style={styles.box} onPress={this.props.onBackspacePress}>
                    <Ionicons name='backspace-outline' size={24} color='red' />
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity style={styles.box} onPress={() => this.props.inputNumber(item)}>
                    <Text style={styles.buttonText}>{item}</Text>
                </TouchableOpacity>
            );
        }
    };

    handleContinue = () => {
        const { onPress, onContinuePress } = this.props;
        if (onContinuePress) {
            onContinuePress();
        } else if (onPress) {
            onPress();
        }
    }

    render() {
        const { button, btndisabled } = this.props;
        return (
            <View style={styles.keypadContainer}>
                {button && (
                    <View style={{ width: '92%', marginBottom: 19 }}>
                        <PrimaryButton Gradient title={'Continue'} disabled={btndisabled} onPress={this.handleContinue} />
                    </View>
                )}
                <FlatList
                    data={[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'backspace']}
                    renderItem={this.renderKeypadItem}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={3}
                    contentContainerStyle={styles.keypad}
                    scrollEnabled={false}
                />
            </View>
        );
    }
}

export default DiapadKeyPad;

const styles = StyleSheet.create({
    keypadContainer: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingBottom: 20
    },
    keypad: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    box: {
        width: 90,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 10,
    },
    buttonText: {
        fontSize: 28,
        fontWeight: '500',
        fontFamily: 'AeonikMedium',
        color: '#000'
    },
});
