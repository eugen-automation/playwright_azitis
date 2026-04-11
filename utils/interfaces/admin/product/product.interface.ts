export interface ProductFormData {
  id: string;
  name: null;
  status: Status;
  name_ro: string;
  name_en: string;
  description_en: string;
  description_ro: string;
  special_terms_ro: string;
  special_terms_en: string;
  address_ro: string;
  address_en: string;
  county_ro: string;
  county_en: string;
  city_ro: string;
  city_en: string;
  company_id: string;
  responsible_id: string;
  creditors_meeting_decision_date: string;
  inventory_number: string;
  currency_id: number;
  is_vat_needed: boolean | '0' | '1';
  start_price: string;
  evaluation_price: string;
  rezervation_price: string;
  deposit_payment_deadline: string;
  balance_payment_deadline: string;
  has_guarantee: boolean | '0' | '1';
  guarantee_percentage: number;
  guarantee_amount: string;
  is_on_promotion: boolean | '0' | '1';
  type: string;
  category_ro: string;
  category_en: string;
  category_id: number;
  batch_id: null;
  specifications: any[];
  images: any[];
  documents: any[];
  videos: Array<Video>;
  video_positions: Array<VideoPosition>;
}

interface Status {
  name: string;
  value: null;
}

interface Video {
  code: string;
  position: string;
}

interface VideoPosition {
  name: string;
  value: string;
}

export interface ProductCreateResult {
  id?: string;
  message?: string;
  warnings?: string[];
}

export interface ProductViewDetailsResult {
  page_data?: PageData;
  details?: ProductFormData;
  message?: string;
}

interface PageData {
  id: number;
  name: string;
  status: Status;
  is_on_promotion: boolean;
  auction_id?: number | null;
}

export interface PublishProductResult {
    message?: string;
}

export interface ProductGetDetailsOptions {
  waitForAuctionId?: boolean;
  timeoutMs?: number;
  intervalMs?: number;
}