import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { UserInteractionProvider } from './UserInteractionContext';
import { CollaborativeProvider } from './CollaborativeContext';
import { MenuRecommendationProvider } from './MenuRecommendationContext';
import { ChujonProvider } from './ChujonContext';
import { NearbyProvider } from './NearbyContext';
import { QuestionsProvider } from './QuestionsContext';

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    return (
        <AuthProvider>
            <UserInteractionProvider>
                <CollaborativeProvider>
                    <MenuRecommendationProvider>
                        <ChujonProvider>
                            <NearbyProvider>
                                <QuestionsProvider>
                                    {children}
                                </QuestionsProvider>
                            </NearbyProvider>
                        </ChujonProvider>
                    </MenuRecommendationProvider>
                </CollaborativeProvider>
            </UserInteractionProvider>
        </AuthProvider>
    );
}; 