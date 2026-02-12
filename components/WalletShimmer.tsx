import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const WalletShimmer = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmer = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        shimmer.start();

        return () => shimmer.stop();
    }, [shimmerAnim]);

    const translateX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 300],
    });

    const ShimmerItem = () => (
        <View style={styles.shimmerItem}>
            <View style={styles.shimmerLeft}>
                <View style={styles.shimmerIcon} />
                <View style={styles.shimmerTextContainer}>
                    <View style={styles.shimmerTextLarge} />
                    <View style={styles.shimmerTextSmall} />
                </View>
            </View>
            <View style={styles.shimmerRight}>
                <View style={styles.shimmerTextMedium} />
                <View style={styles.shimmerTextSmall} />
            </View>
            <Animated.View
                style={[
                    styles.shimmerOverlay,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <ShimmerItem />
            <ShimmerItem />
            <ShimmerItem />
            <ShimmerItem />
            <ShimmerItem />
            <ShimmerItem />
            <ShimmerItem />
            <ShimmerItem />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 8,
        gap: 16,
    },
    shimmerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    shimmerLeft: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    shimmerIcon: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: '#E0E0E0',
    },
    shimmerTextContainer: {
        gap: 8,
    },
    shimmerTextLarge: {
        width: 80,
        height: 14,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
    },
    shimmerTextSmall: {
        width: 60,
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
    },
    shimmerRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    shimmerTextMedium: {
        width: 70,
        height: 14,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
    },
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        width: 100,
    },
});

export default WalletShimmer;
