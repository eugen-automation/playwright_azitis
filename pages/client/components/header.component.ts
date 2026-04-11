import { Locator, Page } from '@playwright/test';
import { BaseComponent } from './_base.component.page';

export class HeaderComponent extends BaseComponent {
    
    constructor(page: Page) {
        super(page);
    }

    // ==================== ROOT LOCATORS ====================
    get headerRoot(): Locator {
        return this.page.locator('#main-navbar');
    }

    private get logoLinkDesktop(): Locator {
        return this.headerRoot.getByTestId('ch-logo-desktop');
    }

    private get categoriesDropdownDesktop(): Locator {
        return this.headerRoot.getByText('Categorii').first();
    }

    private get menuButtonMobile(): Locator {
        return this.headerRoot.locator('button[data-testid="ch-menu-button-mobile"]');
    }

    private get currencySelectorDesktop(): Locator {
        return this.headerRoot.getByTestId('ch-currency');
    }

    private get favouritesLinkDesktop(): Locator {
        return this.headerRoot.getByTestId('ch-favourites-desktop');
    }

    // ==================== GUEST LOCATORS ====================
    private get loginLinkDesktop(): Locator {
        return this.headerRoot.getByRole('link', { name: 'Intră în cont' });
    }

    private get registrationLinkDesktop(): Locator {
        return this.headerRoot.getByRole('link', { name: 'Cont nou' });
    }

    private get loginLinkMobile(): Locator {
        return this.headerRoot.getByTestId('ch-login-link-mobile');
    }

    // ==================== AUTHENTICATED LOCATORS ====================
    private get favoritesCounterDesktop(): Locator {
        return this.headerRoot.getByTestId('ch-favourites-count-desktop');
    }

    private get userBadgeDesktop(): Locator {
        return this.headerRoot.getByTestId('ch-account-dropdown-desktop');
    }

    private get userBadgeMobile(): Locator {
        return this.headerRoot.getByTestId('ch-user-menu-mobile');        
    }

    private get userBadgeBuyerTypeDesktop(): Locator {
        return this.headerRoot.getByTestId('ch-user-type-desktop');
    }

    private get userBadgeBuyerTypeMobile(): Locator {
        return this.headerRoot.getByTestId('ch-buyer-type-mobile');
    }

    private get userBadgeBuyerInitialsDesktop(): Locator {
        return this.headerRoot.getByTestId('ch-user-initials-desktop');
    }

    private get userBadgeBuyerInitialsMobile(): Locator {
        return this.headerRoot.getByTestId('ch-user-initials-mobile');
    }

    private get userDropdownMenu(): Locator {
        return this.headerRoot.getByTestId('ch-user-dropdown-button');
    }

    private get searchbox(): Locator {
        return this.headerRoot.getByRole('searchbox', { name: 'Caută' });
    }

    // ==================== ACTION HELPERS ====================
    private currentLoginLocator(): Locator {
        return this.isMobile ? this.loginLinkMobile : this.loginLinkDesktop;
    }

    private currentUserBadge(): Locator {
        return this.isMobile ? 
            this.userBadgeMobile : 
            this.userBadgeDesktop;
    }

    private currentBuyerType(): Locator {
        return this.isMobile ? this.userBadgeBuyerTypeMobile : this.userBadgeBuyerTypeDesktop;
    }

    private currentBuyerInitials(): Locator {
        return this.isMobile
            ? this.userBadgeBuyerInitialsMobile
            : this.userBadgeBuyerInitialsDesktop;
    }

    // ==================== VISIBILITY HELPERS ====================
    async waitForUserBadgeVisible(timeout = 5000): Promise<boolean> {
        try {
            await this.currentUserBadge().waitFor({ state: 'visible', timeout });
            return true;
        } catch (err) {
            return false;
        }
    }

    async isUserBadgeVisible(): Promise<boolean> {
        return this.currentUserBadge().isVisible();
    }

    async isUserBadgeDropDownVisible(timeout = 2000): Promise<boolean> {
        try {
            await this.userDropdownMenu.waitFor({ state: 'visible', timeout });
            return true;
        } catch {
            return false;
        }
    }

