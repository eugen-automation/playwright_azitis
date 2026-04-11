import { Locator, Page } from '@playwright/test';
import { BaseComponent } from './_base.component.page';

export class BreadcrumbCompComponent extends BaseComponent {

    constructor(page: Page) {
        super(page);
    }

    // ==================== LOCATORS ====================
    get breadcrumbRoot(): Locator {
        return this.page.locator('.breadcrumb');
    }

    private get breadcrumbItems(): Locator {
        return this.breadcrumbRoot.locator('li');
    }

    private breadcrumbItemByName(name: string): Locator {
        return this.breadcrumbRoot.getByRole('link', { name }).first();
    }

    // ==================== TEXT GETTERS ====================
    async getItems(): Promise<string[]> {
        return this.breadcrumbItems.allInnerTexts();
    }

    // ==================== ACTIONS ====================
    async clickItem(name: string): Promise<void> {
        await this.breadcrumbItemByName(name).click();
    }

    // ==================== VISIBILITY HELPERS ====================
    async waitForVisible(timeout = 5000): Promise<void> {
        await this.breadcrumbRoot.waitFor({ state: 'visible', timeout });
    }

    async isVisible(): Promise<boolean> {
        return this.breadcrumbRoot.isVisible();
    }
}
