import { Page, TestInfo, expect } from '@playwright/test';
import { test } from '@playwright/test';
import { HeaderComponent } from '@pages/client/components/header.component';

/**
 * Attach console errors to the Playwright TestInfo and optionally log them to stderr.
 *
 * @param testInfo - Playwright TestInfo instance (from test.info())
 * @param errors - array of console error strings
 * @param name - attachment name (defaults to 'console-errors')
 */
export function attachConsoleErrors(testInfo: TestInfo, errors: string[], name = 'console-errors') {
    if (!testInfo || !Array.isArray(errors) || 0 === errors.length) return;

    const body = errors.join('\n\n');

    try {
        // Attach to Playwright test info (visible in HTML report and Allure if configured)
        testInfo.attach(name, {
            body,
            contentType: 'text/plain'
        });
    } catch (err) {
        // Attachment shouldn't block tests; log if attach fails
        console.error('Failed to attach console errors to test info:', err);
    }

    // Also log errors to stderr so CI logs capture them
    console.error(`Attached ${errors.length} console error(s) to test info (${name}).`);
    for (const e of errors) {
        console.error(e);
    }
}

/**
 * Options for captureTestState function
 */
export interface CaptureStateOptions {
    /** Name for the screenshot attachment */
    screenshotName?: string;
    /** Whether to capture full page screenshot */
    fullPage?: boolean;
    /** Skip screenshot capture */
    skipScreenshot?: boolean;
    /** Skip console error verification */
    skipConsoleCheck?: boolean;
    /** Wait for a header (or other) selector to be visible before taking screenshots; default false */
    ensureHeader?: boolean;
    /** Auto-detect whether a header exists on the page (default true). If true, helper will skip header waits on headerless pages */
    autoDetectHeader?: boolean;
    /** CSS selector for header; defaults to '#main-navbar' */
    headerSelector?: string;
    /** When true, temporarily disable sticky/fixed positioning before fullPage screenshots to avoid duplicated/misaligned headers */
    disableStickyHeaders?: boolean;
    /** Also capture a viewport (non-fullPage) screenshot in addition to the main screenshot for comparison/debugging */
    captureViewportAlso?: boolean;
}

/**
 * Captures test state including screenshot and console error verification
 * 
 * Best practice: Call this at the end of each test to capture final state
 * and verify no console errors occurred.
 * 
 * @param page - Playwright Page object
 * @param testInfo - Playwright TestInfo object
 * @param consoleErrors - Array of console errors collected during test
 * @param options - Optional configuration
 * 
 * @example
 * ```typescript
 * test('my test', async ({ page }, testInfo) => {
 *   const consoleErrors = setupConsoleTracking(page);
 *   
 *   // ... test steps ...
 *   
 *   await captureTestState(page, testInfo, consoleErrors, {
 *     screenshotName: 'Final State - My Page'
 *   });
 * });
 * ```
 */
export async function captureTestState(
    page: Page,
    testInfo: TestInfo,
    consoleErrors: string[],
    options?: CaptureStateOptions
): Promise<void> {
    const header = new HeaderComponent(page);
    const {
        screenshotName = 'Final Test State',
        fullPage = true,
        skipScreenshot = false,
        skipConsoleCheck = false
    } = options || {};

    const {
        ensureHeader = false,
        autoDetectHeader = true,
        headerSelector = header.headerRoot,
        disableStickyHeaders = true,
        captureViewportAlso = false
    } = options || {};

    // Capture screenshot if not skipped
    if (!skipScreenshot) {
        // Decide if a header exists and whether to wait for it. This avoids waiting on headerless pages
        let headerPresent = false;
        if (ensureHeader) {
            try {
                //wait the header to be visible before screenshot
                await header.headerRoot.waitFor({ state: 'visible', timeout: 10000 });
                headerPresent = true;
            } catch (err) {
                await testInfo.attach('Header Wait Warning', {
                    body: `Header selector '#navbar' was not visible before screenshot: ${String(err)}`,
                    contentType: 'text/plain'
                });
            }
        } else if (autoDetectHeader) {
            try {
                const count = await header.headerRoot.count();
                headerPresent = 0 < count;
                if (headerPresent) {
                    // Give a short chance for it to become visible
                    await header.headerRoot.waitFor({ state: 'visible', timeout: 3000 }).catch(() => { });
                }
            } catch {
                headerPresent = false;
            }
        }

        // Optionally disable sticky/fixed headers to make fullPage screenshots deterministic
        let styleHandle: any = null;
        if (disableStickyHeaders && fullPage && headerPresent) {
            try {
                // Inject CSS to neutralize common sticky/fixed header behaviors; include the configured headerSelector
                const safeSelector = headerSelector || '#main-navbar';
                styleHandle = await page.addStyleTag({ content: `
                    ${safeSelector}, header, .sticky, .fixed, [data-sticky] {
                      position: static !important;
                      transform: none !important;
                      top: auto !important;
                    }
                ` });
                // Scroll to top so fullPage capture starts from top of document
                await page.evaluate(() => (globalThis as any).scrollTo(0, 0));
                // Small pause to allow layout to settle
                await page.waitForTimeout(150);
            } catch (err) {
                // ignore injection errors but attach info
                await testInfo.attach('Sticky CSS Injection Warning', {
                    body: `Failed to inject sticky-disabling CSS: ${String(err)}`,
                    contentType: 'text/plain'
                });
            }
        }

        await test.step(`📸 ${screenshotName}`, async () => {
            // Optionally capture a viewport screenshot for comparison
            if (captureViewportAlso) {
                const viewportShot = await page.screenshot({ fullPage: false });
                await testInfo.attach(`${screenshotName} (viewport)`, {
                    body: viewportShot,
                    contentType: 'image/png'
                });
            }

            const screenshot = await page.screenshot({ fullPage });
            await testInfo.attach(screenshotName, {
                body: screenshot,
                contentType: 'image/png'
            });
        });

        // Remove injected style tag if any
        if (styleHandle) {
            try { await styleHandle.evaluate((el: any) => el.remove()); } catch { /* ignore */ }
        }
    }

    // Verify console errors if not skipped
    if (!skipConsoleCheck) {
        await test.step('Verify no console errors', async () => {
            if (0 < consoleErrors.length) {
                // Attach console errors to Allure report
                attachConsoleErrors(testInfo, consoleErrors);

                // Fail the test with clear message
                expect(consoleErrors.length,
                    `❌ Found ${consoleErrors.length} console error(s):\n${consoleErrors.map((err, i) => `${i + 1}. ${err}`).join('\n')}`
                ).toBe(0);
            } else {
                // Success message for Allure
                await testInfo.attach('Console Errors Check', {
                    body: '✅ No console errors detected during test execution',
                    contentType: 'text/plain'
                });
            }
        });
    }
}

