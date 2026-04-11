import { BasePage } from '../base.page';
import { Page, Locator } from '@playwright/test';


/**
 * Product creation data interface
 */
export interface ProductData {
    name: string;
    company: string;
    useYesterdayDate?: boolean;
    date?: Date;
    category: string;
    judet: string;
    localitate: string;
    descriere: string;
    pretStart: string;
    pretEvaluare: string;
    pretRezarva: string;
    termenPlataAvans: string;
    termenPlataRest?: string;
}

/**
 * Product status type
 */
export type ProductStatus = 'unpublished' | 'publishing' | 'published' | 'unknown';

/**
 * Products Page Object Model for Admin Panel
 * Handles product listing, creation, editing, and publishing operations
 */
export class ProductsPage extends BasePage {
    protected get baseUrl(): string {
        return `${this.baseUrl}${this.urlSpecificPath}`;
    }

    // ==================== PAGE CONSTANTS ====================
    readonly pageTitle = 'Bunuri | Azitis';
    readonly urlSpecificPath = '/admin/products';
    readonly urlAddProductPath = '/admin/products/add';
    readonly urlViewProductPath = '/admin/products/view';

    // ==================== SUCCESS MESSAGES ====================
    readonly SUCCESS_MESSAGES = {
        PRODUCT_SAVED: 'Podusul a fost salvat',
        PRODUCT_PUBLISHED: 'Podusul a fost publicat',
        PRODUCT_UPDATED: 'Podusul a fost actualizat',
        PRODUCT_DELETED: 'Podusul a fost șters'
    } as const;

    // ==================== VALIDATION MESSAGES ====================
    readonly VALIDATION_MESSAGES = {
        NAME_REQUIRED: 'Numele în limba română este obligatoriu',
        COMPANY_REQUIRED: 'Compania este obligatorie',
        CATEGORY_REQUIRED: 'Categoria este obligatorie',
        PRICE_REQUIRED: 'Prețul este obligatoriu'
    } as const;

    // ==================== NAVIGATION LOCATORS ====================
    get bunuriMenuItem() {
        return this.page.getByRole('link', { name: 'Bunuri' }).first();
    }

    get adaugaBunButton() {
        return this.page.getByRole('link', { name: 'Adaugă bun' });
    }

    // ==================== PRODUCT FORM LOCATORS ====================
    
    // Product Name (Denumire)
    get productNameInput() {
        return this.page.getByPlaceholder('Denumirea bunului');
    }

    // Company (Companie)
    get companyDropdown() {
        return this.page.locator('form').getByText('Companie*').locator('..').locator('..').locator('div').last();
    }

    getCompanyOption(companyName: string): Locator {
        return this.page.getByText(companyName, { exact: true });
    }

    // Responsible Person (Responsabil) - auto-populated
    get responsabilField() {
        return this.page.locator('form').getByText('Responsabil*').locator('..').locator('..').locator('div').last();
    }

    // Inventory Number (Număr inventar)
    get inventoryNumberInput() {
        return this.page.getByPlaceholder('Numărul de inventar al bunului');
    }

    // Date Picker (Data hotărârii)
    get datePickerInput() {
        return this.page.locator('[data-test-id="dp-input"]');
    }

    getDatePickerDay(year: number, month: number, day: number): Locator {
        const monthStr = month.toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        return this.page.locator(`[data-test-id="dp-${year}-${monthStr}-${dayStr}"]`).getByText(day.toString());
    }

    // Category (Categorie)
    get categoryDropdown() {
        return this.page.locator('form').getByText('Categorie', { exact: true }).locator('..').locator('..').locator('div').last();
    }

    getCategoryOption(categoryName: string): Locator {
        return this.page.getByText(categoryName, { exact: true });
    }

    // County (Județ)
    get judetDropdown() {
        return this.page.locator('form').getByText('Județ*').locator('..').locator('..').locator('div').last();
    }

    getJudetOption(judetName: string): Locator {
        return this.page.getByText(judetName, { exact: true });
    }

