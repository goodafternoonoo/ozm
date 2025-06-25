/* eslint-env jest */

// Jest 전역 설정
global.__DEV__ = true;

// React Native 환경 모킹
jest.mock('react-native', () => ({
    Platform: {
        OS: 'ios',
        select: jest.fn((obj) => obj.ios),
    },
    Dimensions: {
        get: jest.fn(() => ({ width: 375, height: 812 })),
    },
}));

// Expo 환경 모킹
jest.mock('expo', () => ({
    Constants: {
        manifest: {
            extra: {
                backendUrl: 'http://localhost:8000',
            },
        },
    },
}));
