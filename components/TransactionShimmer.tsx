import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const TransactionShimmer = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const { width } = Dimensions.get('window');
    const cardWidth = width - 40; // Full width minus parent padding (20px each side)

    useEffect(() => {
        const shimmer = Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        shimmer.start();

        return () => shimmer.stop();
    }, [shimmerAnim]);

    const translateX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-cardWidth, cardWidth],
    });

    const ShimmerItem = ({ showBorder }: { showBorder: boolean }) => (
        <View style={[shimmerStyles.shimmerItem, showBorder && { borderBottomWidth: 1, borderBottomColor: "#F5F5F5" }]}>
            <View style={shimmerStyles.shimmerLeft}>
                <View style={shimmerStyles.shimmerIcon} />
                <View style={shimmerStyles.shimmerTextContainer}>
                    <View style={shimmerStyles.shimmerTextLarge} />
                    <View style={shimmerStyles.shimmerTextSmall} />
                </View>
            </View>
            <View style={shimmerStyles.shimmerRight}>
                <View style={shimmerStyles.shimmerTextMedium} />
                <View style={shimmerStyles.shimmerTextSmall} />
            </View>
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden' }}>
                <Animated.View
                    style={[
                        shimmerStyles.shimmerOverlay,
                        {
                            transform: [{ translateX }],
                            width: cardWidth,
                        },
                    ]}
                >
                    <LinearGradient
                        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ flex: 1 }}
                    />
                </Animated.View>
            </View>
        </View>
    );

    return (
        <View style={{ width: "100%", paddingHorizontal: 0, gap: 16 }}>
            <View style={[shimmerStyles.shimmerCard, { width: "100%" }]}>
                <View style={{ padding: 15, paddingBottom: 5 }}>
                    <View style={shimmerStyles.shimmerHeader} />
                </View>
                <ShimmerItem showBorder={true} />
                <ShimmerItem showBorder={true} />
                <ShimmerItem showBorder={false} />
            </View>

            <View style={[shimmerStyles.shimmerCard, { width: "100%" }]}>
                <View style={{ padding: 15, paddingBottom: 5 }}>
                    <View style={shimmerStyles.shimmerHeader} />
                </View>
                <ShimmerItem showBorder={true} />
                <ShimmerItem showBorder={false} />
            </View>

            <View style={[shimmerStyles.shimmerCard, { width: "100%" }]}>
                <View style={{ padding: 15, paddingBottom: 5 }}>
                    <View style={shimmerStyles.shimmerHeader} />
                </View>
                <ShimmerItem showBorder={true} />
                <ShimmerItem showBorder={true} />
                <ShimmerItem showBorder={false} />
            </View>
        </View>
    );
};

const shimmerStyles = StyleSheet.create({
    shimmerCard: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        paddingBottom: 10,
        overflow: 'hidden'
    },
    shimmerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 15,
        alignItems: 'center',
        position: 'relative',
    },
    shimmerLeft: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    shimmerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    shimmerTextContainer: {
        gap: 6,
        alignItems: 'flex-start',
    },
    shimmerHeader: {
        width: 60,
        height: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 4,
    },
    shimmerTextLarge: {
        width: 90,
        height: 14,
        backgroundColor: '#F5F5F5',
        borderRadius: 4,
    },
    shimmerTextSmall: {
        width: 100,
        height: 11,
        backgroundColor: '#F5F5F5',
        borderRadius: 4,
    },
    shimmerRight: {
        alignItems: 'flex-end',
        gap: 6,
    },
    shimmerTextMedium: {
        width: 80,
        height: 14,
        backgroundColor: '#F5F5F5',
        borderRadius: 4,
    },
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
    },
});

export default TransactionShimmer;