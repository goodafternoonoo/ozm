import React, { useRef, useEffect } from 'react';
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    LayoutAnimation,
    UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { QuestionsStyles } from '../styles/QuestionsStyles';
import { QuestionBubble } from '../components/QuestionBubble';
import { useQuestions } from '../hooks/useQuestions';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SUGGESTION_QUESTIONS = [
    '건강한 아침 메뉴 추천해줘',
    '김치찌개 만드는 방법 알려줘',
    '한국 전통 음식의 특징은?',
    '매운 음식이 건강에 좋은가요?',
    '서울에서 맛있는 비빔밥 맛집 추천해줘',
    '다이어트 중인데 먹을 수 있는 음식 추천해줘',
];

export default function QuestionsScreen() {
    const {
        userQuestion,
        setUserQuestion,
        messages,
        loading,
        sendMessage,
        clearAllMessages,
    } = useQuestions();
    const scrollViewRef = useRef<ScrollView>(null);
    const headerHeight = useHeaderHeight();

    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }, [messages]);

    useEffect(() => {
        if (messages.length > 0 || loading) {
            setTimeout(
                () => scrollViewRef.current?.scrollToEnd({ animated: true }),
                100
            );
        }
    }, [messages, loading]);

    const handleSuggestionPress = (suggestion: string) => {
        setUserQuestion(suggestion);
    };

    const handleSendMessage = async () => {
        if (!userQuestion.trim()) return;

        // useQuestions 훅의 sendMessage 함수 호출
        await sendMessage();
    };

    const handleTextChange = (text: string) => {
        // 마지막 문자가 개행이고, 이전에 개행이 없었다면 전송
        if (text.endsWith('\n') && !userQuestion.includes('\n')) {
            const messageWithoutNewline = text.slice(0, -1).trim();
            if (messageWithoutNewline) {
                setUserQuestion(messageWithoutNewline);
                handleSendMessage();
                return;
            }
        }
        setUserQuestion(text);
    };

    return (
        <KeyboardAvoidingView
            style={QuestionsStyles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={headerHeight}
        >
            <View style={QuestionsStyles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons
                        name='restaurant-outline'
                        size={28}
                        color='#007AFF'
                        style={{ marginRight: 8 }}
                    />
                    <Text style={QuestionsStyles.title}>푸드봇</Text>
                </View>
                {messages.length > 0 && (
                    <TouchableOpacity
                        onPress={clearAllMessages}
                        style={QuestionsStyles.clearButton}
                    >
                        <Ionicons
                            name='trash-outline'
                            size={20}
                            color='#8E8E93'
                        />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={QuestionsStyles.messagesContainer}
                contentContainerStyle={QuestionsStyles.messagesContentContainer}
                showsVerticalScrollIndicator={false}
            >
                {messages.length === 0 && !loading && (
                    <View style={QuestionsStyles.emptyContainer}>
                        <View style={QuestionsStyles.emptyIcon}>
                            <Ionicons
                                name='chatbubbles-outline'
                                size={80}
                                color='#C7C7CC'
                            />
                        </View>
                        <Text style={QuestionsStyles.emptyText}>
                            음식에 대해 궁금한 점을 물어보세요!
                        </Text>
                        <Text style={QuestionsStyles.emptySubtext}>
                            조리법, 영양 정보, 맛집 추천 등 무엇이든 물어보세요
                        </Text>

                        <View style={QuestionsStyles.suggestionContainer}>
                            <Text style={QuestionsStyles.suggestionTitle}>
                                이런 질문은 어떠세요?
                            </Text>
                            <View style={QuestionsStyles.suggestionChips}>
                                {SUGGESTION_QUESTIONS.map(
                                    (suggestion, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={
                                                QuestionsStyles.suggestionChip
                                            }
                                            onPress={() =>
                                                handleSuggestionPress(
                                                    suggestion
                                                )
                                            }
                                        >
                                            <Text
                                                style={
                                                    QuestionsStyles.suggestionChipText
                                                }
                                            >
                                                {suggestion}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                )}
                            </View>
                        </View>
                    </View>
                )}

                {messages.map((item) => (
                    <QuestionBubble
                        key={item.id}
                        text={item.text}
                        isUser={item.isUser}
                        timestamp={item.timestamp}
                        sources={item.sources}
                        model={item.model}
                    />
                ))}

                {loading && (
                    <View
                        style={[
                            QuestionsStyles.messageBubble,
                            QuestionsStyles.botMessage,
                            QuestionsStyles.loadingBubble,
                        ]}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <ActivityIndicator size='small' color='#007AFF' />
                            <Text
                                style={[
                                    QuestionsStyles.botMessageText,
                                    { marginLeft: 12 },
                                ]}
                            >
                                AI가 답변을 생각하고 있어요...
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={QuestionsStyles.inputContainer}>
                <TextInput
                    style={[
                        QuestionsStyles.input,
                        userQuestion.length > 0 && QuestionsStyles.inputActive,
                    ]}
                    value={userQuestion}
                    onChangeText={handleTextChange}
                    placeholder='음식에 대해 자유롭게 질문해보세요...'
                    placeholderTextColor='#8E8E93'
                    multiline={true}
                    maxLength={500}
                />
                <TouchableOpacity
                    style={[
                        QuestionsStyles.sendButton,
                        (!userQuestion.trim() || loading) &&
                            QuestionsStyles.sendButtonDisabled,
                    ]}
                    onPress={handleSendMessage}
                    disabled={!userQuestion.trim() || loading}
                    activeOpacity={0.7}
                >
                    {loading ? (
                        <ActivityIndicator size='small' color='#fff' />
                    ) : (
                        <Text style={QuestionsStyles.sendButtonText}>전송</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
