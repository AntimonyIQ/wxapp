import React from "react";
import sessionManager from "@/session/session";
import { IRegistration, UserData } from "@/interface/interface";
import { FlatList, Platform, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import BackButton from "@/components/button/back";
import PrimaryButton from "@/components/button/primary";
import LoadingModal from "@/components/modals/loading";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import ThemedSafeArea from "@/components/ThemeSafeArea";

interface IProps { }

interface IState {
    pin: string[];
    loading: boolean;
}

export default class RegisterPinScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private registration: IRegistration;
    private readonly title = "Create Pin";
    private pinRefs: React.RefObject<TextInput | null>[] = Array(4).fill(null).map(() => React.createRef<TextInput>());

    constructor(props: IProps) {
        super(props);
        this.state = { pin: Array(4).fill(""), loading: false };
        this.registration = this.session.registration;
    }

    componentDidMount(): void { }

    private handlePin = async (): Promise<void> => {
        try {
            this.setState({ loading: true });
            const { pin } = this.state;

            const registration: IRegistration = {
                ...this.registration,
                pin: pin.join(""),
            };

            await sessionManager.updateSession({ ...this.session, registration });
            router.navigate("/register/confirmpin");
        } catch (error: any) {
            logger.error(error.message);
        } finally {
            this.setState({ loading: false });
        }
    }

    private handlePinChange = (text: string, index: number): void => {
        const newPin = [...this.state.pin];
        newPin[index] = text;

        this.setState({ pin: newPin }, () => {
            if (text && index < this.pinRefs.length - 1) {
                this.pinRefs[index + 1].current?.focus();
            }
        });
    };

    private handlePinBackspace = (index: number): void => {
        const newPin = [...this.state.pin];

        if (newPin[index]) {
            newPin[index] = "";
        } else if (index > 0) {
            newPin[index - 1] = "";
            this.pinRefs[index - 1].current?.focus();
        }

        this.setState({ pin: newPin });
    };

    private renderInputItem = ({ item, index }: { item: string, index: number }): React.JSX.Element => {
        return (
            <ThemedView style={{ alignItems: 'center', alignSelf: 'center' }}>
                <TextInput
                    style={styles.input}
                    value={item}
                    onChangeText={(text) => this.handlePinChange(text, index)}
                    onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace') {
                            this.handlePinBackspace(index);
                        }
                    }}
                    keyboardType="numeric"
                    maxLength={1}
                    secureTextEntry={true}
                    ref={this.pinRefs[index]}
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

    private renderKeypadItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.box}
            onPress={() => {
                const { pin } = this.state;
                const index = item === 'Backspace'
                    ? pin.findIndex(p => p === '') - 1
                    : pin.findIndex(p => !p);

                const targetIndex = index >= 0 ? index : pin.length - 1;

                if (item === 'Backspace') {
                    this.handlePinBackspace(targetIndex);
                } else {
                    this.handlePinChange(item.toString(), targetIndex);
                }
            }}
        >
            {item === 'Backspace' ? (
                <MaterialCommunityIcons name="backspace" size={24} color="red" />
            ) : (
                <ThemedText style={styles.buttonText}>{item}</ThemedText>
            )}
        </TouchableOpacity>
    );

    render(): React.ReactNode {
        const { pin, loading } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.safeArea}>
                    <ThemedView style={{ paddingHorizontal: 16, paddingTop: 24 }}>
                        <BackButton
                            title={`${this.title}`}
                            subtitle={'Set pin to approve your transactions'}
                            p1
                            p2
                            p3
                            showProgress
                        />

                        <ThemedView style={styles.container}>
                            <FlatList
                                data={pin}
                                renderItem={this.renderInputItem}
                                keyExtractor={(_item, index) => index.toString()}
                                horizontal={true}
                                contentContainerStyle={styles.inputContainer}
                            />
                        </ThemedView>

                        <LoadingModal loading={loading} />
                    </ThemedView>

                    <ThemedView style={styles.keypadContainer}>
                        <ThemedView style={{ width: '100%', paddingHorizontal: 16, marginBottom: 30 }}>
                            {(pin.join('') && pin.join('').length === 4)
                                ? <PrimaryButton Gradient title={'Continue'} onPress={this.handlePin} />
                                : <PrimaryButton Grey onPress={() => { }} title={'Continue'} />}
                        </ThemedView>
                        <FlatList
                            data={[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'Backspace']}
                            renderItem={this.renderKeypadItem}
                            keyExtractor={(_item, index) => index.toString()}
                            numColumns={3}
                            contentContainerStyle={styles.keypad}
                        />
                    </ThemedView>
                </ThemedSafeArea>
                <StatusBar style={"dark"} />
            </>
        )
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 35 : 0,
    },
    errorText: {
        color: 'red',
        fontSize: 10,
        fontFamily: 'AeonikRegular',
        lineHeight: 12,
        top: 0,
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 40,
    },
    inputContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    input: {
        width: 50,
        height: 50,
        backgroundColor: '#F7F7F7',
        borderRadius: 10,
        fontSize: 24,
        textAlign: 'center',
        marginHorizontal: 5,
        alignSelf: 'center',
        fontFamily: 'AeonikMedium',
    },
    keypadContainer: {
        width: '100%',
        alignItems: 'center',
        position: "absolute",
        top: "auto",
        bottom: Platform.OS === "android" ? 20 : 30,
    },
    keypad: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    box: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        marginVertical: 15,
        borderRadius: 10,
    },
    buttonText: {
        fontSize: 24,
        fontFamily: 'AeonikMedium',
    },
});