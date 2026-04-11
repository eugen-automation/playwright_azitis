import { Page, test } from '@playwright/test';



export abstract class BasePage {

    // ==================== PROPERTIES ====================
    readonly page: Page;
    readonly isMobile: boolean;

    // ==================== ABSTRACT PROPERTIES ====================
    protected abstract get baseUrl(): string;
    abstract readonly urlSpecificPath: string;

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        this.page = page;
        const projectName = test.info().project.name;
        this.isMobile = projectName.toLowerCase().includes('mobile');
    }

    // ==================== PRIVATE HELPERS ====================
    private getElementLocator(selector: string) {
        return this.page.locator(selector);
    }

    // ==================== URL GETTERS ====================
    get fullUrl(): string {
        return `${this.baseUrl}${this.urlSpecificPath}`;
    }

    // ==================== NAVIGATION ACTIONS ====================
    async goto(url: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await this.page.goto(url, { waitUntil });
    }

    async reload(): Promise<void> {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
    }

    async waitForPageLoad(): Promise<void> {
        try {
            await Promise.all([
                this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }),
                this.page.waitForLoadState('load', { timeout: 15000 })
            ]);
        } catch (err) {
            throw new Error('Page did not load within 15 seconds', err);
        }
    }

    async waitForUrl(urlPattern: string | RegExp, timeout: number = 10000): Promise<void> {
        await this.page.waitForURL(urlPattern, { timeout });
    }

    // ==================== PAGE INFO GETTERS ====================
    async getPageTitle(): Promise<string> {
        return await this.page.title();
    }

    async getCurrentUrl(): Promise<string> {
        return this.page.url();
    }

    // ==================== SCREENSHOT ACTIONS ====================
    async takeSnapshot(name: string): Promise<void> {
        await this.page.screenshot({ path: `./screenshots/${name}.png` });
    }

    async takeFullPageSnapshot(name: string): Promise<void> {
        await this.page.screenshot({
            path: `./screenshots/${name}.png`,
            fullPage: true
        });
    }

    async takeElementSnapshot(selector: string, name: string): Promise<void> {
        const element = this.getElementLocator(selector);
        await element.screenshot({ path: `./screenshots/${name}.png` });
    }

    // ==================== VIEWPORT HELPERS ====================
    // async isMobileView(): Promise<boolean> {
    //     const viewport = this.page.viewportSize();
    //     return viewport ? viewport.width < this.MOBILE_BREAKPOINT : false;
    // }

    // async isDesktopView(): Promise<boolean> {
    //     const viewport = this.page.viewportSize();
    //     return viewport ? viewport.width >= this.MOBILE_BREAKPOINT : true;
    // }

    // async getViewportType(): Promise<'mobile' | 'desktop'> {
    //     const viewport = this.page.viewportSize();
    //     if (!viewport) return 'desktop';
    //     return viewport.width < this.MOBILE_BREAKPOINT ? 'mobile' : 'desktop';
    // }

    async getViewportSize(): Promise<{ width: number; height: number } | null> {
        return this.page.viewportSize();
    }

    // ==================== ELEMENT INTERACTION HELPERS ====================
    // async scrollToElement(selector: string): Promise<void> {
    //     await this.getElementLocator(selector).scrollIntoViewIfNeeded();
    // }

    // async waitForSelector(selector: string, timeout: number = 10000): Promise<void> {
    //     await this.page.waitForSelector(selector, { timeout });
    // }

    // async isElementVisible(selector: string): Promise<boolean> {
    //     return await this.getElementLocator(selector).isVisible().catch(() => false);
    // }

    // async getElementText(selector: string): Promise<string> {
    //     return (await this.getElementLocator(selector).textContent()) || '';
    // }

    // async clickElement(selector: string): Promise<void> {
    //     await this.getElementLocator(selector).click();
    // }
}