/**
 * Sets up console error tracking for a page
 * 
 * Call this at the beginning of your test to start tracking console errors.
 * Returns an array that will be populated with error messages.
 * 
 * @param page - Playwright Page object
 * @returns Array that will collect console error messages
 * 
 * @example
 * ```typescript
 * test('my test', async ({ page }, testInfo) => {
 *   const consoleErrors = setupConsoleTracking(page);
 *   
 *   await page.goto('/');
 *   // Any console.error() calls will be captured in consoleErrors array
 *   
 *   await captureTestState(page, testInfo, consoleErrors);
 * });
 * ```
 */
export function setupConsoleTracking(page: Page): string[] {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
        if ('error' === msg.type()) {
            const text = msg.text();
            // Filter known benign attribution reporting noise from third-party scripts
            // Example: "Attestation check for Attribution Reporting on https://www.facebook.com failed." 
            if (/Attribution Reporting/i.test(text) || /Attestation check for Attribution Reporting/i.test(text)) {
                // ignore this noisy message
                return;
            }
            consoleErrors.push(text);
        }
    });

    return consoleErrors;
}

/**
 * Captures multiple screenshots during a test flow
 * Useful for tests that navigate through multiple pages
 * 
 * @param page - Playwright Page object
 * @param testInfo - Playwright TestInfo object
 * @param screenshotName - Name for the screenshot
 * @param options - Screenshot options (fullPage, etc.)
 * 
 * @example
 * ```typescript
 * await captureScreenshot(page, testInfo, 'Step 1: Home Page');
 * await page.click('#login');
 * await captureScreenshot(page, testInfo, 'Step 2: After Login');
 * ```
 */
export async function captureScreenshot(
    page: Page,
    testInfo: TestInfo,
    screenshotName: string,
    options?: { fullPage?: boolean }
): Promise<void> {
    const { fullPage = true } = options || {};

    await test.step(`📸 ${screenshotName}`, async () => {
        const screenshot = await page.screenshot({ fullPage });
        await testInfo.attach(screenshotName, {
            body: screenshot,
            contentType: 'image/png'
        });
    });
}

/**
 * Verifies console errors without taking screenshot
 * Useful when you want to check console errors in the middle of a test
 * 
 * @param testInfo - Playwright TestInfo object
 * @param consoleErrors - Array of console errors
 * @param options - Verification options
 * 
 * @example
 * ```typescript
 * const consoleErrors = setupConsoleTracking(page);
 * await page.goto('/');
 * await verifyConsoleErrors(testInfo, consoleErrors, {
 *   expectErrors: false,
 *   resetAfterCheck: true
 * });
 * ```
 */
export async function verifyConsoleErrors(
    testInfo: TestInfo,
    consoleErrors: string[],
    options?: {
        /** Whether to expect errors (for negative testing) */
        expectErrors?: boolean;
        /** Reset the errors array after verification */
        resetAfterCheck?: boolean;
    }
): Promise<void> {
    const { expectErrors = false, resetAfterCheck = false } = options || {};

    await test.step('Verify console errors', async () => {
        if (expectErrors) {
            expect(consoleErrors.length,
                'Expected console errors but found none'
            ).toBeGreaterThan(0);

            // Attach errors for documentation
            attachConsoleErrors(testInfo, consoleErrors);
        } else {
            if (0 < consoleErrors.length) {
                attachConsoleErrors(testInfo, consoleErrors);
                expect(consoleErrors.length,
                    `❌ Found ${consoleErrors.length} console error(s):\n${consoleErrors.map((err, i) => `${i + 1}. ${err}`).join('\n')}`
                ).toBe(0);
            } else {
                await testInfo.attach('Console Errors Check', {
                    body: '✅ No console errors detected',
                    contentType: 'text/plain'
                });
            }
        }

        if (resetAfterCheck) {
            consoleErrors.length = 0;
        }
    });
}
