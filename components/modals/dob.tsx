import { Colors } from '@/constants/Colors';
import React from 'react';
import { Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, TextInput } from 'react-native';
import Toast from 'react-native-toast-message';
import ThemedView from '../ThemedView';
import ThemedText from '../ThemedText';

interface DOBProps {
    visible: boolean;
    onConfirm: (value: string) => void;
    onCancel: () => void;
}

interface DOBState {
    dd: string;
    mm: string;
    yyyy: string;
}

export default class DateOfBirthDialogModal extends React.Component<DOBProps, DOBState> {
    private monthRef = React.createRef<TextInput>();
    private yearRef = React.createRef<TextInput>();

    constructor(props: DOBProps) {
        super(props);
        this.state = {
            dd: "",
            mm: "",
            yyyy: "",
        };
    }

    handleConfirm = () => {
        const { dd, mm, yyyy } = this.state;

        const day = parseInt(dd, 10);
        const month = parseInt(mm, 10);
        const year = parseInt(yyyy, 10);

        const isLeapYear = (year: number) => {
            return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        };

        const daysInMonth = (month: number, year: number) => {
            switch (month) {
                case 2:
                    return isLeapYear(year) ? 29 : 28;
                case 4:
                case 6:
                case 9:
                case 11:
                    return 30;
                default:
                    return 31;
            }
        };

        if (!day || !month || !year || day < 1 || day > daysInMonth(month, year) || month < 1 || month > 12 || year < 1900 || year > 2022) {
            Toast.show({
                type: "error",
                text2: "Please enter a valid date of birth",
                text1Style: { fontSize: 16, fontFamily: 'AeonikBold' },
                text2Style: { fontSize: 12, fontFamily: 'AeonikRegular' },
            });
            return;
        }

        const formattedDOB = `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`;
        this.props.onConfirm(formattedDOB);
    };

    render(): React.ReactNode {
        const { visible, onCancel } = this.props;
        const { dd, mm, yyyy } = this.state;

        return (
            <Modal
                transparent={true}
                visible={visible}
                animationType="slide"
                presentationStyle='overFullScreen'
                statusBarTranslucent={true}>
                <TouchableWithoutFeedback onPress={onCancel}>
                    <ThemedView style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <ThemedView style={styles.dialogContainer}>
                                <ThemedText style={styles.dialogTitle}>Enter Your Date of Birth</ThemedText>
                                <ThemedText style={styles.dialogMessage}>Please provide your date of birth</ThemedText>

                                {/* Date Input Fields */}
                                <ThemedView style={styles.dobContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="DD"
                                        keyboardType="numeric"
                                        maxLength={2}
                                        value={dd}
                                        onChangeText={(text) => this.setState({ dd: text.replace(/[^0-9]/g, '') })}
                                        onSubmitEditing={() => this.monthRef.current?.focus()}
                                    />
                                    <TextInput
                                        ref={this.monthRef}
                                        style={styles.input}
                                        placeholder="MM"
                                        keyboardType="numeric"
                                        maxLength={2}
                                        value={mm}
                                        onChangeText={(text) => this.setState({ mm: text.replace(/[^0-9]/g, '') })}
                                        onSubmitEditing={() => this.yearRef.current?.focus()}
                                    />
                                    <TextInput
                                        ref={this.yearRef}
                                        style={styles.input}
                                        placeholder="YYYY"
                                        keyboardType="numeric"
                                        maxLength={4}
                                        value={yyyy}
                                        onChangeText={(text) => this.setState({ yyyy: text.replace(/[^0-9]/g, '') })}
                                    />
                                </ThemedView>

                                {/* Buttons */}
                                <ThemedView style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                                        <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.button} onPress={this.handleConfirm}>
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
        backgroundColor: "#FFF"
    },
    dialogTitle: {
        fontSize: 18,
        marginBottom: 10,
        fontFamily: 'AeonikBold',
    },
    dialogMessage: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'AeonikRegular',
    },
    dobContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        width: "100%"
    },
    input: {
        width: 50,
        height: 50,
        borderColor: Colors.grey,
        borderWidth: 1,
        borderRadius: 5,
        textAlign: "center",
        fontSize: 18,
        marginHorizontal: 5,
        color: Colors.dark.background,
        fontFamily: 'AeonikRegular',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
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
        backgroundColor: Colors.white,
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

