/**
 * Sanitize a string for safe filename/path usage.
 * Replaces any characters that are not alphanumeric, hyphen, or underscore with underscores.
 * @param value - The string to sanitize
 * @returns Sanitized string safe for filenames
 */
export function sanitizeForFilename(value: string): string {
    return value.replace(/[^a-z0-9-_]+/gi, '_');
}
