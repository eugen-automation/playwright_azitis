export const CLIENT_AUTH = {
    GUEST: 'guest',
    BUYER_INDIVIDUAL: 'buyerIndividual',
    BUYER_COMPANY: 'buyerCompany'
} as const;

/** Union of all valid auth mode string values (derived from CLIENT_AUTH) */
export type ClientAuthMode = typeof CLIENT_AUTH[keyof typeof CLIENT_AUTH];

export default CLIENT_AUTH;