    // Locality (Localitate)
    get localitateInput() {
        return this.page.getByPlaceholder('Localitatea unde este amplasat');
    }

    // Description (Descriere) - CRITICAL FIELD
    get descriereEditor() {
        return this.page.getByRole('paragraph').nth(3);
    }

    // Prices
    get pretDeStartInput() {
        return this.page.getByRole('spinbutton').nth(0);
    }

    get pretDeEvaluareInput() {
        return this.page.getByRole('spinbutton').nth(1);
    }

    get pretDeRezarvaInput() {
        return this.page.getByRole('spinbutton').nth(2);
    }

    // Payment Terms - CRITICAL FIELD
    get termenDePlataAvansInput() {
        return this.page.getByPlaceholder('Termenul de plată al avansului');
    }

    get termenDePlataRestInput() {
        return this.page.getByPlaceholder('Termenul de plată al restului');
    }

    // ==================== ACTION BUTTONS ====================
    get salveazaButton() {
        return this.page.getByRole('button', { name: 'Salvează' });
    }

    get publicaButton() {
        return this.page.getByRole('button', { name: 'Publică' }).first();
    }

    get publicaConfirmButton() {
        return this.page.getByRole('button', { name: 'Publică' }).nth(1);
    }

    get anuleazaPublicareanButton() {
        return this.page.getByRole('button', { name: 'Anulează publicarea' });
    }

    get actualizeazaLink() {
        return this.page.getByRole('link', { name: 'Actualizează' });
    }

    // ==================== STATUS AND MESSAGES ====================
    get statusNouNepublicat() {
        return this.page.locator('text=Nou (nepublicat)');
    }

    get statusInPublicare() {
        return this.page.locator('text=În publicare');
    }

    getSuccessMessage(message: string): Locator {
        return this.page.locator(`text=${message}`);
    }

    getValidationMessage(message: string): Locator {
        return this.page.locator(`text=${message}`);
    }

    // ==================== CONSTRUCTOR ====================
    constructor(page: Page) {
        super(page);
    }

    // ==================== NAVIGATION METHODS ====================
    async navigateToProductsPage() {
        await this.bunuriMenuItem.click();
        await this.page.waitForURL(new RegExp(`.*${this.urlSpecificPath}.*`), { timeout: 10000 });
    }

    async navigateToAddProductPage() {
        await Promise.all([
            this.page.waitForURL(new RegExp(`.*${this.urlAddProductPath}.*`), { timeout: 10000 }),
            this.adaugaBunButton.click()
        ]);
        await this.page.waitForLoadState('networkidle');
    }

