import { Page } from '@playwright/test';
import { config } from '../config/env.config';
import { RequestHandler } from '@utils/api/request-handler';
import { setCustomExpectLogger } from '@utils/api/custom-expect';
import { APILogger } from '@utils/api/logger';
import { loginBuyerApi } from '@utils/api/client/login.client.api';
import { LoginPage } from '@pages/client/login.client.page';
import { buyerRegistrationTest, BuyerRegistrationFixtures } from './buyer-registration.fixtures';



export type TestOptions = BuyerRegistrationFixtures & {
    api: RequestHandler
    apiClient: RequestHandler
    apiClientCompany: RequestHandler
    authBuyerIndividualToken: string
    authBuyerCompanyToken: string
    newIndividualBuyerLoggedInPage: Page
    newCompanyBuyerLoggedInPage: Page
    config: typeof config
}

export const test = buyerRegistrationTest.extend<TestOptions>({

    authBuyerIndividualToken: async ({ newIndividualBuyer }, use) => {
        try {
            console.log(`\n[Fixture] Getting auth token for: ${newIndividualBuyer.email}`);
            const authToken = await loginBuyerApi(newIndividualBuyer.email, newIndividualBuyer.password);
            console.log(`[Fixture] Auth token obtained, length: ${authToken.length}`);
            await use(authToken);
        } catch (err) {
            throw new Error(`[Fixture] Failed to api login individual buyer: ${err}`);
        }
    },

    authBuyerCompanyToken: async ({ newCompanyBuyer }, use) => {
        try {
            console.log(`\n[Fixture] Getting auth token for company: ${newCompanyBuyer.email}`);
            const authToken = await loginBuyerApi(newCompanyBuyer.email, newCompanyBuyer.password);
            console.log(`[Fixture] Auth token obtained, length: ${authToken.length}`);
            await use(authToken);
        } catch (err) {
            throw new Error(`[Fixture] Failed to api login company buyer: ${err}`);
        }
    },

    newIndividualBuyerLoggedInPage: async ({ browser, newIndividualBuyer }, use) => {
        try {
            const context = await browser.newContext();
            const page = await context.newPage();
            const loginPage = new LoginPage(page);
            await loginPage.openLoginPage();

            await loginPage.login(newIndividualBuyer.email, newIndividualBuyer.password);

            console.log('[Fixture] Individual buyer logged in page ready');
            await use(page);
            await context.close();
        } catch (err) {
            throw new Error(`[Fixture] Failed to login individual buyer in UI: ${err}`);
        }
    },

    newCompanyBuyerLoggedInPage: async ({ browser, newCompanyBuyer }, use) => {
        try {
            const context = await browser.newContext();
            const page = await context.newPage();
            const loginPage = new LoginPage(page);
            await loginPage.openLoginPage();

            await loginPage.login(newCompanyBuyer.email, newCompanyBuyer.password);

            console.log('[Fixture] Company buyer logged in page ready');
            await use(page);
            await context.close();
        } catch (err) {
            throw new Error(`[Fixture] Failed to login company buyer in UI: ${err}`);
        }
    },

    // use in tests for individual buyer example
    api: async ({ apiClient }, use) => {
        await use(apiClient);
    },

    apiClient: async ({ request, authBuyerIndividualToken }, use) => {
        const logger = new APILogger();
        setCustomExpectLogger(logger);
        const requestHandler = new RequestHandler(request, config.client.apiUrl, logger, authBuyerIndividualToken);
        await use(requestHandler);
    },

    apiClientCompany: async ({ request, authBuyerCompanyToken }, use) => {
        const logger = new APILogger();
        setCustomExpectLogger(logger);
        const requestHandler = new RequestHandler(request, config.client.apiUrl, logger, authBuyerCompanyToken);
        await use(requestHandler);
    },

    config: async ({ }, use) => {
        await use(config);
    }
});




