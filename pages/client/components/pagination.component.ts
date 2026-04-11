import { Locator, Page } from '@playwright/test';
import { BaseComponent } from './_base.component.page';

export class PaginationComponent extends BaseComponent {

    constructor(page: Page) {
        super(page);
    }

    // ==================== LOCATORS ====================
    private get paginationRoot(): Locator {
        return this.page.getByText(/1\s*[-–]\s*20\s+din\s+\d+\s+bunuri/i);
    }

    private get paginationInfo(): Locator {
        return this.paginationRoot.getByTestId('cal-pagination-info');
    }

    private get previousPageButton(): Locator {
        return this.paginationRoot.getByRole('button', { name: 'Pagina anterioară' });
    }

    private get nextPageButton(): Locator {
        return this.paginationRoot.getByRole('button', { name: 'Pagina următoare' });
    }

    private get totalPagesNumber(): Locator {
        return this.paginationRoot.getByTestId('c-last-page');
    }

    // ==================== TEXT GETTERS ====================
    async getPaginationInfoText(): Promise<string> {
        return (await this.paginationInfo.textContent()) ?? '';
    }

    async getPaginationInformationText(): Promise<string> {
        return (await this.paginationInfo.innerText()) ?? '';
    }

    async getTotalPagesText(): Promise<string> {
        return (await this.totalPagesNumber.textContent()) ?? '';
    }

    // ==================== VISIBILITY HELPERS ====================
    async waitForVisible(timeout = 5000): Promise<void> {
        await this.paginationRoot.waitFor({ state: 'visible', timeout });
    }

    async isVisible(): Promise<boolean> {
        return this.paginationRoot.isVisible();
    }

    // ==================== INTERACTION HELPERS ====================
    async clickNextPage(): Promise<void> {
        await this.nextPageButton.click();
    }

    async clickPreviousPage(): Promise<void> {
        await this.previousPageButton.click();
    }

    async isNextButtonEnabled(): Promise<boolean> {
        return !(await this.nextPageButton.isDisabled());
    }

    async isPreviousButtonEnabled(): Promise<boolean> {
        return !(await this.previousPageButton.isDisabled());
    }

    // ==================== ARIA SNAPSHOTS ====================
    private readonly ariaSnapshotDefaultPaginationDesktop = `
            - paragraph: /1\\s*[-–]\\s*20\\s+din\\s+\\d+\\s+bunuri/
            - button "Pagina anterioară" [disabled]
            - text: /1\\s+2\\s+\\.\\.\\.\\s+\\d+/
            - button "Pagina următoare"
            `;

    private readonly ariaSnapshotDefaultPaginationMobile = `
              - button [disabled]:
                - img
              - paragraph: /1 din \\d+/
              - paragraph: /1 - \\d+ din \\d+ bunuri/
              - button:
                - img
              `;

    getPaginationAriaSnapshot(): string {
        return this.isMobile
            ? this.ariaSnapshotDefaultPaginationMobile
            : this.ariaSnapshotDefaultPaginationDesktop;
    }
}
