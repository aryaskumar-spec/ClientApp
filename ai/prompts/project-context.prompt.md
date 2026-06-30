# Project Context

## Application

Rahul Shetty Academy e-commerce client app
URL: https://rahulshettyacademy.com/client

---

## Framework

Playwright with TypeScript, Page Object Model (POM).
Custom test fixture in `utils/fixture.ts`.
PageManager pattern — all page objects accessed via `PageManager`.

---

## Actual Folder Structure

```
pages/
└── client/
    ├── clientSitePageManager.ts   ← PageManager — always use this
    ├── loginPage.ts
    ├── dashboardPage.ts
    ├── cartPage.ts
    ├── checkoutPage.ts
    └── registerUserPage.ts

tests/
└── client/
    └── *.spec.ts

utils/
    ├── fixture.ts                 ← custom test fixture (import test from here)
    ├── testUsers.ts               ← siteConfig, credentials
    ├── ApiUtils.ts
    ├── storageHelper.ts
    ├── clientSiteSingleData.json
    └── clientSiteMultipleData.json

generated/
├── pages/                         ← AI generated Page Objects go here
└── tests/                         ← AI generated tests go here
```

---

## Existing Page Objects

Inspect `pages/client/` before generating anything.

Existing pages: `loginPage.ts`, `dashboardPage.ts`, `cartPage.ts`, `checkoutPage.ts`, `registerUserPage.ts`.

Reuse them — never duplicate.

---

## New Page Objects

Only create a new Page Object if no suitable one exists in `pages/client/`.

Place new Page Objects under:
```
generated/pages/<FeatureName>Page.ts
```

Example: `generated/pages/ProductPage.ts`

---

## Test Imports — Choosing the Right `test` Import

The correct import depends on whether the test requires a pre-authenticated browser session.

### Tests that start from a logged-in state (e.g. dashboard, cart, checkout, order history)

Use the custom fixture — it injects a pre-authenticated `page`:

```typescript
import { test } from '../../utils/fixture'
import { expect } from '@playwright/test'
import { PageManager } from '../../pages/client/clientSitePageManager'
```

### Tests that navigate to the login page themselves (e.g. invalid credentials, registration)

Use base Playwright `test` directly — the custom fixture loads stored auth state which
will conflict with manual navigation to the login page and cause the browser context to close:

```typescript
import { test, expect } from '@playwright/test'
```

**Decision rule:**
- Does the test call `goToSite()` on the login/register page and interact with the login form? → use `@playwright/test`
- Does the test start from an already-authenticated page (dashboard, cart, etc.)? → use `utils/fixture`

---

## PageManager Usage

Always instantiate `PageManager` and use its getters. Never instantiate page objects directly.

```typescript
const pageManager = new PageManager(page)
const dashboardPage = pageManager.getDashboardPage()
const cartPage = pageManager.getCartPage()
```

---

## Custom Fixture

`utils/fixture.ts` exports a custom `test` that provides:
- `page` — pre-authenticated browser page (no UI login needed)
- `data` — typed test data: `productName`, `creditCardNumber`, `name`, `cvv`, `couponValue`, `countryName`

Use `{ page, data }` destructuring to access both.

---

## Test Data

Single dataset: `import data from '../../utils/clientSiteSingleData.json'`
Multiple datasets: `import dataSet from '../../utils/clientSiteMultipleData.json'` + `for...of` loop

Never hardcode product names, card numbers, or credentials in test bodies.

---

## Naming Conventions

| Artifact | Pattern | Example |
|----------|---------|---------|
| Page Object file | `camelCasePage.ts` | `productPage.ts` |
| Page Object class | `PascalCasePage` | `ProductPage` |
| Test file | `camelCase.spec.ts` | `addToCart.spec.ts` |
| Navigation method | `goToSite()` | `goToSite()` |
| Assertion method | `verify` prefix | `verifyCartNavigation()` |

---

## Assertions

Assertions belong only in test files or page object `verify*` methods.
Never place raw `expect()` calls outside of those.

---

## Synchronization

Use Playwright auto-waiting. Never use `page.waitForTimeout()`.
Use `await locator.waitFor()` for elements that load slowly.

---

## Generation Policy

Never modify files under `pages/`, `tests/`, or `utils/`.
Only generate new artifacts inside `generated/pages/` and `generated/tests/`.
