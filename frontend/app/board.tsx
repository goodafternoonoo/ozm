import React from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/GlobalStyles';
import { boardStyles } from '../styles/BoardStyles';
import { useBoard, Post } from '../contexts/BoardContext';

export default function BoardScreen() {
    const {
        searchText,
        setSearchText,
        selectedCategory,
        setSelectedCategory,
        categories,
        filteredPosts,
    } = useBoard();

    const renderPostItem = ({ item }: { item: Post }) => (
        <TouchableOpacity style={boardStyles.postItem}>
            <View style={boardStyles.postHeader}>
                <Text style={boardStyles.postTitle} numberOfLines={1}>
                    {item.title}
                </Text>
                <View style={boardStyles.postMeta}>
                    <Text style={boardStyles.postAuthor}>{item.author}</Text>
                    <Text style={boardStyles.postDate}>{item.date}</Text>
                </View>
            </View>
            <View style={boardStyles.postFooter}>
                <View style={boardStyles.postStats}>
                    <Ionicons name="eye-outline" size={14} color={colors.text.tertiary} />
                    <Text style={boardStyles.postStatText}>{item.views}</Text>
                    <Ionicons name="chatbubble-outline" size={14} color={colors.text.tertiary} />
                    <Text style={boardStyles.postStatText}>{item.comments}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={boardStyles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
            
            {/* 헤더 */}
            <View style={boardStyles.header}>
                <Text style={boardStyles.headerTitle}>게시판</Text>
                <TouchableOpacity style={boardStyles.writeButton}>
                    <Ionicons name="add" size={24} color={colors.text.inverse} />
                </TouchableOpacity>
            </View>

            {/* 검색바 */}
            <View style={boardStyles.searchContainer}>
                <View style={boardStyles.searchBar}>
                    <Ionicons name="search" size={20} color={colors.text.tertiary} />
                    <TextInput
                        style={boardStyles.searchInput}
                        placeholder="게시글 검색..."
                        placeholderTextColor={colors.text.tertiary}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
            </View>

            {/* 카테고리 탭 */}
            <View style={boardStyles.categoryContainer}>
                <FlatList
                    data={categories}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                boardStyles.categoryTab,
                                selectedCategory === item && boardStyles.categoryTabActive,
                            ]}
                            onPress={() => setSelectedCategory(item)}
                        >
                            <Text
                                style={[
                                    boardStyles.categoryText,
                                    selectedCategory === item && boardStyles.categoryTextActive,
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item}
                    contentContainerStyle={boardStyles.categoryList}
                />
            </View>

            {/* 게시글 목록 */}
            <FlatList
                data={filteredPosts}
                renderItem={renderPostItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={boardStyles.postList}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

