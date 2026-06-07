import { test as base } from '@playwright/test';
import { siteConfig } from './testUsers';

type TestData = {
  productName: string,
  creditCardNumber: string,
  name: string,
  cvv: string,
  couponValue: string,
  countryName: string
}

type Fixtures = {
  data: TestData;
}

export const test = base.extend<Fixtures>({
  page: async ({ browser }, use, testInfo) => {
    const workerIndex = testInfo.workerIndex % siteConfig.workers;
    const storageState = `storage/${siteConfig.name}/user-${workerIndex}.json`;

    const context = await browser.newContext({ storageState });
    const workerPage = await context.newPage();

    await use(workerPage);
    await context.close();
  },

  data: async ({ }, use) => {
    await use({
      productName: "ZARA COAT 3",
      creditCardNumber: "4542 9931 9292 2293",
      name: "Anshika",
      cvv: "452",
      couponValue: "rahulshettyacademy",
      countryName: "Cuba"
    });
  }
});