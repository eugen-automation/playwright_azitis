import { RequestHandler } from '../request-handler';
import { config } from '../../../config/env.config';
import { APILogger } from '../logger';
import { request } from '@playwright/test';
import { ClientLoginResponse } from '@utils/interfaces/client/login.interface';



export async function loginBuyerApi(email: string, password: string) {

    /* PLEASE DO NOT REMOVE THIS CONTEXT DISPOSE BLOCK */
    const context = await request.newContext();
    const logger = new APILogger();
    const api = new RequestHandler(context, config.client.apiUrl, logger);

    try {

        console.log(`\n🔑  Logging in client site to get token for email: ${email}...`);

        const tokenResponse: ClientLoginResponse = await api
            .path('/login')
            .headers({
                'Content-Type': 'application/json'
            })
            .params({ lang: 'ro' })
            .body({ 'email': email, 'password': password })
            .postRequest(200);

        // Return a ready-to-use Authorization header value, e.g. "Bearer <access_token>"
        const authHeader = `${tokenResponse.token_type} ${tokenResponse.access_token}`.trim();
        return authHeader;
    } catch (error) {
        Error.captureStackTrace(error, loginBuyerApi);
        throw error;
    } finally {
        await context.dispose();
    }

}