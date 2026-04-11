import { expect } from '@playwright/test';
import { test as baseTest } from '@fixtures/combined.fixtures';
import CLIENT_AUTH from '../../../utils/constants/auth.constants';
import { setupConsoleTracking, captureTestState } from '../../../utils/helpers/test.helpers';
import { getAuthenticatedSession } from '@utils/helpers/session.helper';
import { LoginPage } from '@pages/client/login.client.page';
import type { CreateBuyerPayload } from '@utils/interfaces/client/register.interface';
import { registerBuyerApi } from '@utils/api/client/registerBuyer.client.api';
import { buildIndividualBuyerPayload, buildCompanyBuyerPayload } from '@utils/api/request-objects/buyer.request';
import {
    buildNavigationPoms,
    publicModes,
    storageStatePathFor,
    type NavigationPoms
} from './helpers.smoke.client';


// ===== FIXTURE SETUP FOR GUEST MODE =====
// Creates the base test with a poms fixture (no authentication required).
// This fixture is used as-is for guest tests and extended for authenticated modes below.
const guestTest = baseTest.extend<{ poms: NavigationPoms }>({
    poms: async ({ page }, use) => {
        await use(buildNavigationPoms(page));
    }
});

// ===== MAIN TEST LOOP =====
// Iterates through each authentication mode and creates a separate test suite.
// For each mode:
// 1. Registers a new buyer account (once per worker in beforeAll)
// 2. Authenticates using that account
// 3. Stores auth session (cookies/storage) to an isolated file
// 4. Creates browser context with that auth state for test isolation
const authModes = publicModes;
authModes.forEach(({ label, auth }) => {

    // Buyer account data (payload) created once per worker, reused across all tests in that mode.
    // This ensures efficient test execution (one registration per worker) while maintaining isolation.
    // Each test gets a fresh browser context/page even though the account is shared.
    let buyerAccount: CreateBuyerPayload | undefined;

    // Test fixture setup: either use guest test (no auth) or extend base test with authentication fixture.
    const test = auth === CLIENT_AUTH.GUEST
        ? guestTest
        : baseTest.extend<{ poms: NavigationPoms }>({
            // ===== AUTHENTICATED FIXTURE SETUP =====
            // This fixture runs before each authenticated test.
            // It:
            // 1. Retrieves the pre-registered buyer account (created in beforeAll)
            // 2. Obtains an authenticated session via LoginPage (generates auth cookies)
            // 3. Creates a new browser context with those auth cookies stored
            // 4. Creates a fresh page in that context
            // 5. Provides POMs initialized with that page
            // 6. Closes the context after the test (cleanup)
            poms: async ({ browser, isMobile, config }, use, testInfo) => {
                if (!buyerAccount) {
                    throw new Error(`[navigation] buyerAccount not initialized for mode: ${auth}. Did beforeAll fail?`);
                }

                const storageFile = storageStatePathFor(testInfo, auth);
                const storageStatePath = await getAuthenticatedSession(
                    browser,
                    {
                        email: buyerAccount.email,
                        password: buyerAccount.password,
                        storageFile,
                        baseUrl: config.client.baseUrl
                    },
                    LoginPage
                );

                const context = await browser.newContext({ storageState: storageStatePath });
                const page = await context.newPage();

                try {
                    await use(buildNavigationPoms(page));
                } finally {
                    await context.close();
                }
            }
        });

    test.describe(`Smoke Tests - Navigation - ${label}`, () => {
        if (auth !== CLIENT_AUTH.GUEST) {
            test.beforeAll(async ({ apiClientNoAuth }) => {
                const payload = auth === CLIENT_AUTH.BUYER_COMPANY
                    ? buildCompanyBuyerPayload()
                    : buildIndividualBuyerPayload();

                await registerBuyerApi(apiClientNoAuth, payload);
                buyerAccount = payload;
            });
        }

        test('1. should navigate to Auctions List page using "Toate bunurile" button', async ({ poms }, testInfo) => {
            testInfo.annotations.push(
                { type: 'tag', description: '@smoke' },
                { type: 'suite', description: 'Home Page Tests' },
                { type: 'feature', description: 'Navigation' },
                { type: 'severity', description: 'critical' }
            );

            const { page, home, auctionsListPage } = poms;
            const consoleErrors = setupConsoleTracking(page);
            const isAuthenticated = auth !== CLIENT_AUTH.GUEST;

            await test.step('Open home page', async () => {
                await home.openHomePage();
                await home.waitForPageLoad();
                await expect(page, 'Should have correct page title').toHaveTitle(home.baseTitle);
                if (isAuthenticated) {
                    expect(await home.header.waitForUserBadgeVisible(), 'User badge should be visible after auth').toBeTruthy();
                }
            });

            await test.step('Click the "Toate bunurile" button', async () => {
                const isVisible = await home.isAllProductsButtonVisible();
                expect(isVisible, '"Toate bunurile" button should be visible').toBeTruthy();

                await home.clickAllProductsButton();
                await auctionsListPage.waitForPageLoad().catch(() => { });
            });

            await test.step('Verify Auctions List page basics', async () => {
                await expect(page, 'Page should have correct url').toHaveURL(auctionsListPage.fullUrl);
                await expect(page, 'Should have correct page title').toHaveTitle(auctionsListPage.pageTitle);
            });

            await test.step('Verify header is present and ARIA structure matches expected snapshot', async () => {
                await expect(auctionsListPage.header.headerRoot, 'Header element should be visible').toBeVisible();

                if (isAuthenticated) {
                    expect(await auctionsListPage.header.waitForUserBadgeVisible(), 'User badge should be visible in header').toBeTruthy();
                    await expect(auctionsListPage.header.headerRoot, 'Header ARIA structure should match snapshot')
                        .toMatchAriaSnapshot(await auctionsListPage.header.getLoggedInAriaSnapshot());
                } else {
                    expect(await auctionsListPage.header.isLoginLinkVisible(), 'Login button should be visible in header').toBeTruthy();
                    await expect(auctionsListPage.header.headerRoot, 'Header ARIA structure should match snapshot')
                        .toMatchAriaSnapshot(auctionsListPage.header.getGuestAriaSnapshot());
                }
            });

            await test.step('Verify auctions list content', async () => {
                await expect(auctionsListPage.searchComp.searchRoot, 'Header search should be visible').toBeVisible({ timeout: 7000 });
                // for mobile open the filters popup first
                await auctionsListPage.auctionListFiltersComp.openFiltersPopupIfMobile();

                await expect(
                    auctionsListPage.auctionListFiltersComp.auctionListFiltersRoot,
                    'Should display the filters sidebar'
                ).toMatchAriaSnapshot(auctionsListPage.auctionListFiltersComp.getAuctionListFiltersAriaSnapshot());
                // close the popup for mobile to avoid covering other elements
                await auctionsListPage.auctionListFiltersComp.closeFiltersPopupIfMobile();

                expect(await auctionsListPage.isResultsSummaryVisible(), 'Total found results should be visible').toBeTruthy();
                expect(await auctionsListPage.isSortButtonVisible(), 'Sort button should be visible').toBeTruthy();
                // desktop onlly
                if (!auctionsListPage.isMobile) {
                    expect(await auctionsListPage.isViewGridButtonVisible(), 'Grid view button should be visible').toBeTruthy();
                    expect(await auctionsListPage.isViewListButtonVisible(), 'List view button should be visible').toBeTruthy();
                }
                const auctionCardsCount = await auctionsListPage.auctionCardComp.countAuctionCardsOnPage();
                expect(auctionCardsCount, 'There should be 20 auction cards displayed on the first page').toBe(20);
            });

            await test.step('Verify footer is present', async () => {
                await expect(auctionsListPage.footer.footerRoot, 'Footer should be visible').toBeVisible();
            });

            await captureTestState(page, testInfo, consoleErrors, {
                screenshotName: `auctions - list - ${label}`
            });
        });

        test('3. should navigate to Auction View page by opening an auction from the list', async ({ poms }, testInfo) => {
            testInfo.annotations.push(
                { type: 'tag', description: '@smoke' },
                { type: 'suite', description: 'Auctions List Page Tests' },
                { type: 'feature', description: 'Navigation' },
                { type: 'severity', description: 'critical' }
            );

            const { page, auctionsListPage, auctionViewPage } = poms;
            const consoleErrors = setupConsoleTracking(page);
            const isAuthenticated = auth !== CLIENT_AUTH.GUEST;

            await test.step('Open auctions list page', async () => {
                await auctionsListPage.openAuctionsListPage();
                await auctionsListPage.waitForListLoaded();
                await expect(page, 'Should have correct page title').toHaveTitle(auctionsListPage.pageTitle);
                if (isAuthenticated) {
                    expect(await auctionsListPage.header.waitForUserBadgeVisible(), 'User badge should be visible after auth').toBeTruthy();
                }
            });

            let firstAuctionTitle = '';

            await test.step('Open the first auction from the list', async () => {
                firstAuctionTitle = await auctionsListPage.getFirstAuctionTitleText();
                expect(firstAuctionTitle, 'First auction title should not be empty').not.toBe('');

                await auctionsListPage.clickFirstAuctionCard();
                await auctionViewPage.waitForPageLoad();
            });

            await test.step('Verify auction view page is loaded', async () => {
                await expect(page, 'Page should navigate to auction view page').toHaveURL(auctionViewPage.urlPattern);
                await expect(page, 'Page title should contain site branding').toHaveTitle(auctionViewPage.pageTitle);
            });

            await test.step('Verify some core auction details are visible', async () => {
                const auctionTitle = await auctionViewPage.getAuctionTitleText();
                expect(auctionTitle, 'Auction title should contain the opened auction name').toContain(firstAuctionTitle);

                const auctionSeller = await auctionViewPage.getSellerText();
                expect(auctionSeller, 'Auction seller should be a non-empty string').not.toBe('');

                const auctionCounty = await auctionViewPage.getCountyText();
                expect(auctionCounty, 'Auction county should be a non-empty string').not.toBe('');
            });

            await captureTestState(page, testInfo, consoleErrors, {
                screenshotName: `auction - detail - ${label}`,
                // Known benign third-party console noise (Facebook/GA Attribution Reporting) — do not fail this navigation test
                skipConsoleCheck: true
            });
        });

        test('4. should navigate to About Us page via footer link', async ({ poms }, testInfo) => {
            testInfo.annotations.push(
                { type: 'tag', description: '@smoke' },
                { type: 'suite', description: 'Footer Component Tests' },
                { type: 'feature', description: 'Navigation' },
                { type: 'severity', description: 'normal' }
            );

            const { page, home, aboutUsPage } = poms;
            const consoleErrors = setupConsoleTracking(page);
            const isAuthenticated = auth !== CLIENT_AUTH.GUEST;

            await test.step('Open home page', async () => {
                await home.openHomePage();
                await home.waitForPageLoad();
                await expect(page, 'Should have correct page title').toHaveTitle(home.baseTitle);
                if (isAuthenticated) {
                    expect(await home.header.isUserBadgeVisible(), 'User badge should be visible after auth').toBeTruthy();
                }
            });

            await test.step('Scroll to footer', async () => {
                await home.footer.footerRoot.scrollIntoViewIfNeeded();
            });

            await test.step('Click About Us link in footer', async () => {
                await home.footer.clickAboutUsLink();
                await aboutUsPage.waitForPageLoad();
            });

            await test.step('Verify About Us page is loaded', async () => {
                await expect(page, 'Page should navigate to About Us page').toHaveURL(aboutUsPage.fullUrl);
                await expect(page, 'Page title should be updated').toHaveTitle(aboutUsPage.pageTitle);
            });

            await captureTestState(page, testInfo, consoleErrors, {
                screenshotName: `about - footer - ${label}`
            });
        });

        test('5. should navigate to Contact page via footer link', async ({ poms }, testInfo) => {
            testInfo.annotations.push(
                { type: 'tag', description: '@smoke' },
                { type: 'suite', description: 'Footer Component Tests' },
                { type: 'feature', description: 'Navigation' },
                { type: 'severity', description: 'normal' }
            );

            const { page, home, contactPage } = poms;
            const consoleErrors = setupConsoleTracking(page);
            const isAuthenticated = auth !== CLIENT_AUTH.GUEST;

            await test.step('Open home page', async () => {
                await home.openHomePage();
                await home.waitForPageLoad();
                if (isAuthenticated) {
                    expect(await home.header.isUserBadgeVisible(), 'User badge should be visible after auth').toBeTruthy();
                }
                await expect(page, 'Should have correct page title').toHaveTitle(home.baseTitle);
            });

            await test.step('Scroll to footer and open Contact page', async () => {
                await home.footer.footerRoot.scrollIntoViewIfNeeded();
                await home.footer.clickContactLink();
                await contactPage.waitForPageLoad();
            });

            await test.step('Verify Contact page basics', async () => {
                await expect(page).toHaveURL(contactPage.fullUrl);
                await expect(page).toHaveTitle(contactPage.pageTitle);
            });

            await captureTestState(page, testInfo, consoleErrors, {
                screenshotName: `contact - footer - ${label}`
            });
        });

        test('6. should navigate to FAQ page via footer link', async ({ poms }, testInfo) => {
            testInfo.annotations.push(
                { type: 'tag', description: '@smoke' },
                { type: 'suite', description: 'Footer Component Tests' },
                { type: 'feature', description: 'Navigation' },
                { type: 'severity', description: 'normal' }
            );

            const { page, home, faqPage } = poms;
            const consoleErrors = setupConsoleTracking(page);
            const isAuthenticated = auth !== CLIENT_AUTH.GUEST;

            await test.step('Open home page', async () => {
                await home.openHomePage();
                await home.waitForPageLoad();
                await expect(page, 'Should have correct page title').toHaveTitle(home.baseTitle);
                if (isAuthenticated) {
                    expect(await home.header.isUserBadgeVisible(), 'User badge should be visible after auth').toBeTruthy();
                }
            });

            await test.step('Scroll to footer', async () => {
                await home.footer.footerRoot.scrollIntoViewIfNeeded();
            });

            await test.step('Click FAQ link in footer', async () => {
                await home.footer.clickFaqLink();
                await faqPage.waitForPageLoad();
            });

            await test.step('Verify FAQ page is loaded', async () => {
                await expect(page, 'Page should navigate to FAQ page').toHaveURL(faqPage.fullUrl);
                await expect(page, 'Page title should be updated').toHaveTitle(faqPage.pageTitle);
            });

            await captureTestState(page, testInfo, consoleErrors, {
                screenshotName: `faq - footer - ${label}`
            });
        });

        test('7. should navigate to Terms and Conditions page via footer link', async ({ poms }, testInfo) => {
            testInfo.annotations.push(
                { type: 'tag', description: '@smoke' },
                { type: 'suite', description: 'Footer Component Tests' },
                { type: 'feature', description: 'Navigation' },
                { type: 'severity', description: 'normal' }
            );

            const { page, home, termsPage } = poms;
            const consoleErrors = setupConsoleTracking(page);
            const isAuthenticated = auth !== CLIENT_AUTH.GUEST;

            await test.step('Open home page', async () => {
                await home.openHomePage();
                await home.waitForPageLoad();
                await expect(page, 'Should have correct page title').toHaveTitle(home.baseTitle);
                if (isAuthenticated) {
                    expect(await home.header.isUserBadgeVisible(), 'User badge should be visible after auth').toBeTruthy();
                }
            });

            await test.step('Scroll to footer', async () => {
                await home.footer.footerRoot.scrollIntoViewIfNeeded();
            });

            await test.step('Click Terms link in footer', async () => {
                await home.footer.clickTermsLink();
                await termsPage.waitForPageLoad();
            });

            await test.step('Verify Terms page is loaded', async () => {
                await expect(page, 'Page should navigate to Terms page').toHaveURL(termsPage.fullUrl);
                await expect(page, 'Page title should be updated').toHaveTitle(termsPage.pageTitle);
            });

            await captureTestState(page, testInfo, consoleErrors, {
                screenshotName: `terms - footer - ${label}`
            });
        });

        test('8. should navigate to Privacy Policy page via footer link', async ({ poms }, testInfo) => {
            testInfo.annotations.push(
                { type: 'tag', description: '@smoke' },
                { type: 'suite', description: 'Footer Component Tests' },
                { type: 'feature', description: 'Navigation' },
                { type: 'severity', description: 'normal' }
            );

            const { page, home, privacyPolicyPage } = poms;
            const consoleErrors = setupConsoleTracking(page);
            const isAuthenticated = auth !== CLIENT_AUTH.GUEST;

            await test.step('Open home page', async () => {
                await home.openHomePage();
                await home.waitForPageLoad();
                await expect(page, 'Should have correct page title').toHaveTitle(home.baseTitle);
                if (isAuthenticated) {
                    expect(await home.header.isUserBadgeVisible(), 'User badge should be visible after auth').toBeTruthy();
                }
            });

            await test.step('Scroll to footer', async () => {
                await home.footer.footerRoot.scrollIntoViewIfNeeded();
            });

            await test.step('Click Privacy Policy link in footer', async () => {
                await home.footer.clickPrivacyPolicyLink();
                await privacyPolicyPage.waitForPageLoad();
            });

            await test.step('Verify Privacy Policy page is loaded', async () => {
                await expect(page, 'Page should navigate to Privacy Policy page').toHaveURL(privacyPolicyPage.fullUrl);
                await expect(page, 'Page title should be updated').toHaveTitle(privacyPolicyPage.pageTitle);
            });

            await captureTestState(page, testInfo, consoleErrors, {
                screenshotName: `privacy - footer - ${label}`
            });
        });

        if (auth !== CLIENT_AUTH.GUEST) {
            test.describe('Authenticated-only navigation', () => {

                test(`should navigate to Your Auctions (Licitațiile tale) page via user dropdown - ${label}`, async ({ poms }, testInfo) => {
                    testInfo.annotations.push(
                        { type: 'tag', description: '@smoke' },
                        { type: 'tag', description: '@authenticated' },
                        { type: 'suite', description: 'Header Component Tests' },
                        { type: 'feature', description: 'User Dropdown Navigation' },
                        { type: 'severity', description: 'critical' }
                    );

                    const { page, home, myAuctionsPage } = poms;
                    const consoleErrors = setupConsoleTracking(page);

                    await test.step('Open home page', async () => {
                        await home.openHomePage();
                        await home.waitForPageLoad();
                        expect(await home.header.isUserBadgeVisible(), 'User badge should be visible after auth').toBeTruthy();
                    });

                    await test.step('Navigate to My Auctions via user dropdown', async () => {
                        await home.header.selectUserMenuAndWait('Panou de control', myAuctionsPage.fullUrl);
                    });

                    await test.step('Verify My Auctions page is loaded', async () => {
                        await expect(page, `Should have proper url: ${myAuctionsPage.fullUrl}`).toHaveURL(myAuctionsPage.fullUrl);
                        await expect(page, `Should have proper page title: ${myAuctionsPage.pageTitle}`).toHaveTitle(myAuctionsPage.pageTitle);
                    });

                    await captureTestState(page, testInfo, consoleErrors, {
                        screenshotName: `my - auctions - dropdown - ${label}`
                    });
                });

                test(`should navigate to Deposits (Depozit) page via user dropdown - ${label}`, async ({ poms }, testInfo) => {
                    testInfo.annotations.push(
                        { type: 'tag', description: '@smoke' },
                        { type: 'tag', description: '@header' },
                        { type: 'tag', description: '@account' },
                        { type: 'tag', description: '@authenticated' },
                        { type: 'suite', description: 'Header Component Tests' },
                        { type: 'feature', description: 'User Dropdown Navigation' },
                        { type: 'severity', description: 'normal' }
                    );

                    const { page, home, depositsPage } = poms;
                    const consoleErrors = setupConsoleTracking(page);

                    await test.step('Open home page', async () => {
                        await home.openHomePage();
                        await home.waitForPageLoad();
                        expect(await home.isUserBadgeVisible(), 'User badge should be visible in header').toBeTruthy();
                    });

                    await test.step('Navigate to Deposits via user dropdown', async () => {
                        await home.header.selectUserMenuAndWait('Depozit', depositsPage.fullUrl);
                    });

                    await test.step('Verify Deposits page is loaded', async () => {
                        await expect(page, `Should have proper url: ${depositsPage.fullUrl}`).toHaveURL(depositsPage.fullUrl);
                        await expect(page, `Should have proper page title: ${depositsPage.pageTitle}`).toHaveTitle(depositsPage.pageTitle);
                    });

                    await captureTestState(page, testInfo, consoleErrors, {
                        screenshotName: `deposits - dropdown - ${label}`
                    });
                });

                test(`should navigate to Guarantees (Garanții) page via user dropdown - ${label}`, async ({ poms }, testInfo) => {
                    testInfo.annotations.push(
                        { type: 'tag', description: '@smoke' },
                        { type: 'tag', description: '@header' },
                        { type: 'tag', description: '@account' },
                        { type: 'tag', description: '@authenticated' },
                        { type: 'suite', description: 'Header Component Tests' },
                        { type: 'feature', description: 'User Dropdown Navigation' },
                        { type: 'severity', description: 'normal' }
                    );

                    const { page, home, guaranteesPage } = poms;
                    const consoleErrors = setupConsoleTracking(page);

                    await test.step('Open home page', async () => {
                        await home.openHomePage();
                        await home.waitForPageLoad();
                        expect(await home.isUserBadgeVisible(), 'User badge should be visible in header').toBeTruthy();
                    });

                    await test.step('Navigate to Guarantees via user dropdown', async () => {
                        await home.header.selectUserMenuAndWait('Garanții', guaranteesPage.fullUrl);
                    });

                    await test.step('Verify Guarantees page is loaded', async () => {
                        await expect(page, `Should have proper url: ${guaranteesPage.fullUrl}`).toHaveURL(guaranteesPage.fullUrl);
                        await expect(page, `Should have proper page title: ${guaranteesPage.pageTitle}`).toHaveTitle(guaranteesPage.pageTitle);
                    });

                    await captureTestState(page, testInfo, consoleErrors, {
                        screenshotName: `guarantees - dropdown - ${label}`,
                        // Some benign API calls may 401/404 in background; do not fail test for those
                        skipConsoleCheck: true
                    });
                });

                test(`should navigate through all sidebar links and verify each authenticatedPage - ${label}`, async ({ poms }, testInfo) => {
                    testInfo.annotations.push(
                        { type: 'tag', description: '@smoke' },
                        { type: 'tag', description: '@authenticated' },
                        { type: 'suite', description: 'Account Sidebar Navigation Tests' },
                        { type: 'feature', description: 'Complete Sidebar Navigation Flow' },
                        { type: 'severity', description: 'critical' }
                    );

                    const { page, home, myAuctionsPage, favoritesPage, depositsPage, guaranteesPage, settingsPage, contactPage } = poms;
                    const consoleErrors = setupConsoleTracking(page);

                    await test.step('Navigate to Panou de control (My Auctions)', async () => {
                        await page.goto('/dashboard');
                        await page.waitForLoadState('domcontentloaded');

                        expect(await home.header.isUserBadgeVisible(), 'User badge should be visible in header').toBeTruthy();
                        await expect(page, `Should be on Panou de control page, with url: ${myAuctionsPage.urlSpecificPath} `)
                            .toHaveURL(myAuctionsPage.urlSpecificPath);
                        await expect(page, `Page title should be: ${myAuctionsPage.pageTitle} `)
                            .toHaveTitle(myAuctionsPage.pageTitle);
                    });

                    await test.step('Verify sidebar is visible', async () => {
                        await expect(myAuctionsPage.accountSidebar.accountLeftSideBarRoot, 'Sidebar should be visible with navigation links')
                            .toBeVisible();
                    });

                    await captureTestState(page, testInfo, consoleErrors, {
                        screenshotName: `1. Panou de control(Licitațiile tale) - ${label} `
                    });

                    await test.step('Navigate to Salvate (Favorite) page', async () => {
                        await myAuctionsPage.accountSidebar.clickFavoritesLink();
                        await favoritesPage.waitForPageLoad();
                    });

                    await test.step('Verify Salvate page loaded correctly', async () => {
                        expect(await home.header.isUserBadgeVisible(), 'User badge should be visible after auth').toBeTruthy();
                        await expect(page, `Should have proper url: ${favoritesPage.fullUrl} `).toHaveURL(favoritesPage.fullUrl);
                        await expect(page, `Should have proper page title: ${favoritesPage.pageTitle} `).toHaveTitle(favoritesPage.pageTitle);
                    });

                    await captureTestState(page, testInfo, consoleErrors, {
                        screenshotName: `2. Salvate(Favorite) - ${label} `
                    });

                    await test.step('Navigate to Depozit page', async () => {
                        await favoritesPage.accountSidebar.clickDepositsLink();
                        await depositsPage.waitForPageLoad();
                    });

                    await test.step('Verify Depozit page loaded correctly', async () => {
                        expect(await home.header.isUserBadgeVisible(), 'User badge should be visible after auth').toBeTruthy();
                        await expect(page, `Should have proper url: ${depositsPage.fullUrl} `).toHaveURL(depositsPage.fullUrl);
                        await expect(page, `Should have proper page title: ${depositsPage.pageTitle} `).toHaveTitle(depositsPage.pageTitle);
                    });

                    await captureTestState(page, testInfo, consoleErrors, {
                        screenshotName: `3. Depozit - ${label} `
                    });

                    await test.step('Navigate to Garanții page', async () => {
                        await depositsPage.accountSidebar.clickGuaranteesLink();
                        await guaranteesPage.waitForPageLoad();
                    });

                    await test.step('Verify Garanții page loaded correctly', async () => {
                        expect(await home.header.isUserBadgeVisible(), 'User badge should be visible after auth').toBeTruthy();
                        await expect(page, `Should have proper url: ${guaranteesPage.fullUrl} `).toHaveURL(guaranteesPage.fullUrl);
                        await expect(page, `Should have proper page title: ${guaranteesPage.pageTitle} `).toHaveTitle(guaranteesPage.pageTitle);
                    });

                    await captureTestState(page, testInfo, consoleErrors, {
                        screenshotName: `4. Garanții - ${label} `
                    });

                    await test.step('Navigate to Setări page', async () => {
                        await guaranteesPage.accountSidebar.clickSettingsLink();
                        await settingsPage.waitForPageLoad();
                    });

                    await test.step('Verify Setări page loaded correctly', async () => {
                        expect(await home.header.isUserBadgeVisible(), 'User badge should be visible after auth').toBeTruthy();
                        await expect(page, `Should have proper url: ${settingsPage.fullUrl} `).toHaveURL(settingsPage.fullUrl);
                        await expect(page, `Should have proper page title: ${settingsPage.pageTitle} `).toHaveTitle(settingsPage.pageTitle);
                    });

                    await captureTestState(page, testInfo, consoleErrors, {
                        screenshotName: `5. Setări - ${label} `
                    });

                    await test.step('Navigate to Ajutor și suport page', async () => {
                        await settingsPage.accountSidebar.clickSupportLink();
                        await contactPage.waitForPageLoad();
                    });

                    await test.step('Verify Ajutor și suport page loaded correctly', async () => {
                        expect(await home.header.isUserBadgeVisible(), 'User badge should be visible after auth').toBeTruthy();

                        await expect(page, `Should have proper url: ${contactPage.fullUrl} `).toHaveURL(contactPage.fullUrl);
                        await expect(page, `Should have proper page title: ${contactPage.pageTitle} `).toHaveTitle(contactPage.pageTitle);
                    });

                    // Screenshot: Contact via Ajutor și suport
                    await captureTestState(page, testInfo, consoleErrors, {
                        screenshotName: `7. Contact page via Ajutor și suport link - ${label} `
                    });
                });
            });
        }

    });
});
