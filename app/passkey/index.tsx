import React from "react";
import sessionManager from "@/session/session";
import { UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { FlatList, Platform, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Defaults from "../default/default";
import LoadingModal from "@/components/modals/loading";
import ThemedText from "@/components/ThemedText";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";

interface IProps { }

interface IState {
    passcode: string[];
    loading: boolean;
    messageError: boolean;
    message: string;
}

export default class PasskeyScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Passkey Screen";
    private pinRefs: React.RefObject<TextInput | null>[] = Array(4).fill(null).map(() => React.createRef<TextInput>());
    constructor(props: IProps) {
        super(props);
        this.state = { passcode: Array(4).fill(""), loading: false, messageError: false, message: "" };
        if (!this.session) {
            logger.log("Session not found. Redirecting to login screen.");
        }
    }

    private processLoginRefresh = async () => {
        const { passcode } = this.state;

        const isConn = await Defaults.IS_NETWORK_AVAILABLE();
        console.log("is connection available: ", isConn);

        if (!passcode) {
            this.setState({ message: "Your pin is wrong please try again", messageError: true });
            return;
        };

        try {
            this.setState({ loading: true });
            const session = sessionManager.getUserData();

            const payload = JSON.stringify({
                passkey: passcode.join(""),
                refreshToken: session.refreshToken,
            });

            logger.log("refreshToken: ", session.refreshToken);

            const response = await fetch(`${Defaults.API}/auth/refresh/v3`, {
                method: "POST",
                headers: { ...Defaults.HEADERS, Cookie: `jwt=${session.refreshToken}`, },
                body: payload,
            });

            const data = await response.json();
            logger.log("Response Data: ", data);
            const { accessToken, refreshToken, expiresIn } = data;

            if (!accessToken) throw new Error('Access token not found in response');

            logger.log("accessToken: ", accessToken);

            const userResponse = await fetch(`${Defaults.API}/users/`, {
                method: 'GET',
                headers: { ...Defaults.HEADERS, 'Authorization': `Bearer ${accessToken}`, }
            });

            if (!userResponse.ok) { throw new Error(`HTTP error! status: ${userResponse.status}`); }

            const userData = await userResponse.json();

            await sessionManager.updateSession({
                ...session,
                accessToken,
                refreshToken,
                expiresIn,
                isLoggedIn: true,
                user: userData.data?.user,
            });

            router.navigate("/dashboard");

        } catch (error: any) {
            if (error.response) {
                const data = error.response.data;
                logger.log("Error Response Data:", data);
                this.setState({ message: data?.message || "Login failed, please try again", messageError: true });
            } else if (error.request) {
                logger.log("No Response Received:", error.request);
            } else {
                logger.log("Passkey Error: ", error.message);
                this.setState({ message: "Authorization failed. Please try again or sign out if the issue persists.", messageError: true });
            }
        } finally {
            this.setState({ loading: false });
        }
    };

    private handlePinInput = (value: string, index: number): void => {
        let { passcode } = this.state;
        const newPin = [...passcode];

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

        this.setState({ passcode: newPin }, async () => {
            if (newPin.join("").length === 4) {
                await this.processLoginRefresh();
            }
        });
    };

    private signout = async () => {
        await sessionManager.logout();
        router.replace('/');
    }

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
                    showSoftInputOnFocus={false}
                    autoComplete="off"
                    autoCapitalize="none"
                    onFocus={(e) => {
                        if (Platform.OS === 'web') {
                            e.target.blur();
                        }
                    }}
                />
            </ThemedView>
        );
    };

    private renderKeypadItem = ({ item }: { item: any }): React.JSX.Element => (
        <TouchableOpacity
            style={styles.box}
            onPress={() => {
                if (item === 'Sign out') {
                    this.signout();
                    return;
                }

                const index = item === 'Backspace'
                    ? this.state.passcode.findIndex(p => p === '') - 1
                    : this.state.passcode.findIndex(p => !p);

                this.handlePinInput(item.toString(), index >= 0 ? index : this.state.passcode.length - 1);
            }}>
            {item === 'Backspace'
                ? <MaterialCommunityIcons name="backspace" size={24} color="red" />
                : item === "Sign out"
                    ? <ThemedText style={{ fontSize: 16, lineHeight: 16, color: "red", fontFamily: 'AeonikMedium', }}>{item}</ThemedText>
                    : <ThemedText style={styles.buttonText}>{item}</ThemedText>}
        </TouchableOpacity>
    );

    render(): React.ReactNode {
        const { passcode, loading, messageError, message } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.container}>
                    <ThemedView style={styles.passkeyContainer}>

                        <ThemedView style={styles.title}>
                            <ThemedText style={styles.titleText}>Welcome back</ThemedText>
                        </ThemedView>

                        <ThemedView style={styles.sub_con}>
                            <Image
                                source={require("../../assets/icons/logo.svg")}
                                tintColor="#253E92"
                                style={{ width: 150, height: 150 }}
                                transition={1000} />
                        </ThemedView>

                        <ThemedView>
                            <ThemedView
                                style={{
                                    height: 1,
                                    width: '100%',
                                    backgroundColor: '#E8E8E8',
                                    marginBottom: 24,
                                }}
                            />

                            <ThemedView>

                                <ThemedView>
                                    <ThemedView style={{ marginBottom: 0, marginTop: 40 }}>
                                        <FlatList
                                            data={passcode}
                                            renderItem={this.renderInputItem}
                                            keyExtractor={(item, index) => index.toString()}
                                            horizontal={true}
                                            contentContainerStyle={styles.inputContainer}
                                        />
                                        <ThemedText
                                            style={{
                                                textAlign: 'center',
                                                fontSize: 12,
                                                fontFamily: 'AeonikRegular',
                                                lineHeight: 14,
                                                marginTop: 16,
                                                color: !messageError ? '#757575' : "#9A1C13",
                                            }}
                                        >
                                            {message}
                                        </ThemedText>
                                    </ThemedView>
                                    <FlatList
                                        data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 'Sign out', 0, 'Backspace']}
                                        renderItem={this.renderKeypadItem}
                                        keyExtractor={(item, index) => index.toString()}
                                        numColumns={3}
                                        contentContainerStyle={styles.keypad}
                                        style={{ paddingBottom: 20 }}
                                    />
                                </ThemedView>

                            </ThemedView>

                        </ThemedView>
                    </ThemedView>
                </ThemedSafeArea>
                <LoadingModal loading={loading} />
            </>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 35 : 0,
    },
    title: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingVertical: 20,
        paddingHorizontal: 20
    },
    sub_con: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    titleText: {
        fontSize: 22,
        fontFamily: 'AeonikMedium',
    },
    passkeyContainer: {
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
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
        position: 'absolute',
        bottom: 20,
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
        lineHeight: 32,
        fontFamily: 'AeonikMedium',
    },
});