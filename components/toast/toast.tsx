import ThemedText from '@/components/ThemedText';
import { Image } from 'expo-image';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
    Animated,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    duration?: number;
    topOffset?: number;
}

export interface ToastRef {
    show: (message: string, type?: ToastType) => void;
    hide: () => void;
}

const SimpleToast = forwardRef<ToastRef, ToastProps>(
    ({ duration = 4000, topOffset = Platform.OS === 'ios' ? 60 : 40 }, ref) => {
        const [visible, setVisible] = useState(false);
        const [message, setMessage] = useState('');
        const [type, setType] = useState<ToastType>('info');
        const translateY = useRef(new Animated.Value(-100)).current;
        const opacity = useRef(new Animated.Value(0)).current;
        const timerRef = useRef<any>(null);

        useImperativeHandle(ref, () => ({
            show: (msg: string, toastType: ToastType = 'info') => {
                if (timerRef.current) clearTimeout(timerRef.current);
                setMessage(msg);
                setType(toastType);
                setVisible(true);

                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start();

                timerRef.current = setTimeout(() => {
                    hide();
                }, duration);
            },
            hide: () => hide(),
        }));

        const hide = () => {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setVisible(false);
            });
        };

        if (!visible) return null;

        const getBackgroundColor = () => {
            switch (type) {
                case 'success':
                    return '#4CAF50';
                case 'error':
                    return '#F44336';
                case 'warning':
                    return '#FF9800';
                case 'info':
                default:
                    return '#2196F3';
            }
        };

        const getIcon = () => {
            // You can replace these with your actual icon assets if available
            return require('@/assets/icons/info.svg');
        };


        return (
            <Animated.View
                style={[
                    styles.container,
                    {
                        top: topOffset,
                        backgroundColor: getBackgroundColor(),
                        transform: [{ translateY }],
                        opacity: opacity,
                    },
                ]}
            >
                <View style={styles.contentContainer}>
                    <ThemedText style={styles.messageText}>{message}</ThemedText>
                    <TouchableOpacity onPress={hide} style={styles.closeButton}>
                        <Image
                            source={require("@/assets/icons/close.svg")} // Ensure you have this icon or change it
                            style={{ width: 16, height: 16 }}
                            contentFit="contain"
                            tintColor="#FFFFFF"
                        />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 20,
        right: 20,
        borderRadius: 8,
        padding: 16,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    messageText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'AeonikRegular',
        flex: 1,
        marginRight: 10,
    },
    closeButton: {
        padding: 4,
    },
});

export default SimpleToast;
