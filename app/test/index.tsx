import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";

interface IProps { }

interface IState { }

export default class TestScreen extends React.Component<IProps, IState> {
    private readonly title = "Template Screen";
    constructor(props: IProps) {
        super(props);
    }

    componentDidMount(): void { }

    render(): React.ReactNode {
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea>
                    <ThemedView>
                        <ThemedText>Hello!!!</ThemedText>
                    </ThemedView>
                </ThemedSafeArea>
                <StatusBar style='light' />
            </>
        )
    }
}