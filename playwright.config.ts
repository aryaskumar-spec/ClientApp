import { defineConfig } from '@playwright/test';
import { siteConfig } from './utils/testUsers';

export default defineConfig({
  testDir: './tests',
  retries: 1,
  /* Run tests in files in parallel */
  fullyParallel: true,
  workers: 6,
  /* Report file type */
  reporter: [
    ['html', { open: 'on-failure' }]
  ],
  use: {
    browserName: 'chromium',
    headless: false,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  globalSetup: './global-setup.ts',
  projects: [
    {
      name: siteConfig.name,
      testDir: `./tests/${siteConfig.name}`,
      workers: siteConfig.workers,
      use: {
        baseURL: siteConfig.baseURL,
      },
    }
  ]
});
