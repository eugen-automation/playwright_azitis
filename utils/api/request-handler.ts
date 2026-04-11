import { APIRequestContext } from '@playwright/test';
import { APILogger } from './logger';
import { test } from '@playwright/test';

type MultipartValue = string | number | boolean | Buffer | NodeJS.ReadableStream | { name: string; mimeType?: string; buffer: Buffer };

function normalizeMultipartPayload(payload: Record<string, unknown>): Record<string, MultipartValue> {
    const normalized: Record<string, MultipartValue> = {};

    for (const [key, value] of Object.entries(payload)) {
        if (value === undefined || null === value) {
            normalized[key] = '';
            continue;
        }

        // Primitive types remain unchanged
        const valueType = typeof value;
        if ('string' === valueType || 'number' === valueType || 'boolean' === valueType) {
            normalized[key] = value as MultipartValue;
            continue;
        }

        // Handle Buffer directly
        if (Buffer.isBuffer(value)) {
            normalized[key] = value as Buffer;
            continue;
        }

        // Handle Node streams directly
        if (true === (value as NodeJS.ReadableStream)?.readable || 'function' === typeof (value as NodeJS.ReadableStream)?.on) {
            normalized[key] = value as NodeJS.ReadableStream;
            continue;
        }

        // Handle file-like objects { name?, mimeType?, buffer }
        if (isFileLikeObject(value)) {
            const candidate = value as Record<string, unknown>;
            const buffer = candidate['buffer'] as Buffer;
            const name = (candidate['name'] as string) || 'file.bin';
            const mimeType = (candidate['mimeType'] as string) || 'application/octet-stream';
            normalized[key] = { name, mimeType, buffer };
            continue;
        }

        // Fallback: stringify other objects
        try {
            normalized[key] = JSON.stringify(value);
        } catch {
            normalized[key] = String(value);
        }
    }

    return normalized;
}

function isFileLikeObject(value: unknown): boolean {
    if (!value || 'object' !== typeof value) return false;
    const candidate = value as Record<string, unknown>;
    // Accept objects that have a Buffer under 'buffer' property
    return Buffer.isBuffer(candidate['buffer'] as unknown) || Boolean(candidate['name'] && candidate['buffer']);
}

export class RequestHandler {

    private request: APIRequestContext;
    private logger: APILogger;
    private baseUrl: string | undefined;
    private defaultBaseUrl: string;
    private apiPath: string = '';
    private queryParams: object = {};
    private apiHeaders: Record<string, string> = {};
    // apiBody can be an object or raw string (for multipart bodies)
    private apiBody: any = {};
    private useMultipart: boolean = false;
    private defaultAuthToken: string;
    private clearAuthFlag: boolean;

    constructor(request: APIRequestContext, apiBaseUrl: string, logger: APILogger, authToken: string = '') {
        this.request = request;
        this.defaultBaseUrl = apiBaseUrl;
        this.logger = logger;
        this.defaultAuthToken = authToken;
    }

    url(url: string) {
        this.baseUrl = url;
        return this;
    }

    path(path: string) {
        this.apiPath = path;
        return this;
    }

    params(params: object) {
        this.queryParams = params;
        return this;
    }

    headers(headers: Record<string, string>) {
        this.apiHeaders = headers;
        return this;
    }

    body(body: any) {
        this.apiBody = body;
        return this;
    }

    /**
     * Set multipart form body. Accepts a record of field->value for Playwright multipart option.
     */
    multipart(body: Record<string, unknown>) {
        this.apiBody = body;
        this.useMultipart = true;
        return this;
    }

    clearAuth() {
        this.clearAuthFlag = true;
        return this;
    }

    async getRequest(statusCode: number) {
        let responseJSON: any;

        const url = this.getUrl();
        await test.step(`GET request to: ${url}`, async () => {
            this.logger.logRequest('GET', url, this.getHeades());
            const response = await this.request.get(url, {
                headers: this.getHeades()
            });
            this.cleanupFields();
            const actualStatus = response.status();
            responseJSON = await response.json();

            this.logger.logResponse(actualStatus, responseJSON);
            this.statusCodeValidator(actualStatus, statusCode, this.getRequest);
        });

        return responseJSON;
    }

