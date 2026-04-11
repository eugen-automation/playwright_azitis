import * as dotenv from 'dotenv';
import path from 'path';

/* Load default .env file first */
dotenv.config({
    path: path.resolve(process.cwd(), '.env'),
    quiet: true
});

/* Load environment-specific .env file to override defaults */
const envFile = `.env.${process.env.ENV || 'staging1'}`;
/* console.log(`📁 Loading environment file: ${envFile}`); */

dotenv.config({
    path: path.resolve(process.cwd(), envFile),
    quiet: true,
    override: true
});

/* console.log(`✅ Environment: ${process.env.ENV}`);
console.log(`✅ CLIENT_BASE_URL loaded: ${process.env.CLIENT_BASE_URL}`); */
export const config = {
    env: process.env.ENV ?? 'staging1',

    client: {
        baseUrl: process.env.CLIENT_BASE_URL!,
        apiUrl: process.env.CLIENT_API_URL!,
        newAccRegistrationDomain: process.env.NEW_ACC_REGISTRATION_DOMAIN!,
        newAccRegistrationPassword: process.env.NEW_ACC_REGISTRATION_PASSWORD || ''
    },

    admin: {
        baseUrl: process.env.ADMIN_BASE_URL!,
        apiUrl: process.env.ADMIN_API_URL!,
        email: process.env.ADMIN_EMAIL!,
        password: process.env.ADMIN_PASSWORD!
    }
};