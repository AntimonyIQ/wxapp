import React from "react";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import ThemedText from "@/components/ThemedText";
import ThemedSafeArea from "@/components/ThemeSafeArea";
import ThemedView from "@/components/ThemedView";

interface IProps { }

interface IState { }

export default class RegisterSuccessScreen extends React.Component<IProps, IState> {
    private readonly title = "Account Success";
    constructor(props: IProps) {
        super(props);
    }

    componentDidMount(): void { }

    render(): React.ReactNode {
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={{
                    flex: 1,
                    paddingTop: Platform.OS === 'android' ? 50 : 0,
                }}>
                    <ThemedView style={{ backgroundColor: 'white', flex: 1, height: "100%", alignItems: 'center', justifyContent: 'center' }}>

                        <LinearGradient
                            colors={['#F1F1F1CE', '#F1F1F1CE']}
                            locations={[0.5, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                width: '86%',
                                height: '100%',
                                position: 'absolute',
                                top: '4.2%',
                                borderTopRightRadius: 20,
                                borderTopLeftRadius: 20,
                            }}
                        />
                        <LinearGradient
                            colors={['#FFFFFF99', '#FFFFFF99']}
                            locations={[0, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                width: '80%',
                                height: '98%',
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
                            height: Platform.OS === "ios" ? '98%' : '95%',
                            position: 'absolute',
                            top: "auto",
                            bottom: 0,
                            paddingBottom: 50,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            paddingHorizontal: 8,
                            backgroundColor: '#f5f5f5f5',
                        }}
                    >
                        <Pressable
                            onPress={() => router.navigate("/onboarding")}
                            style={{
                                padding: 4,
                                borderRadius: 99,
                                marginTop: 18,
                                backgroundColor: '#e7e7e7',
                                right: 10,
                                alignSelf: 'flex-end',
                            }}>
                            <Image
                                source={require("../../assets/icons/close.svg")}
                                tintColor={"#000"}
                                style={{ width: 20, height: 20 }} />
                        </Pressable>

                        <View style={{ height: "100%" }}>
                            <View
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 64,
                                    flex: 1,
                                }}
                            >
                                <Image
                                    source={require("../../assets/icons/welcome.svg")}
                                    style={{ width: 230, height: 230 }}
                                    contentFit="contain"
                                    transition={1000}
                                />
                                <ThemedText
                                    style={{
                                        fontFamily: 'AeonikMedium',
                                        fontSize: 20,
                                        fontWeight: '500',
                                    }}
                                >
                                    Account Created Successfully
                                </ThemedText>
                            </View>

                            <View
                                style={{ gap: 23, alignItems: 'center', marginHorizontal: 16, marginBottom: 40, }}>
                                <Pressable>
                                    <ThemedText
                                        style={{
                                            textDecorationLine: 'underline',
                                            fontSize: 12,
                                            fontFamily: 'AeonikRegular',
                                            lineHeight: 14,
                                        }}
                                    >
                                        By continuing, you agree to wealthX's Privacy policy
                                    </ThemedText>
                                </Pressable>

                                <Pressable
                                    onPress={() => router.navigate("/onboarding/login")}
                                    style={{
                                        paddingHorizontal: 12,
                                        paddingVertical: 14,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#FBA91E',
                                        width: '100%',
                                        borderRadius: 12,
                                    }}
                                >
                                    <ThemedText
                                        style={{
                                            color: '#1F1F1F',
                                            fontFamily: 'AeonikMedium',
                                            fontSize: 16,
                                            lineHeight: 20,
                                        }}
                                    >
                                        Continue
                                    </ThemedText>
                                </Pressable>

                            </View>

                        </View>

                    </ThemedView>
                </ThemedSafeArea>
                <StatusBar style={"dark"} />
            </>
        )
    }
}