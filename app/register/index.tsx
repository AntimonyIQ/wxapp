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
import { IRegistration, UserData } from "@/interface/interface";
import { Platform, Pressable, ScrollView, StyleSheet } from "react-native";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import BackButton from "@/components/button/back";
import TextField from "@/components/inputs/text";
import PrimaryButton from "@/components/button/primary";
import LoadingModal from "@/components/modals/loading";
import DateOfBirthDialogModal from "@/components/modals/dob";
import { IList } from "@/interface/interface";
import ListModal from "@/components/modals/list";
import PhoneField from "@/components/inputs/phone";
import countries from "../data/countries_states.json";
import Defaults from "../default/default";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";

interface IProps { }

interface IState {
    loading: boolean;
    country: string;
    countryCode: string;
    referralCode: string;
    referralFocused: boolean;
    dateOfBirth: string;
    dateOfBirthFocused: boolean;
    phoneNumber: string;
    phoneNumberFocused: boolean;
    dobmodal: boolean;
    list_modal: boolean;
    lists: Array<IList>;
    phones: Array<IList>;
}

export default class RegisterScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Add Details";
    constructor(props: IProps) {
        super(props);
        this.state = {
            loading: false,
            country: '',
            countryCode: '+234',
            referralCode: '',
            referralFocused: false,
            dateOfBirth: '',
            dateOfBirthFocused: false,
            phoneNumber: '',
            phoneNumberFocused: false,
            dobmodal: false,
            list_modal: false,
            lists: [],
            phones: [],
        }

    }

    componentDidMount(): void {
        requestAnimationFrame(() => this.loadList());
    };

    private loadList = (): void => {
        const lists: Array<IList> = countries.map((country, _index) => ({
            name: country.name,
            description: country.name,
            icon: `https://flagcdn.com/24x18/${country.iso2.toLowerCase()}.png`
        }));

        const phones: Array<IList> = countries.map((country, _index) => ({
            name: country.name,
            description: `+${country.phonecode}`,
            icon: `https://flagcdn.com/24x18/${country.iso2.toLowerCase()}.png`
        }));

        this.setState({ lists, phones });
    };

    private handleUserDetails = async (): Promise<void> => {
        try {
            const { country, referralCode, dateOfBirth, phoneNumber, countryCode } = this.state;
            if (!country || !dateOfBirth || !phoneNumber) throw new Error('All fields are required');

            this.setState({ loading: true });

            const registration: IRegistration = {
                ...this.session.registration,
                country,
                referralCode,
                dateOfBirth,
                phoneNumber,
                countryCode
            };

            await sessionManager.updateSession({ ...this.session, registration });
            router.navigate("/register/tag");
        } catch (error: any) {
            logger.error(error);
            Defaults.TOAST(error.message);
        } finally {
            this.setState({ loading: false });
        }
    }

    render(): React.ReactNode {
        const { loading, country, lists, phones, list_modal, dobmodal, referralCode, dateOfBirth, phoneNumber, referralFocused } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.safeArea}>

                    <ScrollView
                        style={{
                            flex: 1,
                            backgroundColor: "#fff"
                        }}
                        showsVerticalScrollIndicator={false}>
                        <ThemedView style={{ paddingHorizontal: 16, paddingTop: 24 }}>

                            <BackButton title={this.title} p1 showProgress />

                            <TextField
                                placeholder={'Full Name'}
                                title={'Full Name'}
                                showText={false}
                                textValue={this.session.registration?.fullName || ""}
                                onChangeText={(text) => { }}
                                readonly={true}
                            />

                            <TextField
                                placeholder={'Email Address'}
                                title={'Email Address'}
                                showText={false}
                                textValue={this.session.registration?.email || ""}
                                onChangeText={(text) => { }}
                                readonly={true}
                            />

                            <ThemedView style={{ flex: 1 }}>
                                <PhoneField
                                    placeholder='Phone Number'
                                    maxLength={20}
                                    getCode={(code) => this.setState({ countryCode: code })}
                                    textValue={phoneNumber}
                                    onChangeText={(text): void => this.setState({ phoneNumber: text })}
                                    showPasteButton={false}
                                    lists={phones}
                                    onClear={(): void => this.setState({ phoneNumber: "" })}
                                    onFocus={(): void => this.setState({ list_modal: false })}
                                />
                            </ThemedView>

                            <ThemedView style={styles.countryInputContainer}>
                                <Pressable
                                    onPress={() => this.setState({ list_modal: true })}>
                                    <ThemedText style={styles.input}>{country || 'Select a country...'}</ThemedText>
                                </Pressable>
                            </ThemedView>

                            <ThemedView style={{ flex: 1, marginBottom: 16 }}>
                                <Pressable
                                    onPress={() => this.setState({ dobmodal: !dobmodal, list_modal: false, })}>
                                    <ThemedText style={styles.input}>{dateOfBirth || 'Enter your date of birth'}</ThemedText>
                                </Pressable>
                            </ThemedView>

                            <ThemedView style={{ flex: 1 }}>
                                <TextField
                                    showText={referralFocused}
                                    onFocus={() => this.setState({ list_modal: false, referralFocused: true, dateOfBirthFocused: false, phoneNumberFocused: false })}
                                    textValue={referralCode}
                                    onChangeText={(text) => this.setState({ referralCode: text })}
                                    onBlur={() => this.setState({ referralFocused: false, dateOfBirthFocused: false, phoneNumberFocused: false })}
                                    onClear={() => this.setState({ referralCode: '' })}
                                    placeholder={'Referral Code (Optional)'}
                                    title={'Referral Code'}
                                />
                            </ThemedView>

                            <ThemedView style={{ marginTop: 34, marginBottom: 100 }}>
                                {(country && phoneNumber && dateOfBirth)
                                    ? <PrimaryButton Gradient title={'Continue'} onPress={this.handleUserDetails} />
                                    : <PrimaryButton Grey disabled onPress={() => { }} title={'Continue'} />
                                }
                            </ThemedView>

                        </ThemedView>
                    </ScrollView>

                    <Pressable style={styles.loginPressable}>
                        <ThemedText style={styles.loginText}>
                            Already have an account? <ThemedText style={styles.loginLink}>Login</ThemedText>
                        </ThemedText>
                    </Pressable>

                    <LoadingModal loading={loading} />
                    <DateOfBirthDialogModal
                        onCancel={() => this.setState({ dobmodal: !dobmodal })}
                        onConfirm={(value) => this.setState({ dateOfBirth: value, dobmodal: !dobmodal })}
                        visible={dobmodal} />

                    {list_modal &&
                        <ListModal
                            visible={list_modal}
                            listChange={(list) => this.setState({ list_modal: false, country: list.name })}
                            onClose={() => this.setState({ list_modal: !list_modal })}
                            lists={lists}
                            showSearch={true} />}
                    <StatusBar style={"dark"} />
                </ThemedSafeArea>
            </>
        )
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 35 : 0,
    },
    loginPressable: {
        position: 'absolute',
        bottom: 20,
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingBottom: 25,
        paddingTop: 10,
    },
    loginText: {
        fontFamily: 'AeonikRegular',
        fontSize: 14,
        color: '#757575',
        lineHeight: 16,
    },
    loginLink: {
        color: '#253E92',
    },
    inputContainer: {
        width: '100%',
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#f7f7f7',
        borderRadius: 10,
        marginBottom: 16,
    },
    countryInputContainer: {
        width: '100%',
        borderRadius: 10,
        marginVertical: 16
    },
    input: {
        fontFamily: 'AeonikMedium',
        fontSize: 14,
        color: "#000",
        backgroundColor: '#f7f7f7',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginBottom: 0,
    },
});