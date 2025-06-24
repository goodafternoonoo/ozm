import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuestionsStyles } from '../styles/QuestionsStyles';

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
                            color='#666'
                        />
                        <Text style={styles.modelText}>{model}</Text>
                    </View>
                )}

                {/* 소스 정보 표시 */}
                {!isUser && sources && sources.length > 0 && (
                    <View style={styles.sourcesContainer}>
                        <Text style={styles.sourcesTitle}>참고 소스:</Text>
                        {sources.slice(0, 3).map((source, index) => (
                            <Text key={index} style={styles.sourceText}>
                                •{' '}
                                {source.title ||
                                    source.url ||
                                    '알 수 없는 소스'}
                            </Text>
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
        marginVertical: 4,
        paddingHorizontal: 16,
    },
    userContainer: {
        alignItems: 'flex-end',
    },
    botContainer: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 18,
        marginBottom: 4,
    },
    userBubble: {
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 4,
    },
    botBubble: {
        backgroundColor: '#F2F2F7',
        borderBottomLeftRadius: 4,
    },
    text: {
        fontSize: 16,
        lineHeight: 20,
    },
    userText: {
        color: '#FFFFFF',
    },
    botText: {
        color: '#000000',
    },
    modelInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    modelText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    sourcesContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    sourcesTitle: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
        marginBottom: 4,
    },
    sourceText: {
        fontSize: 11,
        color: '#666',
        marginBottom: 2,
    },
    timestamp: {
        fontSize: 12,
        marginTop: 2,
    },
    userTimestamp: {
        color: '#8E8E93',
        textAlign: 'right',
    },
    botTimestamp: {
        color: '#8E8E93',
        textAlign: 'left',
    },
});
