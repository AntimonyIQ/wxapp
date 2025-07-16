import React from "react";
import sessionManager from "@/session/session";
import { IRegistration, UserData } from "@/interface/interface";
import { Appearance, ColorSchemeName, FlatList, Platform, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import BackButton from "@/components/button/back";
import PrimaryButton from "@/components/button/primary";
import LoadingModal from "@/components/modals/loading";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from "react-native-toast-message";
import Defaults from "../default/default";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import { Status } from "@/enums/enums";

interface IProps { }

interface IState {
    confirmPin: string[];
    loading: boolean;
}

export default class ConfirmPinScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private registration: IRegistration;
    private readonly title = "Confirm Pin";
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private pinRefs: React.RefObject<TextInput | null>[] = Array(4).fill(null).map(() => React.createRef<TextInput>());
    constructor(props: IProps) {
        super(props);
        this.state = { confirmPin: Array(4).fill(""), loading: false };
        if (!this.session) {
            logger.log("Session not found. Redirecting to login screen.");
        }
        this.registration = this.session.registration;
    }

    componentDidMount(): void { }

    private handlePin = async (): Promise<void> => {
        try {
            this.setState({ loading: true });
            const { confirmPin } = this.state;
            const pin = this.registration.pin;

            await Defaults.IS_NETWORK_AVAILABLE();
            if (pin !== confirmPin.join("")) throw new Error("Pin does not match");
            if (!this.registration.phoneNumber) throw new Error("Invalid Phone number");
            if (!this.registration.countryCode) throw new Error("Invalid country code");

            const codeOnly = this.registration.countryCode.replace('+', '');
            const phoneClean = this.registration.phoneNumber.replace(/^0+/, '');
            const fullPhone = codeOnly + phoneClean;

            const res = await fetch(`${Defaults.API}/auth/register`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceId,
                    'x-wealthx-location': this.session.location,
                },
                body: JSON.stringify({
                    country: this.registration.country,
                    address: this.registration.country,
                    email: this.registration.email,
                    dateOfBirth: this.registration.dateOfBirth,
                    username: this.registration.username,
                    pin: this.registration.pin,
                    phoneNumber: fullPhone,
                    referralCode: this.registration.referralCode,
                    fullName: this.registration.fullName,
                }),
            });

            const data = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                await sessionManager.updateSession({
                    ...this.session,
                    isRegistred: true,
                    registration: {
                        email: "",
                        password: "",
                        countryCode: ""
                    }
                });
                router.navigate("/register/success");
            };

        } catch (error: any) {
            logger.error(error.message);
            Toast.show({
                type: 'error',
                text1: 'Create account Error',
                text2: error.message || `Account creation failed, please try again`,
                text1Style: { fontSize: 16, fontFamily: 'AeonikBold' },
                text2Style: { fontSize: 12, fontFamily: 'AeonikRegular' },
            });
        } finally {
            this.setState({ loading: false });
        }
    }

    private handlePinInput = (value: string, index: number): void => {
        let { confirmPin } = this.state;
        const newPin = [...confirmPin];

        if (value === 'Backspace') {
            if (newPin[index]) {
                newPin[index] = "";
            } else if (index > 0) {
                newPin[index - 1] = "";
                this.pinRefs[index - 1].current?.focus();
            }
        } else {
            newPin[index] = value;
            if (index < newPin.length - 1) {
                this.pinRefs[index + 1].current?.focus();
            }
        }

        this.setState({ confirmPin: newPin });
    };

    private renderInputItem = ({ item, index }: { item: string, index: number }): React.JSX.Element => {
        return (
            <ThemedView style={{ alignItems: 'center', alignSelf: 'center' }}>
                <TextInput
                    style={styles.input}
                    value={item}
                    onChangeText={(text) => this.handlePinInput(text, index)}
                    keyboardType='numeric'
                    maxLength={1}
                    secureTextEntry={true}
                    ref={this.pinRefs[index]}
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
                const index = item === 'Backspace' ? this.state.confirmPin.findIndex(p => p === '') - 1 : this.state.confirmPin.findIndex(p => !p);
                this.handlePinInput(item.toString(), index >= 0 ? index : this.state.confirmPin.length - 1);
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
        const { confirmPin, loading } = this.state;
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
                            p4
                            showProgress
                        />

                        <ThemedView style={styles.container}>
                            <FlatList
                                data={confirmPin}
                                renderItem={this.renderInputItem}
                                keyExtractor={(item, index) => index.toString()}
                                horizontal={true}
                                contentContainerStyle={styles.inputContainer}
                            />
                        </ThemedView>

                        <LoadingModal loading={loading} />
                    </ThemedView>
                    <ThemedView style={styles.keypadContainer}>
                        <ThemedView style={{ width: '100%', paddingHorizontal: 16, marginBottom: 30 }}>
                            {(confirmPin.join('') && confirmPin.join('').length === 4)
                                ? <PrimaryButton Gradient title={'Continue'} onPress={this.handlePin} />
                                : <PrimaryButton Grey onPress={() => { }} title={'Continue'} />}
                        </ThemedView>
                        <FlatList
                            data={[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'Backspace']}
                            renderItem={this.renderKeypadItem}
                            keyExtractor={(item, index) => index.toString()}
                            numColumns={3}
                            contentContainerStyle={styles.keypad}
                        />
                    </ThemedView>
                </ThemedSafeArea>
                <StatusBar style={this.appreance === "dark" ? "light" : "dark"} />
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