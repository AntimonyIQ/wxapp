import React from 'react';
import { Appearance, Linking, StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import sessionManager from '../../session/session';
import logger from '@/logger/logger';
import { router } from 'expo-router';
import { createAvatar, Result } from '@dicebear/core';
import { micah } from '@dicebear/collection';
import { Image } from 'expo-image';
import ProfileButton from '@/components/button/profile';
import DialogModal from '@/components/modals/dialog';
import Toast from 'react-native-toast-message';
import { IUser, UserData } from '@/interface/interface';
import ThemedView from '@/components/ThemedView';
import ThemedText from '@/components/ThemedText';

interface IProps { }

interface IState {
    logout: boolean;
    changepin: boolean;
}

export default class TabTwoScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private avatar: Result;
    private user: IUser;
    constructor(props: IProps) {
        super(props);
        this.state = {
            logout: false,
            changepin: false,
        };
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
        this.user = this.session.user as IUser;
        this.avatar = createAvatar(micah, {
            seed: this.session?.user?.fullName,
        });
    }

    componentDidMount(): void {
        logger.clear();
    }

    render() {
        const { logout, changepin } = this.state;
        return (
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
                headerImage={
                    <Image
                        source={this.avatar.toDataUri()}
                        style={styles.headerImage}
                    />
                }>
                <ThemedView style={styles.section}>
                    <ThemedText style={{ fontFamily: 'AeonikRegular' }}>Account services</ThemedText>
                    <ThemedView style={styles.servicesContainer}>
                        <ProfileButton
                            text={'Account details'}
                            onPress={() => router.navigate('/account')}
                        />
                        <ProfileButton
                            text={'Payment methods'}
                            onPress={() => router.navigate('/payment')}
                        />
                        <ProfileButton text={'Change Pin'} onPress={() => this.setState({ changepin: true })} />
                        <ProfileButton
                            text={'Refer and Earn'}
                            onPress={() => router.navigate('/refer')}
                        />
                        <ProfileButton
                            text={'Settings'}
                            onPress={() => router.navigate('/account/setting')}
                            hideBorder={true}
                        />
                    </ThemedView>
                </ThemedView>

                <ThemedView style={styles.section}>
                    <ThemedText style={{ fontFamily: 'AeonikRegular' }}>Other services</ThemedText>
                    <ThemedView style={styles.servicesContainer}>
                        <ProfileButton text={'Legal'} onPress={() => {
                            Linking.openURL('https://wealthx.app/privacy').catch((err) => console.error('Failed to open URL:', err))
                        }} />
                        <ProfileButton text={'Chat With Us'} onPress={() => router.navigate('/chat')} />
                        <ProfileButton text={'Get Help'} onPress={() => Linking.openURL('https://wealthx.app/faq').catch((err) => console.error('Failed to open URL:', err))} />
                        <ProfileButton text={'Log Out'} onPress={() => this.setState({ logout: !logout })} hideBorder={true} />
                    </ThemedView>
                </ThemedView>
                <DialogModal
                    title='Confirm Logout'
                    message='Are you sure you want to log out?'
                    visible={logout}
                    onConfirm={() => this.setState({ logout: !logout }, async () => {
                        await sessionManager.updateSession({ ...this.session, isLoggedIn: false });
                        router.dismissTo("/");
                    })}
                    onCancel={() => this.setState({ logout: !logout })} />
                <DialogModal
                    title="Confirm PIN Change"
                    message={
                        <>
                            <ThemedText style={styles.dialogMessage}>
                                Changing your PIN requires verification for security purposes. A confirmation email will be sent to your registered email address.
                            </ThemedText>
                            <ThemedText style={styles.dialogMessage}>
                                Please check your inbox and follow the instructions to complete the PIN change.
                            </ThemedText>
                        </>
                    }
                    visible={changepin}
                    onConfirm={() => this.setState({ changepin: !changepin }, async () => {
                        Toast.show({
                            type: "success",
                            text1: "Security Update",
                            text2: `A confirmation email has been sent to ${this.user.email.slice(0, 3)}****${this.user.email.slice(-3)}.`,
                            text1Style: { fontSize: 16, fontFamily: "AeonikBold" },
                            text2Style: { fontSize: 12, fontFamily: "AeonikRegular" },
                        });
                    })}
                    onCancel={() => this.setState({ changepin: !changepin })}
                />
            </ParallaxScrollView>
        );
    }
}

const styles = StyleSheet.create({
    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -35,
        position: 'absolute',
        width: 200,
        height: 200
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 99,
        paddingVertical: 5,
        paddingRight: 20,
    },
    backIcon: {
        height: 24,
        width: 24,
    },
    backText: {
        fontFamily: 'AeonikRegular',
        fontSize: 12,
        color: "red",
        lineHeight: 14,
    },
    title: {
        fontSize: 16,
        fontFamily: 'AeonikBold',
    },
    settingsButton: {
        padding: 6,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    content: {
        marginTop: 46,
        marginHorizontal: 16,
    },
    profileContainer: {
        paddingHorizontal: 24,
        paddingVertical: 23,
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
    },
    profileInfo: {
        flex: 1,
        gap: 12,
    },
    avatar: {
        height: 48,
        width: 48,
    },
    userTag: {
        fontSize: 12,
        color: '#253E92',
        lineHeight: 14,
        fontFamily: 'AeonikRegular',
    },
    section: {
        gap: 8,
    },
    servicesContainer: {
        padding: 18,
        borderRadius: 12,
        gap: 8,
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#0f0f0f" : "#F5F5F5",
    },
    dialogMessage: {
        fontSize: 16,
        marginBottom: 20,
        fontFamily: 'AeonikRegular',
    },
});
