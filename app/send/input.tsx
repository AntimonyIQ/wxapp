import React from "react";
import sessionManager from "@/session/session";
import { UserData } from "@/interface/interface";
import { router, Stack, } from "expo-router";
import { Appearance, ColorSchemeName, Platform, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { } from "@/interface/interface";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import AddressValidator from "@/validator/address";
import TextField from "@/components/inputs/text";
import ThemedView from "@/components/ThemedView";
import ThemedText from "@/components/ThemedText";
import ThemedSafeArea from "@/components/ThemeSafeArea";

interface IProps { }

interface IState {
    valid: boolean;
    loading: boolean;
    address: string;
}

export default class SendInputAddressScreen extends React.Component<IProps, IState> {
    private session: UserData = sessionManager.getUserData();
    private appreance: ColorSchemeName = Appearance.getColorScheme();
    private readonly title = "Send Input Address Screen";
    private coin: ISelectedCoin;
    private validator: AddressValidator;
    constructor(props: IProps) {
        super(props);
        this.state = { valid: false, loading: false, address: "" };
        this.coin = this.session.coin;
        this.validator = new AddressValidator();
    }

    public componentDidMount(): void { }

    private validateAddress = (address: string): void => {
        const { currency } = this.coin;

        const isValid = this.validator.address(currency.symbol, address);
        this.setState({ valid: isValid });
    };

    private handleAddressChange = (address: string) => {
        this.setState({ address });
        this.validateAddress(address);
    };

    render(): React.ReactNode {
        const { currency } = this.coin;
        const { valid, address } = this.state;
        return (
            <>
                <Stack.Screen options={{ title: this.title, headerShown: false }} />
                <ThemedSafeArea style={styles.safeArea}>
                    <ThemedView style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}>
                            <Image
                                source={require("../../assets/icons/chevron-left.svg")}
                                style={styles.backIcon}
                                tintColor={this.appreance === "dark" ? Colors.light.background : "#000000"} />
                            <ThemedText style={styles.backText}>Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.title}>Send {currency.name}</ThemedText>
                        <ThemedView></ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.content}>
                        <TextField
                            placeholder="Enter Recipient Address"
                            title="Enter Recipient Address"
                            showText={false}
                            textValue={address}
                            onChangeText={this.handleAddressChange}
                            onBlur={() => { }}
                            onFocus={() => { }}
                            secureTextEntry={false}
                            showPasteButton={true}
                        />
                    </ThemedView>

                    <ThemedView style={styles.nextButtonContainer}>
                        <Pressable
                            style={[styles.nextButton, { backgroundColor: valid ? '#FBA91E' : '#ccc' }]}
                            onPress={(): void => router.navigate({ pathname: '/send', params: { address } })}
                            disabled={!valid}
                        >
                            <ThemedText style={styles.nextButtonText}>
                                Next
                            </ThemedText>
                        </Pressable>
                    </ThemedView>
                </ThemedSafeArea>
            </>
        );
    }

}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 50 : Platform.OS === "web" ? 20 : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Appearance.getColorScheme() === "dark" ? '#070707' : '#f7f7f7',
        borderRadius: 99,
        paddingVertical: 5,
        paddingRight: 20,
    },
    backIcon: {
        height: 24,
        width: 24,
    },
    backText: {
        fontFamily: 'AeonikRegular',
        fontSize: 12,
        lineHeight: 14,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 30,
        alignItems: 'flex-start',
        width: "100%"
    },
    nextButtonContainer: {
        paddingHorizontal: 16,
        position: Platform.OS === 'android' ? 'absolute' : 'relative',
        bottom: 32,
        width: '100%',
    },
    nextButton: {
        paddingHorizontal: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    nextButtonText: {
        color: '#1F1F1F',
        fontFamily: 'AeonikMedium',
        fontSize: 16,
        lineHeight: 20,
    },
});
