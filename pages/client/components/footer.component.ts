import { Locator, Page } from '@playwright/test';
import { BaseComponent } from './_base.component.page';

export class FooterComponent extends BaseComponent {

    constructor(page: Page) {
        super(page);
    }

    // ==================== LOCATORS ====================
    get footerRoot(): Locator {
        return this.page.getByRole('contentinfo', { name: 'Footer' });
    }

    private get aboutUsLink(): Locator {
        return this.footerRoot.getByRole('link', { name: 'Despre noi' });
    }

    private get contactLink(): Locator {
        return this.footerRoot.getByRole('link', { name: 'Contactează-ne' });
    }

    private get faqLink(): Locator {
        return this.footerRoot.getByRole('link', { name: 'Intrebări frecvente' });
    }

    private get termsLink(): Locator {
        return this.footerRoot.getByRole('link', { name: 'Termeni și condiții' });
    }

    private get privacyPolicyLink(): Locator {
        return this.footerRoot.getByRole('link', { name: 'Politica de confidențialitate' });
    }

    private get anpcLink(): Locator {
        return this.footerRoot.getByRole('link', { name: 'Soluționarea alternativă a litigiilor' });
    }

    private get facebookLink(): Locator {
        return this.footerRoot.locator('a[href*="facebook.com"]');
    }

    private get linkedinLink(): Locator {
        return this.footerRoot.locator('a[href*="linkedin.com"]');
    }

    // ==================== HELPERS ====================
    private escapeForRegex(input: string): string {
        return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private async clickLinkAndWait(locator: Locator): Promise<void> {
        const href = await locator.getAttribute('href').catch(() => null);
        if (href) {
            const regex = new RegExp(this.escapeForRegex(href));
            await Promise.all([
                this.page.waitForURL(regex, { timeout: 10000 }).catch(() => { }),
                locator.click()
            ]);
        } else {
            await locator.click();
            await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => { });
        }
    }

    private async clickLinkWithFallback(locator: Locator): Promise<void> {
        await this.footerRoot.scrollIntoViewIfNeeded();
        try {
            await locator.click({ timeout: 10000 });
        } catch {
            await locator.click({ force: true });
        }
    }

    // ==================== VISIBILITY HELPERS ====================
    async waitForVisible(timeout = 5000): Promise<void> {
        await this.footerRoot.waitFor({ state: 'visible', timeout });
    }

    async isVisible(): Promise<boolean> {
        return this.footerRoot.isVisible();
    }

    // ==================== ARIA SNAPSHOTS ====================
    private readonly desktopAriaSnapshot = `
          - paragraph: Companie
          - list:
            - listitem:
              - link "Despre noi":
                - /url: /despre-noi
            - listitem:
              - link "Contactează-ne":
                - /url: /contact
          - paragraph: Utile
          - list:
            - listitem:
              - link "Intrebări frecvente":
                - /url: /intrebari-frecvente
          - paragraph: ANPC — Informare consumatori
          - list:
            - listitem:
              - link "Soluționarea alternativă a litigiilor":
                - /url: https://anpc.ro/noi-reglementari-de-la-anpc-in-ceea-ce-priveste-procedurile-de-solutionaare-alternativa-a-litigiilor-si-insolventa-a-persoanelor-fizice/
            - listitem:
              - link /ORDIN nr\. \d+ din \d+ mai \d+/: 
                - /url: https://legislatie.just.ro/Public/DetaliiDocument/257649
          - img
          - img
          - img
          - img
          - paragraph: Azitis.com este cea mai performantă platformă destinată vânzării activelor care provin din companii aflate în dificultate. Platforma ajută investitorii să realizeze achiziții, într-o manieră simplă, sigură și transparentă, oferindu-le acces gratuit la cel mai mare portofoliu de oportunități.
          - paragraph: "Urmărește-ne pe:"
          - link:
            - /url: https://www.facebook.com/licitatiiazitis
            - img
          - link:
            - /url: https://www.linkedin.com/company/azitis
            - img
          - list:
            - listitem:
              - link "Termeni și condiții":
                - /url: /termeni-si-conditii
            - listitem:
              - link "Politica de confidențialitate":
                - /url: /politica-de-confidentialitate
          - paragraph: /Copyright © \d+ azitis\. Toate drepturile rezervate\./
          `;

    private readonly mobileAriaSnapshot = `
    - contentinfo "Footer":
      - paragraph: Footer
      - heading "Companie" [level=3]
      - img
      - heading "Utile" [level=3]
      - img
      - heading "ANPC — Informare consumatori" [level=3]
      - img
      - img
      - paragraph: "Urmărește-ne pe:"
      - link:
        - /url: https://www.facebook.com/licitatiiazitis
        - img
      - link:
        - /url: https://www.linkedin.com/company/azitis
        - img
      - img
      - img
      - img
      - list:
        - listitem:
          - link "Termeni și condiții":
            - /url: /termeni-si-conditii
        - listitem:
          - link "Politica de confidențialitate":
            - /url: /politica-de-confidentialitate
      - text: /Ora serverului \d+:\d+:\d+/
      - img
      - paragraph: Ora serverului reprezintă timpul oficial al platformei, folosit pentru sincronizarea tuturor licitațiilor și ofertelor plasate.
      - paragraph: /Copyright © \d+ azitis\. Toate drepturile rezervate\./
    `;

    // ==================== ACTION METHODS ====================
    async getAriaSnapshot(): Promise<string> {
        return this.isMobile ? this.mobileAriaSnapshot : this.desktopAriaSnapshot;
    }

    async clickAboutUsLink(): Promise<void> {
        if (this.isMobile) {
            await this.clickLinkAndWait(this.footerRoot.getByRole('heading', { name: 'Companie' }));
        }
        await this.clickLinkAndWait(this.aboutUsLink);
    }

    async clickContactLink(): Promise<void> {
        if (this.isMobile) {
            await this.clickLinkAndWait(this.footerRoot.getByRole('heading', { name: 'Companie' }));
        }
        await this.clickLinkAndWait(this.contactLink);
    }

    async clickFaqLink(): Promise<void> {
        if (this.isMobile) {
            await this.clickLinkAndWait(this.footerRoot.getByRole('heading', { name: 'Utile' }));
        }
        await this.clickLinkAndWait(this.faqLink);
    }

    async clickTermsLink(): Promise<void> {
        await this.clickLinkWithFallback(this.termsLink);
    }

    async clickPrivacyPolicyLink(): Promise<void> {
        await this.clickLinkWithFallback(this.privacyPolicyLink);
    }

    async clickAnpcLink(): Promise<void> {
        await this.clickLinkWithFallback(this.anpcLink);
    }

    async clickFacebookLink(): Promise<void> {
        await this.clickLinkAndWait(this.facebookLink);
    }

    async clickLinkedinLink(): Promise<void> {
        await this.clickLinkAndWait(this.linkedinLink);
    }
}
