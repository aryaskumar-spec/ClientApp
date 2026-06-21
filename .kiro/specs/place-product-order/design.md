# Design Document

## Overview

This document describes the technical implementation design for the Place Product Order feature. The workflow spans all three Playwright framework layers: the utility/infra layer (test data, fixtures, API helpers), the page object layer (locators, actions, assertions), and the test layer (orchestration). All components are either already present in the framework or are natural extensions of established patterns — no new architectural patterns are introduced.

The feature is implemented as a **UI flow test** (the established category for full end-to-end journeys). Three test variants in `tests/client/orderProduct.spec.ts` cover all acceptance criteria from the requirements document.

---

## Existing Playwright Components to Reuse

All of the following files already exist and are fully reusable for this workflow:

| Component | File | Role |
|---|---|---|
| `DashboardPage` | `pages/client/dashboardPage.ts` | Product catalogue, Add To Cart, cart navigation |
| `CartPage` | `pages/client/cartPage.ts` | Cart container, Buy Now, checkout navigation, cart reset |
| `CheckoutPage` | `pages/client/checkoutPage.ts` | Payment fields, coupon, country, order placement, confirmation, order history |
| `PageManager` | `pages/client/clientSitePageManager.ts` | Single entry point for all page object instantiation |
| `ApiUtils` | `utils/ApiUtils.ts` | `getCartItems()`, `deleteCartItem()` — used by `CartPage.clearCart()` |
| `fixture.ts` | `utils/fixture.ts` | Pre-authenticated `page` fixture; typed `data` fixture |
| `storageHelper.ts` | `utils/storageHelper.ts` | Token/userId extraction — used internally by `ApiUtils` only |
| `testUsers.ts` | `utils/testUsers.ts` | `siteConfig` — base URLs, worker count, credentials |
| `clientSiteSingleData.json` | `utils/clientSiteSingleData.json` | Single dataset for the fixed-product purchase test |
| `clientSiteMultipleData.json` | `utils/clientSiteMultipleData.json` | Array of datasets for the parameterized purchase test |
| `global-setup.ts` | `global-setup.ts` | Pre-test JWT authentication — no changes required |

---

## Proposed Implementation Approach

Three test variants cover all acceptance criteria. All three live in `tests/client/orderProduct.spec.ts` and import `test` from `utils/fixture`:

1. **Single-product purchase** — imports `clientSiteSingleData.json`, runs the complete end-to-end flow for "iphone 13 pro" / India. Covers AC-01 through AC-08.
2. **Parameterized multi-product purchase** — imports `clientSiteMultipleData.json`, runs the same flow for each dataset object via a `for...of` loop. Covers AC-09 and FR-12.
3. **Add-to-cart only** — uses the `data` fixture via `{ page, data }` destructuring, runs product selection and cart navigation only. Covers AC-01 in isolation.

---

## Architecture

```
Test Layer
  tests/client/orderProduct.spec.ts
  ├── Single-product purchase test  (imports clientSiteSingleData.json)
  ├── Parameterized purchase tests  (imports clientSiteMultipleData.json)
  └── Add-to-cart only test         (uses data fixture from fixture.ts)
            │
            ▼ uses PageManager
Page Object Layer
  pages/client/clientSitePageManager.ts
  ├── DashboardPage   → product catalogue, Add To Cart, cart nav
  ├── CartPage        → cart container, Buy Now, checkout nav, clearCart
  └── CheckoutPage    → payment fields, coupon, country, order placement,
                        confirmation, order history verification
            │
            ▼ uses
Utility / Infra Layer
  utils/fixture.ts              → pre-authenticated page + data fixture
  utils/testUsers.ts            → siteConfig (baseURL, apiBaseURL, workers)
  utils/ApiUtils.ts             → getCartItems(), deleteCartItem()
  utils/storageHelper.ts        → token/userId from storage (via ApiUtils only)
  utils/clientSiteSingleData.json
  utils/clientSiteMultipleData.json
  storage/client/user-N.json    → pre-authenticated session state
```

---

## Components and Interfaces

### `DashboardPage` (`pages/client/dashboardPage.ts`)

Covers workflow Steps 1–3: browse catalogue → add product → navigate to cart.

