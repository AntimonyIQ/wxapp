import React from "react";
import { Keyboard, Platform, Pressable, StyleSheet } from "react-native";
import logger from "@/logger/logger";
import { UserData } from "@/interface/interface";
import sessionManager from "@/session/session";
import { router, Stack } from "expo-router";
import { Colors } from "@/constants/Colors";
import PrimaryButton from "@/components/button/primary";
import TextField from "@/components/inputs/text";
import BackButton from "@/components/button/back";
import Toast from 'react-native-toast-message';
import Defaults from "../default/default";
import LoadingModal from "@/components/modals/loading";
import { UserType } from "@/enums/enums";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";

interface IProps { }

interface IState {
    email: string;
    emailFocused: boolean;
    password: string;
    passwordFocused: boolean;
    loading: boolean;
}

interface ILoginResponse {
    accessToken: string;
    expiresIn: string;
    refreshToken: string;
    userType: UserType;
    status: "success" | "error";
    message: string;
}

export default class LoginScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Login Screen";
    constructor(props: IProps) {
        super(props);
        this.state = { email: '', password: '', loading: false, emailFocused: true, passwordFocused: false };
        if (!this.session) {
            logger.log("Session not found. Redirecting to login screen.");
        }
    }

    componentDidMount(): void { }

    private handleLogin = async (): Promise<void> => {
        const { email, password } = this.state;
        Keyboard.dismiss();

        try {
            this.setState({ loading: true });

            await Defaults.IS_NETWORK_AVAILABLE();
            if (!email || !password) throw new Error("please provide email and password to continue");

            const res = await fetch(`${Defaults.API}/auth/login`, {
                method: 'POST',
                headers: { ...Defaults.HEADERS },
                body: JSON.stringify({ email, password }),
            });

            const data: ILoginResponse = await res.json();

            if (data.status === "error") throw new Error(data.message || "Invalid login credentials");

            if (!data.accessToken) throw new Error('Unable to process login response right now, please try again.');

            const response = await fetch(`${Defaults.API}/users/`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'Authorization': `Bearer ${data.accessToken}`
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const udata: UserData = await response.json();

            await sessionManager.login({
                ...this.session,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                expiresIn: data.expiresIn,
                isLoggedIn: true,
                user: udata.data?.user,
            });

            router.navigate('/dashboard');

        } catch (error: any) {
            logger.error('Failed to login:', error.message);
            Toast.show({
                type: 'error',
                text1: 'Login',
                text2: error.message || `Login failed, check email and password and try again`,
                text1Style: { fontSize: 16, fontFamily: 'AeonikBold' },
                text2Style: { fontSize: 12, fontFamily: 'AeonikRegular' },
            });
        } finally {
            this.setState({ loading: false, password: "" });
        }
    }

    render(): React.ReactNode {
        const { email, password, loading } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={{ paddingTop: Platform.OS === 'android' ? 35 : 0, flex: 1 }}>
                    <ThemedView style={{ width: "100%", height: "100%", padding: 20 }}>

                        <BackButton title="Login" />

                        <TextField
                            showPasteButton={true}
                            showText={true}
                            title="Email"
                            placeholder="Email"
                            onClear={() => this.setState({ email: '' })}
                            onFocus={() => this.setState({ emailFocused: true })}
                            textValue={email}
                            keyboardType="email-address"
                            onChangeText={(text) => this.setState({ email: text.toLowerCase().trim() })} />

                        <TextField
                            showEye={true}
                            showText={true}
                            title="Password"
                            placeholder="Password"
                            onClear={() => this.setState({ password: '' })}
                            onFocus={() => this.setState({ passwordFocused: true })}
                            textValue={password}
                            secureTextEntry={true}
                            keyboardType="visible-password"
                            onChangeText={(text) => this.setState({ password: text.trim() })} />

                        <ThemedView style={{ gap: 20, }}>
                            <ThemedView style={{ marginTop: 34, width: "100%" }}>
                                <PrimaryButton
                                    Gradient
                                    title={loading ? "Logging In..." : "Log In"}
                                    onPress={this.handleLogin}
                                    disabled={loading} >
                                </PrimaryButton>
                            </ThemedView>
                            <Pressable style={{ alignSelf: 'center' }} onPress={() => router.navigate('/onboarding/login')}>
                                <ThemedText style={[styles.forgotPasswordText, { color: Colors.blue }]}>Forgot Password</ThemedText>
                            </Pressable>
                            <Pressable style={{ alignSelf: 'center', flexDirection: "row", alignItems: "center" }} onPress={() => router.navigate('/onboarding/signup')}>
                                <ThemedText style={[styles.forgotPasswordText]}>Don't have an account? </ThemedText>
                                <ThemedText style={[styles.forgotPasswordText, { color: Colors.blue }]}>Create an account</ThemedText>
                            </Pressable>
                        </ThemedView>

                    </ThemedView>

                    <LoadingModal loading={loading} />
                </ThemedSafeArea>
            </>
        )
    }
}

const styles = StyleSheet.create({
    forgotPasswordText: {
        fontFamily: 'AeonikRegular',
        fontSize: 14,
        lineHeight: 16,
    },
});