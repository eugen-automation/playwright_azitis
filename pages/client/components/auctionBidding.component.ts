import { BaseComponent } from './_base.component.page';
import { Locator, Page } from '@playwright/test';
import { AUCTION_STATUS, type AuctionStatus } from '@utils/constants/auctionStatus';

export class AuctionBiddingComponent extends BaseComponent {

    readonly depositTextInfo = 'Licitație cu depozit\n\nLicitația cu depozit necesită achitarea unei sume de bani virate în contul platformei și aflate la dispoziția acesteia pe perioada licitației, care are scopul de a valida solvabilitatea, respectiv intențiile ferme ale respectivului utilizator de a licita, de a adjudeca bunul și de a plăti prețul licitat. Depozitul este returnabil conform termenilor și condițiilor de utilizare a platformei.';

    constructor(page: Page) {
        super(page);
    }

    // ==================== PRIVATE LOCATORS (mobile / desktop)

    private get biddingContainerDesktopLocator() {
        return this.page.getByTestId('cav-auction-biding-container-desktop');
    }

    private get biddingContainerMobileLocator() {
        return this.page.getByTestId('cav-auction-biding-container-mobile');
    }

    // ==================== RESOLVE LOCATORS (mobile / desktop)

    private async resolveBiddingContainerLocator(): Promise<Locator> {
        if (this.isMobile) {
            return this.biddingContainerMobileLocator;
        }
        return this.biddingContainerDesktopLocator;
    }

    private async resolveDepositStatusLocator(): Promise<Locator> {
        if (this.isMobile) {
            return this.biddingContainerMobileLocator.getByTestId('cav-auction-deposit-status-mobile');
        }
        return this.biddingContainerDesktopLocator.getByTestId('cav-auction-deposit-status-desktop');
    }

    private async resolveGuaranteeStatusLocator(): Promise<Locator> {
        // Use hard-coded locators here so the resolver is self-contained.
        const mobile = this.isMobile;
        if (mobile) return this.biddingContainerMobileLocator.getByTestId('cav-auction-guarantee-status-mobile');
        return this.biddingContainerDesktopLocator.getByTestId('cav-auction-guarantee-status-desktop');
    }

    private async resolveCountDownInProgressAuctionLocator(): Promise<Locator> {
        if (this.isMobile) return this.biddingContainerMobileLocator.getByTestId('cal-auction-countdown-in-progress');
        return this.biddingContainerDesktopLocator.getByTestId('cal-auction-countdown-in-progress');
    }

    private async resolveCountdownScheduledAuctionLocator(): Promise<Locator> {
        if (this.isMobile) return this.biddingContainerMobileLocator.getByTestId('cal-auction-countdown-scheduled');
        return this.biddingContainerDesktopLocator.getByTestId('cal-auction-countdown-scheduled');
    }

    private async resolveCountdownNewauctionLocator(): Promise<Locator> {
        if (this.isMobile) return this.biddingContainerMobileLocator.getByTestId('cal-auction-countdown-new');
        return this.biddingContainerDesktopLocator.getByTestId('cal-auction-countdown-new');
    }

    private async resolveBidNowButtonLocator(): Promise<Locator> {
        if (this.isMobile) return this.biddingContainerMobileLocator.getByRole('button', { name: 'Licitează acum' });
        return this.biddingContainerDesktopLocator.getByRole('button', { name: 'Licitează acum' });
    }

    private async resolvePaymentBreakdownLinkLocator(): Promise<Locator> {
        if (this.isMobile) return this.biddingContainerMobileLocator.getByTestId('cav-auction-payment-breakdown-link-mobile');
        return this.biddingContainerDesktopLocator.getByTestId('cav-auction-payment-breakdown-link-desktop');
    }

    private async resolveStartingBidPriceLocator(): Promise<Locator> {
        if (this.isMobile) return this.biddingContainerMobileLocator.getByTestId('cav-auction-starting-bid-value-mobile');
        return this.biddingContainerDesktopLocator.getByTestId('cav-auction-starting-bid-value-desktop');
    }

    private async resolveOffersCountLocator(): Promise<Locator> {
        if (this.isMobile) return this.biddingContainerMobileLocator.getByTestId('cav-auction-offers-count-mobile');
        return this.biddingContainerDesktopLocator.getByTestId('cav-auction-offers-count-desktop');
    }

    private async resolveSeeHistoryLinkLocator(): Promise<Locator> {
        if (this.isMobile) return this.biddingContainerMobileLocator.getByTestId('cav-auction-see-history-link-mobile');
        return this.biddingContainerDesktopLocator.getByTestId('cav-auction-see-history-link-desktop');
    }

