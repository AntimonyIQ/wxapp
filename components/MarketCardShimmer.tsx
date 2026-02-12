import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const ShimmerCard = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

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
        outputRange: [-160, 160], // Card width scan
    });

    return (
        <View style={styles.cardContainer}>
            {/* Content Structure mimicking Card.tsx */}
            <View style={styles.logoSkeleton} />

            <View style={styles.textContainer}>
                <View style={styles.nameSkeleton} />
                <View style={styles.priceRow}>
                    <View style={styles.priceSkeleton} />
                    <View style={styles.changeSkeleton} />
                </View>
            </View>

            {/* Shimmer Overlay */}
            <View style={styles.overlayContainer}>
                <Animated.View
                    style={[
                        styles.gradient,
                        { transform: [{ translateX }] }
                    ]}
                >
                    <LinearGradient
                        colors={['transparent', 'rgba(255,255,255,0.6)', 'transparent']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>
            </View>
        </View>
    );
};

export default function MarketCardShimmer() {
    return (
        <View style={styles.container}>
            {[1, 2, 3, 4].map((item) => (
                <View key={item} style={styles.wrapper}>
                    <ShimmerCard />
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 5,
        // Match the flatlist container logic if any, currently simplistic row
    },
    wrapper: {
        marginRight: 8,
    },
    cardContainer: {
        padding: 12,
        gap: 12,
        borderRadius: 12,
        backgroundColor: '#FFFFFF', // White background like real card
        width: 160,
        height: 100, // Approx height based on content
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    logoSkeleton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F0F0F0',
    },
    textContainer: {
        gap: 8,
        marginTop: 4,
    },
    nameSkeleton: {
        width: 50,
        height: 10,
        borderRadius: 4,
        backgroundColor: '#F0F0F0',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    priceSkeleton: {
        width: 70,
        height: 16,
        borderRadius: 4,
        backgroundColor: '#F0F0F0',
    },
    changeSkeleton: {
        width: 40,
        height: 12,
        borderRadius: 4,
        backgroundColor: '#F0F0F0',
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    gradient: {
        width: '100%',
        height: '100%',
    }
});
