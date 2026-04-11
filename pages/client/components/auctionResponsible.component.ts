import { BaseComponent } from './_base.component.page';
import { Locator, Page } from '@playwright/test';

export class AuctionResponsiblePersonComponent extends BaseComponent {
    constructor(page: Page) {
        super(page);
    }

    // ==================== AUCTION RESPONSIBLE PEOPLE RESOLVERS

    private get responsiblePersonContainerDesktopLocator(): Locator {
        return this.page.getByTestId('cav-auction-responsible-container-desktop');
    }

    private get responsiblePersonContainerMobileLocator(): Locator {
        return this.page.getByTestId('cav-auction-responsible-container-mobile');
    }


    // Resolvers for seller/contact info 
    private async resolveResponsibleAvatarLocator(): Promise<Locator> {
        if (this.isMobile) return this.responsiblePersonContainerMobileLocator.getByTestId('cav-auction-responsible-avatar-mobile');
        return this.responsiblePersonContainerDesktopLocator.getByTestId('cav-auction-responsible-avatar-desktop');
    }

    private async resolveResponsiblePersonNameLocator(): Promise<Locator> {
        if (this.isMobile) return this.responsiblePersonContainerMobileLocator.getByTestId('cav-auction-responsible-name-mobile');
        return this.responsiblePersonContainerDesktopLocator.getByTestId('cav-auction-responsible-name-desktop');
    }

    private async resolveResponsibleEmailLocator(): Promise<Locator> {
        if (this.isMobile) return this.responsiblePersonContainerMobileLocator.getByTestId('cav-auction-responsible-email-mobile');
        return this.responsiblePersonContainerDesktopLocator.getByTestId('cav-auction-responsible-email-desktop');
    }

    private async resolveResponsiblePhoneLocator(): Promise<Locator> {
        if (this.isMobile) return this.responsiblePersonContainerMobileLocator.getByTestId('cav-auction-responsible-phone-mobile');
        return this.responsiblePersonContainerDesktopLocator.getByTestId('cav-auction-responsible-phone-desktop');
    }


    // ==================== VISIBILITY HELPERS ====================

    // Public helper methods for seller contact
    async isSellerAvatarVisible(): Promise<boolean> {
        return (await this.resolveResponsibleAvatarLocator()).isVisible();
    }

    async isResponsibleSectionVisible(): Promise<boolean> {
        if (this.isMobile) {
            return this.responsiblePersonContainerMobileLocator.isVisible();
        }
        return this.responsiblePersonContainerDesktopLocator.isVisible();
    }


    // ====================  GET CONTAINERS LOCATORS ====================

    async getResponsibleSectionLocator(): Promise<Locator> {
        if (this.isMobile) {
            return this.responsiblePersonContainerMobileLocator;
        }
        return this.responsiblePersonContainerDesktopLocator;
    }

    // ====================  TEXT FUNCTIONS ====================

    async getResponsiblePersonNameText(): Promise<string> {
        return (await (await this.resolveResponsiblePersonNameLocator()).innerText()).trim();
    }

    async getResponsiblePersonEmailText(): Promise<string> {
        return (await (await this.resolveResponsibleEmailLocator()).innerText()).trim();
       
    }

    async getResponsiblePersonPhoneText(): Promise<string> {
        return (await (await this.resolveResponsiblePhoneLocator()).innerText()).trim();
       
    }


}