import { faker } from '@faker-js/faker';
import type { CreateBuyerPayload } from '@utils/interfaces/client/register.interface';
import { BUYER_TYPE_VALUE } from '@utils/constants/buyer.constants';
import { getCompanyCui } from '@utils/helpers/cuiGenerator.helper';
import { config } from '@config/env.config';



export function buildIndividualBuyerPayload(): CreateBuyerPayload {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
        first_name: firstName,
        last_name: lastName,
        email: faker.internet.email({ firstName, lastName, provider: config.client.newAccRegistrationDomain }),
        password: config.client.newAccRegistrationPassword,
        password_confirmation: config.client.newAccRegistrationPassword,
        type: BUYER_TYPE_VALUE.INDIVIDUAL,
        is_consent_accepted_tc: true,
        is_consent_accepted_gdpr: true
    };
}

export function buildCompanyBuyerPayload(): CreateBuyerPayload {
    const base = buildIndividualBuyerPayload();

    return {
        ...base,
        type: BUYER_TYPE_VALUE.COMPANY,
        cui: getCompanyCui()
    };
}
