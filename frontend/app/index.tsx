import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ChujonRecommendation from '../components/ChujonRecommendation';
import { CollaborativeMenuCard } from '../components/CollaborativeMenuCard';
import { MenuCard, renderABTestInfo } from '../components/MenuCard';
import { useChujonRecommendation } from '../hooks/useChujonRecommendation';
import { useCollaborativeRecommendations } from '../hooks/useCollaborativeRecommendations';
import {
    TimeSlot,
    useMenuRecommendations,
} from '../hooks/useMenuRecommendations';
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
        handleMenuClick,
    } = useMenuRecommendations();

    const chujon = useChujonRecommendation();
    const collaborative = useCollaborativeRecommendations();

    const timeSlotOptions = [
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
        { value: 'dinner' as TimeSlot, label: '저녁', icon: 'moon-outline' },
    ];

    const handleCollaborativeMode = () => {
        setMode('collaborative');
        if (sessionId) {
            getCollaborativeRecommendations();
        }
    };

    return (
        <ScrollView style={MenuRecommendationStyles.container}>
            <View style={MenuRecommendationStyles.header}>
                <Text style={MenuRecommendationStyles.title}>메뉴 추천</Text>
                <Text style={MenuRecommendationStyles.subtitle}>
                    시간대를 선택하고 추천받아보세요!
                </Text>

                {/* A/B 테스트 정보 토글 버튼 */}
                {(abTestInfo || chujon.abTestInfo) && (
                    <TouchableOpacity
                        style={MenuRecommendationStyles.abTestButton}
                        onPress={() => setShowABTestInfo(!showABTestInfo)}
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
                    onPress={() => setMode('simple')}
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
                    onPress={() => {
                        setMode('chujon');
                        chujon.loadQuestions();
                    }}
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
                                onPress={() =>
                                    setSelectedTimeSlot(option.value)
                                }
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

                    {showABTestInfo && abTestInfo && (
                        <View style={{ marginBottom: 8 }}>
                            {renderABTestInfo(abTestInfo)}
                        </View>
                    )}

                    <Text
                        style={[
                            MenuRecommendationStyles.sectionTitle,
                            { marginTop: 20 },
                        ]}
                    >
                        카테고리 선택
                    </Text>
                    <View>
                        <TouchableOpacity
                            style={MenuRecommendationStyles.categoryModalButton}
                            onPress={() => setCategoryModalVisible(true)}
                        >
                            <Text
                                style={[
                                    MenuRecommendationStyles.categoryModalItemText,
                                    categoryId &&
                                        MenuRecommendationStyles.categoryModalItemTextActive,
                                ]}
                            >
                                {categoryId
                                    ? categories.find(
                                          (cat) => cat.id === categoryId
                                      )?.name
                                    : '카테고리 선택'}
                            </Text>
                        </TouchableOpacity>

                        <Modal
                            visible={categoryModalVisible}
                            transparent={true}
                            animationType='fade'
                            onRequestClose={() =>
                                setCategoryModalVisible(false)
                            }
                        >
                            <View style={MenuRecommendationStyles.modalOverlay}>
                                <View
                                    style={
                                        MenuRecommendationStyles.modalContent
                                    }
                                >
                                    <TouchableOpacity
                                        style={
                                            MenuRecommendationStyles.modalCloseButton
                                        }
                                        onPress={() =>
                                            setCategoryModalVisible(false)
                                        }
                                    >
                                        <Ionicons
                                            name='close'
                                            size={20}
                                            color={colors.text.secondary}
                                        />
                                    </TouchableOpacity>
                                    <Text
                                        style={
                                            MenuRecommendationStyles.modalTitle
                                        }
                                    >
                                        카테고리 선택
                                    </Text>
                                    <ScrollView
                                        showsVerticalScrollIndicator={false}
                                    >
                                        <TouchableOpacity
                                            style={
                                                MenuRecommendationStyles.categoryModalItem
                                            }
                                            onPress={() => {
                                                setCategoryId(null);
                                                setCategoryModalVisible(false);
                                            }}
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
                                                style={
                                                    MenuRecommendationStyles.categoryModalItem
                                                }
                                                onPress={() => {
                                                    setCategoryId(category.id);
                                                    setCategoryModalVisible(
                                                        false
                                                    );
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        MenuRecommendationStyles.categoryModalItemText,
                                                        categoryId ===
                                                            category.id &&
                                                            MenuRecommendationStyles.categoryModalItemTextActive,
                                                    ]}
                                                >
                                                    {category.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                    <TouchableOpacity
                                        style={
                                            MenuRecommendationStyles.categoryModalCloseButton
                                        }
                                        onPress={() =>
                                            setCategoryModalVisible(false)
                                        }
                                    >
                                        <Text
                                            style={
                                                MenuRecommendationStyles.categoryModalCloseButtonText
                                            }
                                        >
                                            닫기
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    </View>

                    <TouchableOpacity
                        onPress={getMenuRecommendations}
                        style={MenuRecommendationStyles.button}
                        disabled={loading}
                    >
                        <Text style={MenuRecommendationStyles.buttonText}>
                            {loading
                                ? '추천 중...'
                                : `${
                                      timeSlotOptions.find(
                                          (opt) =>
                                              opt.value === selectedTimeSlot
                                      )?.label
                                  } 메뉴 추천받기`}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : mode === 'chujon' ? (
                <View style={{ marginTop: 8 }}>
                    {chujon.loading && (
                        <ActivityIndicator
                            size='large'
                            color='#007AFF'
                            style={{ marginVertical: 20 }}
                        />
                    )}
                    {chujon.error && (
                        <Text style={{ color: 'red', marginBottom: 8 }}>
                            {chujon.error}
                        </Text>
                    )}
                    {showABTestInfo && chujon.abTestInfo && (
                        <View style={{ marginBottom: 8 }}>
                            {renderABTestInfo(chujon.abTestInfo)}
                        </View>
                    )}
                    {chujon.questions.length > 0 && (
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
                    {chujon.recommendations.length > 0 && (
                        <View
                            style={
                                MenuRecommendationStyles.recommendationsContainer
                            }
                        >
                            <Text
                                style={
                                    MenuRecommendationStyles.recommendationsTitle
                                }
                            >
                                추천 메뉴
                            </Text>
                            {chujon.recommendations.map(({ menu, reason }) => (
                                <MenuCard
                                    key={menu.id}
                                    menu={menu}
                                    reason={reason}
                                    onRemove={removeMenuFromSaved}
                                    onMenuClick={handleMenuClick}
                                    isSaved={savedMenus.some(
                                        (m) => m.id === menu.id
                                    )}
                                    onAdd={(collaborativeMenu) =>
                                        addMenuToSaved({
                                            ...collaborativeMenu,
                                            id: String(collaborativeMenu.id),
                                            category: collaborativeMenu.category
                                                ? ({
                                                      name: collaborativeMenu.category,
                                                  } as any)
                                                : undefined,
                                        })
                                    }
                                />
                            ))}
                        </View>
                    )}
                </View>
            ) : (
                // 협업 필터링 모드
                <View style={{ marginTop: 8 }}>
                    {collaborative.loading && (
                        <ActivityIndicator
                            size='large'
                            color='#007AFF'
                            style={{ marginVertical: 20 }}
                        />
                    )}
                    {collaborative.error && (
                        <Text style={{ color: 'red', marginBottom: 8 }}>
                            {collaborative.error}
                        </Text>
                    )}

                    <View style={MenuRecommendationStyles.inputContainer}>
                        <Text style={MenuRecommendationStyles.sectionTitle}>
                            협업 필터링 추천
                        </Text>
                        <Text style={{ color: '#666', marginBottom: 15 }}>
                            유사한 취향을 가진 다른 사용자들이 좋아한 메뉴를
                            추천해드립니다.
                        </Text>

                        <TouchableOpacity
                            onPress={() =>
                                collaborative.getCollaborativeRecommendations(
                                    sessionId,
                                    5
                                )
                            }
                            style={MenuRecommendationStyles.button}
                            disabled={collaborative.loading}
                        >
                            <Text style={MenuRecommendationStyles.buttonText}>
                                {collaborative.loading
                                    ? '추천 중...'
                                    : '협업 필터링 추천받기'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {collaborative.recommendations.length > 0 && (
                        <View
                            style={
                                MenuRecommendationStyles.recommendationsContainer
                            }
                        >
                            <Text
                                style={
                                    MenuRecommendationStyles.recommendationsTitle
                                }
                            >
                                협업 필터링 추천 메뉴
                            </Text>
                            {collaborative.recommendations.map(
                                ({
                                    menu,
                                    reason,
                                    similarityScore,
                                    similarUsersCount,
                                }) => (
                                    <CollaborativeMenuCard
                                        key={menu.id}
                                        menu={{
                                            ...menu,
                                            id: Number(menu.id),
                                            category:
                                                menu.category?.name ||
                                                '카테고리 없음',
                                        }}
                                        reason={reason}
                                        similarityScore={similarityScore}
                                        similarUsersCount={similarUsersCount}
                                        onRemove={(collaborativeMenu) =>
                                            removeMenuFromSaved({
                                                ...collaborativeMenu,
                                                id: String(
                                                    collaborativeMenu.id
                                                ),
                                                category:
                                                    collaborativeMenu.category
                                                        ? ({
                                                              name: collaborativeMenu.category,
                                                          } as any)
                                                        : undefined,
                                            })
                                        }
                                        onMenuClick={(collaborativeMenu) =>
                                            handleMenuClick({
                                                ...collaborativeMenu,
                                                id: String(
                                                    collaborativeMenu.id
                                                ),
                                                category:
                                                    collaborativeMenu.category
                                                        ? ({
                                                              name: collaborativeMenu.category,
                                                          } as any)
                                                        : undefined,
                                            })
                                        }
                                        isSaved={savedMenus.some(
                                            (m) => m.id === String(menu.id)
                                        )}
                                        onAdd={(collaborativeMenu) =>
                                            addMenuToSaved({
                                                ...collaborativeMenu,
                                                id: String(
                                                    collaborativeMenu.id
                                                ),
                                                category:
                                                    collaborativeMenu.category
                                                        ? ({
                                                              name: collaborativeMenu.category,
                                                          } as any)
                                                        : undefined,
                                            })
                                        }
                                    />
                                )
                            )}
                        </View>
                    )}
                </View>
            )}

            {loading && (
                <View style={MenuRecommendationStyles.loadingContainer}>
                    <ActivityIndicator size='large' color='#007AFF' />
                    <Text style={MenuRecommendationStyles.loadingText}>
                        맛있는 메뉴를 찾고 있어요...
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

            {savedMenus.length > 0 && (
                <View style={MenuRecommendationStyles.recommendationsContainer}>
                    <Text style={MenuRecommendationStyles.recommendationsTitle}>
                        내가 선택한 메뉴
                    </Text>
                    {savedMenus.map((menu) => (
                        <MenuCard
                            key={menu.id}
                            menu={menu}
                            isSaved
                            onRemove={removeMenuFromSaved}
                            onMenuClick={handleMenuClick}
                            onAdd={addMenuToSaved}
                        />
                    ))}
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
                            onRemove={removeMenuFromSaved}
                            onMenuClick={handleMenuClick}
                            isSaved={savedMenus.some((m) => m.id === menu.id)}
                            onAdd={addMenuToSaved}
                        />
                    ))}
                </View>
            )}
        </ScrollView>
    );
}
