import { test } from '@playwright/test';

/**
 * Adds the baseURL to Allure report as a parameter
 * Call this in test.beforeEach or at the start of your test
 */
export function addBaseUrlToAllure(baseURL: string) {
    test.info().annotations.push({
        type: 'Base URL',
        description: baseURL
    });
}

/**
 * Adds environment info to current test
 */
export function addEnvironmentInfo(info: Record<string, string>) {
    for (const [key, value] of Object.entries(info)) {
        test.info().annotations.push({
            type: key,
            description: value
        });
    }
}