    async isLoginLinkVisible(): Promise<boolean> {
        return this.currentLoginLocator().isVisible();
    }

    // ==================== ACTIONS ====================
    async clickLoginLink(): Promise<void> {
        await this.currentLoginLocator().click();
    }

    async clickRegistrationLink(): Promise<void> {
        if (! this.isMobile) {
            await this.registrationLinkDesktop.click();
        }
    }

    async clickUserBadgeDropdown(): Promise<void> {
        await this.currentUserBadge().click();
    }

    async clickCategoriesDropdown(): Promise<void> {
        await this.categoriesDropdownDesktop.click();
    }

    async clickLogo(): Promise<void> {
        await this.logoLinkDesktop.click();
    }

    async setCurrency(currency: string): Promise<void> {
        if (! this.isMobile) {
            await this.currencySelectorDesktop.selectOption({ label: currency });
        }
    }

    // ==================== ACTION METHODS ====================
    async selectUserMenuAndWait(menuText: string, expectedUrl?: string, timeout = 10000): Promise<void> {
        await this.clickUserBadgeDropdown();
        await this.userDropdownMenu.waitFor({ state: 'visible', timeout }).catch(() => { });

        let menuItem = this.userDropdownMenu.getByRole('link', { name: menuText });
        if (0 === (await menuItem.count())) {
            menuItem = this.userDropdownMenu.getByRole('menuitem', { name: menuText });
        }
        if (0 === (await menuItem.count())) {
            menuItem = this.headerRoot.getByText(menuText).first();
        }

        if (0 === (await menuItem.count())) {
            await this.page.waitForTimeout(200);
            menuItem = this.headerRoot.getByText(menuText).first();
        }

        if (0 === (await menuItem.count())) {
            throw new Error(`Menu item with text "${menuText}" not found in user dropdown`);
        }

        await menuItem.click();

        if (expectedUrl) {
            const safe = expectedUrl.replace(/[.*+?^${}()|[\\]\]/g, '\\$&');
            await this.page.waitForURL(new RegExp(safe), { timeout }).catch(() => { });
        }
    }

    // ==================== ARIA SNAPSHOTS ====================
    private readonly guestDesktopAriaSnapshot = `
- link
- text: Categorii
- img
- text: /.*/
- link "Intră în cont"
- link "Cont nou"
`;

    private readonly guestMobileAriaSnapshot = `
- navigation:
  - img
  - link:
    - /url: /
    - img
  - link:
    - /url: /autentificare?redirect=profile-favourites
    - img
  - link:
    - /url: /autentificare
    - img
`;

    private readonly loggedInDesktopAriaSnapshotWithoutSearch = `
- navigation:
  - link:
    - /url: /
    - img
  - text: Categorii
  - img
  - text: /.*/
  - link:
    - /url: /favorite
    - img
  - text: /^(PF|PJ)$/
  - paragraph: /^[A-Z0-9]{1,3}$/
  - paragraph: /.+/
  - img
`;

    private readonly loggedInDesktopAriaSnapshotWithSearch = `
- navigation:
  - link:
    - /url: /
    - img
  - text: Categorii
  - img
  - img
  - searchbox "Caută"
  - text: /.*/
  - link:
    - /url: /favorite
    - img
  - text: /^(PF|PJ)$/
  - paragraph: /^[A-Z0-9]{1,3}$/
  - paragraph: /.+/
  - img
`;

    private readonly loggedInMobileAriaSnapshot = `
- navigation:
    - img
    - link:
        - /url: /
        - img
    - link:
        - /url: /favorite
        - img
    - text: /^(PF|PJ)$/
    - paragraph: /^[A-Z0-9]{1,3}$/
`;

    getGuestAriaSnapshot(): string {
        return this.isMobile ? this.guestMobileAriaSnapshot : this.guestDesktopAriaSnapshot;
    }

    async getLoggedInAriaSnapshot(): Promise<string> {
        if (this.isMobile) {
            return this.loggedInMobileAriaSnapshot;
        }

        const hasSearch = 0 < (await this.searchbox.count());
        return hasSearch
            ? this.loggedInDesktopAriaSnapshotWithSearch
            : this.loggedInDesktopAriaSnapshotWithoutSearch;
    }
}
