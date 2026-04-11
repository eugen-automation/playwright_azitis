// Minimal normalizer: a single exported function `normalizePrice`.
// It extracts a numeric amount from strings like "10.000 EUR" or "10,000.50"
// and returns `{ priceAmount, currency }`. Currency detection only looks for
// 3-letter codes (e.g. EUR, USD) and ignores currency symbols.

/**
 * Normalize a price display string into a numeric amount and optional currency code.
 * Examples:
 *  - "10.000 EUR" -> { priceAmount: 10000, currency: 'EUR' }
 *  - "10,000.50 USD" -> { priceAmount: 10000.5, currency: 'USD' }
 */
export function normalizePrice(input: string): { priceAmount: number; currency?: string } {
    const raw = (input ?? '').trim();
    if (!raw) return { priceAmount: 0 };

    // normalize NBSP and trim
    const s = raw.replace(/\u00A0/g, ' ').trim();

    // extract 3-letter currency code if present
    const codeMatch = s.match(/\b([A-Za-z]{3})\b/);
    const currency = codeMatch ? codeMatch[1].toUpperCase() : undefined;

    // find first numeric chunk (digits, possible separators)
    const numMatch = s.match(/\d[\d\.,\s]*/);
    const numChunk = (numMatch ? numMatch[0] : '').trim();
    if (!numChunk) return { priceAmount: 0, currency };

    // Remove spaces and thousand separators (dots/commas). There are no decimals
    // in this codepath per user constraints, so simply strip non-digits.
    const digitsOnly = numChunk.replace(/\s+/g, '').replace(/[.,]/g, '').replace(/[^0-9]/g, '');
    const priceAmount = digitsOnly ? parseInt(digitsOnly, 10) : 0;

    return { priceAmount, currency };
}