# Playwright Framework Standards

## Role

You are a Senior QA Automation Engineer working on an existing Playwright TypeScript framework.
Extend the existing framework. Never invent a new one.

---

## Step 1 — Parse Feature Name

Extract `[featureName]` from the issue title.
All paths, imports, and commands depend on this value.

| featureName | Generated pages               | Generated tests               |
|-------------|-------------------------------|-------------------------------|
| `client`    | `generated/pages/client/`     | `generated/tests/client/`     |
| `saucedemo` | `generated/pages/saucedemo/`  | `generated/tests/saucedemo/`  |
| `conduit`   | `generated/pages/conduit/`    | `generated/tests/conduit/`    |
| other        | `generated/pages/<featureName>/` | `generated/tests/<featureName>/` |

---

## Step 2 — Inspect Before Generating

### For `client` features:
1. Read `pages/client/` and list all existing Page Object files.
2. Read `pages/client/clientSitePageManager.ts` to see which pages are registered.
3. Also check `generated/pages/client/` for any previously AI-generated Page Objects.
4. Reuse existing ones. Only generate what is genuinely missing.
5. New Page Objects go to `generated/pages/client/`.

### For non-client features (saucedemo, conduit, etc.):
1. Check `generated/pages/<featureName>/` for any existing Page Objects.
2. Use Playwright MCP to navigate the site URL and take a DOM snapshot.
3. Extract locators from the snapshot — never guess locators for pages you haven't inspected.
4. Generate Page Objects based on the live DOM.
5. Do NOT create a PageManager — tests instantiate page objects directly.

---

## Step 3 — Page Object Rules

Every Page Object must follow this exact structure:

```typescript
import { Page, Locator, expect } from "@playwright/test";

export class ExamplePage {
    readonly page: Page;
    readonly someLocator: Locator;

    constructor(page: Page) {
        this.page = page;
        this.someLocator = page.getByRole('button', { name: 'Submit' });
    }

    async goToSite() {
        await this.page.goto('https://example.com');
    }

    async doSomething() { ... }

    async verifySomething() {
        await expect(this.page).toHaveURL(/expected-url/);
    }
}
```

Rules:
- `readonly page: Page` always first.
- Static locators as `readonly` properties set in constructor.
- Dynamic locators (depend on data) as synchronous methods returning `Locator` — not `async`.
- Navigation method named `goToSite()`.
- All assertion methods prefixed `verify` and `async`.
- No `test()` blocks, no hardcoded data, no `page.waitForTimeout()`.

---

## Locator Priority

Always extract locators by inspecting the live page via Playwright MCP snapshot (non-client features).
Use in this order:
1. `getByRole` with accessible name
2. `getByPlaceholder`
3. `getByLabel`
4. `getByText`
5. `locator(css)` with `.filter()` chaining
6. `locator(css)` with attribute selectors

Never use XPath. Never use bare `.nth()` without a scoped container.

---

## Step 4 — Test File Rules

### `client` — tests that navigate to login/register page:
```typescript
import { test, expect } from '@playwright/test'

test('descriptive test name', async ({ page }) => {
    const loginPage = new LoginPage(page)   // or use PageManager
    await loginPage.goToSite()
    // ...
})
```

### `client` — tests starting from authenticated state:
```typescript
import { test } from '../../../utils/fixture'   // 3 levels up from generated/tests/client/
import { expect } from '@playwright/test'
import { PageManager } from '../../../pages/client/clientSitePageManager'

test('descriptive test name', async ({ page }) => {
    const pageManager = new PageManager(page)
    const dashboardPage = pageManager.getDashboardPage()
    await dashboardPage.goToSite()
    // ...
})
```

### non-client features — inject token from utils/<featureName>/ApiUtils.ts:
```typescript
import { test, expect } from '@playwright/test'
import { getToken, saucedemoConfig } from '../../../utils/saucedemo/ApiUtils'
import { LoginPage } from '../../pages/saucedemo/LoginPage'

test('descriptive test name', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goToSite()
    // perform login via UI or inject token as needed
    await loginPage.verifyLoginSuccessful()
})
```

Note: For saucedemo and similar sites with no login API, perform login via UI in the test.
Only use `page.addInitScript()` token injection if the site has a real token-based auth API.

---

## Step 5 — Where to Save Files

| Artifact | Location |
|----------|----------|
| New Page Object — client | `generated/pages/client/<FeatureName>Page.ts` |
| New Page Object — other | `generated/pages/<featureName>/<FeatureName>Page.ts` |
| New test spec — client | `generated/tests/client/<testName>.spec.ts` |
| New test spec — other | `generated/tests/<featureName>/<testName>.spec.ts` |
| Auth utility — new site | `utils/<featureName>/ApiUtils.ts` |

Never write to `pages/`, `tests/`, or top-level `utils/*.ts` files.

---

## Coding Standards

- `async/await` throughout.
- No hardcoded waits.
- Meaningful variable names.
- No unused imports.
- No commented-out code.
- URL assertions always use regex: `expect(page).toHaveURL(/pattern/)`.
