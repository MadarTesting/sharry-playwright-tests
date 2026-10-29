import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'https://practice.expandtesting.com',

    /* Record a trace on every run so the steps show up in UI Mode */
    trace: 'on',
    screenshot: 'only-on-failure', // صورة عند الفشل بس
    video: 'retain-on-failure',    // فيديو يتحفظ عند الفشل بس
    // trace: 'on-first-retry',       // trace فيه خطوات وصور لكل خطوة

  },

  /* Configure projects */
  projects: [
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
});