import { ClientPage } from './_client.basePage';
import { Page, Locator } from '@playwright/test';
import { HeaderComponent } from './components/header.component';
import { FooterComponent } from './components/footer.component';
import { BreadcrumbCompComponent } from './components/breadcrumb.component';
import { SearchComponent } from './components/search.component';
import { AuctionListFiltersComponent } from './components/auctionListFilters.component';
import { AuctionCardComponent } from './components/auctionCard.component';
import { PaginationComponent } from './components/pagination.component';


export class AuctionsListPage extends ClientPage {

    /** Auctions list page - shows auction cards, filters and pagination. */

    // ==================== PAGE CONSTANTS ====================
    readonly urlSpecificPath = '/licitatii';
    readonly pageTitle = 'Azitis | Licitații';
    readonly urlPattern = /.*\/licitatie\/.*/;


    // ==================== COMPONENTS ====================
    readonly header: HeaderComponent;
    readonly footer: FooterComponent;
    readonly breadcrumb: BreadcrumbCompComponent;
    readonly searchComp: SearchComponent;
    readonly auctionListFiltersComp: AuctionListFiltersComponent;
    readonly auctionCardComp: AuctionCardComponent;
    readonly paginationComp: PaginationComponent;

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
        this.header = new HeaderComponent(page);
        this.footer = new FooterComponent(page);
        this.breadcrumb = new BreadcrumbCompComponent(page);
        this.searchComp = new SearchComponent(page);
        this.auctionListFiltersComp = new AuctionListFiltersComponent(page);
        this.auctionCardComp = new AuctionCardComponent(page);
        this.paginationComp = new PaginationComponent(page);
    }

    // ==================== LOCATORS ====================
    // Prefer the visible element when multiple responsive duplicates exist
    // private visibleByTestId(id: string): Locator {
    //   return this.page.getByTestId(id).locator(':visible').first();
    // }

    // ==================== RESULTS SUMMARY ====================

    private get resultsSummaryLocator(): Locator {
        return this.page.getByText('rezultate').first();
    }

    // ==================== SORT CONTROL ====================

    private get sortButtonLocator(): Locator {
        if(this.isMobile) {
            return this.page.getByTestId('c-auction-list-sort-mobile');
        }
        return this.page.getByText('Sortează').first();
    }


    // ==================== VIEW CONTROLS ====================

    /** View as list toggle button */
    private get viewListButtonLocator(): Locator {
        return this.page.getByTitle('Afișare listă').first();
    }

    /** Optional grid toggle button */
    private get viewGridButtonLocator(): Locator {
        return this.page.getByTitle('Afișare grid').first();
    }

    /** Message shown when there are no results */
    private get noResultsMessageLocator(): Locator {
        return this.page.getByText(/(nu\s*(s-au|au)\s*(găsit|gasit)|f(ă|a)r(ă|a) rezultate|nu exist(ă|a) licita(ț|t)ii|niciun rezultat)/i);
    }


    // ==================== NAVIGATION ====================
    async openAuctionsListPage(): Promise<void> {
        await this.page.goto(this.urlSpecificPath, { waitUntil: 'domcontentloaded' });
    }

    async waitForListLoaded(timeout: number = 15000): Promise<void> {
        await this.auctionCardComp.auctionCardRoot.first().waitFor({ state: 'attached', timeout });
    }

    /** Wait for the auctions list page to be visible/ready. */
    async waitForVisible(timeout: number = 15000): Promise<void> {
        await this.waitForListLoaded(timeout);
    }

    /** Check whether auctions list appears visible. */
    async isVisible(): Promise<boolean> {
        try {
            return await this.auctionCardComp.auctionCardRoot.first().isVisible();
        } catch {
            return false;
        }
    }

    // ==================== CLICK ACTIONS ====================

    /** Click the first auction card in the list */
    async clickFirstAuctionCard(): Promise<void> {
        await this.auctionCardComp.clickOnFirstAuctionCard();
    }

    /** Click the details/arrow button for the auction card at the given index (0-based) */
    async clickAuctionCardAt(index: number): Promise<void> {
        await this.auctionCardComp.clickAuctionCardAt(index);
    }

    /** Click the title link for the auction card at the given index (0-based) */
    async clickAuctionTitleAt(index: number): Promise<void> {
        await this.auctionCardComp.clickAuctionTitleAt(index);
    }

    /** Count auction cards on the page (delegates to component) */
    async countAuctionCardsOnPage(): Promise<number> {
        return await this.auctionCardComp.countAuctionCardsOnPage();
    }

    /** Click sort control */
    async clickSortButton(): Promise<void> {
        await this.sortButtonLocator.click();
    }

    /** Switch to grid view if toggle is visible */
    async clickGridViewButton(): Promise<void> {
        if (await this.viewGridButtonLocator.isVisible()) {
            await this.viewGridButtonLocator.click();
        }
    }

    /** Switch to list view if toggle is visible */
    async clickListViewButton(): Promise<void> {
        if (await this.viewListButtonLocator.isVisible()) {
            await this.viewListButtonLocator.click();
        }
    }

    /** Choose a sort option by visible text if a menu appears */
    async selectSortOption(optionText: string): Promise<void> {
        const option = this.page
            .getByRole('option', { name: new RegExp(optionText, 'i') })
            .or(this.page.getByText(new RegExp(optionText, 'i')))
            .locator(':visible')
            .first();
        await option.click();
    }

    // ==================== TEXT GETTERS ====================

    /** Get the first auction card title text */
    async getFirstAuctionTitleText(): Promise<string> {
        const firstTitle = this.auctionCardComp.auctionCardRoot.first().getByTestId('cal-auction-name');
        return (await firstTitle.innerText()).trim();
    }

    /** Get the first auction card price text */
    async getFirstAuctionPriceText(): Promise<string> {
        const el = this.auctionCardComp.auctionCardRoot.first().getByTestId('cal-highest-bid');
        if (0 === await el.count()) return '';
        return (await el.innerText()).trim();
    }

    /** Get the first auction card county text */
    async getFirstAuctionCountyText(): Promise<string> {
        const el = this.auctionCardComp.auctionCardRoot.first().getByTestId('cal-auction-county');
        if (0 === await el.count()) return '';
        return (await el.innerText()).trim();
    }

    /** Get the first auction card company/seller text */
    async getFirstAuctionCompanyText(): Promise<string> {
        const el = this.auctionCardComp.auctionCardRoot.first().getByTestId('cal-auction-company');
        if (0 === await el.count()) return '';
        return (await el.innerText()).trim();
    }

    /** Get the first auction card participants text (if any) */
    async getFirstAuctionParticipantsText(): Promise<string> {
        const el = this.auctionCardComp.auctionCardRoot.first().getByTestId('cal-auction-participants');
        if (0 === await el.count()) return '';
        return (await el.innerText()).trim();
    }

    /** Get the first auction card countdown text (if any) */
    async getFirstAuctionCountdownText(): Promise<string> {
        const testIds = [
            'cal-auction-countdown-in-progress',
            'cal-auction-countdown-scheduled',
            'cal-auction-countdown-new'
        ];

        const root = this.auctionCardComp.auctionCardRoot.first();
        for (const id of testIds) {
            const loc = root.getByTestId(id).locator(':visible').first();
            try {
                if (0 < await loc.count() && await loc.isVisible()) {
                    return (await loc.innerText()).trim();
                }
            } catch {
                // ignore and try next locator
            }
        }

        return '';
    }

    /** Get results summary text */
    async getResultsSummaryText(): Promise<string> {
        return (await this.resultsSummaryLocator.innerText()).trim();
    }

    // ==================== VISIBILITY CHECKS ====================

    /** True when the results summary is visible */
    async isResultsSummaryVisible(): Promise<boolean> {
        return await this.resultsSummaryLocator.isVisible({ timeout: 5000 });
    }

    /** True when the no-results message is visible */
    async isNoResultsMessageVisible(): Promise<boolean> {
        return await this.noResultsMessageLocator.isVisible().catch(() => false);
    }

    async isSortButtonVisible(): Promise<boolean> {
        return await this.sortButtonLocator.isVisible({ timeout: 5000 });
    }

    async isViewGridButtonVisible(): Promise<boolean> {
        return await this.viewGridButtonLocator.isVisible({ timeout: 5000 });
    }

    async isViewListButtonVisible(): Promise<boolean> {
        return await this.viewListButtonLocator.isVisible({ timeout: 5000 });
    }

    // Page load helper specific to Auctions List
    async waitForPageLoad(timeout: number = 15000): Promise<void> {
        await super.waitForPageLoad();
        await this.waitForVisible(timeout);
    }

}
