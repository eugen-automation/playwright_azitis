import { Page, Locator } from '@playwright/test';
import { AdminPage } from './_admin.basePage';


export class LoginPage extends AdminPage {

    // ==================== PAGE CONSTANTS ====================
    readonly pageTitle = 'Autentificare | Azitis';
    readonly urlSpecificPath = '/auth/login';
    readonly urlPathAfterSuccessfulLogin = '/admin/practitioners';



    // ==================== ERROR MESSAGES ====================
    readonly ERROR_MESSAGES = {
        EMAIL: {
            REQUIRED: 'Adresa de email este obligatorie',
            INVALID_FORMAT: 'Adresa de email nu este validă',
            NOT_FOUND: 'Acest email nu este înregistrat'
        },
        PASSWORD: {
            REQUIRED: 'Parola este obligatorie',
            MIN_LENGTH: 'Parola trebuie să aibă între 8 și 255 caractere',
            MAX_LENGTH: 'Parola trebuie să aibă între 8 și 255 caractere',
            WEAK: 'Parola este prea slabă'
        },
        LOGIN: {
            INVALID_CREDENTIALS: 'Credențialele specificate nu sunt valide',
            ACCOUNT_DISABLED: 'Contul este dezactivat',
            ACCOUNT_LOCKED: 'Contul este blocat',
            TOO_MANY_ATTEMPTS: 'Prea multe încercări. Încercați mai târziu'
        }
    } as const;

    // ==================== LOCATORS ====================
    private get emailInput(): Locator {
        return this.page.locator('input[type="email"]');
    }

    private get passwordInput(): Locator {
        return this.page.locator('input[type="password"]');
    }

    private get loginButton(): Locator {
        return this.page.getByRole('button', { name: 'Autentificare' });
    }

    private get forgotPasswordLink(): Locator {
        return this.page.getByRole('link', { name: 'Ai uitat parola?' });
    }

    private get errorMessageElement(): Locator {
        return this.page.locator('.bg-red-200');
    }

    private get layoutArea(): Locator {
        return this.page.locator('[id="__layout"]');
    }

    // ==================== ARIA SNAPSHOTS ====================
    readonly errorMessageAreaSnapshot = `
        - text: Error
        - paragraph: Credențialele specificate nu sunt valide
        - img
    `;

    readonly loginPageAreaSnapshot = `
      - banner:
        - link:
          - /url: /
          - img
        - heading "Autentificare" [level=1]
        - heading "Aici te poți autentifica în contul tău." [level=4]
      - textbox
      - text: Email
      - textbox
      - text: Parolă
      - img
      - link "Ai uitat parola?":
        - /url: /initiere-resetare-parola
      - button "Intră în cont":
        - paragraph: Intră în cont
      - text: Nu ai cont?
      - link "Înregistrează-te":
        - /url: /inregistrare
      - button "Continuă cu Google":
        - img
        - paragraph: Continuă cu Google
      - button "Continuă cu Facebook":
        - img
        - paragraph: Continuă cu Facebook
      - button "Continuă cu Apple":
        - img
        - paragraph: Continuă cu Apple
      - contentinfo:
        - paragraph: /Copyright © \\d+ azitis\\. Toate drepturile rezervate\\./
    `;

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
    }

    // ==================== NAVIGATION METHODS ====================
    async openLoginPage() {
        await this.page.goto(this.urlSpecificPath, { waitUntil: 'domcontentloaded' });
    }

    async waitForPageLoad() {
        await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForLoadState('domcontentloaded')
        ]);
    }

    // ==================== ACTION METHODS ====================
    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
        await this.page.waitForURL(new RegExp(`.*${this.urlPathAfterSuccessfulLogin}.*`), { timeout: 10000 });
    }

    // ==================== HELPER METHODS ====================
    async isLoggedIn(): Promise<boolean> {
        return this.page.url().includes(this.urlPathAfterSuccessfulLogin);
    }

    getErrorMessage(text: string) {
        return this.page.getByText(text, { exact: true });
    }

    async getDisplayedErrorText(): Promise<string> {
        return await this.errorMessageElement.textContent() || '';
    }

    async isErrorMessageVisible(message: string): Promise<boolean> {
        return await this.getErrorMessage(message).isVisible();
    }

    async getErrorMessages(): Promise<string[]> {
        const errorElements = await this.page.locator('.bg-red-200').all();
        const messages: string[] = [];
        for (const element of errorElements) {
            const text = await element.textContent();
            if (text) messages.push(text.trim());
        }
        return messages;
    }

    async hasAnyError(): Promise<boolean> {
        return await this.errorMessageElement.isVisible().catch(() => false);
    }
}
