import React from "react";
import sessionManager from "@/session/session";
import { ActivityIndicator, Appearance, Dimensions, FlatList, Platform, Pressable, StyleSheet, TextInput } from "react-native";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import BackButton from "@/components/button/back";
import { Colors } from "@/constants/Colors";
import LoadingModal from "@/components/modals/loading";
import PrimaryButton from "@/components/button/primary";
import Defaults from "../default/default";
import { IRegistration, UserData } from "@/interface/interface";
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedText from "@/components/ThemedText";

interface IProps { }

interface IState {
    otp: string[];
    loading: boolean;
    error: string;
    resetLoading: boolean;
}

const { height } = Dimensions.get("window");

export default class VerifyScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Check your email";
    private registration: IRegistration;
    private inputRefs: React.RefObject<TextInput | null>[] = Array(4).fill(null).map(() => React.createRef<TextInput>());

    constructor(props: IProps) {
        super(props);
        this.state = { otp: Array(4).fill(""), loading: false, error: "", resetLoading: false };
        if (!this.session) {
            logger.log("Session not found. Redirecting to login screen.");
        }
        this.registration = this.session.registration;
    }

    componentDidMount(): void { }

    private handleInputChange = (text: string, index: number): void => {
        const newInputs: string[] = [...this.state.otp];
        newInputs[index] = text;
        this.setState({ otp: newInputs });

        if (text) {
            if (index < this.state.otp.length - 1) {
                this.inputRefs[index + 1].current?.focus();
            }
        } else {
            if (index > 0) {
                this.inputRefs[index - 1].current?.focus();
            }
        }
    };

    private handleKeyPress = (e: any, index: number): void => {
        if (e.nativeEvent.key === 'Backspace' && !this.state.otp[index] && index > 0) {
            this.inputRefs[index - 1].current?.focus();
        }
    };

    private handleVerifyOTP = async (): Promise<void> => {
        try {
            this.setState({ loading: true });
            const { otp } = this.state;

            await Defaults.IS_NETWORK_AVAILABLE();

            if (!otp.every((code) => code.trim() !== "")) throw new Error("All fields are required");

            const response = await fetch(`${Defaults.API}/auth/verify-otp`, {
                method: 'POST',
                headers: { ...Defaults.HEADERS },
                body: JSON.stringify({ otp: otp.join("") }),
            });

            const data = await response.json();
            this.setState({ loading: false });

            this.setState({}, () => {
                router.navigate("/register");
            });

        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            logger.error(errorMessage);
            Toast.show({
                type: "error",
                text2: errorMessage,
                text1Style: { fontSize: 16, fontFamily: 'AeonikBold' },
                text2Style: { fontSize: 12, fontFamily: 'AeonikRegular' },
            });
        } finally {
            this.setState({ loading: false });
        }
    }

    private handleOTPResend = async (): Promise<void> => {
        try {
            this.setState({ resetLoading: true });
        } catch (error: any) {
            logger.log(error.message);
            Toast.show({
                type: "error",
                text2: error.message,
                text1Style: { fontSize: 16, fontFamily: 'AeonikBold' },
                text2Style: { fontSize: 12, fontFamily: 'AeonikRegular' },
            });
        } finally {
            this.setState({ resetLoading: true });
        }
    }

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
                />
            </ThemedView>
        );
    };

    render(): React.ReactNode {
        const { otp, resetLoading, error, loading } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: 'Onboarding', headerShown: false }} />
                <ThemedSafeArea style={styles.safeArea}>
                    <ThemedView style={{ height: "100%" }}>
                        <ThemedView style={{ paddingHorizontal: 16, paddingTop: 20, }}>

                            <ThemedView style={{ marginBottom: 30 }}>
                                <BackButton
                                    title={this.title}
                                    subtitle={`We sent a one time password to your email`} // ${this.registration.email.slice(0,1)}******${this.registration.email.slice(-10)}
                                />
                            </ThemedView>

                            <FlatList
                                data={otp}
                                renderItem={this.renderInputItem}
                                keyExtractor={(_item, index) => index.toString()}
                                horizontal={true}
                                contentContainerStyle={styles.inputContainer}
                            />

                            <Pressable style={{ marginTop: 12, flexDirection: "row", gap: 8, alignItems: "center" }} onPress={this.handleOTPResend}>
                                <ThemedText
                                    style={{
                                        fontFamily: 'AeonikRegular',
                                        fontSize: 14,
                                        color: '#757575',
                                        lineHeight: 16,
                                    }}
                                >
                                    Didn't get the code?
                                </ThemedText>
                                {resetLoading
                                    ? <ActivityIndicator color={Colors.blue} size={15} />
                                    : <ThemedText style={{ fontFamily: 'AeonikRegular', fontSize: 14, }}>Resend code</ThemedText>}
                            </Pressable>

                            <ThemedView style={{ marginTop: 40, gap: 10 }}>
                                <PrimaryButton Gradient title={'verify'} onPress={this.handleVerifyOTP} />
                                {error.length > 0 && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
                            </ThemedView>

                        </ThemedView>
                    </ThemedView>
                    <Pressable
                        style={{
                            position: "fixed",
                            top: "auto",
                            bottom: 40,
                            alignItems: 'center',
                            alignSelf: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={() => router.navigate('/onboarding/login')}
                    >
                        <ThemedText
                            style={{
                                fontFamily: 'AeonikRegular',
                                fontSize: 14,
                                color: '#757575',
                                lineHeight: 16,
                            }}
                        >
                            Already have an account?{' '}
                            <ThemedText style={{ color: '#253E92' }}>Login</ThemedText>
                        </ThemedText>
                    </Pressable>
                    <LoadingModal loading={loading} />
                </ThemedSafeArea>
                <StatusBar style='light' />
            </>
        )
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 35 : 0,
        height: height
    },
    inputContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
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
    button: {
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#253E92',
    },
});
