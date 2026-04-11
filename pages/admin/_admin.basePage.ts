import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { config } from '../../config/env.config';

/**
 * Base class for all Admin-side pages
 * Provides baseUrl from environment config
 */
export abstract class AdminPage extends BasePage {
    
    // ==================== BASE URL ====================
    /**
     * Base URL for admin pages from environment config
     */
    protected get baseUrl(): string {
        return config.admin.baseUrl;
    }

    constructor(page: Page) {
        super(page);
    }
}
