
import { Page, Locator } from '@playwright/test';
import { BaseModal } from './_base.modal';
import path from 'path';
import { existsSync } from 'fs';


export class AddDepositModal extends BaseModal {

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
    }

    readonly titleModal = 'Creștere valoare depozit';

    // ==================== PRIVATE LOCATORS (separate locators vs actions) ====================

    // locator for modal
    get modalDeposit(): Locator {
        return this.page.getByTestId('cm-add-deposit-modal');
    }

    // locator for radio buttons (collection)
    private get depositAmountRadioLocator(): Locator {
        return this.modalDeposit.getByTestId('cm-deposit-radio');
    }

    // locator for required amount (collection)
    private get depositAmountLabelLocator(): Locator {
        return this.modalDeposit.getByTestId('cm-deposit-required-amount');
    }

    // locator for threshold amount (collection)
    private get depositThresholdAmountLocator(): Locator {
        return this.modalDeposit.getByTestId('cm-deposit-max-threshold-amount');
    }

    private get bankTransferButtonLocator(): Locator {
        return this.modalDeposit.getByRole('button', { name: 'Depune prin transfer bancar' });
    }

    private get proofUploadFileInputLocator(): Locator {
        return this.modalDeposit
            .getByTestId('cm-deposit-proof-upload')
            .locator('input[type="file"]');
    }


    // ==================== ACTIONS METHODS ====================

    async clickDepositAmountRadio(item: number = 0): Promise<void> {
        const radio = this.depositAmountRadioLocator.nth(item);
        if (0 === await radio.count()) throw new Error('Deposit amount radio not found');
        await radio.check();
    }

    async checkDepositAmountRadio(item: number = 0): Promise<boolean> {
        const radio = this.depositAmountRadioLocator.nth(item);
        if (0 === await radio.count()) return false;
        return await radio.isChecked();
    }

    async clickBankTransferLink(): Promise<void> {
        const btn = this.bankTransferButtonLocator.first();
        if (0 === await btn.count()) throw new Error('Bank transfer link not found');
        await btn.click();
    }

    async isAddDepositModalVisible(): Promise<boolean> {
        return await this.modalDeposit.isVisible();
    }

    /** Wait until this specific add-deposit modal is visible */
    async waitForVisible(timeout = 7000): Promise<void> {
        await this.modalDeposit.waitFor({ state: 'visible', timeout });
    }

    async uploadPaymentProofDocument(filePath: string): Promise<void> {
        const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
        if (!existsSync(resolved)) throw new Error(`Upload file not found: ${resolved}`);

        // Primary: try page-level selector (handles inputs moved outside modal)
        const selector = '[data-testid="cm-deposit-proof-upload"] input[type="file"]';
        try {
            await this.page.waitForSelector(selector, { state: 'attached', timeout: 5000 });
            await this.page.setInputFiles(selector, resolved);
            return;
        } catch (e) {
            // ignore and try modal-scoped locator
            throw new Error(e.message);
        }

        // Fallback: use modal-scoped locator
        // try {
        //     await this.proofUploadFileInputLocator.setInputFiles(resolved);
        //     return;
        // } catch (err) {
        //     throw new Error(`Failed to upload deposit proof file (resolved=${resolved}): ${err}`);
        // }
    }

    /** Click the modal send/submit button ("Trimite") */
    async clickSendButton(): Promise<void> {
        // Prefer a labelled 'Trimite' button inside the modal
        const labelled = this.modalDeposit.getByRole('button', { name: 'Trimite' }).first();
        if (0 < await labelled.count()) {
            await labelled.click();
            await this.page.waitForTimeout(250);
            return;
        }

        // Fallback: click the first visible button inside the modal
        const anyVisible = this.modalDeposit.locator('button:visible').first();
        if (0 === await anyVisible.count()) throw new Error('Send button not found in Add Deposit modal');
        await anyVisible.click();
        await this.page.waitForTimeout(250);
    }
}