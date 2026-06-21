# Implementation Plan

## Overview

These tasks implement the end-to-end "Place Product Order" workflow as defined in `spec.md`. Work is organised by layer dependency — data and page object infrastructure must be in place before test authoring begins. Tasks within the same layer (TASK-02, TASK-03, TASK-04) are independent and can be executed in parallel.

## Tasks

- [ ] 1. Verify and align test data files with the specification
  - Confirm `utils/clientSiteSingleData.json` contains one complete dataset: `productName` "iphone 13 pro", `creditCardNumber` "4542 9931 9292 2293", `name` "Arya S Kumar", `cvv` "452", `couponValue` "rahulshettyacademy", `countryName` "India"
  - Confirm `utils/clientSiteMultipleData.json` contains two dataset objects: Dataset 1 — "ZARA COAT 3" / "Cuba" / "Anshika"; Dataset 2 — "iphone 13 pro" / "India" / "Arya S Kumar"; both sharing the same `creditCardNumber`, `cvv`, and `couponValue`
  - Confirm `utils/fixture.ts` declares a `TestData` type with all six keys (`productName`, `creditCardNumber`, `name`, `cvv`, `couponValue`, `countryName`) and supplies Dataset 1 as the default via the `use({...})` call
  - Confirm all three sources share identical key names with no spelling deviations
  - _References: spec.md Preconditions, FR-12, test-data-management.md_

- [ ] 2. Implement `DashboardPage` for product catalogue and cart navigation
  - Add `readonly cartButton` locator using `page.locator('nav').getByText('Cart')` — scoped to nav
  - Add `goToSite()` async method navigating to `https://rahulshettyacademy.com/client` — only place this URL is hardcoded
  - Add `addToCartButton(productName: string)` synchronous method returning a `Locator` — scopes to `.card-body`, filters by `hasText: productName`, takes `.first()`, chains `getByRole('button', { name: 'Add To Cart' })`; not `async`
  - Add `verifyCartPageNavigation()` async method asserting URL matches regex `/dashboard\/cart/`
  - File: `pages/client/dashboardPage.ts`
  - _References: spec.md FR-02, FR-03, AC-01_

- [ ] 3. Implement `CartPage` for cart review, checkout initiation, and cart reset
  - Add `readonly cart` locator using `page.locator('div[class="cart"]')` — exact class attribute match
  - Add `readonly cartItems` locator using `page.locator('div[class="cart"] ul')`
  - Add `getProductBuyNow(productName: string)` synchronous method returning a `Locator` — scopes to `this.cart`, filters by `hasText: productName`, chains `getByRole('button', { name: 'Buy Now' })`, takes `.first()`; not `async`
  - Add `verifyCheckoutPageNavigation()` async method asserting URL matches regex `/dashboard\/order/`
  - Add `clearCart(workerIndex: number): Promise<void>` async method — instantiates `ApiUtils` with a new `request.newContext()`, fetches cart items, deletes each by `_id`, disposes `apiContext`; accepts `workerIndex` as parameter, never hardcoded; no assertions inside
  - File: `pages/client/cartPage.ts`
  - _References: spec.md FR-04, AC-02, EC-01_

- [ ] 4. Implement `CheckoutPage` for payment, coupon, country, confirmation, and order history verification
  - Add all seven `readonly` locators in constructor with `.nth()` locators commented with field names: `creditCardNumberField` (nth 0), `cvvField` (nth 1), `nameOnCardField` (nth 2), `coupon` (nth 3), `applyButton` (`getByRole('button', { name: 'Apply Coupon' })`), `placeOrderButton` (`getByText('Place Order')`), `country` (`getByPlaceholder("Select Country")`)
  - Add `verifyCreditCardPrePopulatedValue(creditCardNumber: string)` — reads `inputValue()` and asserts using synchronous `expect(value).toBe(creditCardNumber)`; comment: `//Assert that credit card number field is not empty and has the expected value`
  - Add `verifyCouponApplied()` — asserts `page.locator('p:has-text("* Coupon Applied")')` is visible; comment: `//Assert that coupon is applied`
  - Add `verifyEmailIdInShippingInfo(emailId: string)` — asserts `page.getByText(emailId)` is visible; comment: `//Assert email id in shipping info`
  - Add `verifyThankyouPageNavigation()` — asserts URL matches `/dashboard\/thank/` and `.hero-primary` has text `' Thankyou for the order. '`; comment: `//Assert navigation to order confirmation page and verify order details`
  - Add `verifyOrderIdVisibleInOrderHistory()` — reads `textContent()` from `td.em-spacer-1 label.ng-star-inserted`, splits on `|`, trims to extract order number, clicks `label[routerlink="/dashboard/myorders"]`, asserts URL matches `/dashboard\/myorders/`, asserts `page.getByText(orderNumber)` is visible; comment: `//Assert navigation to order history page and verify that the order number is visible in order history`
  - File: `pages/client/checkoutPage.ts`
  - _References: spec.md FR-05, FR-06, FR-07, FR-08, FR-09, FR-10, FR-11, AC-03–AC-08, EC-04_

