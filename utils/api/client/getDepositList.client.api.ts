import { RequestHandler } from '../request-handler';
import { DepositListResponse } from '@utils/interfaces/client/depositList.interface';



export async function getDepositList(api: RequestHandler) {

    try {

        const depositListData: DepositListResponse = await api
            .path('/deposit/list')
            .headers({ 'Accept': 'application/json, text/plain, */*' })
            .params({ lang: 'ro' })
            .getRequest(200);

        return depositListData;
    } catch (error) {
        Error.captureStackTrace(error, getDepositList);
        throw error;
    }
}