    async postRequest(statusCode: number) {
        let responseJSON: any;
        const url = this.getUrl();

        await test.step(`POST request to: ${url}`, async () => {
            this.logger.logRequest('POST', url, this.getHeades(), this.apiBody);
            const requestOptions: any = { headers: this.getHeades() };
            if (this.useMultipart) {
                // Build a single multipart/form-data Buffer and set appropriate header.
                const normalized = normalizeMultipartPayload(this.apiBody);

                const boundary = `playwright-boundary-${Date.now()}`;

                async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
                    const chunks: Buffer[] = [];
                    return await new Promise((resolve, reject) => {
                        stream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))));
                        stream.on('end', () => resolve(Buffer.concat(chunks)));
                        stream.on('error', (err) => reject(err));
                    });
                }

                async function buildBuffer(): Promise<Buffer> {
                    const parts: Buffer[] = [];

                    for (const [name, val] of Object.entries(normalized)) {
                        const headerLines: string[] = [];
                        headerLines.push(`--${boundary}`);

                        // File-like
                        if (Buffer.isBuffer(val) || 'undefined' !== typeof (val as any).buffer || (true === (val as NodeJS.ReadableStream)?.readable || 'function' === typeof (val as NodeJS.ReadableStream)?.on)) {
                            // Determine filename and contentType
                            let filename = `${name}.bin`;
                            let contentType = 'application/octet-stream';
                            let fileBuffer: Buffer;

                            if (Buffer.isBuffer(val)) {
                                fileBuffer = val as Buffer;
                            } else if ('undefined' !== typeof (val as any).buffer) {
                                const candidate = val as any;
                                fileBuffer = candidate.buffer as Buffer;
                                filename = candidate.name || filename;
                                contentType = candidate.mimeType || contentType;
                            } else {
                                // It's a stream
                                const stream = val as NodeJS.ReadableStream;
                                fileBuffer = await streamToBuffer(stream);
                            }

                            headerLines.push(`Content-Disposition: form-data; name="${name}"; filename="${filename}"`);
                            headerLines.push(`Content-Type: ${contentType}`);
                            headerLines.push('');
                            parts.push(Buffer.from(`${headerLines.join('\r\n')  }\r\n`));
                            parts.push(fileBuffer);
                            parts.push(Buffer.from('\r\n'));
                            continue;
                        }

                        // Primitive value
                        headerLines.push(`Content-Disposition: form-data; name="${name}"`);
                        headerLines.push('');
                        headerLines.push(String(val));
                        parts.push(Buffer.from(`${headerLines.join('\r\n')  }\r\n`));
                    }

                    parts.push(Buffer.from(`--${boundary}--\r\n`));
                    return Buffer.concat(parts);
                }

                const bodyBuffer = await buildBuffer();
                requestOptions.data = bodyBuffer;
                requestOptions.headers = { ...requestOptions.headers, 'content-type': `multipart/form-data; boundary=${boundary}` };
            } else {
                requestOptions.data = this.apiBody;
            }

            console.log('POST URL:', url);
            console.log('POST Request Options:', requestOptions);

            const response = await this.request.post(url, requestOptions);
            this.cleanupFields();
            const actualStatus = response.status();
            try {
                responseJSON = await response.json();
            } catch (error) {
                responseJSON = {};
            }
            this.logger.logResponse(actualStatus, responseJSON);
            this.statusCodeValidator(actualStatus, statusCode, this.postRequest);
        });

        return responseJSON;
    }

    async putRequest(statusCode: number) {
        let responseJSON: any;

        const url = this.getUrl();
        await test.step(`PUT request to: ${url}`, async () => {
            this.logger.logRequest('PUT', url, this.getHeades(), this.apiBody);
            const response = await this.request.put(url, {
                headers: this.getHeades(),
                data: this.apiBody
            });
            this.cleanupFields();
            const actualStatus = response.status();
            try {
                responseJSON = await response.json();
            } catch (error) {
                responseJSON = {};
            }
            this.logger.logResponse(actualStatus, responseJSON);
            this.statusCodeValidator(actualStatus, statusCode, this.putRequest);
        });

        return responseJSON;
    }

    async deleteRequest(statusCode: number) {
        const url = this.getUrl();
        await test.step(`DELETE request to: ${url}`, async () => {
            this.logger.logRequest('DELETE', url, this.getHeades());
            const response = await this.request.delete(url, {
                headers: this.getHeades()
            });
            this.cleanupFields();
            const actualStatus = response.status();
            this.logger.logResponse(actualStatus);
            this.statusCodeValidator(actualStatus, statusCode, this.deleteRequest);
        });
    }


    private getUrl() {
        const url = new URL(`${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`);
        for (const [key, value] of Object.entries(this.queryParams)) {
            url.searchParams.append(key, String(value));
        }
        return url.toString();
    }

    private statusCodeValidator(actualStatus: number, expectStatus: number, callingMethod: Function) {
        if (actualStatus !== expectStatus) {
            const logs = this.logger.getRecentLogs();
            const error = new Error(`Expected status ${expectStatus} but got ${actualStatus}\n\nRecent API Activity: \n${logs}`);
            Error.captureStackTrace(error, callingMethod);
            throw error;
        }
    }

    private cleanupFields() {
        this.apiBody = {};
        this.useMultipart = false;
        this.apiPath = '';
        this.queryParams = {};
        this.apiHeaders = {};
        this.clearAuthFlag = false;
    }

    private getHeades() {
        if (!this.clearAuthFlag) {
            this.apiHeaders['Authorization'] = this.apiHeaders['Authorization'] || this.defaultAuthToken;
        }
        return this.apiHeaders;
    }

}