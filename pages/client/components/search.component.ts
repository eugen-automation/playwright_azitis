import { Locator, Page } from '@playwright/test';
import { BaseComponent } from './_base.component.page';

export class SearchComponent extends BaseComponent {

    constructor(page: Page) {
        super(page);
    }

    // ==================== LOCATORS ====================
    private get searchBoxLocator(): Locator {
        return this.page.getByRole('searchbox', { name: 'Caută' }).first();
    }

    // ==================== GETTERS ====================
    get searchRoot(): Locator {
        return this.searchBoxLocator;
    }

    // ==================== ACTIONS ====================
    async searchForItem(itemName: string): Promise<void> {
        await this.searchBoxLocator.fill(itemName);
        await this.searchBoxLocator.press('Enter');
    }

    async clearSearch(): Promise<void> {
        await this.searchBoxLocator.fill('');
    }

    // ==================== VISIBILITY HELPERS ====================
    async waitForVisible(timeout = 5000): Promise<void> {
        await this.searchBoxLocator.waitFor({ state: 'visible', timeout });
    }

    async isVisible(): Promise<boolean> {
        return this.searchBoxLocator.isVisible();
    }
}