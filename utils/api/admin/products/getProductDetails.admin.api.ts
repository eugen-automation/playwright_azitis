import { ProductViewDetailsResult, ProductGetDetailsOptions } from '@utils/interfaces/admin/product/product.interface';
import { RequestHandler } from '../../request-handler';

// export interface GetProductDetailsOptions {
//   waitForAuctionId?: boolean;
//   timeoutMs?: number;
//   intervalMs?: number;
// }




// export interface StatusField {
//   name: string;
//   value: string;
// }

// export interface ProductTypeField {
//   name: string;
//   value: string;
// }

// export interface VideoField {
//   code: string;
//   position: string;
// }

// export interface ProductDetails {
//   id: number;
//   name: string;
//   status: StatusField;
//   name_ro: string;
//   name_en: string;
//   description_ro: string;
//   description_en: string;
//   special_terms_ro: string;
//   special_terms_en: string;
//   address_ro: string | null;
//   address_en: string | null;
//   county_ro: string;
//   county_en: string;
//   city_ro: string;
//   city_en: string;
//   company: string;
//   responsible: string;
//   creditors_meeting_decision_date: string;
//   inventory_number: string;
//   currency: string;
//   is_vat_needed: boolean;
//   start_price: string;
//   evaluation_price: string;
//   rezervation_price: string;
//   deposit_payment_deadline: number | string;
//   balance_payment_deadline: string | number;
//   has_guarantee: boolean;
//   guarantee_percentage: number | null;
//   guarantee_amount: string;
//   is_on_promotion: boolean;
//   type: ProductTypeField;
//   category_ro: string;
//   category_en: string;
//   specifications: Array<Record<string, any>>;
//   videos: VideoField[];
//   batch: string;
// }





const defaultPollTimeoutMs = 120_000;
const defaultPollIntervalMs = 1500;

function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

export async function getProductDetailsApi(
    productId: string,
    api: RequestHandler,
    options?: ProductGetDetailsOptions
): Promise<ProductViewDetailsResult> {
    try {
        console.log(`\n🔍 Fetching details for product ID: ${productId}...`);

        const fetchOnce = async (): Promise<ProductViewDetailsResult> => {
            return (await api.path(`/product/view/${productId}?type=details`).getRequest(200)) as ProductViewDetailsResult;
        };

        if (!options?.waitForAuctionId) {
            const productDetails = await fetchOnce();
            console.log('✅ Product details fetched successfully.');
            return productDetails;
        }

        const timeoutMs = options.timeoutMs ?? defaultPollTimeoutMs;
        const intervalMs = options.intervalMs ?? defaultPollIntervalMs;
        const maxAttempts = Math.max(1, Math.ceil(timeoutMs / intervalMs));

        let lastResult: ProductViewDetailsResult | null = null;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                lastResult = await fetchOnce();
            } catch (err) {
                console.warn(`Attempt ${attempt} failed fetching product details:`, err);
                lastResult = { message: (err as Error).message };
            }

            if (lastResult && 'page_data' in lastResult && lastResult.page_data?.auction_id) {
                console.log(`✅ Auction id found after ${attempt} attempt(s)`);
                return lastResult;
            }

            // Not ready yet — wait and retry
            await sleep(intervalMs);
        }

        console.error('Timed out waiting for auction_id for product:', productId, lastResult);
        return lastResult;
    } catch (error) {
        console.error('Error fetching product details:', error);
        return { message: (error as Error).message };
    }
}