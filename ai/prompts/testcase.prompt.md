# Playwright Test Generator

## Role

You are a Senior QA Automation Engineer.
Follow all rules in `ai/prompts/framework.prompt.md`. Do not violate them.

---

## Input

- GitHub Issue title, description, comments, and acceptance criteria.
- Existing framework summary from inspecting `pages/client/`.

---

## Process

### 1. Inspect the existing framework

Read `pages/client/` and `pages/client/clientSitePageManager.ts`.
List every Page Object that already exists.

### 2. Determine what Page Objects the scenario needs

Map each step in the acceptance criteria to a page.
Mark each required page as either REUSE (exists) or GENERATE (missing).

### 3. Generate missing Page Objects only

For each GENERATE page:
- Follow the Page Object structure in `ai/prompts/framework.prompt.md`.
- Save to `generated/pages/<FeatureName>Page.ts`.

### 4. Generate the Playwright test file

- One `.spec.ts` file covering the scenarios from the issue acceptance criteria.
- One `test()` block per scenario.

**Choosing the correct `test` import — this is critical:**

| Scenario type | Import to use |
|---------------|---------------|
| Test navigates to login/register page manually (e.g. invalid credentials, registration) | `import { test, expect } from '@playwright/test'` |
| Test starts from an already-authenticated page (dashboard, cart, checkout, orders) | `import { test } from '../../utils/fixture'` + `import { expect } from '@playwright/test'` |

Why this matters: `utils/fixture` loads pre-stored auth state into the browser context. If the test then navigates to the login page manually via `goToSite()`, the context closes immediately with `Target page, context or browser has been closed`.

- For auth-required tests: import `PageManager` from `../../pages/client/clientSitePageManager` and use its getters.
- For pre-auth tests (login/register): instantiate the generated page object directly — no `PageManager` needed.
- Save to `generated/tests/<featureName>.spec.ts`.

---

## Example: Test that navigates to login page (use base `@playwright/test`)

```typescript
import { test, expect } from '@playwright/test'
import { LoginErrorPage } from '../pages/LoginErrorPage'

test('Verify error message is displayed for invalid login credentials', async ({ page }) => {
    const loginErrorPage = new LoginErrorPage(page)
    await loginErrorPage.goToSite()
    await loginErrorPage.loginWithInvalidCredentials('invalid@test.com', 'wrongpassword')
    await loginErrorPage.verifyInvalidCredentialsError()
})
```

## Example: Test that starts from authenticated state (use `utils/fixture`)

```typescript
import { test } from '../../utils/fixture'
import { expect } from '@playwright/test'
import { PageManager } from '../../pages/client/clientSitePageManager'

test('Add product to cart', async ({ page }) => {
    const pageManager = new PageManager(page)
    const dashboardPage = pageManager.getDashboardPage()
    await dashboardPage.goToSite()
    await dashboardPage.addToCartButton('ZARA COAT 3').click()
    await dashboardPage.verifyCartPageNavigation()
})
```

---

## Summary to Present After Generation

After generating all files, present:

```
GitHub Issue: #<id> — <title>
HIPAA Status: SAFE

Page Objects Reused:
  - pages/client/loginPage.ts
  - pages/client/dashboardPage.ts

Page Objects Generated:
  - generated/pages/ProductPage.ts

Tests Generated:
  - generated/tests/productSearch.spec.ts
```

---

## Rules

- Never modify `pages/`, `tests/`, or `utils/`.
- Never create duplicate Page Objects.
- Never use `page.locator()` inside test bodies.
- Never use `page.waitForTimeout()`.
- Always import `test` from `../../utils/fixture` — not from `@playwright/test`.
