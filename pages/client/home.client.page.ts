import { ClientPage } from './_client.basePage';
import { HeaderComponent } from './components/header.component';
import { FooterComponent } from './components/footer.component';
import { Locator, Page } from '@playwright/test';


export class HomePage extends ClientPage {

    // ==================== PAGE CONSTANTS ====================
    readonly baseTitle = 'Cumpără și vinde bunuri sau imobile la licitație | Azitis';
    readonly urlSpecificPath = '/';  // Home page URL

    // ==================== COMPONENTS ====================
    readonly header: HeaderComponent;
    readonly footer: FooterComponent;

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
        this.header = new HeaderComponent(page);
        this.footer = new FooterComponent(page);
    }

    // ==================== PRIVATE LOCATORS ====================
    private get promotedAuctionContainerLocator(): Locator {
        return this.page.locator('#promoted-inner-wrapper');
    }

    private get promotedAuctionCloseButtonLocator(): Locator {
        return this.page.getByRole('button', { name: 'Close' });
    }

    private get promotedAuctionIconLocator(): Locator {
        return this.page.locator('#promoted-icon');
    }

    private get metaDescriptionLocator(): Locator {
        return this.page.locator('meta[name="description"]');
    }

    private get metaOgTitleLocator(): Locator {
        return this.page.locator('meta[property="og:title"]');
    }

    private get canonicalLinkLocator(): Locator {
        return this.page.locator('link[rel="canonical"]');
    }

    private get mainContentLocator(): Locator {
        return this.page.locator('main').first();
    }

    private get heroSectionLocator(): Locator {
        return this.page.locator('h1').first().locator('xpath=ancestor::div[1]');
    }

    private get h1HeadingLocator(): Locator {
        return this.page.locator('h1');
    }

    private get h2SubtitleLocator(): Locator {
        return this.page.getByRole('heading', { name: /descoperă cea mai performantă platformă/i, level: 2 });
    }

    private get allImagesLocator(): Locator {
        return this.page.locator('img');
    }

    private get searchBoxLocator(): Locator {
        return this.page.getByRole('searchbox', { name: /caută/i });
    }

    private get categoriesHeadingLocator(): Locator {
        return this.page.getByRole('heading', { name: /categorii/i, level: 2 }).first();
    }

    private get allProductsButtonLocator(): Locator {
        return this.page.getByRole('button', { name: /toate bunurile/i });
    }

    private get mainCategoryImagesLocator(): Locator {
        return this.page.locator('img[alt*="Terenuri"], img[alt*="Construcții"], img[alt*="Transporturi"],img[alt*="Utilaje"], img[alt*="Stocuri"], img[alt*="Deșeuri"],img[alt*="Mobilier"], img[alt*="Birotică/IT"], img[alt*="Afaceri la cheie"], img[alt*="Altele"]');
    }

    private get auctionsHeadingLocator(): Locator {
        return this.page.getByRole('heading', { name: /cele mai populare licitații/i });
    }

    private get auctionsListLocator(): Locator {
        return this.page.locator('ul, ol, [role="list"]').filter({
            has: this.page.locator('a[href*="/licitatie/"]')
        }).first();
    }

    private get auctionsItemsLocator(): Locator {
        return this.page.locator('a[href*="/licitatie/"]');
    }



    // ==================== PAGE STATE HELPERS ====================
    /** Wait for the home page main content to be visible. */
    async waitForVisible(timeout = 10000): Promise<void> {
        await this.waitForLayoutAndHeading(this.heroSectionLocator, timeout);
    }

    /** Check whether the home page main content is visible. */
    async isVisible(): Promise<boolean> {
        return await this.mainContentLocator.isVisible().catch(() => false);
    }

    // ==================== NAVIGATION METHODS ====================
    async openHomePage(): Promise<void> {
        await this.page.goto(this.urlSpecificPath, { waitUntil: 'domcontentloaded' });
    }

    async waitForPageLoad(timeout = 15000): Promise<void> {
        await super.waitForPageLoad();
        await this.waitForVisible(timeout);
    }

    // ==================== CLICK ACTIONS ====================
    async clickClosePromotedAuctionPopup(): Promise<boolean> {
        await this.promotedAuctionCloseButtonLocator.click();
        await this.promotedAuctionIconLocator.waitFor({
            state: 'hidden',
            timeout: 2000
        });

        const updatedClassName = await this.promotedAuctionIconLocator.getAttribute('class');
        return updatedClassName ? updatedClassName.includes('!opacity-0') : false;
    }

    async clickAllProductsButton(): Promise<void> {
        await this.allProductsButtonLocator.click();
    }

    // ==================== TEXT GETTERS ====================
    async getMetaDescriptionContent(): Promise<string | null> {
        return await this.metaDescriptionLocator.getAttribute('content');
    }

    async getMetaOgTitleContent(): Promise<string | null> {
        return await this.metaOgTitleLocator.getAttribute('content');
    }

    async getCanonicalLinkHref(): Promise<string | null> {
        return await this.canonicalLinkLocator.getAttribute('href');
    }

    async getHeroHeadingText(): Promise<string> {
        return (await this.h1HeadingLocator.innerText()).trim();
    }

    // ==================== VISIBILITY CHECKS ====================
    async isPromotedAuctionDisplayed(): Promise<boolean> {
        return await this.promotedAuctionContainerLocator.isVisible();
    }

    async isAllProductsButtonVisible(): Promise<boolean> {
        return await this.allProductsButtonLocator.isVisible();
    }

    /** Delegate to header to check whether user badge is visible */
    async isUserBadgeVisible(): Promise<boolean> {
        return await this.header.isUserBadgeVisible();
    }
}