
import ListShimmer from '@/components/ListShimmer';
import { IList } from '@/interface/interface';
import logger from '@/logger/logger';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import React from 'react';
import { Appearance, FlatList, Modal, Pressable, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import TextField from '../inputs/text';
import ThemedText from '../ThemedText';
import ThemedView from '../ThemedView';

interface IListBtnProps {
    icon: string;
    name: string;
    description: string;
    onPress: () => void;
}

class ListButton extends React.Component<IListBtnProps, {}> {
    constructor(props: IListBtnProps) { super(props); }
    render() {
        const { icon, name, description, onPress } = this.props;

        // Handle both web URIs and local require() assets
        const imageSource = typeof icon === 'string' ? { uri: icon } : icon;

        return (
            <Pressable
                onPress={onPress}
                style={styles.container}
            >
                <Image
                    source={imageSource}
                    style={styles.icon}
                />
                <ThemedView>
                    <ThemedText style={styles.nameText}>
                        {name}
                    </ThemedText>
                    <ThemedText style={styles.abbText}>
                        {description}
                    </ThemedText>
                </ThemedView>
            </Pressable>
        );
    }
}

interface ListProps {
    visible: boolean;
    lists: Array<IList>;
    onClose: () => void;
    listChange: (list: IList) => void;
    showSearch?: boolean;
    title?: string;
    loading?: boolean;
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
        const { visible, onClose, lists, listChange, showSearch, title, loading } = this.props;
        const { search, displayedItems } = this.state;

        const filtered: IList[] = lists.filter((list) =>
            list.name.toLowerCase().includes(search.toLowerCase())
        ).slice(0, displayedItems);

        return (
            <Modal
                visible={visible}
                transparent={true}
                animationType="slide"
                presentationStyle='overFullScreen'
                statusBarTranslucent={true}
                onRequestClose={onClose}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <ThemedView style={styles.modalContainer}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <ThemedView style={styles.modalContent}>
                                <ThemedView style={styles.header}>
                                    <ThemedView style={styles.headerIconPlaceholder} />
                                    <ThemedText style={styles.headerText}>{title || "Select Asset"}</ThemedText>
                                    <Pressable onPress={onClose}>
                                        <Image
                                            source={require("@/assets/icons/close.svg")}
                                            style={{ width: 24, height: 24 }}
                                            contentFit='contain'
                                        />
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
                                {loading && <ListShimmer />}
                                {!loading && filtered.length === 0 && (
                                    <ThemedView style={styles.emptyState}>
                                        <MaterialIcons name="search-off" size={48} color="#E0E0E0" />
                                        <ThemedText style={styles.emptyStateText}>No results found</ThemedText>
                                    </ThemedView>
                                )}
                                {!loading && filtered.length > 0 && (
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
                                )}
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
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 8,
        marginBottom: 8,
    },
    icon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    nameText: {
        fontSize: 14,
        fontFamily: 'AeonikMedium',
        lineHeight: 16,
    },
    abbText: {
        color: Appearance.getColorScheme() === "dark" ? "#cdcdcd" : '#757575',
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        lineHeight: 16,
    },
    abText: {
        color: Appearance.getColorScheme() === "dark" ? "#cdcdcd" : '#757575',
        fontSize: 12,
        fontFamily: 'AeonikRegular',
        lineHeight: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    emptyStateText: {
        fontFamily: 'AeonikRegular',
        fontSize: 14,
        color: '#757575',
    },
});
