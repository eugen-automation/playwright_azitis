import { Locator, Page } from '@playwright/test';
import { BaseComponent } from './_base.component.page';

export class AuctionListFiltersComponent extends BaseComponent {

    constructor(page: Page) {
        super(page);
    }

    // ==================== LOCATORS ====================
    get auctionListFiltersRoot(): Locator {
        if (this.isMobile) {
            return this.page.getByTestId('c-auction-list-filter-mobile');
        }
        return this.page.getByTestId('c-auction-list-filter-desktop');
    }

    private get filterHeadings(): Locator {
        return this.auctionListFiltersRoot.getByRole('heading');
    }

    private get categoryCheckboxes(): Locator {
        return this.auctionListFiltersRoot.getByRole('checkbox');
    }

    private get filterButton(): Locator {
        return this.page.getByRole('button', { name: 'Filtrează' });
    }

    private get closeFilterPopupButton(): Locator {
        // Close button sits inside the popup header area.
        // Keep this scoped under the filters root to avoid matching other SVGs on the page.
        return this.auctionListFiltersRoot.locator('div').first().locator('div').first().locator('svg').first();
    }

    private categoryCheckboxByLabel(label: string | RegExp): Locator {
        return this.categoryCheckboxes.filter({ hasText: new RegExp(label, 'i') }).first();
    }

    // ==================== TEXT GETTERS ====================
    async getSidebarHeadingTexts(): Promise<string[]> {
        return this.filterHeadings.allInnerTexts();
    }

    async getVisibleCategoryLabels(): Promise<string[]> {
        return this.categoryCheckboxes.allInnerTexts();
    }

    // ==================== ACTION METHODS ====================
    async toggleCategoryFilter(label: string | RegExp): Promise<void> {
        await this.categoryCheckboxByLabel(label).click();
    }

    async clickFilterButton(): Promise<void> {
        await this.openFiltersPopupIfMobile();
    }

    async clickCloseFilterPopup(): Promise<void> {
        await this.closeFiltersPopupIfMobile();
    }

    async openFiltersPopupIfMobile(timeout = 5000): Promise<void> {
        if (!this.isMobile) return;
        await this.filterButton.click();
        await this.auctionListFiltersRoot.waitFor({ state: 'visible', timeout });
    }

    async closeFiltersPopupIfMobile(timeout = 5000): Promise<void> {
        if (!this.isMobile) return;
        if (!(await this.auctionListFiltersRoot.isVisible())) return;
        await this.closeFilterPopupButton.click();
        await this.auctionListFiltersRoot.waitFor({ state: 'hidden', timeout });
    }

    async isCategoryFilterChecked(label: string | RegExp): Promise<boolean> {
        return this.categoryCheckboxByLabel(label).isChecked();
    }

    getAuctionListFiltersAriaSnapshot(): string {
        if (this.isMobile) {
            return this.ariaSnapshotDefaultFiltersSidebarMobile;
        }
        return this.ariaSnapshotDefaultFiltersSidebarDesktop;
    }

    /** Wait for filters sidebar to be visible (desktop layout). */
    async waitForVisible(timeout = 5000): Promise<void> {
        await this.auctionListFiltersRoot.waitFor({ state: 'visible', timeout });
    }

    /** Check whether the filters sidebar is visible. */
    async isVisible(): Promise<boolean> {
        return this.auctionListFiltersRoot.isVisible();
    }

    async isFiltersPopupVisible(): Promise<boolean> {
        if (this.isMobile) {
            return this.auctionListFiltersRoot.isVisible();
        }
        return false;
    }

    // ==================== ARIA SNAPSHOTS ====================
    private readonly ariaSnapshotDefaultFiltersSidebarDesktop = `
    - heading "Categorii" [level=3]
    - img
    - checkbox /Terenuri \\(\\d+\\)/
    - text: /Terenuri \\(\\d+\\)/
    - img
    - checkbox /Construcții \\(\\d+\\)/
    - text: /Construcții \\(\\d+\\)/
    - img
    - checkbox /Transporturi \\(\\d+\\)/
    - text: /Transporturi \\(\\d+\\)/
    - img
    - checkbox /Utilaje \\(\\d+\\)/
    - text: /Utilaje \\(\\d+\\)/
    - img
    - checkbox /Stocuri \\(\\d+\\)/
    - text: /Stocuri \\(\\d+\\)/
    - img
    - checkbox /Deșeuri \\(\\d+\\)( \\[disabled\\])?/
    - text: /Deșeuri \\(\\d+\\)/
    - img
    - checkbox /Mobilier \\(\\d+\\)/
    - text: /Mobilier \\(\\d+\\)/
    - img
    - checkbox /Birotică.?IT \\(\\d+\\)/
    - text: /Birotică.?IT \\(\\d+\\)/
    - img
    - checkbox /Afaceri la cheie \\(\\d+\\)( \\[disabled\\])?/
    - text: /Afaceri la cheie \\(\\d+\\)/
    - checkbox /Echipamente și instalații \\(\\d+\\)/
    - text: /Echipamente și instalații \\(\\d+\\)/
    - img
    - checkbox /Altele \\(\\d+\\)/
    - text: /Altele \\(\\d+\\)/
    - heading "Status" [level=3]
    - img
    - heading "Preț" [level=3]
    - img
    - heading "Locație" [level=3]
    - img
  `;

    private readonly ariaSnapshotDefaultFiltersSidebarMobile = `
    - heading "Categorii" [level=3]
    - img
    - checkbox
    - text: /Terenuri \\(\\d+\\)/
    - img
    - checkbox
    - text: /Construcții \\(\\d+\\)/
    - img
    - checkbox
    - text: /Transporturi \\(\\d+\\)/
    - img
    - checkbox
    - text: /Utilaje \\(\\d+\\)/
    - img
    - checkbox
    - text: /Stocuri \\(\\d+\\)/
    - img
    - checkbox [disabled]
    - text: /Deșeuri \\(\\d+\\)/
    - img
    - checkbox
    - text: /Mobilier \\(\\d+\\)/
    - img
    - checkbox
    - text: /Birotică.?IT \\(\\d+\\)/
    - img
    - checkbox [disabled]
    - text: /Afaceri la cheie \\(\\d+\\)/
    - checkbox
    - text: /Echipamente și instalații \\(\\d+\\)/
    - img
    - checkbox
    - text: /Altele \\(\\d+\\)/
    - heading "Status" [level=3]
    - img
    - heading "Preț" [level=3]
    - img
    - heading "Locație" [level=3]
    - img
    `;
}
