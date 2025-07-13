import React from "react";
import sessionManager from "@/session/session";
import { UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { Appearance, ColorSchemeName, Platform, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import PrimaryButton from "@/components/button/primary";
import { IList } from "@/interface/interface";
import { Image } from "expo-image";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import ThemedSafeArea from "@/components/ThemeSafeArea";

interface IProps { }

interface IState { }

export default class PaymentInfoScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Info Bank details";
    constructor(props: IProps) {
        super(props);

        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
    }

    componentDidMount(): void { }

    private DescriptionView = (list: Partial<IList>): React.JSX.Element => {
        return (
            <ThemedView style={{ flexDirection: 'column', gap: 10, justifyContent: 'space-between', paddingVertical: 8, backgroundColor: "transparent" }}>
                <ThemedText
                    style={{ fontFamily: 'AeonikRegular', fontSize: 14, lineHeight: 16, color: '#757575', }}>
                    {list.name}
                </ThemedText>
                <ThemedText style={{ fontFamily: 'AeonikMedium', fontSize: 14, lineHeight: 16, }} >
                    {list.description}
                </ThemedText>
            </ThemedView>
        )
    }

    render(): React.ReactNode {
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.container}>
                    <ThemedView style={{ flex: 1 }}>
                        <ThemedView
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <LinearGradient
                                colors={['rgba(255, 255, 255, 0.3)', 'rgba(64, 65, 78, 0.6)']}
                                locations={[0.5, 1]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    width: '86%',
                                    height: '115%',
                                    position: 'absolute',
                                    top: '4.2%',
                                    borderTopRightRadius: 20,
                                    borderTopLeftRadius: 20,
                                }}
                            />
                            <LinearGradient
                                colors={['rgba(255, 255, 255, 0.3)', 'rgba(64, 65, 78, 0.6)']}
                                locations={[0, 1]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    width: '80%',
                                    height: '110%',
                                    position: 'absolute',
                                    top: '3%',
                                    borderTopRightRadius: 20,
                                    borderTopLeftRadius: 20,
                                }}
                            />
                        </ThemedView>

                        <ThemedView
                            style={{
                                width: '100%',
                                backgroundColor: this.appreance === "dark" ? "#0e0e0e" : '#F7F7F7',
                                height: '99%',
                                position: 'absolute',
                                bottom: -30,
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                                paddingHorizontal: 8,
                                paddingTop: 16,
                            }}
                        >
                            <Pressable
                                onPress={() => router.back()}
                                style={{
                                    padding: 4,
                                    borderRadius: 99,
                                    backgroundColor: this.appreance === "dark" ? "#333333" : '#e7e7e7',
                                    right: 10,
                                    alignSelf: 'flex-end',
                                }}
                            >
                                <Image
                                    source={require("../../assets/icons/close.svg")}
                                    tintColor={this.appreance === "dark" ? "#fff" : "#000"}
                                    style={{ width: 20, height: 20 }} />
                            </Pressable>
                            <ThemedView style={{ marginTop: 53, gap: 24, paddingHorizontal: 16, backgroundColor: "transparent" }}>
                                <Image
                                    source={require("../../assets/images/commonLogo.png")}
                                    contentFit="contain"
                                    style={{ width: 30, height: 30, padding: 5 }} />
                                <ThemedView style={{ backgroundColor: "transparent" }}>
                                    <ThemedView style={{ gap: 4, marginBottom: 24, backgroundColor: "transparent" }}>
                                        <ThemedText
                                            style={{
                                                fontSize: 20,
                                                fontFamily: 'AeonikMedium',
                                            }}
                                        >
                                            Connect Bank Account
                                        </ThemedText>
                                        <ThemedText
                                            style={{
                                                fontSize: 12,
                                                fontFamily: 'AeonikRegular',
                                                lineHeight: 14,
                                                color: '#A5A5A5',
                                            }}
                                        >
                                            Enter your account details for withdrawal
                                        </ThemedText>
                                    </ThemedView>
                                </ThemedView>

                                <ThemedView style={{ gap: 24, backgroundColor: "transparent" }}>
                                    <this.DescriptionView
                                        name={'Fast & Easy Payouts'}
                                        description={'Sell your crypto and instantly transfer funds to your bank account.'}
                                    />
                                    <this.DescriptionView
                                        name={'Crypto Purchases'}
                                        description={'Use your bank account to conveniently buy cryptocurrency directly within the app.'}
                                    />
                                    <this.DescriptionView
                                        name={'Simplified Transactions'}
                                        description={'Streamline your crypto experience by managing both crypto and fiat currency within one platform.'}
                                    />
                                </ThemedView>
                            </ThemedView>
                        </ThemedView>
                        <ThemedView style={{ paddingHorizontal: 16, gap: 23, paddingBottom: 40, backgroundColor: "transparent" }}>
                            <ThemedText
                                style={{
                                    textAlign: 'center',
                                    alignSelf: 'center',
                                    textDecorationLine: 'underline',
                                    color: '#8E8E93',
                                    fontSize: 14,
                                    fontFamily: 'AeonikRegular',
                                }}
                            >
                                By continuing, you agree to wealthX's Privacy policy
                            </ThemedText>
                            <PrimaryButton
                                Gradient
                                title={'Continue'}
                                onPress={() => router.navigate("/payment/add")}
                            />
                        </ThemedView>
                    </ThemedView>
                </ThemedSafeArea>
            </>
        )
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
        backgroundColor: "transparent"
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Appearance.getColorScheme() === "dark" ? "#000000" : '#f7f7f7',
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
        lineHeight: 14,
    },
});