import { ClientPage } from '../_client.basePage';
import { Locator, Page } from '@playwright/test';
import { AccountSidebarComponent } from '../components/account-sidebar.component';
import { HeaderComponent } from '../components/header.component';

/**
 * Settings page - Setări
 * Path: /setari
 */
export class SettingsPage extends ClientPage {
    // ==================== PAGE CONSTANTS ====================
    readonly urlSpecificPath = '/setari';
    readonly pageTitle = 'Profil | Azitis';

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
        return this.page.getByRole('heading', { name: /profil/i });
    }

    // ==================== PAGE STATE HELPERS ====================
    async waitForVisible(timeout = 10000): Promise<void> {
        await this.layoutAreaLocator.waitFor({ state: 'visible', timeout });
        // await this.pageHeadingLocator.waitFor({ state: 'visible', timeout });
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
    async openSettingsPage(): Promise<void> {
        await this.page.goto(this.urlSpecificPath, { waitUntil: 'domcontentloaded' });
    }
}
