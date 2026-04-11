import { RequestHandler } from '../../request-handler';
import { MessagePayload } from '@utils/interfaces/general.interface';
import { UpdateBuyerPayload } from '@utils/interfaces/admin/buyer/updateBuyer.interface';



export async function updateBuyerApi(buyerPayloadData: UpdateBuyerPayload, api: RequestHandler): Promise<MessagePayload> {
    try {
        const buyerId = buyerPayloadData.id;
        const updateBuyerResponse = await api
            .path(`/buyer/update/${buyerId}`)
            .body(buyerPayloadData)
            .postRequest(200);

        return updateBuyerResponse;

    } catch (error) {
        console.error('Error during buyer updating:', error);
        return {
            message: (error as Error).message
        };
    }
}