    private async resolveParticipantsCountLocator(): Promise<Locator> {
        if (this.isMobile) return this.biddingContainerMobileLocator.getByTestId('cav-auction-participants-count-mobile');
        return this.biddingContainerDesktopLocator.getByTestId('cav-auction-participants-count-desktop');
    }

    private async resolveFollowersCountLocator(): Promise<Locator> {
        if (this.isMobile) return this.biddingContainerMobileLocator.getByTestId('cav-auction-followers-mobile');
        return this.biddingContainerDesktopLocator.getByTestId('cav-auction-followers-desktop');
    }

    // ==================== VISIBILITY HELPERS ====================
    async waitForVisible(timeout = 5000): Promise<void> {
        const root = await this.resolveBiddingContainerLocator();
        await root.waitFor({ state: 'visible', timeout });
    }

    async isVisible(): Promise<boolean> {
        const root = await this.resolveBiddingContainerLocator();
        return await root.isVisible();
    }

    async hasDeposit(): Promise<boolean> {
        const loc = await this.resolveDepositStatusLocator();
        return 0 < (await loc.count());
    }

    async hasGuarantee(): Promise<boolean> {
        const loc = await this.resolveGuaranteeStatusLocator();
        return 0 < (await loc.count());
    }

    async isSold(): Promise<boolean> {
        const root = await this.resolveBiddingContainerLocator();
        const sold = root.getByText('Bun vândut');
        return 0 < (await sold.count());
    }

    // ==================== CLICK ACTIONS ====================

    async clickBidNow(): Promise<void> {
        const btn = await this.resolveBidNowButtonLocator();
        console.log(`Bid now button count: ${await btn.count()}`);
        if (0 === await btn.count()) throw new Error('Bid now button not found');
        await btn.first().click();
    }

    async clickPaymentBreakdown(): Promise<void> {
        const loc = await this.resolvePaymentBreakdownLinkLocator();
        if (0 === await loc.count()) throw new Error('Payment breakdown link not found');
        await loc.click();
    }

    async clickSeeHistory(): Promise<void> {
        const loc = await this.resolveSeeHistoryLinkLocator();
        if (0 === await loc.count()) throw new Error('See history link not found');
        await loc.click();
    }

    ///////////////////////// ENABLE CHECKS /////////////////////////
    async isBidNowEnabled(): Promise<boolean> {
        const btn = await this.resolveBidNowButtonLocator();
        if (0 === await btn.count()) return false;
        const first = btn.first();
        // const disabledAttr = await first.getAttribute('disabled');
        // if (null !== disabledAttr) return false;
        const classAttr = (await first.getAttribute('class')) || '';
        return !/pointer-events-none/.test(classAttr);
    }

    async waitForBidNowButtonToGetEnabled(
        timeoutMs = 200_000,
        intervalMs = 500
    ): Promise<boolean> {
        const deadline = Date.now() + timeoutMs;

        while (Date.now() < deadline) {
            const isEnabled = await this.isBidNowEnabled();
            console.log(`Bid now button status: ${isEnabled}`);

            if (isEnabled) {
                return true; // ✅ găsit
            }

            await this.page.waitForTimeout(intervalMs);
        }

        return false; // ❌ timeout
    }

    // ==================== HIGH LEVEL HELPERS ====================
    /**
    * Evaluate auction status based on sold badge and countdown text.
    * Returns AuctionStatus values.
     */
    async getAuctionStatus(): Promise<AuctionStatus> {
        if (await this.isSold()) {
            return AUCTION_STATUS.SOLD;
        }

        const timerText = await this.getCountdownText();
        if (timerText?.toLocaleLowerCase().includes('expiră')) {
            return AUCTION_STATUS.ACTIVE;
        } else if (timerText?.toLocaleLowerCase().includes('începe')) {
            return AUCTION_STATUS.UPCOMING;
        }

        return AUCTION_STATUS.SOLD;
    }

