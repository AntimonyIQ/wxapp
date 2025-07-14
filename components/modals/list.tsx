
import React from 'react';
import { Modal, StyleSheet, TouchableWithoutFeedback, Appearance, Pressable, ColorSchemeName } from 'react-native';
import { Image } from 'expo-image';
import ListButton from '../button/list';
import { IList } from '@/interface/interface';
import logger from '@/logger/logger';
import TextField from '../inputs/text';
import { FlatList } from "react-native";
import ThemedView from '../ThemedView';
import ThemedText from '../ThemedText';

interface ListProps {
    visible: boolean;
    lists: Array<IList>;
    onClose: () => void;
    listChange: (list: IList) => void;
    showSearch?: boolean;
}

interface ListState {
    search: string;
    displayedItems: number;
}

export default class ListModal extends React.Component<ListProps, ListState> {
    private PAGE_SIZE = 20;

    constructor(props: ListProps) {
        super(props);
        this.state = {
            search: "",
            displayedItems: this.PAGE_SIZE,
        };
    }


    componentDidMount(): void {
        logger.clear();
    }

    handleLoadMore = () => {
        if (this.state.displayedItems < this.props.lists.length) {
            this.setState((prevState) => ({
                displayedItems: prevState.displayedItems + this.PAGE_SIZE,
            }));
        }
    };

    handleScrollUp = (event: any) => {
        const { contentOffset } = event.nativeEvent;
        if (contentOffset.y < 10) {
            this.setState((prevState) => ({
                displayedItems: Math.max(this.PAGE_SIZE, prevState.displayedItems - this.PAGE_SIZE),
            }));
        }
    };

    render(): React.ReactNode {
        const { visible, onClose, lists, listChange, showSearch } = this.props;
        const { search, displayedItems } = this.state;

        const filtered: IList[] = lists
            .filter((list) => list.name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, displayedItems);

        return (
            <Modal transparent={true} visible={visible} animationType="slide">
                <TouchableWithoutFeedback onPress={onClose}>
                    <ThemedView style={styles.modalContainer}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <ThemedView style={styles.modalContent}>
                                <ThemedView style={styles.header}>
                                    <ThemedView style={styles.headerIconPlaceholder} />
                                    <ThemedText style={styles.headerText}>Select Asset</ThemedText>
                                    <Pressable onPress={onClose}>
                                        <Image
                                            source={require("../../assets/icons/close.svg")}
                                            style={{ width: 24, height: 24 }}
                                            tintColor={"#000"} />
                                    </Pressable>
                                </ThemedView>
                                {showSearch && (
                                    <ThemedView>
                                        <TextField
                                            placeholder="Start typing..."
                                            maxLength={10}
                                            textValue={search}
                                            onChangeText={(text) => this.setState({ search: text })}
                                            onClear={() => this.setState({ search: "" })}
                                            showText={false}
                                        />
                                    </ThemedView>
                                )}
                                <FlatList
                                    data={filtered}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item }) => (
                                        <ListButton
                                            name={item.name}
                                            icon={item.icon}
                                            description={item.description}
                                            onPress={() => {
                                                this.setState({ search: "" });
                                                listChange(item);
                                            }}
                                        />
                                    )}
                                    onEndReached={this.handleLoadMore}
                                    onEndReachedThreshold={0.5}
                                    onScroll={this.handleScrollUp}
                                />
                            </ThemedView>
                        </TouchableWithoutFeedback>
                    </ThemedView>
                </TouchableWithoutFeedback>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    modalContent: {
        padding: 20,
        borderRadius: 12,
        elevation: 5,
        marginBottom: 20,
        maxHeight: "80%",
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 16,
    },
    headerText: {
        fontSize: 16,
        fontFamily: 'AeonikMedium',
        lineHeight: 20,
    },
    headerIconPlaceholder: {
        height: 24,
        width: 24,
    },
});
