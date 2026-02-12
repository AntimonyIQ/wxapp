import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const ListShimmer = () => {
    const animatedValue = new Animated.Value(0);

    React.useEffect(() => {
        Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 300],
    });

    const ShimmerItem = () => (
        <View style={styles.itemContainer}>
            <View style={styles.iconPlaceholder}>
                <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
                    <LinearGradient
                        colors={['#E0E0E0', '#F5F5F5', '#E0E0E0']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>
            </View>
            <View style={styles.textContainer}>
                <View style={[styles.textPlaceholder, { width: 120, height: 16, marginBottom: 4 }]}>
                    <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
                        <LinearGradient
                            colors={['#E0E0E0', '#F5F5F5', '#E0E0E0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                </View>
                <View style={[styles.textPlaceholder, { width: 60, height: 12 }]}>
                    <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
                        <LinearGradient
                            colors={['#E0E0E0', '#F5F5F5', '#E0E0E0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {[1, 2, 3, 4, 5, 6].map((key) => (
                <ShimmerItem key={key} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    iconPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E0E0E0',
        overflow: 'hidden',
    },
    textContainer: {
        flex: 1,
    },
    textPlaceholder: {
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
    },
});

export default ListShimmer;
