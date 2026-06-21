# Fixtures

## Import Rule

All tests needing authentication or test data must import `test` from `utils/fixture`:

```typescript
// ✅
import { test } from '../../utils/fixture';

// ❌ Skips auth injection and data fixture
import { test } from '@playwright/test';
```

`expect` is not re-exported from `fixture.ts`. Import it separately:
```typescript
import { test } from '../../utils/fixture';
import { expect } from '@playwright/test';    // test files
import { Page, Locator, expect } from "@playwright/test"; // page objects
```

## `page` Fixture — Pre-authenticated Context

Overrides the base `page` to inject a stored auth state before each test:

```typescript
page: async ({ browser }, use, testInfo) => {
    const workerIndex = testInfo.workerIndex % siteConfig.workers;
    const storageState = `storage/${siteConfig.name}/user-${workerIndex}.json`;
    const context = await browser.newContext({ storageState });
    const workerPage = await context.newPage();
    await use(workerPage);
    await context.close();   // cleans up after each test automatically
},
```

The returned `page` is already authenticated. No `page.goto(loginUrl)` needed.

## `data` Fixture — Typed Test Data

Injects a `TestData` object into the test. Access via `{ page, data }` destructuring:

```typescript
test('Add product to cart', async ({ page, data }) => {
    await pageManager.getDashboardPage().addToCartButton(data.productName).click();
});
```

Current `TestData` shape (defined in `fixture.ts`):
```typescript
type TestData = {
    productName: string,      // "ZARA COAT 3"
    creditCardNumber: string, // "4542 9931 9292 2293"
    name: string,             // "Anshika"
    cvv: string,              // "452"
    couponValue: string,      // "rahulshettyacademy"
    countryName: string       // "Cuba"
}
```

To change fixture data values, edit the `use({...})` call in `fixture.ts`. This affects all tests using the `data` fixture.

## Extending Fixtures

To add a new property to `data`:
1. Add the key to `TestData` type in `fixture.ts`
2. Add the value to the `use({...})` call

To add a new fixture entirely:
```typescript
type Fixtures = {
    data: TestData;
    adminData: AdminTestData;
}

export const test = base.extend<Fixtures>({
    page: async ({ browser }, use, testInfo) => { /* ... */ },
    data: async ({ }, use) => { /* ... */ },
    adminData: async ({ }, use) => { await use({ /* ... */ }); }
});
```

## Fixture Scope

Both fixtures are test-scoped (Playwright default). Fresh `page` and `data` per test — no shared state between tests.

For choosing between the `data` fixture vs JSON imports vs inline constants, see `test-data-management.md`.
