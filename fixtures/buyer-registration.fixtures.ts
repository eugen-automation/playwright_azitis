import { test as base } from '@playwright/test';
import { config } from '../config/env.config';
import { RequestHandler } from '@utils/api/request-handler';
import { setCustomExpectLogger } from '@utils/api/custom-expect';
import { APILogger } from '@utils/api/logger';
import { registerBuyerApi } from '@utils/api/client/registerBuyer.client.api';
import { CreateBuyerPayload } from '@utils/interfaces/client/register.interface';
import { buildCompanyBuyerPayload, buildIndividualBuyerPayload } from '@utils/api/request-objects/buyer.request';

export type BuyerRegistrationFixtures = {
    apiClientNoAuth: RequestHandler
    newIndividualBuyer: CreateBuyerPayload
    newCompanyBuyer: CreateBuyerPayload
    buyerOps: BuyerOps
}

export type BuyerOps = {
    registerBuyer: (type: 'individual' | 'company') => Promise<CreateBuyerPayload>
}

export const buyerRegistrationTest = base.extend<BuyerRegistrationFixtures>({
    apiClientNoAuth: async ({ request }, use) => {
        const logger = new APILogger();
        setCustomExpectLogger(logger);
        const requestHandler = new RequestHandler(request, config.client.apiUrl, logger);
        await use(requestHandler);
    },

    buyerOps: async ({ apiClientNoAuth }, use) => {
        const ops: BuyerOps = {
            registerBuyer: async (type) => {
                try {
                    const payload =
                        'individual' === type
                            ? buildIndividualBuyerPayload()
                            : buildCompanyBuyerPayload();
                    await registerBuyerApi(apiClientNoAuth, payload);
                    return payload;
                } catch (err) {
                    throw new Error(`[Fixture] Failed to register ${type} buyer: ${err}`);
                }
            }
        };
        await use(ops);
    },

    newIndividualBuyer: async ({ buyerOps }, use) => {
        const buyer = await buyerOps.registerBuyer('individual');
        await use(buyer);
    },

    newCompanyBuyer: async ({ buyerOps }, use) => {
        const buyer = await buyerOps.registerBuyer('company');
        await use(buyer);
    }
});
