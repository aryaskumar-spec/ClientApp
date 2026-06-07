import { expect, request } from '@playwright/test';
import { test } from '../../utils/fixture';
import { ApiUtils } from '../../utils/ApiUtils';
import { siteConfig } from '../../utils/testUsers';

const orderPayload = { orders: [{ country: "Angola", productOrderedId: "6960ea76c941646b7a8b3dd5" }] }

test('Check whether created orderid is visible in history page', async ({ page }, testInfo) => {
    const baseURL = siteConfig.baseURL;
    const apiContext = await request.newContext();
    const apiUtils = new ApiUtils(apiContext, testInfo.workerIndex);
    var orderId = await apiUtils.createOrder(orderPayload);
    await page.goto(baseURL!);

    await expect(page).toHaveURL(/dashboard\/dash/);

    //Navigate to Orders History
    await expect(page.locator('section[id="products"]')).toBeVisible()  //Ensure that products are loaded
    page.getByText('ORDERS').click()

    //Assert navigation to order history page and verify that the order number is visible in order history
    await expect(page).toHaveURL(/dashboard\/myorders/);
    await expect(page.getByText(orderId)).toBeVisible();   
});