

//response from deposit list page

// Private interfaces for nested objects
interface DepositLink {
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
}

interface DepositMetaLinks {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
}

interface DepositMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    links: DepositLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}

interface BidThreshold {
    min: string;
    max: string;
    required_deposit: string;
}

interface BidThresholdRange {
    min: string;
    max: string;
}

export interface DepositListResponse {
    data: any[];
    links: DepositMetaLinks;
    meta: DepositMeta;
    user_deposit: string;
    bid_thresholds: BidThresholdRange;
    all_bidding_thresholds: BidThreshold[];
}