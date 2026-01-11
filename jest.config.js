module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts', '**/?(*.)+(spec|test).tsx'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                jsx: 'react-jsx',
                esModuleInterop: true,
            },
        }],
    },
    testEnvironment: 'jsdom',
    // AGGRESSIVE memory and performance optimizations
    maxWorkers: 1, // Use ONLY 1 worker to reduce memory footprint
    workerIdleMemoryLimit: '1024MB', // Allow up to 1GB before recycling
    bail: false,
    clearMocks: true,
    resetMocks: false,
    restoreMocks: false,
    // Cache to speed up reruns
    cacheDirectory: '/tmp/jest-cache',
    cache: true,
    // Faster test detection
    testPathIgnorePatterns: ['/node_modules/', '/dist/', '/e2e/'],
    // Timeout for slow tests
    testTimeout: 15000,
};
