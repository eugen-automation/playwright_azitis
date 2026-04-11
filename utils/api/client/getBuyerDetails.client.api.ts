import { RequestHandler } from '../request-handler';
import { BuyerDetailsResponse } from '@utils/interfaces/client/buyerViewData.interface';



export async function getBuyerDetails(api: RequestHandler): Promise<BuyerDetailsResponse> {

    try {

        const buyerData: BuyerDetailsResponse = await api
            .path('/profile/view')
            .headers({ 'Accept': 'application/json, text/plain, */*' })
            .params({ lang: 'ro' })
            .getRequest(200);

        return buyerData;
    } catch (error) {
        Error.captureStackTrace(error, getBuyerDetails);
        throw error;
    }
}