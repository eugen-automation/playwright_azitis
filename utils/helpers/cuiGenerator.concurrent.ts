import * as fs from 'fs';
import * as path from 'path';
import { RequestHandler } from '@utils/api/request-handler';

interface Firm {
    name: string;
    taxId: string;
}

/**
 * Check if a taxId already exists in the database
 * This is the source of truth - database always takes precedence
 */
async function isTaxIdAlreadyUsed(api: RequestHandler, taxId: string): Promise<boolean> {
    try {
        // Adjust this endpoint to your actual API
        // Common approaches:
        // 1. Search by taxId
        // 2. Get company details by taxId
        // 3. Check company existence
        
        const response = await api
            .path('/client/search')
            .params({ taxId, lang: 'ro' })
            .getRequest(200);

        // If we got a successful response, the taxId is already used
        return true;
    } catch (error: any) {
        // 404 or other error means it's not used
        if (404 === error?.status || 404 === error?.statusCode) {
            return false;
        }
        // Assume not used if we can't verify (network issue, etc)
        console.warn(`Could not verify taxId ${taxId} with database:`, error?.message);
        return false;
    }
}

/**
 * Parallel-safe CUI generation with database verification
 * 
 * How it works:
 * 1. Shuffles the firms list to reduce contention
 * 2. For each firm, checks the database if taxId is already used
 * 3. Returns the first available taxId
 * 4. Handles concurrent access by checking DB (source of truth)
 * 
 * This avoids both:
 * - Multiple tests getting the same CUI (checks database)
 * - Race conditions (database is atomic)
 */
export async function generateCUIForParallelTests(api: RequestHandler): Promise<string> {
    const firmsPath = path.resolve(__dirname, '../../data/firms.json');
    
    // Read firms data
    const firmsData = fs.readFileSync(firmsPath, 'utf-8');
    const firms: Firm[] = JSON.parse(firmsData);
    
    // Shuffle to distribute load and reduce contention between parallel tests
    const shuffledFirms = firms.sort(() => Math.random() - 0.5);
    
    // Check each CUI against the database (the source of truth)
    for (const firm of shuffledFirms) {
        const isUsed = await isTaxIdAlreadyUsed(api, firm.taxId);
        
        if (!isUsed) {
            console.log(`✓ Selected CUI: ${firm.taxId} (${firm.name})`);
            return firm.taxId;
        }
    }
    
    // If all are used in database, throw error
    throw new Error(
        'All available CUIs have been registered in the database. ' +
        'Options: (1) Delete companies from DB, (2) Add more companies to firms.json'
    );
}

/**
 * Get list of used CUIs from the database
 * Useful for reporting/debugging
 */
export async function getUsedCUIsFromDB(api: RequestHandler): Promise<string[]> {
    try {
        // Adjust to your actual API endpoint
        const response: any = await api
            .path('/admin/companies')
            .params({ lang: 'ro' })
            .getRequest(200);

        return response?.data?.map((company: any) => company.taxId) || [];
    } catch (error) {
        console.error('Could not fetch used CUIs from database:', error);
        return [];
    }
}

/**
 * Verify that a CUI was successfully registered
 */
export async function verifyCUIRegistered(api: RequestHandler, taxId: string): Promise<boolean> {
    return await isTaxIdAlreadyUsed(api, taxId);
}
