import React from "react";
import sessionManager from "../session/session";
import { UserData } from "@/interface/interface";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, View } from "react-native";

interface IProps { }

interface IState { }

export default class TemplateScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private readonly title = "Template Screen";
    constructor(props: IProps) {
        super(props);

        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
    }

    componentDidMount(): void { }

    render(): React.ReactNode {
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <SafeAreaView>
                    <View></View>
                </SafeAreaView>
                <StatusBar style='dark' />
            </>
        )
    }
}