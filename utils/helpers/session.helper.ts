import * as fs from 'fs';
import * as path from 'path';
import { Browser, expect, Page } from '@playwright/test';

/**
 * Login page interface - defines methods that login pages must implement
 */
/**
 * Contract for a Login Page Object that can be used by the session helpers.
 * Any concrete LoginPage class should implement these members so
 * `performUILogin` can drive the UI login flow in a generic manner.
 */
export interface ILoginPage {
    page: Page;
    fullUrl: string;
    urlPathAfterSuccessfulLogin: string;
    openLoginPage(): Promise<void>;
    waitForPageLoad(): Promise<void>;
    login(email: string, password: string): Promise<void>;
}

/**
 * Perform a UI login and save the resulting storage state (cookies/localStorage) to disk.
 *
 * Inputs:
 * - browser: Playwright Browser instance used to create an isolated context for login
 * - config: { email, password, storageFile, baseUrl } login credentials and where to save the state
 * - LoginPageClass: POM class that implements ILoginPage for driving the login UI
 * - validateLogin (optional): additional validation to run post-login (e.g., check header badge)
 *
 * Output:
 * - writes `storageFile` containing the authenticated storage state
 * - throws if login fails
 */
export async function performUILogin(
    browser: Browser,
    config: {
        email: string;
        password: string;
        storageFile: string;
        baseUrl: string;
    },
    LoginPageClass: new (page: Page) => ILoginPage,
    validateLogin?: (page: Page) => Promise<void>
): Promise<void> {
    console.log(`\n[LOGIN] Logging in as: ${config.email}`);

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        const loginPage = new LoginPageClass(page);

        // Open login page
        await loginPage.openLoginPage();
        await loginPage.waitForPageLoad();
        await expect(page).toHaveURL(loginPage.fullUrl);

        // Login
        await loginPage.login(config.email, config.password);

        // Verify login successful
        await expect(page).toHaveURL(new RegExp(`.*${loginPage.urlPathAfterSuccessfulLogin}.*`));

        // Optional validation
        if (validateLogin) {
            await validateLogin(page);
        }

        // Save storage state (cookies + localStorage)
        const authDir = path.dirname(config.storageFile);
        if (!fs.existsSync(authDir)) {
            fs.mkdirSync(authDir, { recursive: true });
        }

        await page.context().storageState({ path: config.storageFile });
        console.log(`[LOGIN] ✅ Session saved: ${config.storageFile}\n`);

    } catch (error) {
        console.error('[LOGIN] ❌ Login failed:', error);
        throw error;
    } finally {
        await context.close();
    }
}

/**
 * Ensure an authenticated storage state exists and return its file path.
 *
 * Behavior:
 * - If storage state exists and is fresh (<= 4 min old), it is reused.
 * - If it's older, or missing/corrupt, a fresh UI login is performed and state is saved.
 *
 * Inputs: same `config` used by performUILogin
 * Output: absolute/relative path to the saved storage state file (string)
 */
export async function getAuthenticatedSession(
    browser: Browser,
    config: {
        email: string;
        password: string;
        storageFile: string;
        baseUrl: string;
    },
    LoginPageClass: new (page: Page) => ILoginPage,
    validateLogin?: (page: Page) => Promise<void>
): Promise<string> {

    // If session file exists, reuse it if fresh; otherwise delete and relogin
    if (fs.existsSync(config.storageFile)) {
        try {
            const stats = fs.statSync(config.storageFile);
            const ageMinutes = Math.floor((Date.now() - stats.mtimeMs) / 60000);
            // Many auth tokens used in UI flows expire around 5 minutes.
            // Refresh proactively when older than 4 minutes to reduce flaky failures mid-test.
            if (4 < ageMinutes) {
                console.log(`[SESSION] ⚠️  Session file is ${ageMinutes} minutes old. Deleting and logging in again...`);
                fs.unlinkSync(config.storageFile);
            } else {
                console.log(`[SESSION] ✅ Reusing existing session (${ageMinutes} minutes old)`);
                return config.storageFile;
            }
        } catch (e) {
            console.warn('[SESSION] Could not stat storage file, relogging...', e);
            try { fs.unlinkSync(config.storageFile); } catch { }
        }
    }

    // Otherwise, perform fresh login
    console.log('[SESSION] Performing fresh UI login');
    await performUILogin(browser, config, LoginPageClass, validateLogin);

    return config.storageFile;
}
