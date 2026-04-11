import { ClientPage } from '../_client.basePage';
import { Locator, Page } from '@playwright/test';
import { AccountSidebarComponent } from '../components/account-sidebar.component';
import { HeaderComponent } from '../components/header.component';


/**
 * My Auctions page - Licitațiile mele
 * Path: /panou-de-control/licitatiile-mele
 */
export class MyAuctionsPage extends ClientPage {
    // ==================== PAGE CONSTANTS ====================
    readonly urlSpecificPath = '/dashboard';
    readonly pageTitle = 'Licitațiile mele | Azitis';

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
        return this.page.getByRole('heading', { name: /licitațiile mele/i });
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
    async openMyAuctionsPage(): Promise<void> {
        await this.page.goto(this.urlSpecificPath, { waitUntil: 'domcontentloaded' });
    }
}
