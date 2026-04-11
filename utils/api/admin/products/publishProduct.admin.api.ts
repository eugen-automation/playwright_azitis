import { RequestHandler } from '../../request-handler';
import { PublishProductResult } from '@utils/interfaces/admin/product/product.interface';




export async function publishProductApi(productId: string, api: RequestHandler): Promise<PublishProductResult> {
    try {

        console.log(`\n📢  Publishing product id ${productId}...`);

        const publishProductResponse: PublishProductResult = await api
            .path(`/product/publish/${productId}`)
            .postRequest(200);

        return publishProductResponse;

    } catch (error) {
        console.error('Error during product publishing:', error);
        return {
            message: (error as Error).message
        };
    }
}