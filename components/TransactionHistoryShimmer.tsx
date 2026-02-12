import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const TransactionHistoryShimmer = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const { width } = Dimensions.get('window');
    const cardWidth = width - 32; // Approx width

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

    const ShimmerItem = ({ hasBorder }: { hasBorder: boolean }) => (
        <View style={[styles.shimmerItem, hasBorder && { borderBottomWidth: 1, borderBottomColor: "#F5F5F5" }]}>
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
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden' }}>
                <Animated.View
                    style={[
                        styles.shimmerOverlay,
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
        <View style={styles.container}>
            <ShimmerItem hasBorder={true} />
            <ShimmerItem hasBorder={true} />
            <ShimmerItem hasBorder={true} />
            <ShimmerItem hasBorder={false} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        overflow: 'hidden',
        width: "100%",
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
    shimmerTextLarge: {
        width: 80,
        height: 14,
        backgroundColor: '#F5F5F5',
        borderRadius: 4,
    },
    shimmerTextSmall: {
        width: 60,
        height: 11,
        backgroundColor: '#F5F5F5',
        borderRadius: 4,
    },
    shimmerRight: {
        alignItems: 'flex-end',
        gap: 6,
    },
    shimmerTextMedium: {
        width: 70,
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

export default TransactionHistoryShimmer;
