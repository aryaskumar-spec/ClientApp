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
    headless: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  globalSetup: './global-setup.ts',
  projects: [
    // ── Handwritten tests ──────────────────────────────────────────
    {
      name: siteConfig.name,
      testDir: `./tests/${siteConfig.name}`,
      workers: siteConfig.workers,
      use: {
        baseURL: siteConfig.baseURL,
      },
    },

    // ── Generated tests — one project per feature ──────────────────
    {
      name: 'generated-client',
      testDir: './generated/tests/client',
      workers: 1,
      use: {
        baseURL: siteConfig.baseURL,
        headless: true,
      },
    },
    {
      name: 'generated-saucedemo',
      testDir: './generated/tests/saucedemo',
      workers: 1,
      use: {
        baseURL: 'https://www.saucedemo.com',
        headless: true,
      },
    },
    {
      name: 'generated-conduit',
      testDir: './generated/tests/conduit',
      workers: 1,
      use: {
        baseURL: 'https://conduit.bonfire.com.br',
        headless: true,
      },
    },
    // Add new feature projects above this line following the same pattern
  ]
});
