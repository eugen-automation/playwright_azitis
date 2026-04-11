import {BuyerType} from '../../constants/buyer.constants';

export interface CreateBuyerPayload {
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    password_confirmation: string,
    type: BuyerType,
    is_consent_accepted_tc: boolean,
    is_consent_accepted_gdpr: boolean,
    cui?: string,
}
