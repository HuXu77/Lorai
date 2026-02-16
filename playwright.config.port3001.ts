import { defineConfig, devices } from '@playwright/test';
import config from './playwright.config';

export default defineConfig({
    ...config,
    use: {
        ...config.use,
        baseURL: 'http://localhost:3001',
    },
    webServer: {
        command: 'PORT=3001 npm run dev',
        url: 'http://localhost:3001',
        reuseExistingServer: false,
        timeout: 120 * 1000,
    },
});
