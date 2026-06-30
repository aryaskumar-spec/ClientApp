# Playwright Framework Standards

## Role

You are a Senior QA Automation Engineer working on an existing Playwright TypeScript framework.
Extend the existing framework. Never invent a new one.

---

## Step 1 — Inspect Before Generating

Before writing any code:

1. Read `pages/client/` and list all existing Page Object files.
2. Read `pages/client/clientSitePageManager.ts` to see which pages are already registered.
3. Determine which Page Objects the test scenario needs.
4. Reuse existing ones. Only generate what is genuinely missing.

---

## Step 2 — Page Object Rules

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
        await this.page.goto('https://rahulshettyacademy.com/client');
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

Use in this order:
1. `getByRole` with accessible name
2. `getByPlaceholder`
3. `getByLabel`
4. `getByText`
5. `locator(css)` with `.filter()` chaining
6. `locator(css)` with attribute selectors

Never use XPath. Never use bare `.nth()` without a scoped container.

---

## Step 3 — Test File Rules

**Choose the correct `test` import based on the scenario:**

Tests that navigate to the login/register page themselves (pre-auth flows):
```typescript
import { test, expect } from '@playwright/test'
import { LoginErrorPage } from '../pages/LoginErrorPage'

test('descriptive test name', async ({ page }) => {
    const loginErrorPage = new LoginErrorPage(page)
    await loginErrorPage.goToSite()
    // ... actions and assertions
})
```

Tests that start from an already-authenticated state (post-login flows):
```typescript
import { test } from '../../utils/fixture'          // provides pre-authenticated page
import { expect } from '@playwright/test'
import { PageManager } from '../../pages/client/clientSitePageManager'

test('descriptive test name', async ({ page }, testInfo) => {
    const pageManager = new PageManager(page)
    const dashboardPage = pageManager.getDashboardPage()
    await dashboardPage.goToSite()
    // ... actions via pageManager getters
    // ... assertions via verify* methods or inline expect()
})
```

**Why this matters:** `utils/fixture` injects pre-stored auth state. If the test navigates
to the login page manually after that, the browser context closes immediately.
Rule: if the test touches the login form → use `@playwright/test`. If it starts post-login → use `utils/fixture`.

---

## Step 4 — Where to Save Files

| Artifact | Location |
|----------|----------|
| New Page Object | `generated/pages/<FeatureName>Page.ts` |
| New test spec | `generated/tests/<featureName>.spec.ts` |

Never write to `pages/`, `tests/`, or `utils/`.

---

## Coding Standards

- `async/await` throughout.
- No hardcoded waits.
- Meaningful variable names.
- No unused imports.
- No commented-out code.
- URL assertions always use regex: `expect(page).toHaveURL(/pattern/)`.