| Member | Kind | Locator / Behaviour |
|---|---|---|
| `cartButton` | `readonly Locator` | `page.locator('nav').getByText('Cart')` |
| `goToSite()` | async method | Navigates to `https://rahulshettyacademy.com/client` |
| `addToCartButton(productName)` | sync method → `Locator` | `.card-body` scoped, filtered by `hasText: productName`, `.first()`, `getByRole('button', { name: 'Add To Cart' })` |
| `verifyCartPageNavigation()` | async verify method | `expect(page).toHaveURL(/dashboard\/cart/)` |

### `CartPage` (`pages/client/cartPage.ts`)

Covers workflow Step 4: initiate checkout from cart. Also provides cart state reset.

| Member | Kind | Locator / Behaviour |
|---|---|---|
| `cart` | `readonly Locator` | `page.locator('div[class="cart"]')` |
| `cartItems` | `readonly Locator` | `page.locator('div[class="cart"] ul')` |
| `getProductBuyNow(productName)` | sync method → `Locator` | `this.cart` scoped, filtered by `hasText: productName`, `getByRole('button', { name: 'Buy Now' })`, `.first()` |
| `verifyCheckoutPageNavigation()` | async verify method | `expect(page).toHaveURL(/dashboard\/order/)` |
| `clearCart(workerIndex)` | async method → `Promise<void>` | Instantiates `ApiUtils`, fetches cart items, deletes each by `_id`, disposes `apiContext` |

### `CheckoutPage` (`pages/client/checkoutPage.ts`)

Covers workflow Steps 5–10: payment → coupon → country → place order → confirm → history.

| Member | Kind | Locator / Behaviour |
|---|---|---|
| `creditCardNumberField` | `readonly Locator` | `getByRole('textbox').nth(0)` |
| `cvvField` | `readonly Locator` | `getByRole('textbox').nth(1)` |
| `nameOnCardField` | `readonly Locator` | `getByRole('textbox').nth(2)` |
| `coupon` | `readonly Locator` | `getByRole('textbox').nth(3)` |
| `applyButton` | `readonly Locator` | `getByRole('button', { name: 'Apply Coupon' })` |
| `placeOrderButton` | `readonly Locator` | `getByText('Place Order')` |
| `country` | `readonly Locator` | `getByPlaceholder("Select Country")` |
| `verifyCreditCardPrePopulatedValue(creditCardNumber)` | async verify | `inputValue()` read, `expect(value).toBe(creditCardNumber)` |
| `verifyCouponApplied()` | async verify | `expect(page.locator('p:has-text("* Coupon Applied")')).toBeVisible()` |
| `verifyEmailIdInShippingInfo(emailId)` | async verify | `expect(page.getByText(emailId)).toBeVisible()` |
| `verifyThankyouPageNavigation()` | async verify | URL `/dashboard\/thank/` + `.hero-primary` text assertion |
| `verifyOrderIdVisibleInOrderHistory()` | async verify | Extracts order ID from pipe-delimited string; navigates to My Orders; asserts order ID visible |

### `PageManager` (`pages/client/clientSitePageManager.ts`)

| Member | Kind | Behaviour |
|---|---|---|
| `dashboardPage` | `readonly DashboardPage` | Instantiated in constructor |
| `cartPage` | `readonly CartPage` | Instantiated in constructor |
| `checkoutPage` | `readonly CheckoutPage` | Instantiated in constructor |
| `getDashboardPage()` | getter | Returns `this.dashboardPage` |
| `getCartPage()` | getter | Returns `this.cartPage` |
| `getCheckoutPage()` | getter | Returns `this.checkoutPage` |

---

## Data Models

### `TestData` (defined in `utils/fixture.ts`)

```
TestData {
  productName: string      // exact product name as it appears in catalogue
  creditCardNumber: string // pre-populated card number to verify at checkout
  name: string             // cardholder name entered at checkout
  cvv: string              // 3-digit CVV entered at checkout
  couponValue: string      // promotional coupon code
  countryName: string      // full country name for shipping autocomplete
}
```

### Dataset source mapping

