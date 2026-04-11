export const AUCTION_STATUS = {
    ACTIVE: 'active',
    UPCOMING: 'upcoming',
    SOLD: 'sold'
} as const;

export type AuctionStatus = (typeof AUCTION_STATUS)[keyof typeof AUCTION_STATUS];

export const AUCTION_STATUS_LIST: AuctionStatus[] = Object.values(AUCTION_STATUS);
