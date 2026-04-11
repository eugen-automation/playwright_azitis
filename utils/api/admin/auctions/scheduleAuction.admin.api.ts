// export interface AuctionSchedulePayload {
//     company_id?: number,
//     company?: string,
//     auction_type?: string,
//     responsible_id?: number,
//     start_datetime?: string,
//     finish_datetime?: string,
//     auction_datetime?: string,
//     unpir_proof?: FileUpload,
//     newspaper_proof?: FileUpload,
//     auction_types_list?: Array<{ name: string, value: string }>,
//     responsible_list?: Array<{
//         id: number,
//         value: number,
//         name: string
//     }>,
//     id?: number,
//     name?: string,
//     start_price?: string,
//     rezervation_price?: string,
//     has_guarantee?: '0' | '1',
//     guarantee_percentage?: number,
//     guarantee_amount?: string,
//     currency_id?: number,
//     currency_code?: "RON" | "EUR",
//     documents_config?: {
//         max_size: 512000,
//         allowed_mimes: "jpg,jpeg,png,webp,pdf,doc,docx,xls,xlsx,mp4"
//     }
// }
import { RequestHandler } from '../../request-handler';
import { AuctionFormData } from '@utils/interfaces/admin/auction/auction.interface';

/** File-like value accepted by the API multipart handler. */
// export type FileUpload = {
//     name: string;
//     mimeType?: string;
//     buffer: Buffer;
// } | Buffer | NodeJS.ReadableStream;

/**
 * Schedule (or update schedule for) an auction using the admin API.
 * If the payload contains file uploads (`unpir_proof` or `newspaper_proof`),
 * the function will send multipart/form-data via `RequestHandler.multipart()`.
 */
export async function scheduleAuctionApi(auctionId: string, payload: AuctionFormData, api: RequestHandler) {
    let response: any;

    console.log(`\n⏰  Scheduling auction id ${auctionId}...`);

    const hasFile = Boolean(payload.unpir_proof || payload.newspaper_proof);
    const requestBuilder = api.path(`/auction/schedule/${auctionId}`);

    if (hasFile) {
        return await requestBuilder.multipart(payload as Record<string, unknown>).postRequest(200);
    }

    return await requestBuilder.body(payload).postRequest(200);
}




