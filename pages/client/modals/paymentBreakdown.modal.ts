// This page represents the auction payment breakdown modal (Componenta oferta
import { Page, Locator } from '@playwright/test';
import { BaseModal } from './_base.modal';



export class PaymentBreakdownModal extends BaseModal {

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
    }

    readonly titleModal = 'Componență ofertă';

    // ==================== PRIVATE LOCATORS (separate locators vs actions) ====================


    private get modalAuctionTimeoutLocator(): Locator {
        return this.modalContainer.getByTestId('cal-auction-countdown');
    }

    private get modalAuctionDescriptionLocator(): Locator {
        return this.modalContainer.getByTestId('cm-auction-payment-breakdown-descr');
    }

    private get modalAuctionDetailsLocator(): Locator {
        return this.modalContainer.getByTestId('cm-auction-payment-breakdown-details-title');
    }

    private get modalYourBidLabelLocator(): Locator {
        return this.modalContainer.getByTestId('cm-auction-payment-breakdown-your-bid-label');
    }

    private get modalYourBidValueLocator(): Locator {
        return this.modalContainer.getByTestId('cm-auction-payment-breakdown-your-bid-value');
    }

    private get modalAuctionVATLabelLocator(): Locator {
        // fixed selector using getByTestId
        return this.modalContainer.getByTestId('cm-auction-payment-breakdown-vat-label');
    }

    private get modalAuctionVATValueLocator(): Locator {
        return this.modalContainer.getByTestId('cm-auction-payment-breakdown-vat-value');
    }

    private get modalFeeLabelLocator(): Locator {
        return this.modalContainer.getByTestId('cm-auction-payment-breakdown-fee-label');
    }

    private get modalFeeValueLocator(): Locator {
        return this.modalContainer.getByTestId('cm-auction-payment-breakdown-fee-value');
    }

    private get modalCurrencyInfoLocator(): Locator {
        return this.modalContainer.getByTestId('cm-auction-payment-breakdown-currency-info');
    }

    private get modalTotalCostLabelLocator(): Locator {
        return this.modalContainer.getByTestId('cm-auction-payment-breakdown-total-cost-label');
    }

    private get modalTotalCostAmountLocator(): Locator {
        return this.modalContainer.getByTestId('cm-auction-payment-breakdown-total-cost-value');
    }

    private get modalTermsCheckboxLocator(): Locator {
        return this.page.getByTestId('cm-auction-payment-breakdown-terms-checkbox');
    }

    private get modalTermsTitleLocator(): Locator {
        return this.modalContainer.getByTestId('cm-auction-payment-breakdown-terms-bold-line');
    }

    private get modalTermsTextLocator(): Locator {
        return this.modalContainer.getByTestId('cm-auction-payment-breakdown-terms-second-line');
    }

    private get modalBidNowButtonLocator(): Locator {
        return this.modalContainer.getByTestId('cm-auction-payment-breakdown-bid-button');
    }

    private get modalBackButtonLocator(): Locator {
        return this.modalContainer.getByTestId('cm-auction-payment-breakdown-go-back-button');
    }

    // ==================== ACTIONS METHODS ====================


    /** Wait until modal is hidden */
    async waitForHidden(timeout = 5000): Promise<void> {
        await this.modalContainer.waitFor({ state: 'hidden', timeout });
    }

    async getYourBidValueText(): Promise<string> {
        if (0 === await this.modalYourBidValueLocator.count()) return '';
        return (await this.modalYourBidValueLocator.innerText()).trim();
    }

    async getVatValueText(): Promise<string> {
        if (0 === await this.modalAuctionVATValueLocator.count()) return '';
        return (await this.modalAuctionVATValueLocator.innerText()).trim();
    }

    async getFeeValueText(): Promise<string> {
        if (0 === await this.modalFeeValueLocator.count()) return '';
        return (await this.modalFeeValueLocator.innerText()).trim();
    }

    async getTotalCostAmountText(): Promise<string> {
        if (0 === await this.modalTotalCostAmountLocator.count()) return '';
        return (await this.modalTotalCostAmountLocator.innerText()).trim();
    }

    async getCurrencyInfoText(): Promise<string> {
        if (0 === await this.modalCurrencyInfoLocator.count()) return '';
        return (await this.modalCurrencyInfoLocator.innerText()).trim();
    }

    async getTermsTitleText(): Promise<string> {
        if (0 === await this.modalTermsTitleLocator.count()) return '';
        return (await this.modalTermsTitleLocator.innerText()).trim();
    }

    async getTermsText(): Promise<string> {
        if (0 === await this.modalTermsTextLocator.count()) return '';
        return (await this.modalTermsTextLocator.innerText()).trim();
    }

    /** Toggle the terms checkbox (click) */
    async toggleTermsCheckbox(): Promise<void> {
        if (0 === await this.modalTermsCheckboxLocator.count()) throw new Error('Terms checkbox not found');
        await this.modalTermsCheckboxLocator.click();
        await this.page.waitForTimeout(250); // wait for any UI updates
    }


    async clickBidNowButton(): Promise<void> {
        await this.modalBidNowButtonLocator.click();
    }

    /** Click back/go back button */
    async clickBack(): Promise<void> {
        const btn = this.modalBackButtonLocator.locator(':visible').first();
        if (0 === await btn.count()) throw new Error('Back button not found');
        await btn.click();
    }

    async isBidButtonEnabled(): Promise<boolean> {
        return await this.isButtonActive(this.modalBidNowButtonLocator);
    }

}
