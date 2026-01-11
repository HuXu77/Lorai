import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Lorai E2E Tests
 * 
 * Run E2E tests: npm run test:e2e
 * Run with UI:   npx playwright test --ui
 */
export default defineConfig({
    testDir: './src/tests/e2e',

    /* Run tests in files in parallel */
    fullyParallel: true,

    /* Fail the build on CI if you accidentally left test.only */
    forbidOnly: !!process.env.CI,

    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,

    /* Opt out of parallel tests on CI */
    workers: process.env.CI ? 1 : undefined,

    /* Reporter to use */
    reporter: [
        ['html', { open: 'never' }],
        ['list']
    ],

    /* Shared settings for all the projects below */
    use: {
        /* Base URL to use in tests */
        baseURL: 'http://localhost:3000',

        /* Viewport size - large enough for debug panel */
        viewport: { width: 1920, height: 1080 },

        /* Collect trace when retrying the failed test */
        trace: 'on-first-retry',

        /* Screenshot on failure */
        screenshot: 'only-on-failure',

        /* Video recording for debugging */
        video: 'retain-on-failure',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,  // Always reuse existing server
        timeout: 120 * 1000,
    },
});
