import { RequestHandler } from '../../request-handler';



interface DepositThresholdsResponse {
    user_deposit: string;
    bid_thresholds: {
        min: string;
        max: string;
    };
    all_bidding_thresholds: Array<{
        max: string | null;
        min: string;
        required_deposit: string;
    }>;
}


export async function getDepositThresholdsApi(api: RequestHandler): Promise<DepositThresholdsResponse> {

    try {

        const returnResult = await api
            .path('/deposit/get-thresholds?lang=ro')
            .getRequest(200);

        return returnResult;
    } catch (error) {
        console.error('Error fetching deposit thresholds:', error);
        throw error;
    }
}


