import { defineConfig, devices } from '@playwright/test';
import { config } from './config/env.config';



export default defineConfig({
    testDir: './tests',
    // Discover test files under testDir. Keep as a broad glob so IDE extensions can find tests.
    testMatch: ['**/*.test.ts'],
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['line'],
        ['allure-playwright', {
            environmentInfo: {
                'Environment': process.env.ENV || 'staging1',
                'Node Version': process.version,
                'OS Platform': process.platform
            }
        }],
        ['html', { open: 'never' }]
    ],
    use: {
        /* Take screenshot on failure */
        screenshot: 'only-on-failure',
        /* Take video on retry/failure */
        video: 'retain-on-failure',
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'retain-on-failure',
        /* Set baseURL for client tests - global scope */
        baseURL: config.client.baseUrl
    },

    /* Configure projects for major browsers */
    projects: [
        // ==================== CLIENT PROJECTS ====================

        // Client mobile - all tests (authenticated handled by fixtures)
        {
            name: 'Client mobile',
            // Run the same smoke file on mobile unless a separate mobile suite exists
            use: {
                ...devices['Pixel 7'],
                browserName: 'chromium',
                baseURL: config.client.baseUrl
            }
        },

        // Client desktop - all tests (authenticated handled by fixtures)
        {
            name: 'Client desktop',

            use: {
                ...devices['Desktop Chrome'],
                baseURL: config.client.baseUrl,
                viewport: { width: 1280, height: 800 }
            }
        },

        // ==================== ADMIN PROJECTS ====================
        // Admin desktop - all tests (authenticated handled by fixtures)
        {
            name: 'Admin desktop',
            testMatch: /tests\/admin\/.*\.test\.ts$/,
            use: {
                ...devices['Desktop Chrome'],   
                baseURL: config.admin.baseUrl,
                viewport: { width: 1600, height: 900 },
                launchOptions: {
                    args: ['--window-size=1920,1080']  //! To be greater than viewport to avoid scrollbars
                }
            }
        }
    ]

});