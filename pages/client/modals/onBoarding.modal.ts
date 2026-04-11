
import { Page, Locator } from '@playwright/test';
import { BaseModal } from './_base.modal';



export class OnBoardingModal extends BaseModal {

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
    }

    readonly titleModal = 'Confirmare cont utilizator';


    // ==================== PRIVATE LOCATORS (separate locators vs actions) ====================

    // locator for modal
    get onBoardingModal(): Locator {
        return this.page.getByTestId('cm-onbording-modal');
    }




    // ==================== ACTIONS METHODS ====================

    async isModalVisible(): Promise<boolean> {
        try {
            await this.onBoardingModal.waitFor({ state: 'visible', timeout: 15000 });
            return true;
        } catch {
            return false;
        }
    }
}