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
import { Dimensions, FlatList, Platform, Pressable, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import { router, Stack } from "expo-router";
import PrimaryButton from "@/components/button/primary";
import { Image } from "expo-image";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";

interface IProps { }

interface IState {
    currentIndex: number;
}

interface Carouse {
    id: string;
    image: string;
    title: string;
    description: string;
}

const { width, height } = Dimensions.get("screen");

export default class OnboardingScreen extends React.Component<IProps, IState> {
    private readonly carouselItem: Carouse[] = [
        {
            id: '1',
            image: require("../../assets/icons/splash_one.svg"),
            title: 'Take Control of Your Crypto',
            description: 'Buy, sell, and trade your favorite cryptocurrencies with ease.'
        },
        {
            id: '2',
            image: require("../../assets/icons/splash_two.svg"),
            title: 'Pay Bills with Crypto',
            description: 'Use your crypto to seamlessly pay bills directly from the app'
        },
        {
            id: '3',
            image: require("../../assets/icons/splash_three.svg"),
            title: 'Swap Faster, Manage Smarter',
            description: 'Swap coins directly within the app, saving you time and transaction fees.'
        },
    ];
    private FlatListRef: React.RefObject<FlatList<Carouse>>;
    private viewConfigRef: { viewAreaCoveragePercentThreshold: number; };
    private autoSlideTimer: number | undefined;
    constructor(props: IProps) {
        super(props);
        this.state = {
            currentIndex: 0,
        };
        this.FlatListRef = React.createRef<FlatList<Carouse>>() as React.RefObject<FlatList<Carouse>>;
        this.viewConfigRef = { viewAreaCoveragePercentThreshold: 95 };
    }

    componentDidMount(): void {
        this.startAutoSlide();
    }

    componentWillUnmount(): void {
        clearInterval(this.autoSlideTimer);
    }

    private startAutoSlide = (): void => {
        this.autoSlideTimer = setInterval(() => {
            const { currentIndex } = this.state;
            const nextIndex = (currentIndex + 1) % this.carouselItem.length;
            this.scrollToIndex(nextIndex);
        }, 5000);
    }

    private onViewStart = ({ viewableItems }: { viewableItems: { isViewable: boolean; index: number | null }[] }): void => {
        const viewableItem = viewableItems.find(item => item.isViewable);
        if (viewableItem && viewableItem.index !== null) {
            this.setState({ currentIndex: viewableItem.index });
        }
    }

    private scrollToIndex = (index: number): void => {
        this.FlatListRef.current?.scrollToIndex({ animated: true, index: index });
        this.setState({ currentIndex: index });
    }

    renderItem = ({ item }: { item: Carouse }): React.JSX.Element => {
        return (
            <ThemedView style={styles.carouselItemContainer}>
                <TouchableOpacity
                    style={{}}>
                    <Image
                        source={item.image}
                        style={{ width: width - (Platform.OS === "web" ? 100 : 140), height: height - 550 }}
                        contentFit="contain"
                        transition={1000}
                    />
                </TouchableOpacity>
                <ThemedView style={{ gap: 16, alignItems: 'center', paddingHorizontal: 20 }}>
                    <ThemedText style={styles.text}>{item.title}</ThemedText>
                    <ThemedText style={styles.subtext}>{item.description}</ThemedText>
                </ThemedView>
            </ThemedView>
        );
    }

    render(): React.ReactNode {
        const { currentIndex } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: 'Onboarding', headerShown: false }} />
                <SafeAreaView style={styles.safeArea}>
                    <ThemedView style={styles.container}>
                        <FlatList
                            data={this.carouselItem}
                            renderItem={this.renderItem}
                            horizontal={true}
                            pagingEnabled={true}
                            showsHorizontalScrollIndicator={false}
                            ref={this.FlatListRef}
                            viewabilityConfig={this.viewConfigRef}
                            onViewableItemsChanged={this.onViewStart}
                            style={{ width, height }}
                            contentContainerStyle={{}}
                            snapToAlignment="center"
                        />

                        <ThemedView
                            style={{
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                paddingHorizontal: 18,
                                bottom: 20,
                                alignSelf: 'center',
                                width: '100%',
                            }}
                        >
                            <ThemedView style={styles.dotView}>
                                {this.carouselItem.map((_, index) => (
                                    <Pressable
                                        key={index.toString()}
                                        style={({ pressed }) => [
                                            styles.circle,
                                            {
                                                backgroundColor: pressed
                                                    ? 'white'
                                                    : currentIndex === index
                                                        ? Colors.blue
                                                        : '#EEEEEE',
                                            },
                                        ]}
                                        onPress={() => this.scrollToIndex(index)}
                                    />
                                ))}
                            </ThemedView>
                        </ThemedView>

                        <ThemedView style={{ paddingHorizontal: 18, marginTop: 41, gap: 16, width: "100%" }}>
                            <PrimaryButton
                                Gradient
                                title={'Create Account'}
                                onPress={() => router.navigate('/onboarding/signup')}
                            />
                            <PrimaryButton title={'Login'} onPress={() => router.navigate('/onboarding/login')} />
                        </ThemedView>
                    </ThemedView>
                    <StatusBar style="dark" />
                </SafeAreaView>
            </>
        )
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingVertical: Platform.OS === 'android' ? 50 : Platform.OS === "web" ? 20 : 0,
        backgroundColor: "#FFF"
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        height: '100%',
        paddingBottom: 40,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
    subtext: {
        fontSize: 16,
        lineHeight: 20,
        textAlign: 'center',
        fontFamily: 'AeonikMedium',
    },
    text: {
        fontSize: 24,
        lineHeight: 24,
        textAlign: 'center',
        fontFamily: 'AeonikBold',
    },
    carouselItemContainer: {
        width: width,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dotView: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 20,
        alignItems: 'center',
    },
    circle: {
        width: 8,
        height: 8,
        borderRadius: 5,
        marginHorizontal: 5,
    },
});