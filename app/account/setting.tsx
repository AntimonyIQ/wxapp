// This is part for the Wealthx Mobile Application.
// Copyright © 2023 WealthX. All rights reserved.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";
import sessionManager from "@/session/session";
import logger from "@/logger/logger";
import { Href, router, Stack } from "expo-router";
import { Appearance, ColorSchemeName, Linking, Platform, ScrollView, Share, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import DialogModal from "@/components/modals/dialog";
import ProfileButton from "@/components/button/profile";
import { IParams, IResponse, IUser, UserData } from "@/interface/interface";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import { StatusBar } from "expo-status-bar";
import Defaults from "../default/default";
import LoadingModal from "@/components/modals/loading";
import { Status } from "@/enums/enums";
import ProfileSwitch from "@/components/switch/profile";
import * as LocalAuthentication from 'expo-local-authentication';
import VerifiedButton from "@/components/button/verified";

interface IProps { }

interface IState {
    deleted: boolean;
    loading: boolean;
    changepin: boolean;
    disableaccount: boolean;
    logout_modal: boolean;
}

export default class AccountSettingScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Account Screen";
    private readonly store_link = Platform.OS === "android"
        ? "https://play.google.com/store/apps/details?id=com.wealthx.app"
        : "https://apps.apple.com/us/app/wx-sell-btc-crypto/id6736343501";
    constructor(props: IProps) {
        super(props);
        this.state = { deleted: false, loading: false, changepin: false, logout_modal: false, disableaccount: false };
    }

    private delete = async (): Promise<void> => {

        try {
            this.setState({ deleted: false, loading: true });

            await Defaults.IS_NETWORK_AVAILABLE();

            const login = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            };

            const res = await fetch(`${Defaults.API}/user/delete`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-location': this.session.location,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
                body: JSON.stringify({}),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                await sessionManager.updateSession({
                    ...this.session,
                    user: undefined,
                    isLoggedIn: false,
                    isRegistred: false,
                    params: {} as IParams
                });
                router.dismissTo("/");
                return;
            };
        } catch (error: any) {
            console.error(error);
            Defaults.TOAST(error.message, "Error");
        } finally {
            this.setState({ loading: false });
        }
    };

    private logout = async (): Promise<void> => {
        try {
            this.setState({ loading: true });
            await Defaults.IS_NETWORK_AVAILABLE();

            const login = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            };

            const res = await fetch(`${Defaults.API}/user/logout`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-devicename': this.session.devicename,
                    Authorization: `Bearer ${this.session.authorization}`,
                }
            });
            const data = await res.json();

            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                await sessionManager.updateSession({ ...this.session, isLoggedIn: false });
                router.dismissTo("/");
                return;
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            this.setState({ loading: false });
        }
    };

    private modify = async (): Promise<void> => {
        try {
            this.setState({ loading: true, changepin: false });
            await Defaults.IS_NETWORK_AVAILABLE();

            const login = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            };

            const res = await fetch(`${Defaults.API}/user/modification/pin`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-location': this.session.location,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
            });

            const data = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                Defaults.TOAST('4 digit OTP has been sent to your email address', "OTP Sent", "success");
                router.navigate("/pin/auth");
                return;
            };
        } catch (err: any) {
            console.error(err);
            Defaults.TOAST(err.message);
        } finally {
            this.setState({ loading: false });
        }
    };

    private disable = async (): Promise<void> => {
        try {
            this.setState({ loading: true });

            await Defaults.IS_NETWORK_AVAILABLE();
            const login = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            }

            const res = await fetch(`${Defaults.API}/user/status/${!this.session.user?.isActive}`, {
                method: 'PATCH',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-location': this.session.location,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                await sessionManager.updateSession({
                    ...this.session,
                    user: {
                        ...this.session.user as IUser,
                        isActive: !this.session.user?.isActive
                    }
                });
                Defaults.TOAST(!this.session.user?.isActive ? "Account disabled" : "Account Enabled", "Success", "success");
                router.back();
                return;
            };
        } catch (error: any) {
            console.error(error.message);
            Defaults.TOAST(error.message);
        } finally {
            this.setState({ loading: false });
        }
    };

    private biometric = async (): Promise<void> => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (!compatible) {
            Defaults.TOAST("Biometric not supported on this device");
            return;
        }

        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) {
            Defaults.TOAST("No biometrics enrolled");
            return;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Authenticate with biometrics",
            fallbackLabel: "Use Passcode",
            cancelLabel: "Cancel",
            disableDeviceFallback: false,
        });

        if (result.success) this.savebiometric();
        else Defaults.TOAST("Authentication failed");
    }

    private savebiometric = async (): Promise<void> => {
        try {
            this.setState({ loading: true });

            await Defaults.IS_NETWORK_AVAILABLE();
            const login = Defaults.LOGIN_STATUS();
            if (!login) {
                logger.log("Session not found. Redirecting to login screen.");
                router.dismissTo(this.session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
                return;
            }

            const res = await fetch(`${Defaults.API}/user/biometric`, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-handshake': this.session.client.publicKey,
                    'x-wealthx-deviceid': this.session.deviceid,
                    'x-wealthx-location': this.session.location,
                    Authorization: `Bearer ${this.session.authorization}`,
                },
                body: JSON.stringify({ biometricType: "FINGERPRINT", biometric: "FINGERPRINT" }),
            });

            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                Defaults.TOAST("Biometric authentication Enabled", "Biometric", "success");
                await sessionManager.updateSession({
                    ...this.session,
                    user: {
                        ...this.session.user as IUser,
                        biometricEnabled: !this.session.user?.biometricEnabled || true
                    },
                });
            };
        } catch (error: any) {
            console.error(error);
            Defaults.TOAST(error.message);
        } finally {
            this.setState({ loading: false });
        }
    };

    private identification = async (): Promise<void> => {
        if (this.session.user?.isPhoneNumberVerified === false) Defaults.TOAST("Please verify phone number to continue");

    }

    render(): React.ReactNode {
        const { deleted, logout_modal, changepin, loading, disableaccount } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.container}>
                    <ThemedView style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Image
                                source={require("../../assets/icons/chevron_right.svg")}
                                style={styles.backIcon}
                                tintColor={"#000000"} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.title}>Account settings</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ScrollView horizontal={false}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}>
                        <ThemedView style={styles.content}>
                            <ThemedView style={{ marginTop: 21, gap: 12 }}>
                                <ThemedText>Verifications</ThemedText>
                                <ThemedView
                                    style={{
                                        padding: 8,
                                        borderRadius: 12,
                                        gap: 8,
                                        backgroundColor: this.appreance === "dark" ? '#090909' : '#F7F7F7'
                                    }}>
                                    {this.session.user?.isEmailVerified === false
                                        ? <ProfileButton text={'Verify Email Address'} onPress={() => { }} />
                                        : <VerifiedButton text={'Email verified'} onPress={(): void => { }} />
                                    }
                                    {this.session.user?.isPhoneNumberVerified === false
                                        ? <ProfileButton text={'Verify Phone Number'} onPress={() => router.navigate('/phone')} />
                                        : <ProfileSwitch text={'Phone verified'} isEnabled={this.session.user?.isPhoneNumberVerified ? true : false} onValueChange={(): void => { }} />
                                    }
                                    {this.session.user?.isIdentityVerified === false
                                        ? <ProfileButton text={'Identity verification'} hideBorder={true} onPress={this.identification} />
                                        : <ProfileSwitch text={'Identity Verifiedd'} hideBorder={true} isEnabled={this.session.user?.isIdentityVerified ? true : false} onValueChange={(): void => { }} />
                                    }
                                </ThemedView>
                            </ThemedView>

                            <ThemedView style={{ marginTop: 21, gap: 12 }}>
                                <ThemedText>Account services</ThemedText>
                                <ThemedView
                                    style={{
                                        padding: 8,
                                        borderRadius: 12,
                                        gap: 8,
                                        backgroundColor: this.appreance === "dark" ? '#090909' : '#F7F7F7'
                                    }}>
                                    {/** <ProfileButton text={'Change Password'} onPress={() => router.navigate('/forget' as Href)} /> */}
                                    <ProfileButton text={'Change Transaction Pin'} onPress={() => this.setState({ changepin: true })} />
                                    <ProfileSwitch text={'Disable Account'}
                                        isEnabled={this.session.user?.isActive === true ? true : false}
                                        onValueChange={(): void => this.setState({ disableaccount: true })} />
                                    {this.session.user?.passkeyEnabled === false
                                        ? <ProfileButton text={'Setup Passkey Authentication'} onPress={() => router.navigate('/passkey/new')} />
                                        : <ProfileSwitch text={'Passkey Activated'} isEnabled={this.session.user?.passkeyEnabled ? true : false} onValueChange={(): void => { }} />
                                    }
                                    {this.session.user?.biometricEnabled === false
                                        ? <ProfileButton text={'Biometric Authentication'} onPress={this.biometric} />
                                        : <ProfileSwitch text={'Biometric Activated'} isEnabled={this.session.user?.biometricEnabled ? true : false} onValueChange={(): void => { }} />
                                    }
                                    {this.session.user?.twoFactorEnabled === false
                                        ? <ProfileButton text={'2FA Authentication'} onPress={() => router.navigate('/2fa')} />
                                        : <ProfileSwitch text={'2FA Auth Enabled'} onValueChange={() => { }} isEnabled={this.session.user?.twoFactorEnabled ? true : false} />
                                    }
                                    <ProfileButton text={'Logout'} textColor={"#FF0000"} hideBorder={true} onPress={() => this.setState({ logout_modal: true })} />
                                </ThemedView>
                            </ThemedView>

                            <ThemedView style={{ gap: 12, marginTop: 40 }}>
                                <ThemedText>Other services</ThemedText>
                                <ThemedView
                                    style={{
                                        padding: 8,
                                        borderRadius: 12,
                                        gap: 8,
                                        backgroundColor: this.appreance === "dark" ? '#090909' : '#F7F7F7'
                                    }}
                                >
                                    <ProfileButton text={'Rate WealthX'} onPress={() => Linking.openURL(this.store_link).catch((err) => console.error('Error opening URL:', err))} />
                                    <ProfileButton text={'Share'} onPress={async () => {
                                        await Share.share({
                                            title: "Join WealthX and start trading your own cryptocurrency assets",
                                            message: this.store_link,
                                        });
                                    }} />
                                    <ProfileButton text={'Help'} onPress={() => {
                                        Linking.openURL('https://wealthx.app/faq').catch((err) => console.error('Error opening URL:', err));
                                    }} />
                                    <ProfileButton textColor={"#FF0000"} text={'Delete Account'} hideBorder={true} onPress={() => this.setState({ deleted: true })} />
                                </ThemedView>
                            </ThemedView>
                        </ThemedView>
                    </ScrollView>

                    <DialogModal
                        title='Confirm Account Delete'
                        message={<>
                            <ThemedText style={styles.dialogMessage}>Are you sure you want to delete your account? This action cannot be undone. </ThemedText>
                            <ThemedText style={styles.dialogMessage}>This will also remove all your data and access to your account. Do you want to proceed?</ThemedText>
                        </>}
                        visible={deleted}
                        onConfirm={() => this.setState({ deleted: !deleted }, this.delete)}
                        onCancel={() => this.setState({ deleted: !deleted })} />
                    <DialogModal
                        title='Confirm Logout'
                        message={<>
                            <ThemedText style={styles.dialogMessage}>Are you sure you want to log out of your account?</ThemedText>
                            <ThemedText style={styles.dialogMessage}>You will need to sign in again to access your data. Do you want to continue?</ThemedText>
                        </>}
                        visible={logout_modal}
                        onConfirm={() => this.setState({ logout_modal: !logout_modal }, this.logout)}
                        onCancel={() => this.setState({ logout_modal: !logout_modal })} />
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
                        onConfirm={() => this.setState({ changepin: !changepin }, this.modify)}
                        onCancel={() => this.setState({ changepin: !changepin })}
                    />
                    <DialogModal
                        title="Disable Account"
                        message={
                            <>
                                <ThemedText style={styles.dialogMessage}>
                                    Disabling your account will restrict access to your profile and related services. This action can be reversed by reactivating your account later.
                                </ThemedText>
                            </>
                        }
                        visible={disableaccount}
                        onConfirm={() => this.setState({ disableaccount: !disableaccount }, this.disable)}
                        onCancel={() => this.setState({ disableaccount: !disableaccount })}
                    />
                    <LoadingModal loading={loading} />
                    <StatusBar style="dark" />
                </ThemedSafeArea>
            </>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 50 : Platform.OS === "web" ? 20 : 0,
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
        backgroundColor: '#f7f7f7',
        borderRadius: 99,
        paddingVertical: 5,
        paddingRight: 20,
        paddingLeft: 5,
    },
    backIcon: {
        height: 23,
        width: 23,
    },
    backText: {
        fontFamily: 'AeonikRegular',
        fontSize: 12,
        lineHeight: 14,
    },
    title: {
        fontSize: 16,
        fontFamily: 'AeonikBold',
    },
    dialogMessage: {
        fontSize: 16,
        marginBottom: 20,
        fontFamily: 'AeonikRegular',
    },
    content: {
        marginTop: 46,
        marginHorizontal: 16,
    },
    profileContainer: {
        alignSelf: 'center',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
    },
    userInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontFamily: 'AeonikMedium',
    },
    userUsername: {
        fontSize: 14,
        fontFamily: 'AeonikRegular',
        color: '#757575',
        marginTop: 5,
    },
    detailsContainer: {
        marginTop: 43,
        gap: 12,
    },
    detailsBox: {
        padding: 8,
        borderRadius: 12,
        gap: 8,
        backgroundColor: 'white',
    },
    deleteButton: {
        paddingHorizontal: 12,
        position: 'absolute',
        bottom: 45,
        alignSelf: 'center',
    },
    deleteButtonText: {
        fontSize: 16,
        lineHeight: 20,
        color: '#FF0000',
        textAlign: 'center',
        fontFamily: 'AeonikRegular',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});