| Test variant | Source | Key values |
|---|---|---|
| Single-product purchase | `clientSiteSingleData.json` | productName: "iphone 13 pro", countryName: "India" |
| Parameterized — iteration 1 | `clientSiteMultipleData.json[0]` | productName: "ZARA COAT 3", countryName: "Cuba" |
| Parameterized — iteration 2 | `clientSiteMultipleData.json[1]` | productName: "iphone 13 pro", countryName: "India" |
| Add-to-cart only | `fixture.ts` `data` fixture | productName: "ZARA COAT 3", countryName: "Cuba" |

All three file-based sources share the same six keys: `productName`, `creditCardNumber`, `name`, `cvv`, `couponValue`, `countryName`.

---

## Fixtures

### `page` fixture
Defined in `utils/fixture.ts`. Overrides the base Playwright `page` to load `storage/client/user-N.json` before each test. Worker mapping: `workerIndex = testInfo.workerIndex % siteConfig.workers`. The returned `page` is already authenticated — no UI login step required.

### `data` fixture
Also in `utils/fixture.ts`. Provides a default `TestData` object (ZARA COAT 3, Cuba). Used by the add-to-cart only test via `{ page, data }` destructuring. The single-product and parameterized tests use JSON imports directly.

---

## Utilities

| Utility | File | Usage in this workflow |
|---|---|---|
| `siteConfig` | `utils/testUsers.ts` | `baseURL` used in page object `goToSite()` methods; `workers` count for fixture modulo cap |
| `ApiUtils` | `utils/ApiUtils.ts` | Used by `CartPage.clearCart()` — `getCartItems()` and `deleteCartItem()` |
| `storageHelper` | `utils/storageHelper.ts` | Internal to `ApiUtils` only — not imported by tests or page objects |

---

## Test Data

See Data Models section above. All test data values are externally defined — no product names, card numbers, or coupon codes are hardcoded in test files or page objects.

---

## Sequence / Workflow

Full purchase flow (single-product test and each parameterized iteration):

```
[Pre-test]  global-setup.ts → storage/client/user-N.json (JWT injected)
[Fixture]   page fixture → browser context loaded with auth state

 1. dashboardPage.goToSite()
 2. dashboardPage.addToCartButton(productName).click()
 3. dashboardPage.cartButton.click()
 4. dashboardPage.verifyCartPageNavigation()          → /dashboard/cart
 5. cartPage.getProductBuyNow(productName).click()
 6. cartPage.verifyCheckoutPageNavigation()            → /dashboard/order
 7. checkoutPage.creditCardNumberField.waitFor()       → wait for page load
 8. checkoutPage.verifyCreditCardPrePopulatedValue()   → exact card match
 9. checkoutPage.cvvField.fill(cvv)
10. checkoutPage.nameOnCardField.fill(name)
11. checkoutPage.coupon.fill(couponValue)
12. checkoutPage.applyButton.click()
13. checkoutPage.verifyCouponApplied()                 → "* Coupon Applied" visible
14. checkoutPage.country.pressSequentially(
        countryName.substring(0, 3), { delay: 150 })  → trigger autocomplete
15. checkoutPage.page.getByText(
        countryName, { exact: true }).click()          → select from suggestions
16. checkoutPage.placeOrderButton.click()
17. checkoutPage.verifyThankyouPageNavigation()        → /dashboard/thank + message
18. checkoutPage.verifyOrderIdVisibleInOrderHistory()  → extract ID, nav to
                                                          /dashboard/myorders,
                                                          assert ID visible
```

---

## Design Decisions

- **Single spec file for all three tests** — `tests/client/orderProduct.spec.ts` groups all related purchase flow variants. This follows the framework's convention of grouping by feature rather than test type.
- **`for...of` loop for parameterization** — matches the established framework pattern. `test.each` is not used in this codebase.
- **`pressSequentially` with `{ delay: 150 }` for country autocomplete** — `fill()` does not trigger Angular's type-ahead. Character-by-character input with a delay is required to surface suggestions.
- **`creditCardNumberField.waitFor()` before checkout assertions** — checkout loads asynchronously after Buy Now. This wait ensures the page is interactive before any assertion or fill.
- **Order ID extraction encapsulated in `verifyOrderIdVisibleInOrderHistory()`** — the order reference on the confirmation page is embedded in a pipe-delimited string (e.g., `"Order # | ABC123"`). Split on `|`, take index `[1]`, trim. The test layer never handles the raw format.
- **`clearCart()` commented out by default** — available for test isolation when needed, but disabled by default to avoid unnecessary API calls. EC-01 is handled structurally by `.first()` in `getProductBuyNow`.
- **`data` fixture for add-to-cart test** — demonstrates fixture-injection pattern; keeps test data configurable from `fixture.ts`.

