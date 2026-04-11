import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { config } from '../../config/env.config';

/**
 * Base class for all Client-side pages
 * Provides baseUrl from environment config and common page patterns
 */
export abstract class ClientPage extends BasePage {
    
    // ==================== BASE URL ====================
    /**
     * Base URL for client pages from environment config
     */
    protected get baseUrl(): string {
        return config.client.baseUrl;
    }

    // ==================== COMMON LOCATORS ====================
    /**
     * Standard layout container used across most client pages
     * ID: __layout
     */
    protected get layoutAreaLocator(): Locator {
        return this.page.locator('[id="__layout"]');
    }

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
    }

    // ==================== COMMON WAIT HELPERS ====================
    /**
     * Wait for the page layout area and primary heading to be visible
     * Call from subclass waitForVisible() if applicable
     * @param headingLocator - The heading locator to wait for (optional for custom implementations)
     */
    protected async waitForLayoutAndHeading(headingLocator?: Locator, timeout: number = 10000): Promise<void> {
        await this.layoutAreaLocator.waitFor({ state: 'visible', timeout });
        if (headingLocator) {
            await headingLocator.waitFor({ state: 'visible', timeout });
        }
    }
}
