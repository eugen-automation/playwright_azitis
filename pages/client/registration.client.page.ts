import { faker } from '@faker-js/faker';
import { ClientPage } from './_client.basePage';
import { Locator, Page } from '@playwright/test';
import { config } from '../../config/env.config';
import type { CreateBuyerPayload } from '@utils/interfaces/client/register.interface';
import BUYER_TYPE_VALUE from '@utils/constants/buyer.constants';


export class RegistrationPage extends ClientPage {

    // ==================== PAGE CONSTANTS ====================
    readonly pageTitle = 'Înregistrare | Azitis';
    readonly registrationSuccessTitle = 'Înregistrare - Email | Azitis';
    readonly urlSpecificPath = '/inregistrare';
    readonly registrationSuccessUrl = '/open-mail';


    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
    }

    // ==================== PRIVATE LOCATORS ====================

    get rootLocator(): Locator {
        return this.page.locator('[id="__layout"]');
    }

    private get persoanaFizicaLocator(): Locator {
        return this.rootLocator.getByText('Persoană Fizică');
    }

    private get persoanaJuridicaRomanaLocator(): Locator {
        return this.rootLocator.getByText('Persoană Juridică Română');
    }

    private get formElemLocator(): Locator {
        return this.rootLocator.locator('form');
    }

    private get surenameInputLocator(): Locator {
        return this.rootLocator.getByText('Prenume').locator('..').locator('input');
    }

    private get nameInputLocator(): Locator {
        return this.rootLocator.getByText('Nume', { exact: true }).locator('..').locator('input');
    }

    private get emailInputLocator(): Locator {
        return this.rootLocator.getByText('Email', { exact: true }).locator('..').locator('input');
    }

    private get passwordInputLocator(): Locator {
        return this.rootLocator.getByText('Parolă', { exact: true }).locator('..').locator('input');
    }

    private get passwordConfirmationInputLocator(): Locator {
        return this.rootLocator.getByText('Confirmă parola').locator('..').locator('input');
    }

    private get amCititCheckboxLocator(): Locator {
        return this.rootLocator.getByRole('checkbox', { name: 'Am citit si sunt de acord cu' });
    }

    private get suntDeAcordCheckboxLocator(): Locator {
        return this.rootLocator.getByRole('checkbox', { name: 'Sunt de acord cu prelucrarea' });
    }

    private get registrationSuccessMessageLocator(): Locator {
        return this.rootLocator.locator('.bg-green-200');
    }

    private get registerButtonLocator(): Locator {
        return this.rootLocator.getByRole('button', { name: 'Înregistrează-te' });
    }

    private get mainHeadingLocator(): Locator {
        return this.rootLocator.getByRole('heading', { name: /Creează cont/i, level: 1 });
    }

    private get cuiLabelLocator(): Locator {
        return this.rootLocator.getByLabel('CUI');
    }

    private get cuiPlaceholderLocator(): Locator {
        return this.rootLocator.getByPlaceholder('CUI').or(this.rootLocator.getByText('CUI').or(this.rootLocator.getByRole('textbox').first()));
    }

    // ==================== ARIA SNAPSHOTS ====================
    readonly cuiAreaSnapshot = `
        - paragraph: Date companie
        - textbox
        - text: CUI
    `;

    readonly registrationSuccessPageAreaSnapshot = `
        - text: Success
        - paragraph: Un email de activare a fost trimis la adresa specificată
        - img
        - banner:
          - link:
            - /url: /
            - img
          - img
          - text: Înapoi
          - heading "Verifică-ți email-ul" [level=1]
          - heading "Pentru a avea acces în platformă, e necesar să-ți activezi contul. Ți-am trimis un mesaj. Verifică-ți adresa de e-mail și accesează link-ul primit." [level=4]
        - link "Deschide Gmail":
          - /url: https://gmail.com
          - img
          - text: Deschide Gmail
        - link "Deschide Outlook":
          - /url: https://outlook.office.com/mail/
          - img
          - text: Deschide Outlook
        - contentinfo:
          - paragraph: Copyright © 2026 azitis. Toate drepturile rezervate.
    `;

    readonly registrationPageAreaSnapshot = `
        - banner:
          - link:
            - /url: /
            - img
          - heading "Creează cont" [level=1]
        - text: Persoană Fizică Persoană Juridică Română
        - heading "Pentru a putea fi acceptat la licitații, asigură-te că datele introduse sunt corecte și reale." [level=4]
        - textbox
        - text: Prenume
        - textbox
        - text: Nume
        - textbox
        - text: Email
        - textbox
        - text: Parolă
        - img
        - textbox
        - text: Confirmă parola
        - img
        - checkbox "Am citit si sunt de acord cu"
        - text: Am citit si sunt de acord cu
        - link "Termenii și Condițiile":
          - /url: /termeni-si-conditii
        - checkbox "Sunt de acord cu prelucrarea datelor în conformitate cu"
        - text: Sunt de acord cu prelucrarea datelor în conformitate cu
        - link "Politica de Prelucrare a datelor cu caracter personal":
          - /url: /politica-de-confidentialitate
        - button "Înregistrează-te":
          - paragraph: Înregistrează-te
        - button "Continuă cu Google":
          - img
          - paragraph: Continuă cu Google
        - button "Continuă cu Facebook":
          - img
          - paragraph: Continuă cu Facebook
        - button "Continuă cu Apple":
          - img
          - paragraph: Continuă cu Apple
        - text: Ai cont deja?
        - link "Intră în cont":
          - /url: /autentificare
        - contentinfo:
          - paragraph: /Copyright © \\d+ azitis\\. Toate drepturile rezervate\\./
    `;


    // ==================== PAGE STATE HELPERS ====================
    async waitForVisible(timeout = 10000): Promise<void> {
        await this.waitForLayoutAndHeading(this.mainHeadingLocator, timeout);
    }

    async isMainHeadingVisible(): Promise<boolean> {
        return await this.mainHeadingLocator.isVisible().catch(() => false);
    }

    // ==================== NAVIGATION METHODS ====================
    async openRegistrationPage(): Promise<void> {
        await this.page.goto(this.urlSpecificPath, { waitUntil: 'domcontentloaded' });
    }

    async waitForPageLoad(timeout = 15000): Promise<void> {
        await super.waitForPageLoad();
        await this.waitForVisible(timeout);

        if (!(await this.isMainHeadingVisible())) {
            throw new Error('Registration page did not render its main heading within 15 seconds');
        }
    }

    // ==================== CLICK ACTIONS ====================
    async clickPersoanaFizica(): Promise<void> {
        await this.persoanaFizicaLocator.click();
    }

    async clickPersoanaJuridicaRomana(): Promise<void> {
        await this.persoanaJuridicaRomanaLocator.click();
    }

    async clickRegisterButton(): Promise<void> {
        await this.registerButtonLocator.click();
    }

    async clickAmCititCheckbox(): Promise<void> {
        await this.amCititCheckboxLocator.check();
    }

    async clickSuntDeAcordCheckbox(): Promise<void> {
        await this.suntDeAcordCheckboxLocator.check();
    }

    // ==================== TEXT GETTERS ====================
    async getCompanyIdInputLocator(): Promise<Locator> {
        // if (0 < await this.cuiLabelLocator.count()) return this.cuiLabelLocator;
        const locator = await this.cuiPlaceholderLocator.count();
        if (0 < locator) return this.cuiPlaceholderLocator.first();

        throw new Error('CUI input field not found on Registration Page');
    }

    async getRegistrationSuccessMessage(): Promise<string> {
        return (await this.registrationSuccessMessageLocator.textContent())?.trim() || '';
    }

    // ==================== ACTION METHODS ====================
    async registerAccount(registrationData: Partial<CreateBuyerPayload> = {}): Promise<void> {
        try {
            // company specific fields
            if (registrationData.type === BUYER_TYPE_VALUE.COMPANY) {
                await this.clickPersoanaJuridicaRomana();
                const companyIdInput = await this.getCompanyIdInputLocator();
                await companyIdInput.fill(registrationData.cui);
            } else {
                // individual specific fields
                await this.clickPersoanaFizica();
            }
            await this.surenameInputLocator.fill(registrationData.first_name);
            await this.nameInputLocator.fill(registrationData.last_name);
            await this.emailInputLocator.fill(registrationData.email);
            await this.passwordInputLocator.fill(registrationData.password);
            await this.passwordConfirmationInputLocator.fill(registrationData.password);

            if (false !== registrationData.is_consent_accepted_tc) {
                await this.clickAmCititCheckbox();
            }
            if (false !== registrationData.is_consent_accepted_tc) {
                await this.clickSuntDeAcordCheckbox();
            }

            await this.clickRegisterButton();

        } catch (error) {
            console.error('Error during registration process:', error);
            throw error;
        }
    }

    // async getCUIFromTermeneRo(): Promise<string> {

    //     try {
    //         // generate random number between 1 and 50000
    //         const randomPage = Math.floor(Math.random() * 999) + 1;
    //         const url = `https://termene.ro/firme/${randomPage}`;

    //         // navigate to third party site to get a random CUI
    //         const termenePage = await this.page.context().newPage();
    //         await termenePage.goto(url, { waitUntil: 'domcontentloaded' });

    //         const locator = termenePage.locator('span[itemprop="taxID"]');
    //         const locatorCount = await locator.count();
    //         if (0 < locatorCount) {
    //             const randomIndex = Math.floor(Math.random() * locatorCount);
    //             const cui = await locator.nth(randomIndex).innerText();

    //             await termenePage.close();
    //             return cui;
    //         }
    //         return 'was not able to get cui';
    //     } catch (error) {
    //         console.error('Error fetching CUI from termene.ro:', error);
    //         return 'was not able to get cui';
    //     }
    // }

    // ==================== HELPER METHODS ====================
    // Add helper methods here if needed
}
