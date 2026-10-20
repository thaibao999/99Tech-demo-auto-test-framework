import { defineConfig, devices } from '@playwright/test'
import { BASE_URL } from './e2e-tests/utils/env'

export default defineConfig({
  testDir: './e2e-tests/tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  globalTimeout: 18_000_000, // 5 hours
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure-and-retries',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // API tests don't use a browser, so they run once instead of once per browser.
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
    },
    {
      name: 'chromium',
      testIgnore: /.*\.api\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: /.*\.api\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
      default: false,
    },
    {
      name: 'webkit',
      testIgnore: /.*\.api\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
      default: false,
    },
  ],
})
