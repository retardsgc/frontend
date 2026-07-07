import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageStatePath = path.resolve(__dirname, './tests/.auth/user.json');
const hasStorageState = fs.existsSync(storageStatePath);

/**
 * Playwright configuration for E-Commerce frontend tests
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run tests sequentially for checkout flow
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for sequential tests
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5177',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    storageState: hasStorageState ? storageStatePath : undefined,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5177',
  //   reuseExistingServer: !process.env.CI,
  // },
});
