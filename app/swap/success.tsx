import React from 'react';
import { router, Stack } from 'expo-router';
import PrimaryButton from '@/components/button/primary';
import { Image } from 'expo-image';
import ThemedSafeArea from '@/components/ThemeSafeArea';
import ThemedView from '@/components/ThemedView';
import ThemedText from '@/components/ThemedText';

export default class SwapDoneScreen extends React.Component<{}, {}> {

    render() {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <ThemedSafeArea style={{ flex: 1, justifyContent: 'center' }}>
                    <ThemedView style={{ justifyContent: 'center', alignItems: 'center' }}>
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
                    <ThemedView
                        style={{
                            position: 'absolute',
                            bottom: 40,
                            width: '100%',
                            paddingHorizontal: 16,
                        }}>
                        <PrimaryButton onPress={() => router.dismissTo("/dashboard")} Gradient title={'View Account'} />
                    </ThemedView>
                </ThemedSafeArea>
            </>
        );
    }
}
