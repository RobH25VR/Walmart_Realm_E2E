import path from 'path';
import { config as loadEnv } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

loadEnv({ path: path.resolve(process.cwd(), 'playwright.env') });

export default defineConfig({
  testDir: './tests/perf',
  timeout: 60 * 1000,
  retries: 3,
  workers: 1,
  reporter: [
    ['list'],
    ['html'],
    ['json', { outputFile: 'playwright-report/report.json' }],
  ],
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20 * 1000,
    navigationTimeout: 60 * 1000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testMatch: /.*\.spec\.ts$/ },
  ],
});
