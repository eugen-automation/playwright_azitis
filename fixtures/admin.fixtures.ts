import { RequestHandler } from '../utils/api/request-handler';
import { APILogger } from '../utils/api/logger';
import { setCustomExpectLogger } from '@utils/api/custom-expect';
import { config } from '../config/env.config';
import { LoginAdminApi } from '../utils/api/admin/login/loginAdmin.admin.api';
import { generateTimestamp, futureDateTime } from '@utils/helpers/time';
import { productBasicData, productGuaranteeData } from '@utils/api/admin/products/data/createProductData';
import { createProductApi } from '@utils/api/admin/products/createProduct.admin.api';
import { publishProductApi } from '@utils/api/admin/products/publishProduct.admin.api';
import { getProductDetailsApi } from '@utils/api/admin/products/getProductDetails.admin.api';
import { scheduleAuctionApi } from '@utils/api/admin/auctions/scheduleAuction.admin.api';
import { ProductFormData } from '@utils/interfaces/admin/product/product.interface';
import { AuctionFormData } from '@utils/interfaces/admin/auction/auction.interface';
import { updateBuyerApi } from '@utils/api/admin/buyer/updateBuyer.admin.api';
import { UpdateBuyerPayload } from '@utils/interfaces/admin/buyer/updateBuyer.interface';
import { MessagePayload } from '@utils/interfaces/general.interface';
import { test as clientTest } from './client.fixtures';
import { getBuyerDetails } from '@utils/api/client/getBuyerDetails.client.api';
import { LoginPage } from '@pages/client/login.client.page';


export type ProductSetupPayload = {
    productId: string
    productData: any
}

export type AuctionSetupPayload = {
    productId: string
    auctionId: number
    productData: any
}

export type AdminAuctionOps = {
    createProduct: (type: 'deposit' | 'guarantee') => Promise<ProductSetupPayload>
    publishProduct: (product: ProductSetupPayload) => Promise<AuctionSetupPayload>
    scheduleAuction: (published: AuctionSetupPayload) => Promise<AuctionSetupPayload & { scheduled: true }>
    setupAuction: (type: 'deposit' | 'guarantee') => Promise<AuctionSetupPayload & { scheduled: true }>
}

export type TestOptions = {
    apiAdmin: RequestHandler
    authTokenAdmin: string
    config: typeof config

    createDepositProduct: ProductSetupPayload
    createGuaranteeProduct: ProductSetupPayload

    publishDepositProduct: AuctionSetupPayload
    publishGuaranteeProduct: AuctionSetupPayload

    scheduleDepositAuction: AuctionSetupPayload & { scheduled: true }
    scheduleGuaranteeAuction: AuctionSetupPayload & { scheduled: true }

    // Legacy names still used in tests
    scheduleAuctionDeposit: AuctionSetupPayload & { scheduled: true }
    scheduleAuctionGuarantee: AuctionSetupPayload & { scheduled: true }

    // Factory-style ops (recommended)
    adminAuctionOps: AdminAuctionOps

    // Backwards-compatible names
    publishProduct: AuctionSetupPayload
    scheduleAuction: AuctionSetupPayload & { scheduled: true }
    scheduleNewDepositAuction: AuctionSetupPayload & { scheduled: true }
    scheduleNewGuaranteeAuction: AuctionSetupPayload & { scheduled: true }

    newIndividualBuyerOnboardingComplete: { result: any, buyerId: string }
    newCompanyBuyerOnboardingComplete: { result: any, buyerId: string }
    newIndividualBuyerOnboardingCompleteLoggedInPage: any
    newCompanyBuyerOnboardingCompleteLoggedInPage: any
}

