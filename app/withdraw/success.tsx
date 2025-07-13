import React from "react";
import sessionManager from "@/session/session";
import { UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import PrimaryButton from "@/components/button/primary";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";

interface IProps { }

interface IState { }

export default class TemplateScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    // private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Withdraw Success Screen";
    // private withdrawal: IWithdrawal;
    constructor(props: IProps) {
        super(props);

        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
        // this.withdrawal = this.session.withdrawal;
    }

    componentDidMount(): void { }

    render(): React.ReactNode {
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={{ flex: 1, justifyContent: 'center' }}>
                    <ThemedView style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                        <Image
                            source={require("../../assets/images/sales.png")} style={{ marginBottom: 40, width: 150, height: 150 }} />
                        <ThemedView style={{ justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                            <ThemedText
                                style={{
                                    fontSize: 20,
                                    fontFamily: 'AeonikMedium',
                                }}
                            >
                                Your transaction is being processed
                            </ThemedText>
                            <ThemedText
                                style={{
                                    color: '#6B7280',
                                    fontSize: 14,
                                    lineHeight: 18,
                                    fontFamily: 'AeonikRegular',
                                    textAlign: 'center',
                                }}
                            >
                                We'll notify you once it's completed. Thank you for your patience!
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>
                    {/**
                    <ThemedView style={{
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 40,
                    }}>
                        <ThemedText style={{ fontSize: 12, color: "#000", lineHeight: 12 }}>You will get</ThemedText>
                        <ThemedText style={{ fontSize: 40, lineHeight: 40, marginTop: 10, fontFamily: 'AeonikBold', }}>
                            ₦{(this.withdrawal.amount - 80).toLocaleString()}
                        </ThemedText>
                    </ThemedView>
                    */}
                    <ThemedView
                        style={{
                            position: 'absolute',
                            bottom: 40,
                            width: '100%',
                            paddingHorizontal: 16,
                        }}>
                        <PrimaryButton onPress={() => router.dismissTo("/dashboard")} Gradient title={'Done'} />
                    </ThemedView>
                </ThemedSafeArea>
                <StatusBar style='light' />
            </>
        )
    }
}