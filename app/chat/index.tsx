import React from "react";
import sessionManager from "@/session/session";
import { IChat, UserData, IUser } from "@/interface/interface";
import logger from "@/logger/logger";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Appearance, ColorSchemeName, Platform, Pressable, ScrollView, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import TextField from "@/components/inputs/text";
import ChatBubble from "@/components/card/bubble";
import { Colors } from "@/constants/Colors";
import Defaults from "../default/default";
import LoadingModal from "@/components/modals/loading";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ThemedSafeArea from "@/components/ThemeSafeArea";

interface IProps { }

interface IState {
    message: string;
    loading: boolean;
    isSending: boolean;
    isTyping: boolean;
    chats: Array<IMessage>;
    replayId: string;
}

export default class ChatScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Chat with us";
    private scrollView: ScrollView | null = null;
    private user: IUser;
    constructor(props: IProps) {
        super(props);
        this.state = { message: "", loading: true, isSending: false, isTyping: false, chats: [], replayId: "" }
        if (!this.session || !this.session.isLoggedIn) {
            logger.log("Session not found. Redirecting to login screen.");
            router.dismissTo("/");
        };
        this.user = this.session.user as IUser;
    }

    componentDidMount(): void {
        this.getChats();
        setTimeout(() => {
            this.scrollView?.scrollToEnd({ animated: true });
        }, 500);
    }

    private formatChatDate(timestamp: string): string {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        }

        if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        }

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        if (date > oneWeekAgo) {
            return date.toLocaleDateString("en-US", { weekday: "long" });
        }

        return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    };

    private getChats = async (): Promise<void> => {
        try {
            this.setState({ loading: true });

            const response = await fetch(`${Defaults.API}/support/user`, {
                method: "GET",
                headers: { ...Defaults.HEADERS, "Authorization": `Bearer ${this.session.accessToken}` },
            });

            if (!response.ok) throw new Error("response failed with status: " + response.status);

            const data = await response.json();

            if (data.status === "success") {
                const supportChat: SupportChatDocument = data?.data?.supportChat;
                this.setState({ chats: supportChat.messages, replayId: supportChat._id });
            }
        } catch (error: any) {
            logger.error(error);
        } finally {
            this.setState({ loading: false });
        }
    }

    private sendMessage = async (): Promise<void> => {
        try {
            this.setState({ isSending: true, message: "" });

            const payload: Record<string, any> = {
                message: this.state.message,
                sender: "user",
                messageId: this.state.replayId,
            };

            const response = await fetch(`${Defaults.API}/support/message`, {
                method: "POST",
                headers: { ...Defaults.HEADERS, "Authorization": `Bearer ${this.session.accessToken}` },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("response failed with status: " + response.status);

            const data = await response.json();
            if (data.status === "success") {
                const newSupportChat: SupportChatDocument = data?.data.supportChatMessage;
                const messages: Array<IMessage> = newSupportChat.messages;

                this.setState({ chats: messages, replayId: newSupportChat._id });
            }
        } catch (error: any) {
            logger.error(error.message || error);
        } finally {
            this.setState({ isSending: false });
        }
    }

    render(): React.ReactNode {
        const { isSending, message, loading, chats, isTyping } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.safeArea}>
                    <ThemedView style={styles.header}>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}>
                            <Image
                                source={require("../../assets/icons/chevron-left.svg")}
                                tintColor={this.appreance === "dark" ? "#ffffff" : "#000000"}
                                style={styles.backIcon} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>

                        <ThemedText style={styles.title}>{this.title}</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ScrollView
                        ref={(ref) => { this.scrollView = ref; }}
                        onContentSizeChange={() => this.scrollView?.scrollToEnd({ animated: true })}
                        horizontal={false}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}>
                        <ThemedView style={{ padding: 20, width: "100%", }}>
                            <ChatBubble text='Hello! How can we assist you today?' isSender={false} />

                            {chats.map((chat, index) => {
                                const currentDate = this.formatChatDate(chat.timestamp);
                                const previousDate = index > 0 ? this.formatChatDate(chats[index - 1].timestamp) : null;
                                const showDivider = currentDate !== previousDate;

                                const date = new Date(chat.timestamp);
                                const hours = date.getHours();
                                const minutes = date.getMinutes();
                                const ampm = hours >= 12 ? 'PM' : 'AM';
                                const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;

                                return (
                                    <React.Fragment key={index}>
                                        {showDivider && (
                                            <ThemedView style={{ alignItems: "center", marginVertical: 10 }}>
                                                <ThemedText style={{ fontSize: 14, fontWeight: "bold", color: "#999" }}>
                                                    {currentDate}
                                                </ThemedText>
                                            </ThemedView>
                                        )}

                                        <ChatBubble
                                            text={chat.message}
                                            isRead
                                            time={formattedTime}
                                            isSender={chat.sender === "user"} />
                                    </React.Fragment>
                                );
                            })}

                            {(isTyping || isSending) && <ChatBubble text="●●●" isSender={true} />}
                        </ThemedView>
                    </ScrollView>

                    <ThemedView style={styles.chatArea}>
                        <ThemedView style={{ padding: 0, height: "auto", width: "86%", }}>
                            <TextField
                                disable={isSending}
                                textValue={message}
                                showText={true}
                                onFocus={(): void => this.setState({ isTyping: true })}
                                onBlur={(): void => this.setState({ isTyping: false })}
                                onClear={(): void => this.setState({ message: "" })}
                                placeholder="Start typing..."
                                onChangeText={(text): void => this.setState({ message: text })}
                            />
                        </ThemedView>
                        <Pressable
                            onPress={this.sendMessage}
                            style={{ backgroundColor: Colors.blue, width: 45, height: 45, flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 360, transform: [{ translateY: -10 }] }}>
                            <Image
                                source={require("../../assets/icons/send.svg")}
                                tintColor={this.appreance === "dark" ? "#FFF" : "#000"}
                                style={{ width: 21, height: 21, }}></Image>
                        </Pressable>
                    </ThemedView>

                    <LoadingModal loading={loading} />
                </ThemedSafeArea>
                <StatusBar style='light' />
            </>
        )
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 50 : Platform.OS === "web" ? 20 : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Appearance.getColorScheme() === "dark" ? '#070707' : '#f7f7f7',
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
    title: {
        fontSize: 16,
        fontFamily: 'AeonikBold',
    },
    chatArea: {
        width: "100%",
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
});