import { expect, type Page } from '@playwright/test';
import { test as baseTest } from '@fixtures/combined.fixtures';
import CLIENT_AUTH, { type ClientAuthMode } from '../../../utils/constants/auth.constants';
import { buildNavigationPoms, getActiveBuyerModes } from './helpers.smoke.client';
import { setupConsoleTracking, captureTestState } from '../../../utils/helpers/test.helpers';
import { PaymentBreakdownModal } from '../../../pages/client/modals/paymentBreakdown.modal';
import { SpecialTermsModal } from '@pages/client/modals/specialTerms.modal';
import { AddDepositModal } from '@pages/client/modals/addDeposit.modal';
import { AddGuaranteeModal } from '../../../pages/client/modals/addGuarantee.modal';


/**
 * Flow tests run per buyer mode (individual, company) declared in helpers.smoke.client.ts.
 * Guest is automatically filtered out via getActiveBuyerModes().
 *
 * Fixtures used:
 * - Test 1 (deposit): onboarding-complete buyer + deposit auction
 * - Test 2 (guarantee): basic logged-in buyer + guarantee auction
 */

const buyerModes = getActiveBuyerModes();

// Centralized fixture selector keeps tests static (green arrows stay) and makes it easy to
// swap to newCompanyBuyerLoggedInPage/newIndividualBuyerLoggedInPage when those fixtures exist.
const createBuyerTest = (auth: ClientAuthMode) => (
    auth === CLIENT_AUTH.BUYER_COMPANY
        ? baseTest.extend<{ buyerLoggedInPage: Page }>({
            buyerLoggedInPage: [async ({ newCompanyBuyerOnboardingCompleteLoggedInPage }, use) => {
                await use(newCompanyBuyerOnboardingCompleteLoggedInPage);
            }, { scope: 'test' }]
          })
        : baseTest.extend<{ buyerLoggedInPage: Page }>({
            buyerLoggedInPage: [async ({ newIndividualBuyerOnboardingCompleteLoggedInPage }, use) => {
                await use(newIndividualBuyerOnboardingCompleteLoggedInPage);
            }, { scope: 'test' }]
          })
);

