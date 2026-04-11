import { test, Locator, Page } from '@playwright/test';


export abstract class BaseComponent {
    // ==================== PROPERTIES ====================
    readonly page: Page;
    readonly isMobile: boolean;
    // readonly MOBILE_BREAKPOINT = MOBILE_BREAKPOINT; /* Below this = mobile, at/above = desktop */

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        this.page = page;
        const projectName = test.info().project.name;
        this.isMobile = projectName.toLowerCase().includes('mobile');
    }



    // ==================== VIEWPORT HELPERS ====================
    // private getViewportSize(): { width: number; height: number } | null {
    //     return this.page.viewportSize();
    // }

    // isMobileView(): boolean {
    //     const viewportSize = this.getViewportSize();
    //     return viewportSize ? viewportSize.width < this.MOBILE_BREAKPOINT : false;
    // }

    // isDesktopView(): boolean {
    //     return !this.isMobileView();
    // }

    // getViewportType(): 'mobile' | 'desktop' {
    //     return this.isMobileView() ? 'mobile' : 'desktop';
    // }

    // ==================== COMPONENT INTERACTIONS ====================
    async isComponentVisible(locator: Locator): Promise<boolean> {
        return await locator.isVisible();
    }

    async waitForComponentVisible(locator: Locator, timeout: number = 5000): Promise<void> {
        await locator.waitFor({ state: 'visible', timeout });
    }

    async waitForComponentHidden(locator: Locator, timeout: number = 5000): Promise<void> {
        await locator.waitFor({ state: 'hidden', timeout });
    }
}