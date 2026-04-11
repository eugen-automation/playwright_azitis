import { Locator, Page } from '@playwright/test';
import { BaseComponent } from './_base.component.page';

/**
 * Popular Auctions Carousel Component
 * Displayed at the bottom of most pages (home, auction detail, etc.)
 * Shows a scrollable list of popular auctions with navigation arrows
 */
export class PopularAuctionsComponent extends BaseComponent {

    constructor(page: Page) {
        super(page);
    }

    // ==================== LOCATORS ====================
    private get sectionHeadingLocator(): Locator {
        return this.page.getByRole('heading', { name: /cele mai populare licitații/i, level: 2 });
    }

    private get carouselControlsLocator(): Locator {
        return this.sectionHeadingLocator.locator('xpath=following-sibling::div').first();
    }

    private get carouselPreviousButtonLocator(): Locator {
        return this.carouselControlsLocator.locator('img[cursor="pointer"]').first();
    }

    private get carouselNextButtonLocator(): Locator {
        return this.carouselControlsLocator.locator('img[cursor="pointer"]').last();
    }

    private get carouselPositionIndicatorLocator(): Locator {
        return this.page.locator('text=/item \d+ of \d+/i');
    }

    private get auctionCardsListLocator(): Locator {
        return this.carouselControlsLocator.locator('list').first();
    }

    private get auctionCardsLocator(): Locator {
        return this.auctionCardsListLocator.locator('> listitem');
    }

    // ==================== GETTERS ====================
    get sectionHeading(): Locator {
        return this.sectionHeadingLocator;
    }

    get carouselPreviousButton(): Locator {
        return this.carouselPreviousButtonLocator;
    }

    get carouselNextButton(): Locator {
        return this.carouselNextButtonLocator;
    }

    get carouselPositionIndicator(): Locator {
        return this.carouselPositionIndicatorLocator;
    }

    get auctionCardsList(): Locator {
        return this.auctionCardsListLocator;
    }

    get allAuctionCards(): Locator {
        return this.auctionCardsLocator;
    }

    // ==================== CARD HELPERS ====================
    getAuctionCardByIndex(index: number): Locator {
        return this.allAuctionCards.nth(index);
    }

    getCardThumbnail(card: Locator): Locator {
        return card.locator('img').first();
    }

    getCardTitleLink(card: Locator): Locator {
        return card.getByRole('link').filter({ hasNotText: /thumbnail/i }).first();
    }

    getCardTimerBadge(card: Locator): Locator {
        return card.locator('text=/licitația (expiră|începe) în/i');
    }

    getCardParticipantsBadge(card: Locator): Locator {
        return card.locator('text=/\d+ licitanți/i');
    }

    getCardLocation(card: Locator): Locator {
        return card.locator('paragraph').filter({ has: card.locator('xpath=preceding-sibling::img') }).first();
    }

    getCardSeller(card: Locator): Locator {
        return card.locator('paragraph').filter({ has: card.locator('xpath=preceding-sibling::img') }).nth(1);
    }

    getCardPrice(card: Locator): Locator {
        return card.locator('paragraph').filter({ hasText: /EUR/i }).last();
    }

    // ==================== ACTIONS ====================
    async scrollNext(): Promise<void> {
        await this.carouselNextButtonLocator.click();
        await this.page.waitForTimeout(500);
    }

    async scrollPrevious(): Promise<void> {
        await this.carouselPreviousButtonLocator.click();
        await this.page.waitForTimeout(500);
    }

    async clickAuctionCard(index: number): Promise<void> {
        const card = this.getAuctionCardByIndex(index);
        const titleLink = this.getCardTitleLink(card);
        await titleLink.click();
    }

    // ==================== DATA ACCESSORS ====================
    async getVisibleCardsCount(): Promise<number> {
        return await this.allAuctionCards.count();
    }

    async getCarouselPosition(): Promise<{ current: number; total: number } | null> {
        const positionText = await this.carouselPositionIndicatorLocator.textContent();
        if (!positionText) return null;

        const match = positionText.match(/item (\d+) of (\d+)/i);
        if (!match) return null;

        return {
            current: parseInt(match[1], 10),
            total: parseInt(match[2], 10)
        };
    }

    async getVisibleAuctionTitles(): Promise<string[]> {
        const cards = await this.allAuctionCards.all();
        const titles: string[] = [];

        for (const card of cards) {
            const titleLink = this.getCardTitleLink(card);
            const title = await titleLink.textContent();
            if (title) {
                titles.push(title.trim());
            }
        }

        return titles;
    }

    async hasParticipants(index: number): Promise<boolean> {
        const card = this.getAuctionCardByIndex(index);
        const participantsBadge = this.getCardParticipantsBadge(card);
        return await participantsBadge.isVisible();
    }

    async getAuctionStatus(index: number): Promise<'active' | 'upcoming' | 'unknown'> {
        const card = this.getAuctionCardByIndex(index);
        const timerBadge = this.getCardTimerBadge(card);

        try {
            const timerText = await timerBadge.textContent();
            if (timerText?.includes('expiră')) {
                return 'active';
            } else if (timerText?.includes('începe')) {
                return 'upcoming';
            }
        } catch {
        }

        return 'unknown';
    }

    // ==================== VISIBILITY HELPERS ====================
    async isVisible(): Promise<boolean> {
        return await this.sectionHeadingLocator.isVisible();
    }

    async waitForVisible(timeout = 5000): Promise<void> {
        await this.sectionHeadingLocator.waitFor({ state: 'visible', timeout });
    }

    async hasNavigationArrows(): Promise<boolean> {
        const prevVisible = await this.carouselPreviousButtonLocator.isVisible();
        const nextVisible = await this.carouselNextButtonLocator.isVisible();
        return prevVisible && nextVisible;
    }
}