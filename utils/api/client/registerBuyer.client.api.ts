import { RequestHandler } from '../request-handler';
import { CreateBuyerPayload } from '@utils/interfaces/client/register.interface';
import { CreateBuyerResponse } from '@utils/interfaces/general.interface';
import { BUYER_TYPE_VALUE } from '@utils/constants/buyer.constants';
import fs from 'fs';
import * as path from 'path';





function loadCompanyCuisFromFirmsJson(): string[] {
    const firmsPath = path.resolve(process.cwd(), 'utils', 'data', 'firms.json');

    try {
        const raw = fs.readFileSync(firmsPath, 'utf-8');
        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) {
            return [];
        }

        const cuis = parsed
            .map((entry: any) => entry?.taxId ?? entry?.tax_id ?? entry?.cui)
            .filter((value: any) => 'string' === typeof value && 0 < value.trim().length)
            .map((value: string) => value.trim());

        return Array.from(new Set(cuis));
    } catch {
        return [];
    }
}

function isStatusMismatchError(error: unknown, status: number): boolean {
    const message = (error as any)?.message;
    return 'string' === typeof message && message.includes(`but got ${status}`);
}

export async function registerBuyerApi(api: RequestHandler, body: CreateBuyerPayload): Promise<CreateBuyerResponse> {
    const isCompany = body.type === BUYER_TYPE_VALUE.COMPANY;
    const cuis = isCompany ? loadCompanyCuisFromFirmsJson() : [];

    // For company registrations, retry on HTTP 422 by trying another CUI/taxId from firms.json.
    // Keep attempts bounded to avoid long loops in case 422 is unrelated to CUI.
    const maxAttempts = isCompany ? Math.min(5, Math.max(1, cuis.length)) : 1;

    let attemptBody: CreateBuyerPayload = { ...body };

    if (isCompany) {
        const normalized = 'string' === typeof attemptBody.cui ? attemptBody.cui.trim() : '';

        // If the payload doesn't provide a CUI, start with the first candidate from firms.json
        // so we don't waste the first attempt with an invalid/missing CUI.
        if (!normalized) {
            const fallback = cuis[0];
            attemptBody = { ...attemptBody, cui: fallback };
        } else {
            attemptBody = { ...attemptBody, cui: normalized };
        }
    }

    const remainingCandidates = isCompany ? cuis.filter((cui) => cui !== attemptBody.cui) : [];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            // Debug: show that registration call will be performed (do not modify .env files)
            console.log(`\n🧑‍💼 Creating buyer account. Email: ${attemptBody.email} Password: ${attemptBody.password}`);
            if (isCompany) {
                console.log(`🏢 Company CUI attempt ${attempt}/${maxAttempts}: ${attemptBody.cui ?? '(missing)'}`);
            }

            const createBuyerResponse: CreateBuyerResponse = await api
                .path('/register')
                .headers({
                    'Content-Type': 'application/json'
                })
                .params({ lang: 'ro' })
                .body(attemptBody)
                .postRequest(201);

            return createBuyerResponse;
        } catch (error) {
            const shouldRetry = isCompany && isStatusMismatchError(error, 422) && 0 < remainingCandidates.length;
            if (!shouldRetry) {
                console.error('Error during buyer registration:', error);
                throw error;
            }

            const nextCui = remainingCandidates.shift()!;
            attemptBody = { ...attemptBody, cui: nextCui };
        }
    }

    // Should be unreachable due to throws/returns, but keeps TS happy.
    throw new Error('[registerBuyerApi] Exhausted retries while registering company buyer.');
}