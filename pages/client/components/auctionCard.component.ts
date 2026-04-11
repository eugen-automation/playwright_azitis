import { BaseComponent } from './_base.component.page';
import { Locator, Page } from '@playwright/test';

export class AuctionCardComponent extends BaseComponent {
    constructor(page: Page) {
        super(page);
    }

    // ==================== LOCATORS ====================
    get auctionCardRoot(): Locator {
        return this.page.getByTestId('cal-auction-card-container');
    }

    private get auctionCardThumbnail(): Locator {
        return this.auctionCardRoot.locator(':scope img');
    }

    private get auctionCardTitleLink(): Locator {
        return this.auctionCardRoot.getByTestId('cal-auction-name');
    }

    private get auctionCardPrice(): Locator {
        return this.auctionCardRoot.getByTestId('cal-highest-bid');
    }

    private get auctionCardExpiryCountdown(): Locator {
        return this.auctionCardRoot.getByTestId('cal-auction-countdown');
    }

    private get auctionCardBiddersCount(): Locator {
        return this.auctionCardRoot.getByTestId('cal-auction-participants');
    }

    private get auctionCardCounty(): Locator {
        return this.auctionCardRoot.getByTestId('cal-auction-county');
    }

    private get auctionCardCompanyName(): Locator {
        return this.auctionCardRoot.getByTestId('cal-auction-company');
    }

    private get auctionCardFavoriteButton(): Locator {
        return this.auctionCardRoot.getByTestId('cal-favorite-button');
    }

    private get auctionCardDetailsButton(): Locator {
        return this.auctionCardRoot.getByTestId('cal-view-auction-details-arrow');
    }

    private get auctionStatusLabel(): Locator {
        return this.auctionCardRoot
            .getByText(/Adjudecat|Câștigat|Câștigător|Vândut|Finalizat|Sold/i)
            .first();
    }

    // ==================== TEXT GETTERS ====================
    async getAuctionTitle(): Promise<string> {
        return (await this.auctionCardTitleLink.innerText()).trim();
    }

    async getAuctionPrice(): Promise<string> {
        return (await this.auctionCardPrice.innerText()).trim();
    }

    async getAuctionFavoriteStatus(): Promise<string> {
        return (await this.auctionCardFavoriteButton.getAttribute('aria-pressed')) ?? '';
    }
    // ==================== VISIBILITY / STATE CHECKS ====================
    async isAuctionMarkedAsFavorite(): Promise<boolean> {
        const svg = this.auctionCardFavoriteButton.locator('svg').first();
        if (0 === (await svg.count())) return false;
        const fill = await svg.getAttribute('fill');
        return fill ? 'none' !== fill.trim().toLowerCase() : true;
    }

    /** Count auction cards in this component */
    async countAuctionCardsOnPage(): Promise<number> {
        return this.auctionCardRoot.count();
    }

    // ==================== PRIVATE HELPERS ====================
    private async hasVisibleBidders(): Promise<boolean> {
        return 0 < (await this.auctionCardBiddersCount.count());
    }

    private async getCountdownText(): Promise<string> {
        return (await this.auctionCardExpiryCountdown.innerText()) ?? '';
    }

    // ==================== ACTIONS ====================
    async clickAuctionTitle(): Promise<void> {
        await this.auctionCardTitleLink.click();
    }

    async clickFavoriteButton(): Promise<void> {
        await this.auctionCardFavoriteButton.click();
    }

    async clickAuctionDetails(): Promise<void> {
        await this.auctionCardDetailsButton.click();
    }

    async clickOnFirstAuctionCard(): Promise<void> {
        await this.auctionCardDetailsButton.first().click();
    }

    /** Click the details/arrow button for the auction card at the given index (0-based) */
    async clickAuctionCardAt(index: number): Promise<void> {
        const btn = this.auctionCardDetailsButton.nth(index);
        if (0 === await btn.count()) throw new Error(`Auction details button not found at index ${index}`);
        await btn.click();
    }

    /** Click the title link for the auction card at the given index (0-based) */
    async clickAuctionTitleAt(index: number): Promise<void> {
        const title = this.auctionCardTitleLink.nth(index);
        if (0 === await title.count()) throw new Error(`Auction title not found at index ${index}`);
        await title.click();
    }

    // ==================== ARIA SNAPSHOTS ====================
    private readonly ariaSnapshotAuctionOngoingWithBidders = `
- img /.*/
- img
- text: /Licitația expiră în .*/
- img
- paragraph: /\d+\s+licitanți?/
- heading /.*/ [level=3]
- paragraph: /[\d\.,\s]+\s*(EUR|RON|USD|€|\$|£)/
- img
- paragraph: /.*/
- img
- paragraph: /.*/
- button "Favorite":
    - img
- link "Vezi detalii":
    - /url: /licitatie/.*/
`;

    private readonly ariaSnapshotAuctionOngoingNoBidders = `
- img /.*/
- img
- text: /Licitația expiră în .*/
- heading /.*/ [level=3]
- paragraph: /[\d\.,\s]+\s*(EUR|RON|USD|€|\$|£)/
- img
- paragraph: /.*/
- img
- paragraph: /.*/
- button "Favorite":
    - img
- link "Vezi detalii":
    - /url: /licitatie/.*/
`;

    private readonly ariaSnapshotAuctionFuture = `
- img /.*/
- img
- text: /Licitația începe în .*/
- heading /.*/ [level=3]
- paragraph: /[\d\.,\s]+\s*(EUR|RON|USD|€|\$|£)/
- img
- paragraph: /.*/
- img
- paragraph: /.*/
- button "Favorite":
    - img
- link "Vezi detalii":
    - /url: /licitatie/.*/
`;

    private readonly ariaSnapshotAuctionWon = `
- img /.*/
- img
- text: /(?:Adjudecat|Câștigat|Câștigător|Vândut|Finalizat|Sold)/i
- img
- paragraph: /\d+\s+licitanți?/
- heading /.*/ [level=3]
- paragraph: /[\d\.,\s]+\s*(EUR|RON|USD|€|\$|£)/
- img
- paragraph: /.*/
- img
- paragraph: /.*/
- button "Favorite":
    - img
- link "Vezi detalii":
    - /url: /licitatie/.*/
`;

    private async detectAuctionStatus(): Promise<['ongoing' | 'future' | 'won' | 'unknown', boolean]> {
        try {
            if (0 < (await this.auctionStatusLabel.count())) {
                const hasBidders = await this.hasVisibleBidders();
                return ['won', hasBidders];
            }

            if (0 < (await this.auctionCardExpiryCountdown.count())) {
                const countdownText = await this.getCountdownText();
                const hasBidders = await this.hasVisibleBidders();

                if (/Licitația expiră|expir/i.test(countdownText)) {
                    return ['ongoing', hasBidders];
                }
                if (/Licitația începe|începe/i.test(countdownText)) {
                    return ['future', hasBidders];
                }
            }

            return ['unknown', await this.hasVisibleBidders()];
        } catch {
            return ['unknown', false];
        }
    }

    async getAuctionCardAriaSnapshot(): Promise<string> {
        const [status, hasBidders] = await this.detectAuctionStatus();

        if ('won' === status) {
            return this.ariaSnapshotAuctionWon;
        }
        if ('future' === status) {
            return this.ariaSnapshotAuctionFuture;
        }

        return hasBidders
            ? this.ariaSnapshotAuctionOngoingWithBidders
            : this.ariaSnapshotAuctionOngoingNoBidders;
    }
}