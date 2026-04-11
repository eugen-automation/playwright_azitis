import { ClientPage } from './_client.basePage';
import { Locator, Page } from '@playwright/test';

export class PrivacyPolicyPage extends ClientPage {
    // ==================== PAGE CONSTANTS ====================
    readonly pageTitle = /.*Politica de confidențialitate.*/i;
    readonly urlSpecificPath = '/politica-de-confidentialitate';
    // readonly urlPattern = /.*politica-de-confidentialitate.*/;

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
    }

    // ==================== LOCATORS ====================
    private get mainHeadingLocator(): Locator {
        return this.page.getByRole('heading', { name: 'Politica de Confidenţialitate', level: 1 });
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
    async openPrivacyPolicyPage(): Promise<void> {
        await this.page.goto(this.urlSpecificPath);
    }

    // Override base page loader to wait for Privacy Policy-specific content
    async waitForPageLoad(timeout = 15000): Promise<void> {
        await super.waitForPageLoad();
        await this.waitForVisible(timeout);

        if (!(await this.isMainHeadingVisible())) {
            throw new Error('Privacy Policy page did not render its main heading within 15 seconds');
        }
    }
}
