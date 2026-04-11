import { DocumentsConfig } from '../general.interface';

export interface BuyerDetailsResponse
{    
    id: number,
    email: string,
    type: string,
    onboarding_status: string,
    name: string,
    phone: string | null,
    categories: [],
    ci: null,
    documents_config: DocumentsConfig
}