---

## Correctness Properties

### Property 1: Every test step is covered by at least one assertion
Each test must produce a failing assertion if the workflow breaks at any step — no silent pass-throughs are permitted. URL assertions cover navigation steps; visibility and value assertions cover page state.

**Validates: Requirements 1, 2, 3, 4, 5, 6, 7, 8**

### Property 2: Order ID consistency between confirmation and history
The order reference number extracted from the confirmation page must be the exact same string asserted visible in the order history list — no transformation, truncation, or reformatting occurs between extraction and assertion.

**Validates: Requirements 7, 8**

### Property 3: Checkout page readiness before interaction
`creditCardNumberField.waitFor()` must be called before any checkout field interaction or assertion, ensuring the async page load is complete and preventing race-condition failures.

**Validates: Requirements 4, 5, 6, 7**

### Property 4: API context always disposed after cart operations
Every call to `request.newContext()` inside `CartPage.clearCart()` must be paired with a corresponding `apiContext.dispose()` — including the early-return path when the cart is already empty.

**Validates: Requirements 3**

---

## Error Handling

- If `global-setup.ts` fails to authenticate any worker (API returns no token), it throws with a descriptive error and aborts the entire run.
- If `storageHelper` cannot find a token or userId in the storage file, it throws — the error is not swallowed.
- If `CartPage.clearCart()` finds an empty cart, it disposes the `apiContext` and returns early without error.
- Playwright's `retries: 1` setting provides one automatic retry for transient failures before a test is marked failed.

---

## Testing Strategy

- **Test category:** UI flow — full end-to-end purchase journeys using the `page` fixture for pre-authenticated context.
- **Parallel execution:** 6 workers, each mapped to a dedicated test user via `siteConfig.workers`. No credential sharing between workers.
- **Test isolation:** Each test gets a fresh browser context from the fixture. Cart state is user-scoped. `clearCart()` is available if explicit state reset is needed.
- **Traceability:** Test names include `data.productName` dynamically so failures in the HTML report are immediately identifiable by product.
- **Artifacts on failure:** Video, screenshot, and trace are all captured automatically (`retain-on-failure`) by `playwright.config.ts`.

---

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Product removed from catalogue | Fails at Add To Cart | Update `clientSiteSingleData.json` and `clientSiteMultipleData.json` |
| Coupon code deactivated | Fails at Apply Coupon | Update `couponValue` in JSON files and fixture — one change covers all tests |
| Country autocomplete timing | Suggestions don't appear | `pressSequentially` with `delay: 150` mitigates this |
| Cart state from prior run | Flaky Buy Now selection | `clearCart()` available; `.first()` handles EC-01 structurally |
| Order ID format change | `verifyOrderIdVisibleInOrderHistory()` breaks | Logic is in one method — single fix covers all tests |

---

## Dependencies

| Dependency | Type | Details |
|---|---|---|
| `@playwright/test` v1.60+ | Framework | Test runner, `expect`, `request`, `Locator`, `Page` APIs |
| `global-setup.ts` | Framework infra | Must run successfully before any test — generates `storage/client/user-N.json` |
| `siteConfig` in `utils/testUsers.ts` | Config | `baseURL` and `apiBaseURL` must point to the correct environment |
| `ApiUtils` | Utility | Required by `CartPage.clearCart()` — `getCartItems()` and `deleteCartItem()` must be functional |
| Storage state files `storage/client/user-N.json` | Runtime | Generated by `global-setup.ts` — must exist with valid JWT before tests run |
| Playwright Chromium browser | Runtime | The only browser configured in `playwright.config.ts` |
