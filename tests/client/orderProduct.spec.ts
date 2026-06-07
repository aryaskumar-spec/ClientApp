import { test } from '../../utils/fixture'
import { siteConfig } from '../../utils/testUsers';
import { PageManager } from '../../pages/client/clientSitePageManager'
import dataSet from '../../utils/clientSiteMultipleData.json'
import data from '../../utils/clientSiteSingleData.json'

test(`Purchase ${data.productName}`, async ({ page }, testInfo) => {
   const workerIndex = testInfo.workerIndex;
   const userEmail = siteConfig.users[workerIndex].username;  // ← dynamic per worker

   const pageManager = new PageManager(page)

   const cartPage = pageManager.getCartPage();
   await cartPage.clearCart(workerIndex);

   const dashboardPage = pageManager.getDashboardPage()
   await dashboardPage.goToSite()
   await dashboardPage.addToCartButton(data.productName).click();
   await dashboardPage.cartButton.click();
   await dashboardPage.verifyCartPageNavigation()

   await cartPage.getProductBuyNow(data.productName).click();
   await cartPage.verifyCheckoutPageNavigation()

   const checkoutPage = pageManager.getCheckoutPage()
   await checkoutPage.waitForPaymentInfo()
   await checkoutPage.verifyCreditCardPrePopulatedValue(data.creditCardNumber)
   await checkoutPage.verifyEmailIdInShippingInfo(userEmail)
   await checkoutPage.cvvField.fill(data.cvv);
   await checkoutPage.nameOnCardField.fill(data.name);
   await checkoutPage.coupon.fill(data.couponValue);
   await checkoutPage.applyButton.click()
   await checkoutPage.verifyCouponApplied()
   await checkoutPage.country.pressSequentially(data.countryName.substring(0, 3), { delay: 150 });
   await checkoutPage.countryDropdown.first().waitFor();
   await checkoutPage.pickCountryFromDropDown(data.countryName)
   await checkoutPage.placeOrderButton.click();
   await checkoutPage.verifyThankyouPageNavigation()
   await checkoutPage.verifyOrderIdVisibleInOrderHistory()
});

//Parameterization in running tests with different data sets
for (const data of dataSet) {
   test(`Purchase ${data.productName} with other product`, async ({ page }, testInfo) => {
      const workerIndex = testInfo.workerIndex;
      const userEmail = siteConfig.users[workerIndex].username;  // ← dynamic per worker

      const pageManager = new PageManager(page)

      const cartPage = pageManager.getCartPage();
      await cartPage.clearCart(workerIndex);

      const dashboardPage = pageManager.getDashboardPage()
      await dashboardPage.goToSite()
      await dashboardPage.addToCartButton(data.productName).click();
      await dashboardPage.cartButton.click();
      await dashboardPage.verifyCartPageNavigation()

      await cartPage.getProductBuyNow(data.productName).click();
      await cartPage.verifyCheckoutPageNavigation()

      const checkoutPage = pageManager.getCheckoutPage()
      await checkoutPage.waitForPaymentInfo()
      await checkoutPage.verifyCreditCardPrePopulatedValue(data.creditCardNumber)
      await checkoutPage.verifyEmailIdInShippingInfo(userEmail)
      await checkoutPage.cvvField.fill(data.cvv);
      await checkoutPage.nameOnCardField.fill(data.name);
      await checkoutPage.coupon.fill(data.couponValue);
      await checkoutPage.applyButton.click()
      await checkoutPage.verifyCouponApplied()
      await checkoutPage.country.pressSequentially(data.countryName.substring(0, 3), { delay: 150 });
      await checkoutPage.countryDropdown.first().waitFor();
      await checkoutPage.pickCountryFromDropDown(data.countryName)
      await checkoutPage.placeOrderButton.click();
      await checkoutPage.verifyThankyouPageNavigation()
      await checkoutPage.verifyOrderIdVisibleInOrderHistory()
   })
}

//Pass test data as fixture by extend test annotation behavior
test('Add product to cart', async ({ page, data }) => {
   const pageManager = new PageManager(page)
   const dashboardPage = pageManager.getDashboardPage()
   await dashboardPage.goToSite()
   await dashboardPage.addToCartButton(data.productName).click();
   await dashboardPage.cartButton.click();
   await dashboardPage.verifyCartPageNavigation()
})
