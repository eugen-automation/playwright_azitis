import { Locator, Page } from '@playwright/test';
import { BaseComponent } from './_base.component.page';
/**
 * Account Sidebar Component
 * Vertical sidebar displayed on account pages (Panou de control, Depozit, Garantii, etc.)
 * 
 * Contains 6 navigation links:
 * 1. Licitațiile tale (Panou de control) → /dashboard
 * 2. Salvate (Favorite) → /panou-de-control/salvate
 * 3. Depozit → /tranzactii
 * 4. Garanții → /garantii
 * 5. Setări → /setari
 * 6. Ajutor și suport → /contact
 */
export class AccountSidebarComponent extends BaseComponent{
    // readonly page: Page;

    // ==================== CONSTANTS ====================
    readonly MY_AUCTIONS_TEXT = 'Licitațiile tale';
    readonly FAVORITES_TEXT = 'Salvate';
    readonly DEPOSITS_TEXT = 'Depozit';
    readonly GUARANTEES_TEXT = 'Garanții';
    readonly SETTINGS_TEXT = 'Setări';
    readonly SUPPORT_TEXT = 'Ajutor';

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
    }

    // ==================== PRIVATE LOCATORS ====================
    private get accountLeftSideBarRootLocator(): Locator {
        return this.page.locator('nav').first();
    }

    private get myAuctionsLinkLocator(): Locator {
        return this.page.locator(`a:has-text("${this.MY_AUCTIONS_TEXT}")`).first();
    }

    private get favoritesLinkLocator(): Locator {
        return this.page.locator(`a:has-text("${this.FAVORITES_TEXT}")`).first();
    }

    private get depositsLinkLocator(): Locator {
        return this.page.locator(`a:has-text("${this.DEPOSITS_TEXT}")`).first();
    }

    private get guaranteesLinkLocator(): Locator {
        return this.page.locator(`a:has-text("${this.GUARANTEES_TEXT}")`).first();
    }

    private get settingsLinkLocator(): Locator {
        return this.page.locator(`a:has-text("${this.SETTINGS_TEXT}")`).first();
    }

    private get supportLinkLocator(): Locator {
        return this.page.locator(`a:has-text("${this.SUPPORT_TEXT}")`).first();
    }

    // ==================== GETTERS ====================
    get accountLeftSideBarRoot(): Locator {
        return this.accountLeftSideBarRootLocator;
    }

    get accountMyAuctionsLink(): Locator {
        return this.myAuctionsLinkLocator;
    }

    get accountFavoritesLink(): Locator {
        return this.favoritesLinkLocator;
    }

    get accountDepositsLink(): Locator {
        return this.depositsLinkLocator;
    }

    get accountGuaranteesLink(): Locator {
        return this.guaranteesLinkLocator;
    }

    get accountSettingsLink(): Locator {
        return this.settingsLinkLocator;
    }

    get accountSupportLink(): Locator {
        return this.supportLinkLocator;
    }

    // ==================== CLICK ACTIONS ====================
    async clickMyAuctionsLink(): Promise<void> {
        await this.myAuctionsLinkLocator.click();
    }

    async clickFavoritesLink(): Promise<void> {
        await this.favoritesLinkLocator.click();
    }

    async clickDepositsLink(): Promise<void> {
        await this.depositsLinkLocator.click();
    }

    async clickGuaranteesLink(): Promise<void> {
        await this.guaranteesLinkLocator.click();
    }

    async clickSettingsLink(): Promise<void> {
        await this.settingsLinkLocator.click();
    }

    async clickSupportLink(): Promise<void> {
        await this.supportLinkLocator.click();
    }

    async waitForSidebar(): Promise<void> {
        await this.accountLeftSideBarRootLocator.waitFor({ state: 'visible' });
    }

    // ==================== VERIFICATIONS ====================
    /**
     * Check if sidebar is visible
     */
    async isSidebarVisible(): Promise<boolean> {
        return await this.accountLeftSideBarRootLocator.isVisible();
    }

    // ==================== LOCATOR ACCESSORS (PUBLIC) ====================
    /** Return the Locator for My Auctions link (public accessor) */
    getMyAuctionsLink(): Locator { return this.myAuctionsLinkLocator; }

    /** Return the Locator for Favorites link (public accessor) */
    getFavoritesLink(): Locator { return this.favoritesLinkLocator; }

    /** Return the Locator for Deposits link (public accessor) */
    getDepositsLink(): Locator { return this.depositsLinkLocator; }

    /** Return the Locator for Guarantees link (public accessor) */
    getGuaranteesLink(): Locator { return this.guaranteesLinkLocator; }

    /** Return the Locator for Settings link (public accessor) */
    getSettingsLink(): Locator { return this.settingsLinkLocator; }

    /** Return the Locator for Support link (public accessor) */
    getSupportLink(): Locator { return this.supportLinkLocator; }

    /**
     * Check if My Auctions link is visible
     */
    async isMyAuctionsLinkVisible(): Promise<boolean> {
        return await this.myAuctionsLinkLocator.isVisible();
    }

    /**
     * Check if Favorites link is visible
     */
    async isFavoritesLinkVisible(): Promise<boolean> {
        return await this.favoritesLinkLocator.isVisible();
    }

    /**
     * Check if Deposits link is visible
     */
    async isDepositsLinkVisible(): Promise<boolean> {
        return await this.depositsLinkLocator.isVisible();
    }

    /**
     * Check if Guarantees link is visible
     */
    async isGuaranteesLinkVisible(): Promise<boolean> {
        return await this.guaranteesLinkLocator.isVisible();
    }

    /**
     * Check if Settings link is visible
     */
    async isSettingsLinkVisible(): Promise<boolean> {
        return await this.settingsLinkLocator.isVisible();
    }

    /**
     * Check if Support link is visible
     */
    async isSupportLinkVisible(): Promise<boolean> {
        return await this.supportLinkLocator.isVisible();
    }
}
