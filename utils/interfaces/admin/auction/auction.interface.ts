import { DocumentsConfig } from '@utils/interfaces/general.interface';

export interface AuctionFormData {
    company_id?: number,
    company?: string,
    auction_type?: string,
    responsible_id?: number,
    start_datetime?: string,
    finish_datetime?: string,
    auction_datetime?: string,
    unpir_proof?: FileUpload | Buffer | NodeJS.ReadableStream,
    newspaper_proof?: FileUpload | Buffer | NodeJS.ReadableStream,
    auction_types_list?: Array<AuctionType>,
    responsible_list?: Array<Responsible>,
    id?: number,
    name?: string,
    start_price?: string,
    rezervation_price?: string,
    has_guarantee?: '0' | '1',
    guarantee_percentage?: number,
    guarantee_amount?: string,
    currency_id?: number,
    currency_code?: 'RON' | 'EUR',
    documents_config?: DocumentsConfig
}

interface Responsible { id: number, value: number, name: string }

interface AuctionType { name: string, value: string }

interface FileUpload {
    name: string,
    mimeType?: string,
    buffer: Buffer,
}