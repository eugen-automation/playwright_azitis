import { ClientPage } from './_client.basePage';
import { Locator, Page } from '@playwright/test';

export class LoginPage extends ClientPage {
    // ==================== PAGE CONSTANTS ====================
    readonly pageTitle = 'Autentificare | Azitis';
    readonly urlSpecificPath = '/autentificare';
    readonly urlPathAfterSuccessfulLogin = '/dashboard';

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
    }

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

    // ==================== PRIVATE LOCATORS ====================
    private get emailInputLocator(): Locator {
        return this.page.locator('input[type="email"]');
    }

    private get passwordInputLocator(): Locator {
        return this.page.locator('input[type="password"]');
    }

    private get loginButtonLocator(): Locator {
        return this.page.getByRole('button', { name: 'Intră în cont' });
    }

    private get forgotPasswordLinkLocator(): Locator {
        return this.page.getByRole('link', { name: 'Ai uitat parola?' });
    }

    private get registerLinkLocator(): Locator {
        return this.page.getByRole('link', { name: 'Înregistrează-te' });
    }

    private get errorMessageLocator(): Locator {
        return this.page.locator('.bg-red-200');
    }

    private get googleLoginButtonLocator(): Locator {
        return this.page.getByRole('button', { name: /Google/i });
    }

    private get facebookLoginButtonLocator(): Locator {
        return this.page.getByRole('button', { name: /Facebook/i });
    }

    private get appleLoginButtonLocator(): Locator {
        return this.page.getByRole('button', { name: /Apple/i });
    }

    private get mainHeadingLocator(): Locator {
        return this.page.getByRole('heading', { name: /Autentificare/i, level: 1 });
    }

    private get alreadyHaveAccountTextLocator(): Locator {
        return this.page.getByText(/(Ai cont deja\?|Nu ai cont\?)/i);
    }

    private get copyrightTextLocator(): Locator {
        return this.page.getByText(/Copyright © 2026 azitis\. Toate drepturile rezervate\./);
    }

    private get backgroundImageLocator(): Locator {
        return this.page.locator('img[alt="Authentication background"]');
    }

    // ==================== PAGE STATE HELPERS ====================
    async waitForVisible(timeout = 10000): Promise<void> {
        await this.waitForLayoutAndHeading(this.mainHeadingLocator, timeout);
    }

    // ==================== VISIBILITY CHECKS ====================
    async isMainHeadingVisible(): Promise<boolean> {
        return await this.mainHeadingLocator.isVisible().catch(() => false);
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





    // ==================== NAVIGATION METHODS ====================
    async openLoginPage(): Promise<void> {
        await this.page.goto(this.urlSpecificPath, { waitUntil: 'domcontentloaded' });
    }

    async waitForPageLoad(timeout = 15000): Promise<void> {
        await super.waitForPageLoad();
        await this.waitForVisible(timeout);

        if (!(await this.isMainHeadingVisible())) {
            throw new Error('Login page did not render its main heading within 15 seconds');
        }
    }

    // ==================== CLICK ACTIONS ====================
    async clickLoginButton(): Promise<void> {
        await this.loginButtonLocator.click();
    }

    async clickGoogleLoginButton(): Promise<void> {
        await this.googleLoginButtonLocator.click();
    }

    async clickFacebookLoginButton(): Promise<void> {
        await this.facebookLoginButtonLocator.click();
    }

    async clickAppleLoginButton(): Promise<void> {
        await this.appleLoginButtonLocator.click();
    }

    async clickForgotPasswordLink(): Promise<void> {
        await this.forgotPasswordLinkLocator.click();
    }

    async clickRegisterLink(): Promise<void> {
        await this.registerLinkLocator.click();
    }

    private async fillCredentials(email: string, password: string): Promise<void> {
        await this.emailInputLocator.fill(email);
        console.log('Filling email input', email);
        await this.passwordInputLocator.fill(password);
        console.log('Filling password input', password);
    }

    async login(email: string, password: string): Promise<void> {
        await this.fillCredentials(email, password);
        await this.clickLoginButton();
        // Allow a longer timeout for navigation after login and let failures surface
        await this.page.waitForURL(new RegExp(`.*${this.urlPathAfterSuccessfulLogin}.*`), { timeout: 30000 });
    }

    async attemptLogin(email: string, password: string): Promise<void> {
        await this.fillCredentials(email, password);
        await this.clickLoginButton();
        await this.page.waitForTimeout(1000);
    }

    // ==================== TEXT GETTERS ====================
    getErrorMessageLocator(text: string): Locator {
        return this.page.getByText(text, { exact: true });
    }

    async getDisplayedErrorText(): Promise<string> {
        return (await this.errorMessageLocator.textContent()) || '';
    }

    async getErrorMessages(): Promise<string[]> {
        const errorElements = await this.errorMessageLocator.all();
        const messages: string[] = [];
        for (const element of errorElements) {
            const text = await element.textContent();
            if (text) messages.push(text.trim());
        }
        return messages;
    }

    // ==================== VISIBILITY CHECKS ====================
    async hasAnyError(): Promise<boolean> {
        return await this.errorMessageLocator.isVisible().catch(() => false);
    }

    async isErrorMessageVisible(message: string): Promise<boolean> {
        return await this.getErrorMessageLocator(message).isVisible();
    }

    // ==================== HELPER METHODS ====================
    async isLoggedIn(): Promise<boolean> {
        return this.page.url().includes(this.urlPathAfterSuccessfulLogin);
    }
}
