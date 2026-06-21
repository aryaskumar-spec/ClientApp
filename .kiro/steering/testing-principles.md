# Testing Principles

## Test Independence

Each test is fully isolated:
- Each worker has its own dedicated user — no credential sharing
- Each test gets a fresh browser context from the `page` fixture
- `cartPage.clearCart(workerIndex)` is available to reset state before a test (currently commented out in specs)
- No `beforeAll` shared state — isolation is always preferred

## Test Naming

Names describe what is verified, not how. Use dynamic names for parameterized tests:

```typescript
test('Check whether created orderid is visible in history page', ...)
test('Ensure that error message is shown on trying to view order details forbidden to user', ...)
test('@Api Intercept Orders Response to mimic no orders scenario', ...)
test(`Purchase ${data.productName}`, ...)
```

Tag interception tests with `@Api` in the name — enables `npm run apiLogin` grep filtering.

## Four Test Categories

| Category | Spec file | Pattern |
|---|---|---|
| UI flow | `orderProduct.spec.ts` | Custom `test` fixture + PageManager throughout |
| Hybrid API+UI | `orderProductViaApi.spec.ts` | `ApiUtils` for setup, then UI navigation + assert |
| Network interception | `networkInterception.spec.ts` | `page.route()` mock + `waitForResponse` + assert |
| Security/authorization | `securityTesting.spec.ts` | `route.continue({ url })` rewrite + error message assert |

## Parameterized Tests

```typescript
import dataSet from '../../utils/clientSiteMultipleData.json'

for (const data of dataSet) {
    test(`Purchase ${data.productName} with other product`, async ({ page }, testInfo) => {
        // ...
    })
}
```

Always include a data-driven identifier in the test name so failures are immediately traceable in the report.

## Skipping Tests

```typescript
test.skip(`Register and login to the application`, async ({ page }) => { ... });
```

Never delete or comment out a test body. `test.skip()` keeps it visible in the report.

## Assertions

UI assertions belong in page object `verify*` methods. Inline `expect` is acceptable only in hybrid and interception tests where the assertion is tightly coupled to API-layer state.

```typescript
// URL — always regex, never exact string
await expect(page).toHaveURL(/dashboard\/myorders/);

// Visibility
await expect(locator).toBeVisible();

// Text content
await expect(page.locator('.hero-primary')).toHaveText(' Thankyou for the order. ');

// Input value (synchronous read)
const value = await this.creditCardNumberField.inputValue();
expect(value).toBe(creditCardNumber);
```

## What Tests Must Not Do

- Define locators inline — all locators belong in page object classes
- Import base `test` from `@playwright/test` when auth or `data` fixture is needed — use `utils/fixture`
- Use `page.waitForTimeout()` — no arbitrary sleeps
- Hardcode base URLs — use `siteConfig.baseURL` or page object `goToSite()`
- Access another worker's storage — always derive index from `testInfo.workerIndex`
- Leave a test without at least one assertion

For test data selection rules, see `test-data-management.md`.
