import { ClientPage } from '../_client.basePage';
import { Locator, Page } from '@playwright/test';
import { AccountSidebarComponent } from '../components/account-sidebar.component';
import { HeaderComponent } from '../components/header.component';

/**
 * Deposits page - Depozit
 * Path: /panou-de-control/depozit
 */
export class DepositsPage extends ClientPage {
    // ==================== PAGE CONSTANTS ====================
    readonly urlSpecificPath = '/tranzactii';
    readonly pageTitle = 'Depozitul meu | Azitis';

    // ==================== COMPONENTS ====================
    readonly header: HeaderComponent;
    readonly accountSidebar: AccountSidebarComponent;

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);

        this.accountSidebar = new AccountSidebarComponent(page);
        this.header = new HeaderComponent(page);
    }

    // ==================== PRIVATE LOCATORS ====================
    private get titleLocator(): Locator {
        return this.page.getByRole('heading', { name: 'Tranzacții' });
    }

    private get totalDepositLabelLocator(): Locator {
        return this.page.getByTestId('cacc-deposit-total-amount-label');
    }

    private get totalDepositValueLocator(): Locator {
        return this.page.getByTestId('cacc-deposit-amount-value');
    }

    private get addDepositButtonLocator(): Locator {
        return this.page.getByRole('button', { name: 'Adaugă sumă' }).or(this.page.getByTestId('cacc-deposit-add-button'));
    }

    private get withdrawDepositButtonLocator(): Locator {
        return this.page.getByTestId('cacc-deposit-withdraw-button');
    }

    private get initialDepositInfoTitleLocator(): Locator {
        return this.page.getByRole('heading', { name: 'Depozit 0 RON' });
    }

    private get initialDepositInfoTextLocator(): Locator {
        return this.page.getByText('Depozitul tău inițial este de');
    }

    // ==================== PAGE STATE HELPERS ====================
    async waitForVisible(timeout = 10000): Promise<void> {
        await this.waitForLayoutAndHeading(this.titleLocator, timeout);
    }

    async waitForPageLoad(timeout = 15000): Promise<void> {
        await super.waitForPageLoad();
        await this.waitForVisible(timeout);
    }

    // ==================== TEXT GETTERS ====================
    async getTotalDepositValueText(): Promise<string> {
        return (await this.totalDepositValueLocator.textContent())?.trim() || '';
    }

    async getTotalDepositLabelText(): Promise<string> {
        return (await this.totalDepositLabelLocator.textContent())?.trim() || '';
    }

    // ==================== CLICK ACTIONS ====================
    async clickAddDepositButton(): Promise<void> {
        await this.addDepositButtonLocator.click();
    }

    async clickWithdrawDepositButton(): Promise<void> {
        await this.withdrawDepositButtonLocator.click();
    }

    // ==================== VISIBILITY CHECKS ====================
    async isTitleVisible(): Promise<boolean> {
        return await this.titleLocator.isVisible();
    }

    async isAddDepositButtonVisible(): Promise<boolean> {
        return await this.addDepositButtonLocator.isVisible();
    }

    async isWithdrawDepositButtonVisible(): Promise<boolean> {
        return await this.withdrawDepositButtonLocator.isVisible();
    }

    async isInitialDepositInfoVisible(): Promise<boolean> {
        return await this.initialDepositInfoTitleLocator.isVisible();// &&
        //    await this.initialDepositInfoTextLocator.isVisible();
    }

    // ==================== NAVIGATION ====================
    async openDepositsPage(): Promise<void> {
        await this.page.goto(this.urlSpecificPath, { waitUntil: 'domcontentloaded' });
    }
}