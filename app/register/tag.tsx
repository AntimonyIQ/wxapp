import React from "react";
import sessionManager from "@/session/session";
import { IRegistration, UserData } from "@/interface/interface";
import { Platform, Pressable, StyleSheet } from "react-native";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import BackButton from "@/components/button/back";
import TextField from "@/components/inputs/text";
import PrimaryButton from "@/components/button/primary";
import LoadingModal from "@/components/modals/loading";
import { Colors } from "@/constants/Colors";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";

interface IProps { }

interface IState {
    username: string;
    usernameFocused: boolean;
    loading: boolean;
}

export default class TagScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Set your WX Tag";
    constructor(props: IProps) {
        super(props);
        this.state = { username: '', usernameFocused: false, loading: false };
        if (!this.session) {
            logger.log("Session not found. Redirecting to login screen.");
        }
    }

    componentDidMount(): void { }

    private handleUsernameDetails = async (): Promise<void> => {
        try {
            this.setState({ loading: true });
            const { username } = this.state;

            const registration: IRegistration = {
                ...this.session.registration,
                tagName: `${username}-wx`,
                username: username,
            };

            await sessionManager.updateSession({ ...this.session, registration });
            router.navigate("/register/pin");
        } catch (error: any) {
            logger.error(error.message);
        } finally {
            this.setState({ loading: false });
        }
    }

    private handleUsernameChange = (text: string): void => {
        const sanitizedText = text.replace(/[^a-zA-Z0-9]/g, '');
        this.setState({ username: sanitizedText.toLowerCase() });
    }

    render(): React.ReactNode {
        const { username, usernameFocused, loading } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.safeArea}>
                    <ThemedView style={{ paddingHorizontal: 16, paddingTop: 24 }}>

                        <BackButton
                            title={`${this.title}`}
                            subtitle={'Set a cool tag for yourself 😎'}
                            p1
                            p2
                            showProgress
                        />

                        <TextField
                            placeholder={'Set username'}
                            showText={usernameFocused}
                            onFocus={() => this.setState({ usernameFocused: true })}
                            textValue={username.trim()}
                            onChangeText={(text) => this.handleUsernameChange(text)}
                            onClear={() => this.setState({ username: '' })}
                            onBlur={() => this.setState({ usernameFocused: false })}
                            title={'Username'}
                        />

                        <ThemedText
                            style={{
                                color: '#757575',
                                fontSize: 10,
                                fontFamily: 'AeonikRegular',
                                lineHeight: 12,
                                marginTop: 10,
                                marginBottom: 10,
                            }}
                        >
                            Your username would show as
                        </ThemedText>

                        <ThemedText>{!username ? null : `${username.toLowerCase()}-wx`}</ThemedText>

                        <ThemedView style={{ marginTop: 40, gap: 40 }}>
                            {(username && username.length > 3)
                                ? <PrimaryButton Gradient title={'Continue'} onPress={this.handleUsernameDetails} />
                                : <PrimaryButton Grey disabled title={'Continue'} onPress={(): void => { }} />}
                            <Pressable style={{ alignSelf: 'center' }}>
                                <ThemedText
                                    style={{
                                        color: Colors.blue,
                                        fontWeight: '500',
                                        fontSize: 16,
                                        lineHeight: 20,
                                        fontFamily: 'AeonikMedium',
                                    }}
                                >
                                    Skip For Now
                                </ThemedText>
                            </Pressable>
                        </ThemedView>
                        <LoadingModal loading={loading} />
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
});