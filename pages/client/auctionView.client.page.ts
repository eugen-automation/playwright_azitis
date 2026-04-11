import { ClientPage } from './_client.basePage';
import { Page, Locator } from '@playwright/test';
import { HeaderComponent } from './components/header.component';
import { FooterComponent } from './components/footer.component';
import { BreadcrumbCompComponent } from './components/breadcrumb.component';
import { PopularAuctionsComponent } from './components/popularAuctions.component';
import { AuctionDetailsComponent } from './components/auctionDetails.component';
import { AuctionResponsiblePersonComponent } from './components/auctionResponsible.component';
import { AuctionBiddingComponent } from './components/auctionBidding.component';
import { PaymentBreakdownModal } from './modals/paymentBreakdown.modal';

/**
 * Auction Detail page - Vizualizare licitație
 * Path: /licitatie/{id}
 * This page combines both product and auction information displayed together.
 */
export class AuctionViewPage extends ClientPage {
    // ==================== PAGE CONSTANTS ====================
    readonly urlPattern = /\/licitatie\/[a-z0-9-]+/i;  // Regex pattern for auction detail URLs
    readonly urlSpecificPath = '/licitatie/';
    readonly pageTitle = /Azitis/i;  // Page title includes product name + "| Azitis"

    // ==================== COMPONENTS ====================
    readonly header: HeaderComponent;
    readonly footer: FooterComponent;
    readonly breadcrumb: BreadcrumbCompComponent;
    readonly popularAuctionsComp: PopularAuctionsComponent;
    readonly auctionDetailSection: AuctionDetailsComponent;
    readonly responsiblePersonSection: AuctionResponsiblePersonComponent;
    readonly biddingSection: AuctionBiddingComponent;
    readonly paymentBreakdown: PaymentBreakdownModal;


    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);

        this.header = new HeaderComponent(page);
        this.footer = new FooterComponent(page);
        this.breadcrumb = new BreadcrumbCompComponent(page);
        this.popularAuctionsComp = new PopularAuctionsComponent(page);
        this.biddingSection = new AuctionBiddingComponent(page);
        this.paymentBreakdown = new PaymentBreakdownModal(page);
        this.auctionDetailSection = new AuctionDetailsComponent(page);
        this.responsiblePersonSection = new AuctionResponsiblePersonComponent(page);

    }

    // Compatibility adapters - small facades expected by some tests
    // async getResponsiblePersonNameText(): Promise<string> {
    //     return await this.auctionResponsiblePersonSection.getResponsiblePersonNameText();
    // }

    // async getResponsiblePersonEmailText(): Promise<string> {
    //     return await this.auctionResponsiblePersonSection.getResponsiblePersonEmailText();
    // }

    // async getResponsiblePersonPhoneText(): Promise<string> {
    //     return await this.auctionResponsiblePersonSection.getResponsiblePersonPhoneText();
    // }

    async isPopularAuctionsVisible(): Promise<boolean> {
        return await this.popularAuctionsComp.isVisible();
    }

    // Simple wrappers for documents/location sections used by tests
    readonly documentsSection = {
        isVisible: async (): Promise<boolean> => {
            return await this.downloadAllButtonLocator.isVisible().catch(() => false);
        }
    };

    readonly locationMapImage = {
        isVisible: async (): Promise<boolean> => {
            return await this.locationMapImageLocator.isVisible().catch(() => false);
        }
    };

    // ==================== PRIVATE LOCATORS ====================


    private get viewAllPhotosButtonLocator(): Locator {
        return this.page.getByTestId('cav-auction-see-all-pictures-button');
    }

    // // // /Specifications section
    private get specificationsHeadingLocator(): Locator {
        return this.page.getByTestId('cav-auction-specifications-title');
    }

    private get specificationsDataFirstLabelLocator(): Locator {
        return this.page.getByTestId('cav-auction-specifications-0-title');
    }

    private get specificationsDataFirstValueLocator(): Locator {
        return this.page.getByTestId('cav-auction-specifications-0-value');
    }

    // ....... other specifcations data

    private get viewMoreSpecsButtonLocator(): Locator {
        return this.page.getByTestId('cav-auction-specifications-see-more-button');
    }

    // // // /Special terms section
    private get specialTermsHeadingLocator(): Locator {
        return this.page.getByTestId('cav-auction-product-special-terms-title');
    }

    private get specialTermsContentLocator(): Locator {
        return this.page.getByTestId('cav-auction-product-special-terms-description');
    }

    // // // /Description section
    private get descriptionHeadingLocator(): Locator {
        return this.page.getByTestId('cav-auction-description-title');
    }

    // // // /Documents section
    private get descriptionContentLocator(): Locator {
        // All paragraphs in description section
        return this.page.getByTestId('cav-auction-description-content');
    }

    private get downloadAllButtonLocator(): Locator {
        return this.page.getByRole('button', { name: /descarcă toate/i }).or(this.page.getByTestId('cav-acutiondocuments-download-all-button'));
    }

    // // // /Location section
    private get locationHeadingLocator(): Locator {
        return this.page.getByTestId('cav-auction-location-title').or(this.page.getByRole('heading', { name: /locație/i, level: 3 }));
    }

    private get locationMapImageLocator(): Locator {
        // Static map preview image
        return this.page.getByTestId('cav-auction-location-map');
    }

    private get locationDirectionsButtonLocator(): Locator {
        // Link to Google Maps directions
        return this.page.getByTestId('cav-auction-location-directions-button').or(this.page.getByRole('link', { name: /directii/i }));
    }

    private get locationMapTooltipLocator(): Locator {
        return this.page.getByTestId('cav-auction-location-tooltip');
    }

    // ==================== RESOLVERS ====================
    // Resolver: choose mobile vs desktop locator using `isMobileView()`
    private async resolveAuctionTitleLocator(): Promise<Locator> {
        const mobile = this.isMobile;
        if (mobile) {
            return this.page.getByTestId('cav-auction-title-mobile');
        }
        return this.page.getByTestId('cav-auction-title-desktop');
    }

    // Resolver: return appropriate locator for current viewport
    private async resolveProductLocationCountyLocator(): Promise<Locator> {
        const mobile = this.isMobile;
        if (mobile) {
            return this.page.getByTestId('cav-auction-county-mobile');
        }
        return this.page.getByTestId('cav-auction-county-desktop');
    }

    // Resolver: choose mobile vs desktop locator
    private async resolveProductSellerNameLocator(): Promise<Locator> {
        const mobile = this.isMobile;
        if (mobile) {
            return this.page.getByTestId('cav-auction-company-mobile');
        }
        return this.page.getByTestId('cav-auction-company-desktop');
    }

    // Resolver: choose mobile vs desktop locator
    private async resolveAuctionInventoryNumberLocator(): Promise<Locator> {
        const mobile = this.isMobile;
        if (mobile) {
            return this.page.getByTestId('cav-auction-inventory-number-mobile');
        }
        return this.page.getByTestId('cav-auction-inventory-number-desktop');
    }

    // Resolvers: pick mobile/desktop testids and prefer visible button/role when present
    private async resolveFavoriteButtonLocator(): Promise<Locator> {
        const mobile = this.isMobile;
        if (mobile) {
            return this.page.getByTestId('cav-favorite-button-mobile');
        }
        return this.page.getByTestId('cav-favorite-button-desktop');
    }

    private async resolveShareButtonLocator(): Promise<Locator> {
        const mobile = this.isMobile;
        if (mobile) {
            return this.page.getByTestId('cav-share-button-mobile');
        }
        return this.page.getByTestId('cav-share-button-desktop');
    }

    // ====================  TEXT FUNCTIONS ====================
    // Public read helpers (hero)
    async getAuctionTitleText(): Promise<string> {
        const loc = await this.resolveAuctionTitleLocator();
        if (0 < await loc.count()) {
            return (await loc.innerText()).trim();
        }

        // Fallback: sometimes title is rendered as an h1 without testid — handle here so tests don't use locators
        const h1 = this.page.locator('h1').first();
        if (0 < await h1.count()) {
            return (await h1.innerText()).trim();
        }

        return '';
    }

    async getCountyText(): Promise<string> {
        const loc = await this.resolveProductLocationCountyLocator();
        if (0 === await loc.count()) return '';
        return (await loc.innerText()).trim();
    }

    async getSellerText(): Promise<string> {
        const loc = await this.resolveProductSellerNameLocator();
        if (0 === await loc.count()) return '';
        return (await loc.innerText()).trim();
    }

    async getInventoryIdText(): Promise<string> {
        const loc = await this.resolveAuctionInventoryNumberLocator();
        if (0 === await loc.count()) return '';
        return (await loc.innerText()).trim();
    }

    async getSpecificationsHeadingText(): Promise<string> {
        return (await this.specificationsHeadingLocator.innerText()).trim();
    }

    async getSpecialTermsHeadingText(): Promise<string> {
        return (await this.specialTermsHeadingLocator.innerText()).trim();
    }

    async getSpecialTermsContentText(): Promise<string> {
        return (await this.specialTermsContentLocator.innerText()).trim();
    }

    async getDescriptionHeadingText(): Promise<string> {
        return (await this.descriptionHeadingLocator.innerText()).trim();
    }

    async getDescriptionContentText(): Promise<string> {
        return (await this.descriptionContentLocator.innerText()).trim();
    }

    async getLocationHeadingText(): Promise<string> {
        return (await this.locationHeadingLocator.innerText()).trim();
    }

    async getLocationMapTooltipText(): Promise<string> {
        return (await this.locationMapTooltipLocator.innerText()).trim();
    }

    // ==================== CLICK FUNCTIONS ====================

    async clickSpecificationsExpandButton(): Promise<void> {
        if (await this.viewMoreSpecsButtonLocator.isVisible()) {
            await this.viewMoreSpecsButtonLocator.click();
        }
    }

    async clickDownloadAllDocumentsButton(): Promise<void> {
        await this.downloadAllButtonLocator.click();
    }

    async clickDirectionsButton(): Promise<void> {
        await this.locationDirectionsButtonLocator.click();
    }

    async clickViewAllPhotosButton(): Promise<void> {
        await this.viewAllPhotosButtonLocator.click();
    }

    async clickSaveAuction(): Promise<void> {
        const loc = await this.resolveFavoriteButtonLocator();
        await loc.click();
    }

    async clickShareAuction(): Promise<void> {
        const loc = await this.resolveShareButtonLocator();
        await loc.click();
    }

    // ==================== VISIBILITY FUNCTIONS ====================

    async isViewAllPhotosButtonVisible(): Promise<boolean> {
        return await this.viewAllPhotosButtonLocator.isVisible();
    }

    async waitForVisible(timeout = 15000): Promise<void> {
        await this.descriptionContentLocator.waitFor({ state: 'visible', timeout });
        await this.biddingSection.waitForVisible(timeout);
    }

    async isAuctionTitleVisible(): Promise<boolean> {
        const locator = await this.resolveAuctionTitleLocator();
        return await locator.isVisible().catch(() => false);
    }

    async isFavouriteButtonVisible(): Promise<boolean> {
        const loc = await this.resolveFavoriteButtonLocator();
        return await loc.isVisible().catch(() => false);
    }

    async isShareButtonVisible(): Promise<boolean> {
        const loc = await this.resolveShareButtonLocator();
        return await loc.isVisible().catch(() => false);
    }

    async isLocationTooltipVisible(): Promise<boolean> {
        return await this.locationMapTooltipLocator.isVisible();
    }

    async isLocationDirectionsButtonVisible(): Promise<boolean> {
        return await this.locationDirectionsButtonLocator.isVisible();
    }

    async waitForPageLoad(timeout: number = 15000): Promise<void> {
        await super.waitForPageLoad();
        await this.waitForVisible(timeout);
    }

    async waitForTitle(timeout: number = 20000): Promise<Locator> {
        const loc = await this.resolveAuctionTitleLocator();
        await loc.waitFor({ state: 'visible', timeout });
        return loc;
    }

}