    async waitForFormToLoad() {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000); // Allow form to fully render
    }

    // ==================== PRODUCT CREATION METHODS ====================
    
    /**
     * Fill product name (Denumire) field
     */
    async fillProductName(productName: string) {
        const allTextboxes = await this.page.getByRole('textbox').all();
        await allTextboxes[0].fill(productName);
    }

    /**
     * Select company from dropdown
     */
    async selectCompany(companyName: string) {
        await this.companyDropdown.click();
        await this.getCompanyOption(companyName).click();
        // Wait for Responsabil to auto-populate
        await this.page.waitForTimeout(1000);
    }

    /**
     * Select date using date picker (Data hotărârii adunării creditorilor)
     * @param date - Date object to select
     */
    async selectDate(date: Date) {
        await this.datePickerInput.click();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        await this.getDatePickerDay(year, month, day).click();
    }

    /**
     * Select yesterday's date
     */
    async selectYesterdayDate() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        await this.selectDate(yesterday);
    }

    /**
     * Select category (Categorie)
     */
    async selectCategory(categoryName: string) {
        await this.categoryDropdown.click();
        await this.getCategoryOption(categoryName).click();
    }

    /**
     * Select county (Județ)
     */
    async selectJudet(judetName: string) {
        await this.judetDropdown.click();
        await this.getJudetOption(judetName).click();
    }

    /**
     * Fill locality (Localitate) - CRITICAL FIELD
     */
    async fillLocalitate(localitate: string) {
        await this.localitateInput.fill(localitate);
    }

    /**
     * Fill description (Descriere) - CRITICAL FIELD
     */
    async fillDescriere(descriere: string) {
        await this.descriereEditor.click();
        await this.descriereEditor.fill(descriere);
    }

    /**
     * Fill all price fields
     */
    async fillPrices(pretStart: string, pretEvaluare: string, pretRezarva: string) {
        await this.pretDeStartInput.fill(pretStart);
        await this.pretDeEvaluareInput.fill(pretEvaluare);
        await this.pretDeRezarvaInput.fill(pretRezarva);
    }

    /**
     * Fill payment term advance (Termen de plată avans) - CRITICAL FIELD
     */
    async fillTermenDePlataAvans(days: string) {
        await this.termenDePlataAvansInput.fill(days);
    }

    /**
     * Save the product
     */
    async saveProduct() {
        await this.salveazaButton.click();
        await this.page.waitForURL(new RegExp(`.*${this.urlViewProductPath}.*`), { timeout: 10000 });
    }

    /**
     * Publish the product
     */
    async publishProduct() {
        await this.publicaButton.click();
        // Wait for confirmation dialog
        await this.page.waitForTimeout(500);
        await this.publicaConfirmButton.click();
    }

    /**
     * Complete product creation workflow with all required fields
     * @param productData - Object containing all product information
     */
    async createCompleteProduct(productData: ProductData) {
        await this.fillProductName(productData.name);
        await this.selectCompany(productData.company);
        
        if (productData.useYesterdayDate) {
            await this.selectYesterdayDate();
        } else if (productData.date) {
            await this.selectDate(productData.date);
        }
        
        await this.selectCategory(productData.category);
        await this.selectJudet(productData.judet);
        await this.fillLocalitate(productData.localitate);
        await this.fillDescriere(productData.descriere);
        await this.fillPrices(productData.pretStart, productData.pretEvaluare, productData.pretRezarva);
        await this.fillTermenDePlataAvans(productData.termenPlataAvans);
        
        if (productData.termenPlataRest) {
            await this.termenDePlataRestInput.fill(productData.termenPlataRest);
        }
    }

    // ==================== HELPER METHODS ====================
    
    /**
     * Extract product ID from current URL
     * @returns Product ID or null if not found
     */
    extractProductIdFromUrl(): string | null {
        const url = this.page.url();
        const match = url.match(/\/view\/(\d+)/);
        return match ? match[1] : null;
    }

    /**
     * Wait for success message to appear
     */
    async waitForSuccessMessage(message: string) {
        await this.getSuccessMessage(message).waitFor({ state: 'visible', timeout: 5000 });
    }

    /**
     * Check if product is in "Nou (nepublicat)" status
     */
    async isProductUnpublished(): Promise<boolean> {
        return await this.statusNouNepublicat.isVisible();
    }

    /**
     * Check if product is in "În publicare" status
     */
    async isProductPublished(): Promise<boolean> {
        return await this.statusInPublicare.isVisible();
    }

    /**
     * Validate that product was saved successfully
     */
    async validateProductSaved(): Promise<boolean> {
        const url = this.page.url();
        return url.includes(this.urlViewProductPath);
    }

    /**
     * Get current product status
     * @returns Status string: 'unpublished', 'publishing', or 'published'
     */
    async getProductStatus(): Promise<ProductStatus> {
        if (await this.statusNouNepublicat.isVisible().catch(() => false)) {
            return 'unpublished';
        }
        if (await this.statusInPublicare.isVisible().catch(() => false)) {
            return 'publishing';
        }
        // Could add more status checks here
        return 'unknown';
    }

    /**
     * Get product name from page heading
     */
    async getProductName(): Promise<string> {
        const heading = this.page.locator('h1').first();
        return await heading.textContent() || '';
    }

    /**
     * Check if specific field is visible on product view page
     */
    async isFieldVisible(fieldText: string): Promise<boolean> {
        return await this.page.locator(`text=${fieldText}`).isVisible().catch(() => false);
    }
}
