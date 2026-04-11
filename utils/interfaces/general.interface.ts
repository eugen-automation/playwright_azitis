
export interface DocumentsConfig {
    max_size: number;
    allowed_mimes: string;
}


export interface CreateBuyerResponse
{
    type: string,
    text: string
}


export interface MessagePayload {
    message?: string;
}