import { expect } from '@playwright/test'
import { test } from '../../utils/fixture'
import { siteConfig } from '../../utils/testUsers';

const GET_ORDER_DETAILS_BY_ID = "https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id="

const BASE_URL = siteConfig.baseURL || "https://rahulshettyacademy.com/client/#/auth/login";

test('Ensure that error message is shown on trying to view order details forbidden to user', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.route(`${GET_ORDER_DETAILS_BY_ID}*`, route => route.continue({ url: `${GET_ORDER_DETAILS_BY_ID}621661f884b053f6765465b6` }))
    await page.getByText('ORDERS').click();
    await expect(page).toHaveURL(/dashboard\/myorders/);
    await expect(page.locator("button:has-text('View')").first()).toBeVisible()
    await page.locator("button:has-text('View')").first().click()
    await expect(page.getByText('You are not authorize to view this order')).toBeVisible()
});




