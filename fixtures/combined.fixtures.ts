import { mergeTests } from '@playwright/test';
import { test as clientTest } from './client.fixtures';
import { test as adminTest } from './admin.fixtures';


export const test = mergeTests(clientTest, adminTest);