export const test = clientTest.extend<TestOptions>({

    authTokenAdmin: async ({ }, use) => {
        const authToken = await LoginAdminApi();
        await use(authToken);
    },

    apiAdmin: async ({ request, authTokenAdmin }, use) => {
        const logger = new APILogger();
        setCustomExpectLogger(logger);
        const requestHandler = new RequestHandler(request, config.admin.apiUrl, logger, authTokenAdmin);
        await use(requestHandler);
    },

    adminAuctionOps: async ({ apiAdmin }, use) => {
        const ops: AdminAuctionOps = {
            createProduct: async (type) => {
                const timestamp = generateTimestamp();

                const basePayload: Partial<ProductFormData> = {
                    ...productBasicData,
                    name_ro: `${productBasicData.name_ro} ${timestamp}`,
                    name_en: `${productBasicData.name_en} ${timestamp}`
                };

                const payload: Partial<ProductFormData> = 'guarantee' === type
                    ? {
                        ...basePayload,
                        ...productGuaranteeData,
                        name_ro: `${productGuaranteeData.name_ro} ${timestamp}`,
                        name_en: `${productBasicData.name_en} ${timestamp}`
                    }
                    : basePayload;

                const createProductResult = await createProductApi(payload, apiAdmin);
                if (!createProductResult || !createProductResult.id) {
                    throw new Error(`Product creation failed, missing product id: ${JSON.stringify(createProductResult)}`);
                }

                return {
                    productId: createProductResult.id,
                    productData: payload
                };
            },

            publishProduct: async (product) => {
                const publishProductResult = await publishProductApi(product.productId, apiAdmin);
                if (!publishProductResult || !publishProductResult.message || !publishProductResult.message.toLowerCase().includes('dusul a fost publicat')) {
                    throw new Error(`Product publishing failed: ${JSON.stringify(publishProductResult)}`);
                }

                const auctionData = await getProductDetailsApi(product.productId, apiAdmin, { waitForAuctionId: true, timeoutMs: 120_000, intervalMs: 1500 });
                if (!auctionData || !('page_data' in auctionData) || !auctionData.page_data?.auction_id) {
                    throw new Error(`Not able to retrieve auction id for published product. ${JSON.stringify(auctionData?.page_data)}`);
                }

                return {
                    ...product,
                    auctionId: auctionData.page_data.auction_id,
                    published: true
                } as AuctionSetupPayload;
            },

            scheduleAuction: async (published) => {
                const onePxPngB64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
                const buffer = Buffer.from(onePxPngB64, 'base64');
                const schedulePayload: Partial<AuctionFormData> = {
                    auction_type: 'online',
                    responsible_id: Number(published.productData.responsible_id),
                    start_datetime: futureDateTime(2),
                    finish_datetime: futureDateTime(10),
                    company_id: Number(published.productData.company_id),
                    unpir_proof: buffer,
                    newspaper_proof: buffer,
                    has_guarantee: published.productData.has_guarantee,
                    guarantee_amount: published.productData?.guarantee_amount ?? '',
                    guarantee_percentage: published.productData?.guarantee_percentage ?? null,
                    rezervation_price: published.productData?.rezervation_price ?? '',
                    start_price: published.productData.start_price ?? ''
                };

                const auctionScheduleResult = await scheduleAuctionApi(published.auctionId.toString(), schedulePayload as AuctionFormData, apiAdmin);
                console.log('[smoke.setup] schedule result:', auctionScheduleResult?.statusCode ?? auctionScheduleResult);

                if (!auctionScheduleResult || 200 !== auctionScheduleResult.statusCode) {
                    throw new Error(`Auction scheduling failed. ${JSON.stringify(auctionScheduleResult)}`);
                }

                return {
                    ...published,
                    scheduled: true
                };
            },

            setupAuction: async (type) => {
                const created = await ops.createProduct(type);
                const published = await ops.publishProduct(created);
                return await ops.scheduleAuction(published);
            }
        };

        await use(ops);
    },

    // --- Optional fixtures: only created when test depends on them ---
    createDepositProduct: [async ({ adminAuctionOps }, use) => {
        await use(await adminAuctionOps.createProduct('deposit'));
    }, { scope: 'test', auto: false }],

    createGuaranteeProduct: [async ({ adminAuctionOps }, use) => {
        await use(await adminAuctionOps.createProduct('guarantee'));
    }, { scope: 'test', auto: false }],

    publishDepositProduct: [async ({ adminAuctionOps, createDepositProduct }, use) => {
        await use(await adminAuctionOps.publishProduct(createDepositProduct));
    }, { scope: 'test', auto: false }],

    publishGuaranteeProduct: [async ({ adminAuctionOps, createGuaranteeProduct }, use) => {
        await use(await adminAuctionOps.publishProduct(createGuaranteeProduct));
    }, { scope: 'test', auto: false }],

    scheduleDepositAuction: [async ({ adminAuctionOps, publishDepositProduct }, use) => {
        await use(await adminAuctionOps.scheduleAuction(publishDepositProduct));
    }, { scope: 'test', auto: false }],

    scheduleGuaranteeAuction: [async ({ adminAuctionOps, publishGuaranteeProduct }, use) => {
        await use(await adminAuctionOps.scheduleAuction(publishGuaranteeProduct));
    }, { scope: 'test', auto: false }],

    scheduleAuctionDeposit: [async ({ scheduleDepositAuction }, use) => {
        await use(scheduleDepositAuction);
    }, { scope: 'test', auto: false }],

    scheduleAuctionGuarantee: [async ({ scheduleGuaranteeAuction }, use) => {
        await use(scheduleGuaranteeAuction);
    }, { scope: 'test', auto: false }],

    // --- Backwards-compatible fixtures (to avoid updating tests immediately) ---
    publishProduct: async ({ publishDepositProduct, publishGuaranteeProduct }, use) => {
        const published = publishDepositProduct ?? publishGuaranteeProduct;
        if (!published) {
            throw new Error('Either publishDepositProduct or publishGuaranteeProduct must be provided');
        }
        await use(published);
    },

    scheduleAuction: async ({ scheduleDepositAuction, scheduleGuaranteeAuction }, use) => {
        const scheduled = scheduleDepositAuction ?? scheduleGuaranteeAuction;
        if (!scheduled) {
            throw new Error('Either scheduleDepositAuction or scheduleGuaranteeAuction must be provided');
        }
        await use(scheduled);
    },

    scheduleNewDepositAuction: async ({ scheduleDepositAuction }, use) => {
        await use(scheduleDepositAuction);
    },

    scheduleNewGuaranteeAuction: async ({ scheduleGuaranteeAuction }, use) => {
        await use(scheduleGuaranteeAuction);
    },

    // buyer update - individual (optional: only when test needs onboarding complete)
    newIndividualBuyerOnboardingComplete: [async ({ newIndividualBuyer, apiClient, apiAdmin }, use) => {
        try {
            console.log(`\n[Fixture] Completing onboarding for individual buyer: ${newIndividualBuyer.email}`);
            
            // Get buyer details using authenticated client
            const buyerDetailsResponse = await getBuyerDetails(apiClient);
            if (!buyerDetailsResponse?.id) {
                throw new Error('Failed to get buyer details');
            }
            console.log(`[Fixture] Buyer details obtained, ID: ${buyerDetailsResponse.id}`);
            
            const updateBuyerPayload: UpdateBuyerPayload = {
                id: buyerDetailsResponse.id,
                name: buyerDetailsResponse.name,
                email: buyerDetailsResponse.email,
                phone: undefined,
                onboarding_status: 'done',
                personal_id_document: undefined
            };
            // Update buyer to mark onboarding as complete
            const result = await updateBuyerApi(updateBuyerPayload, apiAdmin);
            console.log('[Fixture] Buyer onboarding status updated');
            
            await use({ result, buyerId: buyerDetailsResponse.id.toString() });
        } catch (err) {
            throw new Error(`[Fixture] Failed to complete onboarding for individual buyer: ${err}`);
        }
    }, { scope: 'test', auto: false }],

    // buyer update - company (optional: only when test needs onboarding complete)
    newCompanyBuyerOnboardingComplete: [async ({ newCompanyBuyer, apiClientCompany, apiAdmin }, use) => {
        try {
            console.log(`\n[Fixture] Completing onboarding for company buyer: ${newCompanyBuyer.email}`);
            
            // Get buyer details using authenticated client
            const buyerDetailsResponse = await getBuyerDetails(apiClientCompany);
            if (!buyerDetailsResponse?.id) {
                throw new Error('Failed to get buyer details');
            }
            console.log(`[Fixture] Buyer details obtained, ID: ${buyerDetailsResponse.id}`);
            
            const updateBuyerPayload: UpdateBuyerPayload = {
                id: buyerDetailsResponse.id,
                name: buyerDetailsResponse.name,
                email: buyerDetailsResponse.email,               
                onboarding_status: 'done'
               
            };
            // Update buyer to mark onboarding as complete
            const result = await updateBuyerApi(updateBuyerPayload, apiAdmin);
            console.log('[Fixture] Buyer onboarding status updated');
            
            await use({ result, buyerId: buyerDetailsResponse.id.toString() });
        } catch (err) {
            throw new Error(`[Fixture] Failed to complete onboarding for company buyer: ${err}`);
        }
    }, { scope: 'test', auto: false }],

    newIndividualBuyerOnboardingCompleteLoggedInPage: [async ({ browser, newIndividualBuyer, newIndividualBuyerOnboardingComplete }, use) => {
        try {
            const context = await browser.newContext();
            const page = await context.newPage();
            const loginPage = new LoginPage(page);
            await loginPage.openLoginPage();

            await loginPage.login(newIndividualBuyer.email, newIndividualBuyer.password);

            console.log('[Fixture] Individual buyer with completed onboarding logged in page ready');
            await use(page);
            await context.close();
        } catch (err) {
            throw new Error(`[Fixture] Failed to login individual buyer with completed onboarding in UI: ${err}`);
        }
    }, { scope: 'test', auto: false }],

    newCompanyBuyerOnboardingCompleteLoggedInPage: [async ({ browser, newCompanyBuyer, newCompanyBuyerOnboardingComplete }, use) => {
        try {
            const context = await browser.newContext();
            const page = await context.newPage();
            const loginPage = new LoginPage(page);
            await loginPage.openLoginPage();

            await loginPage.login(newCompanyBuyer.email, newCompanyBuyer.password);

            console.log('[Fixture] Company buyer with completed onboarding logged in page ready');
            await use(page);
            await context.close();
        } catch (err) {
            throw new Error(`[Fixture] Failed to login company buyer with completed onboarding in UI: ${err}`);
        }
    }, { scope: 'test', auto: false }],

    config: async ({ }, use) => {
        await use(config);
    }
});
