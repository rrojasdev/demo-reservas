import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './frontend/tests',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'DATABASE_PATH=./db/e2e.db PORT=3000 npm run dev',
      url: 'http://127.0.0.1:3000/api/auth/me',
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command: 'npm run dev:frontend',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
