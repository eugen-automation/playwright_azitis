
import { Page, Locator } from '@playwright/test';
import { BaseModal } from './_base.modal';



export class AddGuaranteeModal extends BaseModal {

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
    }

    readonly titleModal = 'Garanția licitației "';


    // ==================== PRIVATE LOCATORS (separate locators vs actions) ====================

    // locator for modal
    get guaranteeModal(): Locator {
        return this.page.getByTestId('cm-guarantee-modal');
    }

    


    // ==================== ACTIONS METHODS ====================

}