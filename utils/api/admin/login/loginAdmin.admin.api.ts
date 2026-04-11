import { RequestHandler } from '../../request-handler';
import { config } from '../../../../config/env.config';
import { APILogger } from '../../logger';
import { request } from '@playwright/test';


export interface TokenResponse {
    access_token: string;
    expires_in: number;
    is_super_user?: boolean;
    token_type: string;
    permissions?: any;
}


export async function LoginAdminApi(email: string = config.admin.email, password: string = config.admin.password) {
    const context = await request.newContext();
    const logger = new APILogger();
    const api = new RequestHandler(context, config.admin.apiUrl, logger);

    try {

        console.log('\n🔑  Logging in admin to get token...');

        const tokenResponse: TokenResponse = await api
            .path('/login')
            .body({ 'email': email, 'password': password })
            .postRequest(200);

        // Return a ready-to-use Authorization header value, e.g. "Bearer <access_token>"
        const authHeader = `${tokenResponse.token_type} ${tokenResponse.access_token}`.trim();
        return authHeader;
    } catch (error) {
        Error.captureStackTrace(error, LoginAdminApi);
        throw error;
    } finally {
        await context.dispose();
    }

}