buyerModes.forEach(({ label, auth }) => {

    // Build the mode-specific test with the right buyer fixture.
    const test = createBuyerTest(auth);

    test.describe(`Smoke Tests - Flow - ${label}`, () => {

        test.describe('Bidding', () => {

            test('should not allow placing a bid without paid deposit', async ({ 
                scheduleAuctionDeposit,
                buyerLoggedInPage
            }, testInfo) => {
                testInfo.annotations.push(
                    { type: 'tag', description: '@smoke' },
                    { type: 'suite', description: 'Flow Tests' },
                    { type: 'feature', description: 'Bidding Functionality' },
                    { type: 'severity', description: 'critical' }
                );

                // Use the single fixture that was selected for this mode
                const poms = buildNavigationPoms(buyerLoggedInPage);
                const { page, auctionsListPage, auctionViewPage } = poms;
                
                const paymentBreakdownModal = new PaymentBreakdownModal(page);
                const specialTermsModal = new SpecialTermsModal(page);
                const addDepositModal = new AddDepositModal(page);
                const consoleErrors = setupConsoleTracking(page);

                await test.step('Open auctions list page', async () => {
                    await auctionsListPage.openAuctionsListPage();
                    await auctionsListPage.waitForListLoaded();
                    await expect(page, 'Should have correct page title').toHaveTitle(auctionsListPage.pageTitle);
                });

                await test.step('Verify auction items are visible', async () => {
                    const auctionLinksCount = await auctionsListPage.auctionCardComp.countAuctionCardsOnPage();
                    expect(auctionLinksCount, 'Should have at least one auction item on auctions list page').toBeGreaterThan(0);
                });

                await test.step('Search for deposit product and open it', async () => {
                    await auctionsListPage.searchComp.searchForItem(scheduleAuctionDeposit.productData.name_ro);
                    await auctionsListPage.waitForPageLoad();

                    await auctionsListPage.auctionCardComp.clickOnFirstAuctionCard();
                    await page.waitForURL(auctionViewPage.urlPattern);
                });

                await test.step('Verify auction view page is loaded', async () => {
                    await expect(page, 'Page should navigate to auction view page').toHaveURL(auctionViewPage.urlPattern);
                    await expect(page, 'Page title should contain site branding').toHaveTitle(auctionViewPage.pageTitle);
                });

                await test.step('Wait auction to start', async () => {
                    await auctionViewPage.biddingSection.waitForAuctionToStart();
                });

                await test.step('Attempt to place bid without deposit', async () => {
                    const startingBidPrice = await auctionViewPage.biddingSection.getStartPriceText();

                    expect(await auctionViewPage.biddingSection.waitForBidNowButtonToGetEnabled(), 'Bid Now button should be enabled').toBeTruthy();
                    await auctionViewPage.biddingSection.clickBidNow();

                    await test.step('Verify payment breakdown modal and accept terms', async () => {
                        expect(await paymentBreakdownModal.isModalVisible(), 'Payment breakdown modal should be displayed').toBeTruthy();
                        expect(await paymentBreakdownModal.getModalTitle(), 'Payment breakdown modal title should be correct')
                            .toBe(paymentBreakdownModal.title);
                        expect(await paymentBreakdownModal.isBidButtonEnabled(), 'Bid Now button should be disabled when terms are not accepted')
                            .toBeFalsy();

                        await paymentBreakdownModal.toggleTermsCheckbox();
                    });

                    await test.step('Verify special terms modal and accept', async () => {
                        await specialTermsModal.waitForVisible();
                        expect(await specialTermsModal.isModalVisible(), 'Special terms modal should be displayed').toBeTruthy();
                        expect(await specialTermsModal.getModalTitle(), 'Special terms modal title should be correct')
                            .toBe(specialTermsModal.modalTitleSpecialTerms);

                        await specialTermsModal.clickAcceptButton();
                    });

                    await test.step('Attempt to bid again and expect Add Deposit modal', async () => {
                        await paymentBreakdownModal.waitForVisible();
                        expect(await paymentBreakdownModal.isModalVisible(), 'Payment breakdown modal should be displayed').toBeTruthy();

                        await paymentBreakdownModal.clickBidNowButton();

                        await addDepositModal.waitForVisible();
                        expect(await addDepositModal.isModalVisible(), 'Add deposit modal should be displayed').toBeTruthy();
                        expect(await addDepositModal.getModalTitle(), 'Add deposit modal title should be correct')
                            .toBe(addDepositModal.titleModal);

                        const startingBidFinal = await auctionViewPage.biddingSection.getStartingPriceText();
                        expect(startingBidFinal, 'Starting bid price should be the same as before').toBe(startingBidPrice);
                    });
                });

                await captureTestState(page, testInfo, consoleErrors, {
                    screenshotName: `flow - bid blocked by deposit - ${label}`,
                    skipConsoleCheck: true
                });
            });

            test.skip('should not allow place bid without payed guarantee', async ({ 
                scheduleNewGuaranteeAuction,
                buyerLoggedInPage
            }, testInfo) => {
                testInfo.annotations.push(
                    { type: 'tag', description: '@smoke' },
                    { type: 'tag', description: '@authenticated' },
                    { type: 'suite', description: 'Auctions View Tests' },
                    { type: 'feature', description: 'Bidding Functionality' },
                    { type: 'severity', description: 'normal' }
                );

                // Use the single fixture that was selected for this mode
                const poms = buildNavigationPoms(buyerLoggedInPage);
                const { auctionsListPage, auctionViewPage } = poms;
                
                const paymentBreakdownModal = new PaymentBreakdownModal(buyerLoggedInPage);
                const specialTermsModal = new SpecialTermsModal(buyerLoggedInPage);
                const addGuaranteeModal = new AddGuaranteeModal(buyerLoggedInPage);

                await test.step('Open auctions list page', async () => {
                    await auctionsListPage.openAuctionsListPage();
                    await auctionsListPage.waitForListLoaded();
                    await expect(buyerLoggedInPage, 'Should have correct page title').toHaveTitle(auctionsListPage.pageTitle);
                });

                await test.step('Verify auction items are visible', async () => {
                    const auctionLinksCount = await auctionsListPage.auctionCardComp.countAuctionCardsOnPage();
                    expect(auctionLinksCount, 'Should have at least one auction item on auctions list page').toBeGreaterThan(0);
                });

                await test.step('Search for guarantee product and open it in Auction view page', async () => {
                    await auctionsListPage.searchComp.searchForItem(scheduleNewGuaranteeAuction.productData.name_ro);
                    await auctionsListPage.waitForPageLoad();
                });

                await test.step('Focus first card and click product title', async () => {
                    await auctionsListPage.auctionCardComp.clickOnFirstAuctionCard();
                    await buyerLoggedInPage.waitForURL(auctionViewPage.urlPattern);
                });

                await test.step('Verify auction view page is loaded', async () => {
                    await expect(buyerLoggedInPage, 'Page should navigate to auction view page').toHaveURL(auctionViewPage.urlPattern);
                    await expect(buyerLoggedInPage, 'Page title should contain site branding').toHaveTitle(auctionViewPage.pageTitle);
                });

                await test.step('Attempt to place bid without guarantee', async () => {
                    const startingBidPrice = await auctionViewPage.biddingSection.getStartingPriceText();

                    expect(await auctionViewPage.biddingSection.isBidNowEnabled(), 'Bid Now button should be enabled').toBeTruthy();
                    await auctionViewPage.biddingSection.clickBidNow();

                    await test.step('Verify payment breakdown modal is displayed and accept the special terms checkbox', async () => {
                        expect(await paymentBreakdownModal.isModalVisible(), 'Payment breakdown modal should be displayed').toBeTruthy();
                        expect(await paymentBreakdownModal.getModalTitle(), 'Payment breakdown modal title should be correct').toBe(paymentBreakdownModal.title);
                        expect(await paymentBreakdownModal.isBidButtonEnabled(), 'Bid Now button should be disabled when terms are not accepted').toBeFalsy();
                        await paymentBreakdownModal.toggleTermsCheckbox();
                    });

                    await specialTermsModal.waitForVisible();
                    expect(await specialTermsModal.isModalVisible(), 'Special terms modal should be displayed').toBeTruthy();
                    expect(await specialTermsModal.getModalTitle(), 'Special terms modal title should be correct').toBe(specialTermsModal.modalTitleSpecialTerms);
                    await specialTermsModal.clickAcceptButton();

                    await test.step('Verify payment breakdown modal is displayed again after accepting special terms and attempt to bid', async () => {
                        await paymentBreakdownModal.waitForVisible();
                        expect(await paymentBreakdownModal.isModalVisible(), 'Payment breakdown modal should be displayed').toBeTruthy();
                        expect(await paymentBreakdownModal.getModalTitle(), 'Payment breakdown modal title should be correct').toBe(paymentBreakdownModal.title);
                        await paymentBreakdownModal.clickBidNowButton();
                    });

                    await test.step('Verify add guarantee modal is displayed and starting bid price is unchanged', async () => {
                        await addGuaranteeModal.waitForVisible();
                        expect(await addGuaranteeModal.isModalVisible(), 'Payment breakdown modal should be displayed').toBeTruthy();
                        expect(await addGuaranteeModal.getModalTitle(), 'Payment breakdown modal title should be correct').toContain(addGuaranteeModal.titleModal);
                    });

                    await test.step('Verify starting bid price is unchanged after failed bid attempt', async () => {
                        const startingBidFinal = await auctionViewPage.biddingSection.getStartingPriceText();
                        expect(startingBidFinal, 'Starting bid price should be the same as before').toBe(startingBidPrice);
                    });
                });
            });

            // Pending implementation copied from old multi-auth file:
            // test('Pending implementation: should allow place bid with payed deposit 2', async ({ page }) => {
            //     const accountDepositPage = new DepositsPage(page);
            //     const addDepositModal = new AddDepositModal(page);
            //     await accountDepositPage.openDepositsPage();
            //     await accountDepositPage.waitForPageLoad();
            //     const depositedAmount = await accountDepositPage.getTotalDepositValueText();
            //     expect(await accountDepositPage.isInitialDepositInfoVisible() || '0 RON' === depositedAmount, 'Total deposit value should be 0 by default').toEqual(true);
            //     await accountDepositPage.clickAddDepositButton();
            //     expect(await addDepositModal.isModalVisible(), 'Add deposit modal should be displayed').toBeTruthy();
            //     await addDepositModal.clickDepositAmountRadio(0);
            //     await addDepositModal.clickBankTransferLink();
            //     // upload deposit proof file ...
            //     // await addDepositModal.uploadPaymentProofDocument(assetPath);
            //     await addDepositModal.clickSendButton();
            //     // const notification = new NotificationComponent(page);
            //     // expect(await notification.isSuccessDepositMessageVisible(), 'should displaye the success deposit message').toBeTruthy();
            // });

            // test.skip('Pending implementation: should allow place bid with payed guarantee 2', async () => {
            // });
        });
    });
});
