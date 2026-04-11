import { Page, Locator } from '@playwright/test';

export abstract class BaseModal {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ==================== PRIVATE LOCATORS (separate locators vs actions) ====================
    get modalContainer(): Locator {
        return this.page.locator('.overflow-x-hidden.\\!max-h-\\[95\\%\\]');
    }

    get closeButton(): Locator {
        return this.modalContainer.getByTestId('mc-modal-close-button');
    }

    get title(): Locator {
        return this.modalContainer.getByRole('heading', { level: 3 }).first();
    }

    // ==================== PUBLIC METHODS ====================
    async isModalVisible(): Promise<boolean> {
        return await this.modalContainer.isVisible();
    }

    /** Wait until modal is visible */
    async waitForVisible(timeout = 7000): Promise<void> {
        await this.modalContainer.waitFor({ state: 'visible', timeout });
    }

    /** Get modal title text */
    async getModalTitle(): Promise<string> {
        if (0 === await this.title.count()) return '';
        return (await this.title.innerText()).trim();
    }

    // async clickButton(elem: Locator): Promise<void> {
    //     await elem.scrollIntoViewIfNeeded();
    //     await elem.waitFor({ state: 'visible', timeout: 5000 });
    //     await elem.click();
    //     await this.page.waitForTimeout(250); // wait for any UI updates 
    // }

    async isButtonActive(elem: Locator): Promise<boolean> {
        const classes = (await elem.getAttribute('class')) || '';
        // If the utility class disables pointer events, consider the button inactive
        if (/\bpointer-events-none\b/.test(classes)) return false;
        // Otherwise check for any 'active' markers
        return /(\bactive\b|\benabled\b|\bbtn-primary\b)/.test(classes);
    }



}   