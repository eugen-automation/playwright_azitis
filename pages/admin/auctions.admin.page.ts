import { BasePage } from '../base.page';
// import { Page } from '@playwright/test';


export class AuctionsPage extends BasePage {
    protected get baseUrl(): string {
        throw new Error('Method not implemented.');
    }
    urlSpecificPath: string;

}
