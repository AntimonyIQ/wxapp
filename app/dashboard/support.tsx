import ThemedSafeArea from '@/components/ThemeSafeArea';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default class SupportScreen extends React.Component<{}, { isLoading: boolean }> {
    constructor(props: {}) {
        super(props);
        this.state = {
            isLoading: true,
        };
    }

    render() {
        return (
            <ThemedSafeArea style={{ flex: 1 }}>
                <View style={styles.container}>
                    {this.state.isLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#283C8D" />
                        </View>
                    )}
                    <WebView
                        originWhitelist={['*']}
                        source={{ uri: 'https://tawk.to/chat/6888a2595c1a7d192bb13ff4/1j1arkc8t' }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                        style={{ flex: 1, width: '100%', backgroundColor: 'transparent' }}
                        onLoadEnd={() => this.setState({ isLoading: false })}
                        scalesPageToFit={true}
                        allowsInlineMediaPlayback={true}
                    />
                </View>
            </ThemedSafeArea>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        zIndex: 1,
    },
});
