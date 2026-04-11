export const BUYER_TYPE_VALUE = {
    INDIVIDUAL: 'buyer-individual',
    COMPANY: 'buyer-company'
} as const;

export type BuyerType = typeof BUYER_TYPE_VALUE[keyof typeof BUYER_TYPE_VALUE];

export default BUYER_TYPE_VALUE;
