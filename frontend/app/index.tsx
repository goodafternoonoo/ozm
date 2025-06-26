import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo, useCallback } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ChujonRecommendation from '../components/ChujonRecommendation';
import { CollaborativeMenuCard } from '../components/CollaborativeMenuCard';
import { MenuCard } from '../components/MenuCard';
import { useChujonRecommendation } from '../hooks/useChujonRecommendation';
import { useCollaborativeRecommendations } from '../hooks/useCollaborativeRecommendations';
import { TimeSlot, useMenuRecommendations } from '../hooks/useMenuRecommendations';
import { colors } from '../styles/GlobalStyles';
import { MenuRecommendationStyles } from '../styles/MenuRecommendationStyles';

export default function MenuRecommendationScreen() {
    const [mode, setMode] = useState<'simple' | 'chujon' | 'collaborative'>(
        'simple'
    );
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [showABTestInfo, setShowABTestInfo] = useState(false);

    const {
        selectedTimeSlot,
        setSelectedTimeSlot,
        categoryId,
        setCategoryId,
        categories,
        recommendations,
        savedMenus,
        loading,
        error,
        abTestInfo,
        sessionId,
        getMenuRecommendations,
        getCollaborativeRecommendations,
        removeMenuFromSaved,
        addMenuToSaved,
    } = useMenuRecommendations();

    const chujon = useChujonRecommendation();
    const collaborative = useCollaborativeRecommendations();

    // 시간대 옵션을 useMemo로 최적화
    const timeSlotOptions = useMemo(() => [
        {
            value: 'breakfast' as TimeSlot,
            label: '아침',
            icon: 'sunny-outline',
        },
        {
            value: 'lunch' as TimeSlot,
            label: '점심',
            icon: 'restaurant-outline',
        },
        { 
            value: 'dinner' as TimeSlot, 
            label: '저녁', 
            icon: 'moon-outline' 
        },
    ], []);

    // 모드 변경 핸들러들을 useCallback으로 최적화
    const handleSimpleMode = useCallback(() => {
        setMode('simple');
    }, []);

    const handleChujonMode = useCallback(() => {
        setMode('chujon');
        chujon.loadQuestions();
    }, [chujon]);

    const handleCollaborativeMode = useCallback(() => {
        setMode('collaborative');
        if (sessionId) {
            getCollaborativeRecommendations();
        }
    }, [sessionId, getCollaborativeRecommendations]);

    const handleTimeSlotChange = useCallback((timeSlot: TimeSlot) => {
        setSelectedTimeSlot(timeSlot);
    }, [setSelectedTimeSlot]);

    const handleCategoryModalToggle = useCallback(() => {
        setCategoryModalVisible(!categoryModalVisible);
    }, [categoryModalVisible]);

    const handleABTestInfoToggle = useCallback(() => {
        setShowABTestInfo(!showABTestInfo);
    }, [showABTestInfo]);

    // A/B 테스트 정보 표시 여부를 useMemo로 최적화
    const shouldShowABTestButton = useMemo(() => {
        return !!(abTestInfo || chujon.abTestInfo);
    }, [abTestInfo, chujon.abTestInfo]);

    // 카테고리 선택 핸들러를 useCallback으로 최적화
    const handleCategorySelect = useCallback((categoryId: string | null) => {
        setCategoryId(categoryId);
        setCategoryModalVisible(false);
    }, [setCategoryId]);

    return (
        <ScrollView style={MenuRecommendationStyles.container}>
            <View style={MenuRecommendationStyles.header}>
                <Text style={MenuRecommendationStyles.title}>메뉴 추천</Text>
                <Text style={MenuRecommendationStyles.subtitle}>
                    시간대를 선택하고 추천받아보세요!
                </Text>

                {/* A/B 테스트 정보 토글 버튼 */}
                {shouldShowABTestButton && (
                    <TouchableOpacity
                        style={MenuRecommendationStyles.abTestButton}
                        onPress={handleABTestInfoToggle}
                    >
                        <Ionicons
                            name='flask-outline'
                            size={16}
                            color={colors.status.info}
                        />
                        <Text style={MenuRecommendationStyles.abTestButtonText}>
                            A/B 테스트 정보 {showABTestInfo ? '숨기기' : '보기'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={MenuRecommendationStyles.modeSwitchContainer}>
                <TouchableOpacity
                    style={[
                        MenuRecommendationStyles.modeButton,
                        mode === 'simple' &&
                            MenuRecommendationStyles.modeButtonActive,
                    ]}
                    onPress={handleSimpleMode}
                >
                    <Text
                        style={[
                            MenuRecommendationStyles.modeButtonText,
                            mode === 'simple' &&
                                MenuRecommendationStyles.modeButtonTextActive,
                        ]}
                    >
                        간단 추천
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        MenuRecommendationStyles.modeButton,
                        mode === 'chujon' &&
                            MenuRecommendationStyles.modeButtonActive,
                    ]}
                    onPress={handleChujonMode}
                >
                    <Text
                        style={[
                            MenuRecommendationStyles.modeButtonText,
                            mode === 'chujon' &&
                                MenuRecommendationStyles.modeButtonTextActive,
                        ]}
                    >
                        취존 추천
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        MenuRecommendationStyles.modeButton,
                        mode === 'collaborative' &&
                            MenuRecommendationStyles.modeButtonActive,
                    ]}
                    onPress={handleCollaborativeMode}
                >
                    <Text
                        style={[
                            MenuRecommendationStyles.modeButtonText,
                            mode === 'collaborative' &&
                                MenuRecommendationStyles.modeButtonTextActive,
                        ]}
                    >
                        협업 필터링
                    </Text>
                </TouchableOpacity>
            </View>

            {mode === 'simple' ? (
                <View style={MenuRecommendationStyles.inputContainer}>
                    <Text style={MenuRecommendationStyles.sectionTitle}>
                        시간대 선택
                    </Text>
                    <View style={MenuRecommendationStyles.timeSlotContainer}>
                        {timeSlotOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    MenuRecommendationStyles.timeSlotButton,
                                    selectedTimeSlot === option.value &&
                                        MenuRecommendationStyles.timeSlotButtonActive,
                                ]}
                                onPress={() => handleTimeSlotChange(option.value)}
                            >
                                <Ionicons
                                    name={option.icon as any}
                                    size={24}
                                    color={
                                        selectedTimeSlot === option.value
                                            ? colors.text.inverse
                                            : colors.primary
                                    }
                                />
                                <Text
                                    style={[
                                        MenuRecommendationStyles.timeSlotText,
                                        selectedTimeSlot === option.value &&
                                            MenuRecommendationStyles.timeSlotTextActive,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={MenuRecommendationStyles.sectionTitle}>
                        카테고리 선택 (선택사항)
                    </Text>
                    <TouchableOpacity
                        style={MenuRecommendationStyles.categoryModalButton}
                        onPress={handleCategoryModalToggle}
                    >
                        <Text
                            style={[
                                MenuRecommendationStyles.categoryModalItemText,
                                categoryId &&
                                    MenuRecommendationStyles.categoryModalItemTextActive,
                            ]}
                        >
                            {categoryId
                                ? categories.find((cat) => cat.id === categoryId)?.name ||
                                  '카테고리 선택'
                                : '카테고리 선택'}
                        </Text>
                    </TouchableOpacity>

                    <Modal
                        visible={categoryModalVisible}
                        transparent={true}
                        animationType="fade"
                    >
                        <View style={MenuRecommendationStyles.modalOverlay}>
                            <View
                                style={MenuRecommendationStyles.modalContent}
                            >
                                <TouchableOpacity
                                    style={MenuRecommendationStyles.modalCloseButton}
                                    onPress={handleCategoryModalToggle}
                                >
                                    <Ionicons
                                        name="close"
                                        size={24}
                                        color={colors.text.primary}
                                    />
                                </TouchableOpacity>

                                <Text style={MenuRecommendationStyles.modalTitle}>
                                    카테고리 선택
                                </Text>

                                <TouchableOpacity
                                    style={MenuRecommendationStyles.categoryModalItem}
                                    onPress={() => handleCategorySelect(null)}
                                >
                                    <Text
                                        style={[
                                            MenuRecommendationStyles.categoryModalItemText,
                                            !categoryId &&
                                                MenuRecommendationStyles.categoryModalItemTextActive,
                                        ]}
                                    >
                                        전체
                                    </Text>
                                </TouchableOpacity>

                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category.id}
                                        style={MenuRecommendationStyles.categoryModalItem}
                                        onPress={() => handleCategorySelect(category.id)}
                                    >
                                        <Text
                                            style={[
                                                MenuRecommendationStyles.categoryModalItemText,
                                                categoryId === category.id &&
                                                    MenuRecommendationStyles.categoryModalItemTextActive,
                                            ]}
                                        >
                                            {category.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}

                                <TouchableOpacity
                                    style={MenuRecommendationStyles.categoryModalCloseButton}
                                    onPress={handleCategoryModalToggle}
                                >
                                    <Text style={MenuRecommendationStyles.categoryModalCloseButtonText}>
                                        닫기
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    <TouchableOpacity
                        onPress={getMenuRecommendations}
                        style={MenuRecommendationStyles.button}
                    >
                        <Text style={MenuRecommendationStyles.buttonText}>
                            추천받기
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {mode === 'chujon' && (
                <ChujonRecommendation
                    questions={chujon.questions}
                    onSubmit={() => {
                        chujon.getChujonRecommendations();
                    }}
                    onAnswerChange={(questionId, answer) => {
                        chujon.setAnswer(questionId, answer);
                    }}
                    onRestart={() => {
                        chujon.loadQuestions();
                    }}
                />
            )}

            {mode === 'chujon' && chujon.recommendations.length > 0 && (
                <View
                    style={MenuRecommendationStyles.recommendationsContainer}
                >
                    <Text style={MenuRecommendationStyles.recommendationsTitle}>
                        취존 추천 결과
                    </Text>
                    {chujon.recommendations.map(({ menu, reason }) => (
                        <MenuCard
                            key={menu.id}
                            menu={menu}
                            reason={reason}
                            isSaved={savedMenus.some((saved) => saved.id === menu.id)}
                            onRemove={() => removeMenuFromSaved(menu)}
                            onAdd={() => addMenuToSaved(menu)}
                            showABTestInfo={showABTestInfo}
                            abTestInfo={chujon.abTestInfo}
                        />
                    ))}
                </View>
            )}

            {mode === 'collaborative' && (
                <View style={MenuRecommendationStyles.inputContainer}>
                    <Text style={MenuRecommendationStyles.sectionTitle}>
                        협업 필터링 추천
                    </Text>
                    <TouchableOpacity
                        onPress={() =>
                            collaborative.getCollaborativeRecommendations(
                                sessionId,
                                10
                            )
                        }
                        style={MenuRecommendationStyles.button}
                    >
                        <Text style={MenuRecommendationStyles.buttonText}>
                            협업 필터링 추천받기
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {mode === 'collaborative' && collaborative.recommendations.length > 0 && (
                <View
                    style={MenuRecommendationStyles.recommendationsContainer}
                >
                    <Text style={MenuRecommendationStyles.recommendationsTitle}>
                        협업 필터링 추천 결과
                    </Text>
                    {collaborative.recommendations.map(
                        ({ menu, reason, similarityScore, similarUsersCount }) => (
                            <CollaborativeMenuCard
                                key={menu.id}
                                menu={{
                                    ...menu,
                                    id: Number(menu.id),
                                    category: typeof menu.category === 'string' 
                                        ? menu.category 
                                        : menu.category?.name || '카테고리 없음',
                                }}
                                reason={reason}
                                similarityScore={similarityScore}
                                similarUsersCount={similarUsersCount}
                                isSaved={savedMenus.some(
                                    (saved) => saved.id === menu.id
                                )}
                                onRemove={() => removeMenuFromSaved(menu)}
                                onAdd={() => addMenuToSaved(menu)}
                            />
                        )
                    )}
                </View>
            )}

            {loading && (
                <View style={MenuRecommendationStyles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={MenuRecommendationStyles.loadingText}>
                        추천 메뉴를 가져오는 중...
                    </Text>
                </View>
            )}

            {error && (
                <View style={MenuRecommendationStyles.errorContainer}>
                    <Text style={MenuRecommendationStyles.errorText}>
                        {error}
                    </Text>
                </View>
            )}

            {recommendations.length > 0 && (
                <View style={MenuRecommendationStyles.recommendationsContainer}>
                    <Text style={MenuRecommendationStyles.recommendationsTitle}>
                        추천 메뉴
                    </Text>
                    {recommendations.map(({ menu, reason }) => (
                        <MenuCard
                            key={menu.id}
                            menu={menu}
                            reason={reason}
                            isSaved={savedMenus.some((saved) => saved.id === menu.id)}
                            onRemove={() => removeMenuFromSaved(menu)}
                            onAdd={() => addMenuToSaved(menu)}
                            showABTestInfo={showABTestInfo}
                            abTestInfo={abTestInfo}
                        />
                    ))}
                </View>
            )}
        </ScrollView>
    );
}
