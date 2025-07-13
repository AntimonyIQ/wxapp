import React from "react";
import sessionManager from "@/session/session";
import { UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import { Stack } from "expo-router";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";

interface IProps { }

interface IState { }

export default class ConfirmNewPasskeyScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    constructor(props: IProps) {
        super(props);

        if (!this.session) {
            logger.log("Session not found. Redirecting to login screen.");
        }
    }

    componentDidMount(): void { }

    render(): React.ReactNode {
        return (
            <>
                <Stack.Screen options={{ title: 'Onboarding', headerShown: false }} />
                <ThemedSafeArea>
                    <ThemedView></ThemedView>
                </ThemedSafeArea>
            </>
        )
    }
}