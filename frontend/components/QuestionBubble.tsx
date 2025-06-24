import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, shadows } from '../styles/GlobalStyles';

const { width } = Dimensions.get('window');

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
                            color={colors.text.tertiary}
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
                                    color={colors.primary}
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
        paddingHorizontal: spacing.xs,
    },
    userContainer: {
        alignItems: 'flex-end',
    },
    botContainer: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: width * 0.75,
        padding: spacing.md,
        borderRadius: 20,
        marginBottom: spacing.xs,
        ...shadows.small,
    },
    userBubble: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 6,
    },
    botBubble: {
        backgroundColor: colors.surface,
        borderBottomLeftRadius: 6,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    text: {
        ...typography.body1,
    },
    userText: {
        color: colors.text.inverse,
    },
    botText: {
        color: colors.text.primary,
    },
    modelInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
    },
    modelText: {
        ...typography.caption,
        color: colors.text.tertiary,
        marginLeft: spacing.xs,
    },
    sourcesContainer: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
    },
    sourcesTitle: {
        ...typography.caption,
        color: colors.text.tertiary,
        fontWeight: '600' as const,
        marginBottom: spacing.xs,
    },
    sourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    sourceText: {
        fontSize: 11,
        color: colors.primary,
        marginLeft: spacing.xs,
        flex: 1,
        fontWeight: '500' as const,
    },
    timestamp: {
        ...typography.caption,
        marginTop: spacing.xs,
    },
    userTimestamp: {
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'right',
    },
    botTimestamp: {
        color: colors.text.tertiary,
        textAlign: 'left',
    },
});
