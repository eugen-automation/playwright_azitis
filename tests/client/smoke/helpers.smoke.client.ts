import { type Page, type TestInfo } from '@playwright/test';
import * as path from 'path';

import CLIENT_AUTH, { type ClientAuthMode } from '../../../utils/constants/auth.constants';
import { sanitizeForFilename } from '@utils/helpers/string.helpers';
import { AboutUsPage } from '../../../pages/client/aboutUs.client.page';
import { AuctionViewPage } from '../../../pages/client/auctionView.client.page';
import { AuctionsListPage } from '../../../pages/client/auctionsList.client.page';
import { ContactPage } from '../../../pages/client/contactUs.client.page';
import { FaqPage } from '../../../pages/client/faq.client.page';
import { HomePage } from '../../../pages/client/home.client.page';
import { PrivacyPolicyPage } from '../../../pages/client/privacyPolicy.client.page';
import { TermsPage } from '../../../pages/client/terms.client.page';
import { DepositsPage } from '../../../pages/client/account/deposits.account.page';
import { FavoritesPage } from '../../../pages/client/account/favorites.account.page';
import { GuaranteesPage } from '../../../pages/client/account/guarantees.account.page';
import { MyAuctionsPage } from '../../../pages/client/account/myAuctions.account.page';
import { SettingsPage } from '../../../pages/client/account/settings.account.page';
import { RegistrationPage } from '../../../pages/client/registration.client.page';

export type NavigationPoms = {
    page: Page;
    home: HomePage;
    auctionsListPage: AuctionsListPage;
    auctionViewPage: AuctionViewPage;
    aboutUsPage: AboutUsPage;
    contactPage: ContactPage;
    faqPage: FaqPage;
    termsPage: TermsPage;
    privacyPolicyPage: PrivacyPolicyPage;
    registrationPage: RegistrationPage;

    myAuctionsPage: MyAuctionsPage;
    favoritesPage: FavoritesPage;
    depositsPage: DepositsPage;
    guaranteesPage: GuaranteesPage;
    settingsPage: SettingsPage;
};

export const buildNavigationPoms = (page: Page): NavigationPoms => ({
    page,
    home: new HomePage(page),
    auctionsListPage: new AuctionsListPage(page),
    auctionViewPage: new AuctionViewPage(page),
    aboutUsPage: new AboutUsPage(page),
    contactPage: new ContactPage(page),
    faqPage: new FaqPage(page),
    termsPage: new TermsPage(page),
    privacyPolicyPage: new PrivacyPolicyPage(page),
    registrationPage: new RegistrationPage(page),

    myAuctionsPage: new MyAuctionsPage(page),
    favoritesPage: new FavoritesPage(page),
    depositsPage: new DepositsPage(page),
    guaranteesPage: new GuaranteesPage(page),
    settingsPage: new SettingsPage(page)
});

export const publicModes: ReadonlyArray<{ label: string; auth: ClientAuthMode }> = [
    { label: 'guest', auth: CLIENT_AUTH.GUEST },
    { label: 'individual buyer', auth: CLIENT_AUTH.BUYER_INDIVIDUAL },
    // { label: 'company buyer', auth: CLIENT_AUTH.BUYER_COMPANY }
] as const;

/**
 * Get authenticated buyer modes to run tests for.
 * Filter by commenting out modes in publicModes array above.
 * Returns only authenticated buyers (excludes guest).
 */
export function getActiveBuyerModes(): ReadonlyArray<{ label: string; auth: ClientAuthMode }> {
    return publicModes.filter(m => m.auth !== CLIENT_AUTH.GUEST);
}

export function storageStatePathFor(testInfo: TestInfo, auth: ClientAuthMode): string {
    const projectName = sanitizeForFilename(testInfo.project.name);
    const worker = testInfo.workerIndex;
    return path.resolve(process.cwd(), 'playwright', '.auth', `client-${auth}-${projectName}-worker${worker}.json`);
}

/**
 * Select the appropriate buyer page fixture based on auth mode.
 * 
 * Usage in tests:
 *   const page = selectBuyerOnboardingPage(
 *       auth,
 *       newIndividualBuyerOnboardingCompleteLoggedInPage,
 *       newCompanyBuyerOnboardingCompleteLoggedInPage
 *   );
 * 
 * @param auth - The current auth mode from the forEach loop
 * @param individualPage - Individual buyer logged-in page fixture
 * @param companyPage - Company buyer logged-in page fixture
 * @returns The appropriate page fixture
 */
export function selectBuyerOnboardingPage(
    auth: ClientAuthMode,
    individualPage: Page,
    companyPage: Page
): Page {
    return auth === CLIENT_AUTH.BUYER_COMPANY ? companyPage : individualPage;
}
