import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60 * 1000, 
  retries: 3,
  reporter: 
  [['list'],
   ['html'],
  ['json', { outputFile: 'playwright-report/report.json' }]
],
  // optional: HTML report
  use: {
    headless: true, // run in headless mode
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20 * 1000,
    navigationTimeout: 60 * 1000,
  },
  projects: [
    // ------------------------
    // Desktop browsers
    // ------------------------
    {
      name: 'chromium',
      workers: 4, // safe parallelism
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /^(?!.*iPhone).*\.spec\.ts$/,
    },
    {
      name: 'webkit',
      workers: 1, // WebKit is slower & flakier in parallel
      use: {
        ...devices['Desktop Safari'],
      },
      testMatch: /^(?!.*iPhone).*\.spec\.ts$/,
    },

    // ------------------------
    // Mobile
    // ------------------------
    {
      name: 'iPhone',
      workers: 2, // mobile should be serial
      use: {
        ...devices['iPhone 13'],
      },
      testMatch: /.*iPhone\.spec\.ts$/,
    },
    {
      name: 'iPad',
      workers: 1,
      use: {
        ...devices['iPad Pro'],
      },
      testMatch: /^(?!.*iPhone).*\.spec\.ts$/,
    },
  ],
});
