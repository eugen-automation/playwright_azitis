import { Locator, Page } from '@playwright/test';
import { BaseComponent } from './_base.component.page';


export class AuctionDetailsComponent extends BaseComponent {

    constructor(page: Page) {
        super(page);
    }


    // AUCTION DETAILS SECTION
    private get auctionDetailsContainerDesktopLocator(): Locator {
        return this.page.getByTestId('cav-auction-details-container-desktop');
    }

    private get auctionDetailsContainerMobileLocator(): Locator {
        return this.page.getByTestId('cav-auction-details-container-mobile');
    }

    // ==================== AUCTION DETAILS CONTAINER RESOLVERS

    private async resolveAuctionDetailsContainer(): Promise<Locator> {
        if (this.isMobile) return this.auctionDetailsContainerMobileLocator;
        return this.auctionDetailsContainerDesktopLocator;
    }

    private async resolveAuctionDetailsHeadingLocator(): Promise<Locator> {
        if (this.isMobile) {
            return this.auctionDetailsContainerMobileLocator.getByTestId('cav-auction-details-title-mobile');
        }
        return this.auctionDetailsContainerDesktopLocator.getByTestId('cav-auction-details-title-desktop');
    }

    private async resolveStartDateLabelLocator(): Promise<Locator> {
        if (this.isMobile) {
            return this.auctionDetailsContainerMobileLocator.getByTestId('cav-auction-details-offline-auction-start-date-label-mobile');
        }
        return this.auctionDetailsContainerDesktopLocator.getByTestId('cav-auction-details-offline-auction-start-date-label-desktop');
    }

    private async resolveStartDateValueLocator(): Promise<Locator> {
       
        if (this.isMobile) {
            return this.auctionDetailsContainerMobileLocator.getByTestId('cav-auction-details-online-auction-start-date-value-mobile');
        }
        return this.auctionDetailsContainerDesktopLocator.getByTestId('cav-auction-details-online-auction-start-date-value-desktop');
    }

    private async resolveEndDateLabelLocator(): Promise<Locator> {
       
        if (this.isMobile) {
            return this.auctionDetailsContainerMobileLocator.getByTestId('cav-auction-details-offline-auction-finish-date-label-mobile');
        }
        return this.auctionDetailsContainerDesktopLocator.getByTestId('cav-auction-details-offline-auction-finish-date-label-desktop');
    }

    private async resolveEndDateValueLocator(): Promise<Locator> {
       
        if (this.isMobile) {
            return this.auctionDetailsContainerMobileLocator.getByTestId('cav-auction-details-online-auction-finish-date-value-mobile');
        }
        return this.auctionDetailsContainerDesktopLocator.getByTestId('cav-auction-details-online-auction-finish-date-value-desktop');
    }

    private async resolveAuctionInventoryNumberLabelLocator(): Promise<Locator> {
       
        if (this.isMobile) {
            return this.auctionDetailsContainerMobileLocator.getByTestId('cav-auction-details-offline-auction-inventory-number-label-mobile');
        }
        return this.auctionDetailsContainerDesktopLocator.getByTestId('cav-auction-details-offline-auction-inventory-number-label-desktop');
    }

    private async resolveAdvancePaymentDeadlineLabelLocator(): Promise<Locator> {
       
        if (this.isMobile) return this.page.getByTestId('cav-auction-details-deposit-payment-value1-mobile');
        return this.page.getByTestId('cav-auction-details-deposit-payment-value1-desktop');
    }

    private async resolveAdvancePaymentDeadlineValueLocator(): Promise<Locator> {
       
        if (this.isMobile) return this.page.getByTestId('cav-auction-details-deposit-payment-value-mobile');
        return this.page.getByTestId('cav-auction-details-deposit-payment-value-desktop');
    }

    private async resolveFullPaymentDeadlineValueLocator(): Promise<Locator> {
       
        if (this.isMobile) return this.page.getByTestId('cav-auction-details-balance-payment-value-mobile');
        return this.page.getByTestId('cav-auction-details-balance-payment-value-desktop');
    }


    // ====================  GET LOCATORS ====================

    // Expose some section locators publicly
    async getAuctionDetailContainerLocator(): Promise<Locator> {
        return await this.resolveAuctionDetailsContainer();
    }

    // ====================  GET TEXT FUNCTIONS ====================

    async getHeadingText(): Promise<string> {
        const loc = await this.resolveAuctionDetailsHeadingLocator();
        if (0 === await loc.count()) return '';
        return (await loc.innerText()).trim();
    }

    async getStartDateTimeText(): Promise<string> {
        return (await (await this.resolveStartDateValueLocator()).innerText()).trim();
    }

    async getEndDateTimeText(): Promise<string> {
        if (0 === await (await this.resolveEndDateValueLocator()).count()) return '';
        return (await (await this.resolveEndDateValueLocator()).innerText()).trim();
    }

    async getAuctionInventoryNumberText(): Promise<string> {
        if (0 === await (await this.resolveAuctionInventoryNumberLabelLocator()).count()) return '';
        return (await (await this.resolveAuctionInventoryNumberLabelLocator()).innerText()).trim();
    }

    async getAdvancePaymentDeadlineText(): Promise<string> {
        const loc = await this.resolveAdvancePaymentDeadlineValueLocator();
        if (!loc) return '';
        if (0 === await loc.count()) return '';
        return (await loc.innerText()).trim();
    }

    async getFullPaymentDeadlineText(): Promise<string> {
        const loc = await this.resolveFullPaymentDeadlineValueLocator();
        if (!loc) return '';
        if (0 === await loc.count()) return '';
        return (await loc.innerText()).trim();
    }

    // Additional compatibility helpers expected by some tests
    async getAdvancePaymentLabelText(): Promise<string> {
        const loc = await this.resolveAdvancePaymentDeadlineLabelLocator();
        if (!loc) return '';
        if (0 === await loc.count()) return '';
        return (await loc.innerText()).trim();
    }

    async getAdvancePaymentValueText(): Promise<string> {
        const loc = await this.resolveAdvancePaymentDeadlineValueLocator();
        if (!loc) return '';
        if (0 === await loc.count()) return '';
        return (await loc.innerText()).trim();
    }


    // ==================== VISIBILITY FUNCTIONS ====================
    async isAuctionDetailsHeadingVisible(): Promise<boolean> {
        return await (await this.resolveAuctionDetailsHeadingLocator()).isVisible();
    }

    async isAuctionDetailsContainerVisible(): Promise<boolean> {
        return await (await this.resolveAuctionDetailsContainer()).isVisible();
    }
}