    async waitForAuctionToStart(timeoutMs = 200000, intervalMs = 500): Promise<void> {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            const status = await this.getAuctionStatus();
            console.log(`Auction status: ${status}`);
            if (AUCTION_STATUS.ACTIVE === status) return;
            await this.page.waitForTimeout(intervalMs);
        }
        const finalStatus = await this.getAuctionStatus();
        throw new Error(`Timed out waiting for auction to start; last status: ${finalStatus}`);
    }


    // ==================== TEXT GETTERS / VISIBILITY CHECKS (convenience)
    async getStatusForDepositAuctionText(): Promise<string> {
        const root = await this.resolveBiddingContainerLocator();
        if (this.isMobile) {
            return (await root.getByTestId('cav-auction-deposit-status-mobile').innerText()).trim();
        }
        return (await root.getByTestId('cav-auction-deposit-status-desktop').innerText()).trim();
    }

    async getStatusForGruaranteeAuctionText(): Promise<string> {
        const root = await this.resolveBiddingContainerLocator();
        if (this.isMobile) {
            return (await root.getByTestId('cav-auction-guarantee-status-mobile').innerText()).trim();
        }
        return (await root.getByTestId('cav-auction-guarantee-status-desktop').innerText()).trim();

    }

    async getCountdownText(): Promise<string> {
        const locInProgress = await this.resolveCountDownInProgressAuctionLocator();
        if (0 < await locInProgress.count()) {
            return (await locInProgress.innerText()).trim();
        }

        const locScheduled = await this.resolveCountdownScheduledAuctionLocator();
        if (0 < await locScheduled.count()) {
            return (await locScheduled.innerText()).trim();
        }

        const locNew = await this.resolveCountdownNewauctionLocator();
        if (0 < await locNew.count()) {
            return (await locNew.innerText()).trim();
        }

        return '';

    }

    async getStartPriceText(): Promise<string> {
        if (this.isMobile) {
            return (await this.biddingContainerMobileLocator.getByTestId('cav-auction-starting-bid-value-mobile').innerText()).trim();;
        }
        return (await this.biddingContainerDesktopLocator.getByTestId('cav-auction-starting-bid-value').first().innerText()).trim();
    }

    async getReservedPriceLabelText(): Promise<string> {
        const root = await this.resolveBidNowButtonLocator();
        const loc = root.locator('text=/Preț de rezervă/i').first();
        if (0 === await loc.count()) return '';
        return (await loc.innerText()).trim();
    }

    async isAuctionBreakdownLinkVisible(): Promise<boolean> {
        const loc = await this.resolvePaymentBreakdownLinkLocator();
        return 0 < (await loc.count()) && await loc.isVisible();
    }

    async getOffersCountText(): Promise<string> {
        const loc = await this.resolveOffersCountLocator();
        if (0 === await loc.count()) return '';
        return (await loc.innerText()).trim();
    }

    async isBiddersHistoryLinkVisible(): Promise<boolean> {
        const loc = await this.resolveSeeHistoryLinkLocator();
        return 0 < (await loc.count()) && await loc.isVisible();
    }

    async getParticipantsCountText(): Promise<string> {
        const loc = await this.resolveParticipantsCountLocator();
        if (0 === await loc.count()) return '';
        return (await loc.innerText()).trim();
    }

    async getFollowersCountText(): Promise<string> {
        const loc = await this.resolveFollowersCountLocator();
        if (0 === await loc.count()) return '';
        return (await loc.innerText()).trim();
    }

    // async getCountdownText(): Promise<string> {
    //     const loc = await this.resolveBidNowButtonLocator();
    //     if (0 === await loc.count()) return '';
    //     return (await loc.innerText()).trim();
    // }

    async getStartingPriceText(): Promise<string> {
        const loc = await this.resolveStartingBidPriceLocator();
        if (0 === await loc.count()) return '';
        return (await loc.nth(1).innerText()).trim();
    }

    async findFirstCurrencyText(): Promise<string> {
        const currencyRegex = /[\d\.,\s]+(?:\u00A0|\s)?(?:EUR|RON|USD|GBP|€|\$|£)/i;
        const root = await this.resolveBidNowButtonLocator();
        const candidates = root.locator('p');
        const count = await candidates.count();
        for (let i = 0; i < count; i++) {
            const txt = (await candidates.nth(i).innerText()).trim();
            if (currencyRegex.test(txt)) return txt;
        }
        return '';
    }

    async getOffersCount(): Promise<number> {
        const loc = await this.resolveOffersCountLocator();
        if (0 === await loc.count()) return 0;
        const text = (await loc.innerText()).trim();
        const m = text.match(/(\d+)/);
        return m ? parseInt(m[1], 10) : 0;
    }

    async getParticipantsCount(): Promise<number> {
        const loc = await this.resolveParticipantsCountLocator();
        if (0 === await loc.count()) return 0;
        const text = (await loc.innerText()).trim();
        const m = text.match(/(\d+)/);
        return m ? parseInt(m[1], 10) : 0;
    }

    async getFollowersCount(): Promise<number> {
        const loc = await this.resolveFollowersCountLocator();
        if (0 === await loc.count()) return 0;
        const text = (await loc.innerText()).trim();
        const m = text.match(/(\d+[\d\.,]*)/);
        if (!m) return 0;
        return parseInt(m[1].replace(/[\.,\s]/g, ''), 10);
    }
}

export default AuctionBiddingComponent;
