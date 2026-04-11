import { Locator, Page } from '@playwright/test';
import { BaseComponent } from './_base.component.page';



export class NotificationComponent extends BaseComponent {

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
    }

    // ==================== LOCATORS ====================
    private get notificationRootLocator(): Locator {
        return this.page.locator('[id="__layout"]');
    }

    private get successDepositMessageLocator(): Locator {
        return this.notificationRootLocator.getByText('Tranzacția a fost creată cu succes');
    }




    // ==================== VISIBILITY HELPERS ====================
    async isSuccessDepositMessageVisible(): Promise<boolean> {
        return await this.successDepositMessageLocator.isVisible();
    }
}