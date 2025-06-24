import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../styles/GlobalStyles';
import { Platform } from 'react-native';

const isWeb = typeof window !== 'undefined';

export default function RootLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.text.tertiary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: colors.border.light,
                    height: isWeb ? 50 : 60,
                    paddingBottom: 0,
                    paddingTop: 0,
                    overflow: 'visible',
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    lineHeight: 12,
                    fontWeight: '500',
                    marginTop: 0,
                    marginBottom: 0,
                    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
                    overflow: 'visible',
                },
                tabBarIconStyle: {
                    marginTop: 0,
                },
                headerStyle: {
                    backgroundColor: colors.surface,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.light,
                    shadowColor: colors.shadow.light,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 1,
                    shadowRadius: 2,
                    elevation: 2,
                },
                headerTintColor: colors.text.primary,
                headerTitleStyle: {
                    ...typography.h3,
                    color: colors.text.primary,
                    fontWeight: '600',
                },
                headerShadowVisible: false,
            }}
        >
            <Tabs.Screen
                name='index'
                options={{
                    title: '메뉴 추천',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'restaurant' : 'restaurant-outline'}
                            size={isWeb ? 20 : size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name='nearby'
                options={{
                    title: '근처 맛집',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'location' : 'location-outline'}
                            size={isWeb ? 20 : size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name='questions'
                options={{
                    title: '냠냠이',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'chatbubble' : 'chatbubble-outline'}
                            size={isWeb ? 20 : size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: '프로필',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'person' : 'person-outline'}
                            size={isWeb ? 20 : size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name='oauth/callback'
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
