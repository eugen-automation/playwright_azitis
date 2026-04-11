export function generateTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14); // ex: 20251111104530
}

/**
 * Returns a future datetime string relative to now.
 * @param minutes number of minutes in the future (default 2)
 */
export function futureDateTime(minutes = 2): string {
    const ms = Date.now() + Math.max(0, minutes) * 60_000;
    return formatDateFormatYMDHMS(new Date(ms));
}

/**
 * Return a formatted datetime string for the admin API:
 * YYYY-MM-DD HH:mm:ss
 */
function formatDateFormatYMDHMS(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = '00';
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}