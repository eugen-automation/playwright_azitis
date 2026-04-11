import { ClientPage } from './_client.basePage';
import { Locator, Page } from '@playwright/test';

export class ContactPage extends ClientPage {
    // ==================== PAGE CONSTANTS ====================
    readonly pageTitle = /.*Contact.*/i;
    readonly urlSpecificPath = '/contact';
    // readonly urlPattern = /.*contact.*/;

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
    }

    // ==================== LOCATORS ====================
    private get mainHeadingLocator(): Locator {
        return this.page.getByRole('heading', { name: /Contact/i, level: 1 });
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
    async openContactPage(): Promise<void> {
        await this.page.goto(this.urlSpecificPath);
    }

    // Override base page loader to wait for Contact-specific content
    async waitForPageLoad(timeout = 15000): Promise<void> {
        await super.waitForPageLoad();
        await this.waitForVisible(timeout);

        if (!(await this.isMainHeadingVisible())) {
            throw new Error('Contact page did not render its main heading within 15 seconds');
        }
    }
}
