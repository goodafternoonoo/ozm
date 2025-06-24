import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuestionBubbleProps {
    text: string;
    isUser: boolean;
    timestamp: string;
    sources?: any[];
    model?: string;
}

export const QuestionBubble: React.FC<QuestionBubbleProps> = ({
    text,
    isUser,
    timestamp,
    sources,
    model,
}) => {
    return (
        <View
            style={[
                styles.container,
                isUser ? styles.userContainer : styles.botContainer,
            ]}
        >
            <View
                style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.botBubble,
                ]}
            >
                <Text
                    style={[
                        styles.text,
                        isUser ? styles.userText : styles.botText,
                    ]}
                >
                    {text}
                </Text>

                {/* AI 모델 정보 표시 */}
                {!isUser && model && (
                    <View style={styles.modelInfo}>
                        <Ionicons
                            name='sparkles-outline'
                            size={12}
                            color='#8E8E93'
                        />
                        <Text style={styles.modelText}>
                            {model.includes('llama')
                                ? 'Llama AI'
                                : model.includes('sonar')
                                ? 'Sonar AI'
                                : model}
                        </Text>
                    </View>
                )}

                {/* 소스 정보 표시 */}
                {!isUser && sources && sources.length > 0 && (
                    <View style={styles.sourcesContainer}>
                        <Text style={styles.sourcesTitle}>참고 소스</Text>
                        {sources.slice(0, 2).map((source, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.sourceItem}
                            >
                                <Ionicons
                                    name='link-outline'
                                    size={12}
                                    color='#007AFF'
                                />
                                <Text
                                    style={styles.sourceText}
                                    numberOfLines={1}
                                >
                                    {source.title ||
                                        source.url ||
                                        '알 수 없는 소스'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
            <Text
                style={[
                    styles.timestamp,
                    isUser ? styles.userTimestamp : styles.botTimestamp,
                ]}
            >
                {timestamp}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 2,
        paddingHorizontal: 4,
    },
    userContainer: {
        alignItems: 'flex-end',
    },
    botContainer: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: '75%',
        padding: 16,
        borderRadius: 20,
        marginBottom: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    userBubble: {
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 6,
    },
    botBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 6,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    text: {
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '400',
    },
    userText: {
        color: '#FFFFFF',
    },
    botText: {
        color: '#1C1C1E',
    },
    modelInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
    },
    modelText: {
        fontSize: 12,
        color: '#8E8E93',
        marginLeft: 4,
        fontWeight: '500',
    },
    sourcesContainer: {
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
    },
    sourcesTitle: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '600',
        marginBottom: 6,
    },
    sourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    sourceText: {
        fontSize: 11,
        color: '#007AFF',
        marginLeft: 4,
        flex: 1,
        fontWeight: '500',
    },
    timestamp: {
        fontSize: 11,
        marginTop: 4,
        fontWeight: '500',
    },
    userTimestamp: {
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'right',
    },
    botTimestamp: {
        color: '#8E8E93',
        textAlign: 'left',
    },
});
