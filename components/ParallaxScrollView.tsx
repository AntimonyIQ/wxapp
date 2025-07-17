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

import React, { Component, createRef } from 'react';
import { Animated, Appearance, ScrollView, StyleSheet } from 'react-native';
import ThemedView from './ThemedView';

const HEADER_HEIGHT = 250;

interface Props {
    headerImage: React.ReactElement;
    headerBackgroundColor: { dark: string; light: string };
    children: React.ReactNode;
}

interface State {
    scrollY: Animated.Value;
}

export default class ParallaxScrollView extends Component<Props, State> {
    private scrollRef: React.RefObject<ScrollView | null>;
    constructor(props: Props) {
        super(props);
        this.scrollRef = createRef<ScrollView>();
        this.state = {
            scrollY: new Animated.Value(0),
        };
    }

    render() {
        const { headerImage, headerBackgroundColor, children } = this.props;
        const colorScheme = Appearance.getColorScheme() ?? 'light';

        // Interpolations
        const translateY = this.state.scrollY.interpolate({
            inputRange: [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            outputRange: [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
            extrapolate: 'clamp',
        });

        const scale = this.state.scrollY.interpolate({
            inputRange: [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            outputRange: [2, 1, 1],
            extrapolate: 'clamp',
        });

        return (
            <ThemedView style={styles.container}>
                <Animated.ScrollView
                    ref={this.scrollRef}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    contentContainerStyle={{ paddingBottom: 0 }}>
                    <Animated.View
                        style={[
                            styles.header,
                            { backgroundColor: headerBackgroundColor[colorScheme] },
                            { transform: [{ translateY }, { scale }] },
                        ]}>
                        {headerImage}
                    </Animated.View>
                    <ThemedView style={styles.content}>{children}</ThemedView>
                </Animated.ScrollView>
            </ThemedView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: HEADER_HEIGHT,
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        padding: 20,
        gap: 16,
        overflow: 'hidden',
        backgroundColor: "#FFF",
        height: "100%"
    },
});
