import { ClientPage } from './_client.basePage';
import { Locator, Page } from '@playwright/test';

export class TermsPage extends ClientPage {
    // ==================== PAGE CONSTANTS ====================
    readonly pageTitle = /.*Termeni.*/i;
    readonly urlSpecificPath = '/termeni-si-conditii';
    // readonly urlPattern = /.*termeni-si-conditii.*/;

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
    }

    // ==================== LOCATORS ====================
    private get mainHeadingLocator(): Locator {
        return this.page.getByRole('heading', { name: 'Articolul 1. Definiții' });
    }

    // ==================== PAGE STATE HELPERS ====================
    async waitForVisible(timeout = 10000): Promise<void> {
        await this.waitForLayoutAndHeading(this.mainHeadingLocator, timeout);
    }

    // ==================== VISIBILITY CHECKS ====================
    async isMainHeadingVisible(): Promise<boolean> {
        return await this.mainHeadingLocator.isVisible().catch(() => false);
    }

    // ==================== NAVIGATION ====================
    async openTermsPage(): Promise<void> {
        await this.page.goto(this.urlSpecificPath);
    }

    // Override base page loader to wait for Terms-specific content
    async waitForPageLoad(timeout = 15000): Promise<void> {
        await super.waitForPageLoad();
        await this.waitForVisible(timeout);

        if (!(await this.isMainHeadingVisible())) {
            throw new Error('Terms and Conditions page did not render its main heading within 15 seconds');
        }
    }
}
