import { Page, Locator } from '@playwright/test';
import { BaseModal } from './_base.modal';


export class SpecialTermsModal extends BaseModal {

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
    }

    readonly modalTitleSpecialTerms = 'Acord de acceptare a Termenilor și Condițiilor generale de utilizare a site-ului www.azitis.com și a Termenilor și Condițiilor speciale ale licitației prezente';

    // ==================== PRIVATE LOCATORS (separate locators vs actions) ====================

    private get acceptButtonLocator(): Locator {
        return this.modalContainer.getByTestId('mc-special-terms-accept-button');
    }

    async clickAcceptButton(): Promise<void> {
        await this.acceptButtonLocator.click();
    }



    // ==================== ACTIONS METHODS ====================
        
}