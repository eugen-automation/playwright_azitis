import { ClientPage } from '../_client.basePage';
import { Locator, Page } from '@playwright/test';
import { AccountSidebarComponent } from '../components/account-sidebar.component';
import { HeaderComponent } from '../components/header.component';

/**
 * Favorites page - Salvate
 * Path: /favorite
 */
export class FavoritesPage extends ClientPage {
    // ==================== PAGE CONSTANTS ====================
    readonly urlSpecificPath = '/favorite';
    readonly pageTitle = 'Licitații salvate | Azitis';

    // ==================== COMPONENTS ====================
    readonly header: HeaderComponent;
    readonly accountSidebar: AccountSidebarComponent;

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);

        this.accountSidebar = new AccountSidebarComponent(page);
        this.header = new HeaderComponent(page);
    }

    // ==================== PRIVATE LOCATORS ====================
    private get pageHeadingLocator(): Locator {
        return this.page.getByRole('heading', { name: 'Licitaţiile salvate' });
    }

    // ==================== PAGE STATE HELPERS ====================
    async waitForVisible(timeout = 10000): Promise<void> {
        await this.waitForLayoutAndHeading(this.pageHeadingLocator, timeout);
    }

    async waitForPageLoad(timeout = 15000): Promise<void> {
        await super.waitForPageLoad();
        await this.waitForVisible(timeout);
    }

    // ==================== VISIBILITY CHECKS ====================
    async isHeadingVisible(): Promise<boolean> {
        return await this.pageHeadingLocator.isVisible().catch(() => false);
    }

    // ==================== NAVIGATION ====================
    async openFavoritesPage(): Promise<void> {
        await this.page.goto(this.urlSpecificPath, { waitUntil: 'domcontentloaded' });
    }
}