- [ ] 5. Register all workflow pages in `PageManager`
  - Confirm `readonly dashboardPage: DashboardPage`, `readonly cartPage: CartPage`, `readonly checkoutPage: CheckoutPage` are declared and instantiated in the constructor with the shared `page` argument
  - Confirm `getDashboardPage()`, `getCartPage()`, `getCheckoutPage()` getter methods are present and return their respective instances
  - Confirm all imports use relative paths
  - File: `pages/client/clientSitePageManager.ts`
  - _References: spec.md FR-01, architecture.md PageManager Pattern_

- [ ] 6. Write the single-product end-to-end purchase test
  - Import `test` from `../../utils/fixture`, `PageManager` from `../../pages/client/clientSitePageManager`, `data` (default) from `../../utils/clientSiteSingleData.json`
  - Test name: `` `Purchase ${data.productName}` `` (dynamic)
  - Test body in order: obtain `workerIndex` from `testInfo.parallelIndex`; instantiate `PageManager`; obtain `cartPage` (clear cart call present but commented out); obtain `dashboardPage`; call `goToSite()`; click `addToCartButton(data.productName)`; click `cartButton`; call `verifyCartPageNavigation()`; click `getProductBuyNow(data.productName)`; call `verifyCheckoutPageNavigation()`; obtain `checkoutPage`; `await creditCardNumberField.waitFor()`; call `verifyCreditCardPrePopulatedValue(data.creditCardNumber)`; fill `cvvField`, `nameOnCardField`, `coupon`; click `applyButton`; call `verifyCouponApplied()`; `pressSequentially` on `country` with `data.countryName.substring(0, 3)` and `{ delay: 150 }`; click `getByText(data.countryName, { exact: true })`; click `placeOrderButton`; call `verifyThankyouPageNavigation()`; call `verifyOrderIdVisibleInOrderHistory()`
  - File: `tests/client/orderProduct.spec.ts`
  - _References: spec.md FR-01–FR-11, AC-01–AC-08_

- [ ] 7. Write the parameterized multi-product purchase tests
  - Add `dataSet` (default import) from `../../utils/clientSiteMultipleData.json` to the imports
  - Wrap in `for (const data of dataSet)` loop — not `test.each` or any other pattern
  - Test name inside loop: `` `Purchase ${data.productName} with other product` `` (dynamic, includes product name for traceable failure reporting)
  - Test body follows the exact same step sequence as Task 6, substituting the loop variable `data` for the imported single `data` object
  - File: `tests/client/orderProduct.spec.ts`
  - _References: spec.md FR-12, AC-09_

- [ ] 8. Write the add-to-cart only test using the fixture `data` object
  - Test name: `'Add product to cart'`
  - Test function signature: `async ({ page, data }) => { ... }` — destructures both `page` and `data` from the custom fixture
  - Test body in order: instantiate `PageManager`; obtain `dashboardPage`; call `goToSite()`; click `addToCartButton(data.productName)`; click `cartButton`; call `verifyCartPageNavigation()`
  - No checkout, payment, or order steps — scoped to cart navigation only
  - File: `tests/client/orderProduct.spec.ts`
  - _References: spec.md FR-02, FR-03, AC-01_

- [ ] 9. Verify final structure of `orderProduct.spec.ts`
  - `test` imported from `../../utils/fixture` (not `@playwright/test`)
  - All three tests present: single-product purchase, parameterized purchase loop, add-to-cart only
  - No inline locator definitions in test bodies
  - No `page.waitForTimeout()` calls
  - No hardcoded URLs in test body
  - `creditCardNumberField.waitFor()` called before `verifyCreditCardPrePopulatedValue` in both purchase tests
  - Cart clear call present but commented out in both purchase tests
  - `pressSequentially` with `{ delay: 150 }` used for country autocomplete in both purchase tests
  - Country selection uses `getByText(data.countryName, { exact: true })` for the autocomplete click
  - File: `tests/client/orderProduct.spec.ts`
  - _References: spec.md all acceptance criteria, coding-standards.md, testing-principles.md_

## Notes

- TASK-02, TASK-03, and TASK-04 are independent page object classes and can be implemented in parallel.
- TASK-07 and TASK-08 add tests to the same file as TASK-06. All three tests must coexist in `tests/client/orderProduct.spec.ts`.
- `clearCart(workerIndex)` in `CartPage` is available for pre-test state reset but is intentionally commented out in the spec file — uncomment only if test isolation requires a clean cart state.
- The country autocomplete requires `pressSequentially` with `delay: 150` rather than `fill()` — this matches the Angular type-ahead behaviour and is the established framework pattern.
- The order reference number on the confirmation page is embedded in a pipe-delimited string. Extraction logic (split on `|`, take index `[1]`, trim) is encapsulated inside `verifyOrderIdVisibleInOrderHistory()` and must not be duplicated in the test layer.
- `test` must always be imported from `utils/fixture` in this spec file — the base `@playwright/test` test does not provide pre-authenticated page context or the `data` fixture.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": [1] },
    { "wave": 2, "tasks": [2, 3, 4] },
    { "wave": 3, "tasks": [5] },
    { "wave": 4, "tasks": [6] },
    { "wave": 5, "tasks": [7, 8] },
    { "wave": 6, "tasks": [9] }
  ]
}
```
