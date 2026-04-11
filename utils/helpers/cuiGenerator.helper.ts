// export async function generateCUI(): Promise<string> {
//     // import data from @utils/data/firms.json

//     return '';
// }

// // utils/taxIds.ts
// import taxIds from "@utils/data/firms.json";
// import { test } from "@playwright/test";

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));


// export function getTaxIdsForWorker() {
//   const workerIndex = test.info().workerIndex; // 0, 1, 2, ...
//   // const totalWorkers = test.info().project.use.workers ?? 1;

//   // Split evenly
//   // const chunkSize = Math.ceil(taxIds.length / totalWorkers);
//   const start = workerIndex * chunkSize;
//   const end = start + chunkSize;

//   return taxIds.slice(start, end);
// }

export function getCompanyCui(): string {
    const envCui = process.env.COMPANY_BUYER_CUI;
    if (envCui && envCui.trim()) {
        return envCui.trim();
    }

    // Simple fallback for local/dev: pick a random CUI from firms.json.
    // In CI parallel mode this can be replaced with a parallel-safe allocator.
    try {
        const candidatePaths = [
            path.resolve(process.cwd(), 'utils', 'data', 'firms.json'),
            path.resolve(moduleDir, '..', 'data', 'firms.json')
        ];

        const firmsPath = candidatePaths.find((p: string) => fs.existsSync(p));
        if (!firmsPath) {
            throw new Error('firms.json not found');
        }

        const raw = fs.readFileSync(firmsPath, 'utf-8');
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed) && 0 < parsed.length) {
            const cuis = parsed
                .map((entry: any) => entry?.taxId ?? entry?.tax_id ?? entry?.cui)
                .map((value: any) => ('number' === typeof value ? String(value) : value))
                .filter((value: any) => 'string' === typeof value && 0 < value.trim().length)
                .map((value: string) => value.trim());

            if (0 < cuis.length) {
                return cuis[Math.floor(Math.random() * cuis.length)];
            }
        }
    } catch {
        // fall through to error
    }

    throw new Error(
        'Missing COMPANY_BUYER_CUI env var and could not load a CUI from utils/data/firms.json. '
    );
}
