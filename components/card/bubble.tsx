import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "../ThemedText";
import { Image } from "expo-image";
import { Colors } from "@/constants/Colors";

interface ChatBubbleProps {
    text: string;
    isSender?: boolean;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
    fontSize?: number;
    maxWidth?: number | string;
    isRead?: boolean;
    time?: string; // New prop for message time
}

class ChatBubble extends React.PureComponent<ChatBubbleProps> {
    static defaultProps = {
        isSender: false,
        backgroundColor: "#E5E5EA",
        textColor: "#000",
        borderRadius: 16,
        fontSize: 16,
        maxWidth: "75%",
        isRead: false,
        time: "",
    };

    render() {
        const { text, isSender, backgroundColor, textColor, borderRadius, fontSize, maxWidth, isRead, time } =
            this.props;

        return (
            <View style={[styles.container, isSender ? styles.senderContainer : styles.receiverContainer]}>
                {/* Tail */}
                <View
                    style={[
                        styles.tail,
                        isSender ? styles.tailSender : styles.tailReceiver,
                        { borderBottomColor: isSender ? Colors.blue : backgroundColor, },
                    ]}
                />

                {/* Bubble */}
                <View
                    style={[
                        styles.bubble,
                        {
                            backgroundColor: isSender ? Colors.blue : backgroundColor,
                            borderRadius,
                            minWidth: (text.length * 9) < 300 ? text.length * 9 : "75%",
                            maxWidth: typeof maxWidth === "number" ? maxWidth : parseFloat(maxWidth as string),
                        },
                    ]}
                >
                    <ThemedText style={[styles.text, { color: textColor, fontSize }]}>{text}</ThemedText>

                    {/* Time & Read Status (Only for Sent Messages) */}
                    {isSender && (
                        <View style={styles.footer}>
                            {time ? <ThemedText style={styles.time}>{time}</ThemedText> : null}
                            {isRead && (
                                <Image
                                    source={require("../../assets/icons/isread.svg")}
                                    style={styles.readIcon}
                                    tintColor={"#FFF"}
                                />
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginVertical: 4,
        marginHorizontal: 10,
        width: "100%"
    },
    senderContainer: {
        alignSelf: "flex-end",
        justifyContent: "flex-end"
    },
    receiverContainer: {
        alignSelf: "flex-start",
    },
    bubble: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        // minWidth: "70%", // Ensures bubble stretches
        maxWidth: "75%", // Ensures it doesn’t exceed max width
        flexGrow: 1, // Forces bubble to expand as much as possible
        flexShrink: 1, // Prevents it from exceeding limits
        flex: 1
    },
    text: {
        fontSize: 16,
        flexWrap: "wrap",
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-end",
        marginTop: 4,
    },
    time: {
        fontSize: 8,
        marginRight: 5,
    },
    readIcon: {
        width: 13,
        height: 13,
    },
    tail: {
        position: "absolute",
        bottom: 0,
        width: 10,
        height: 10,
        borderWidth: 5,
        borderStyle: "solid",
        backgroundColor: "transparent",
    },
    tailSender: {
        right: -5,
        borderLeftWidth: 5,
        borderLeftColor: "transparent",
        borderTopWidth: 5,
        borderTopColor: "transparent",
        borderBottomWidth: 5,
    },
    tailReceiver: {
        left: -5,
        borderRightWidth: 5,
        borderRightColor: "transparent",
        borderTopWidth: 5,
        borderTopColor: "transparent",
        borderBottomWidth: 5,
    },
});

export default ChatBubble;
