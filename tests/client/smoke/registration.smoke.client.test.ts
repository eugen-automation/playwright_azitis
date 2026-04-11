import { test as baseTest } from '@fixtures/combined.fixtures';
import { expect } from '@playwright/test';
import { buildIndividualBuyerPayload, buildCompanyBuyerPayload } from '@utils/api/request-objects/buyer.request';
import { LoginPage } from '@pages/client/login.client.page';
import { MyAuctionsPage } from '@pages/client/account/myAuctions.account.page';
import { OnBoardingModal } from '@pages/client/modals/onBoarding.modal';

import {
    buildNavigationPoms,
    type NavigationPoms
} from './helpers.smoke.client';


// ===== FIXTURE SETUP FOR GUEST MODE =====
// Creates the base test with a poms fixture (no authentication required).
// This fixture is used as-is for guest tests and extended for authenticated modes below.
const test = baseTest.extend<{ poms: NavigationPoms }>({
    poms: async ({ page }, use) => {
        await use(buildNavigationPoms(page));
    }
});




test('10 should register and login a new buyer-individual with valid data', async ({ poms }, testInfo) => {
    testInfo.annotations.push(
        { type: 'tag', description: '@smoke' },
        { type: 'suite', description: 'Registration Page Tests' },
        { type: 'feature', description: 'Registration' },
        { type: 'severity', description: 'blocker' }
    );

    // Setup console error tracking
    // const consoleErrors = setupConsoleTracking(page);


    const { page, registrationPage, home } = poms;
    const payload = buildIndividualBuyerPayload();

    await test.step('Open the Registration page', async () => {

        await registrationPage.openRegistrationPage();
        await registrationPage.waitForPageLoad();
    });

    await test.step('Fill in the registration form with valid data', async () => {
        await registrationPage.registerAccount(payload);
        await registrationPage.waitForPageLoad();
    });

    await test.step('Verify successful registration', async () => {

        /* verify content snapshot */
        await expect(registrationPage.rootLocator,
            'Registration success page content should match the expected aria snapshot'
        ).toMatchAriaSnapshot(registrationPage.registrationSuccessPageAreaSnapshot);

        await test.step('Verify the URL is correct', async () => {
            expect(page, `URL should contain registration complete path "${registrationPage.registrationSuccessUrl}"`).toHaveURL(new RegExp(`.*${registrationPage.registrationSuccessUrl}.*`));
        });

        /* verify title */
        await test.step('Verify the page title is correct', async () => {
            const currentTitle = await page.title();
            expect(currentTitle, `Registration complete page should have correct page title. Expected: '${registrationPage.registrationSuccessTitle}', current: '${currentTitle}'`).toBe(registrationPage.registrationSuccessTitle);
        });

        // new tab?
        await test.step('Open home page as guest', async () => {
            await home.openHomePage();
            await home.waitForPageLoad();
            await expect(page, 'Should have correct page title').toHaveTitle(home.baseTitle);
        });
    });

    const page2 = await page.context().newPage();
    await test.step('Login with the newly created account', async () => {

        const loginPage = new LoginPage(page2);
        const myAuctionsPage = new MyAuctionsPage(page2);
        const onBoardingModal = new OnBoardingModal(page2);


        await loginPage.openLoginPage();
        await loginPage.login(payload.email, payload.password);

        expect(await loginPage.isLoggedIn(), 'Login failed').toBeTruthy();

        await expect(page2).toHaveURL(new RegExp(`.*${myAuctionsPage.urlSpecificPath}.*`));
        await expect(page2).toHaveTitle(myAuctionsPage.pageTitle);

        expect(await onBoardingModal.isModalVisible(), 'Onboarding modal should be visible after first login').toBeTruthy();
        expect(await myAuctionsPage.header.waitForUserBadgeVisible(), 'User badge should be visible after auth').toBeTruthy();

    });

    // Capture final state and verify no console errors
    // await captureTestState(page2, testInfo, consoleErrors, {
    //     screenshotName: 'Registration - Successful Account Creation'
    // });
});

test.skip('20 should register and login a new buyer-company with valid data', async ({ poms }, testInfo) => {
    testInfo.annotations.push(
        { type: 'tag', description: '@smoke' },
        { type: 'suite', description: 'Registration Page Tests' },
        { type: 'feature', description: 'Registration' },
        { type: 'severity', description: 'blocker' }
    );


    // Setup console error tracking
    // const consoleErrors = setupConsoleTracking(page);


    const { page, registrationPage } = poms;
    const payload = buildCompanyBuyerPayload();

    await test.step('Open the Registration page', async () => {
        await registrationPage.openRegistrationPage();
        await registrationPage.waitForPageLoad();
    });

    await test.step('Fill in the registration form with valid data', async () => {
        await registrationPage.registerAccount(payload);
        await registrationPage.waitForPageLoad();
    });

    await test.step('Verify successful registration', async () => {

        /* verify content snapshot */
        await expect(registrationPage.rootLocator,
            'Registration success page content should match the expected aria snapshot'
        ).toMatchAriaSnapshot(registrationPage.registrationSuccessPageAreaSnapshot);

        await test.step('Verify the URL is correct', async () => {
            expect(page, `URL should contain registration complete path "${registrationPage.registrationSuccessUrl}"`).toHaveURL(new RegExp(`.*${registrationPage.registrationSuccessUrl}.*`));
        });

        /* verify title */
        await test.step('Verify the page title is correct', async () => {
            const currentTitle = await page.title();
            expect(currentTitle, `Registration complete page should have correct page title. Expected: '${registrationPage.registrationSuccessTitle}', current: '${currentTitle}'`).toBe(registrationPage.registrationSuccessTitle);
        });

        await registrationPage.page.close();
    });

    const page2 = await page.context().newPage();
    await test.step('Login with the newly created account', async () => {

        const loginPage = new LoginPage(page2);
        const myAuctionsPage = new MyAuctionsPage(page2);
        const onBoardingModal = new OnBoardingModal(page2);

        await loginPage.openLoginPage();
        await loginPage.login(payload.email, payload.password);

        expect(await loginPage.isLoggedIn(), 'Login failed').toBeTruthy();

        await expect(page2).toHaveURL(new RegExp(`.*${myAuctionsPage.urlSpecificPath}.*`));
        await expect(page2).toHaveTitle(myAuctionsPage.pageTitle);

        expect(await onBoardingModal.isModalVisible(), 'Onboarding modal should be visible after first login').toBeTruthy();
        expect(await myAuctionsPage.header.waitForUserBadgeVisible(), 'User badge should be visible after auth').toBeTruthy();

    });

    // Capture final state and verify no console errors
    // await captureTestState(page2, testInfo, consoleErrors, {
    //     screenshotName: 'Registration - Successful Account Creation'
    // });
});