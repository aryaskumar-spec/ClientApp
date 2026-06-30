# Playwright Test Generator

## Role

You are a Senior QA Automation Engineer.
Follow all rules in `ai/prompts/framework.prompt.md`. Do not violate them.

---

## Input

- GitHub Issue title (contains `[featureName]`), description, comments, and acceptance criteria.
- Existing framework summary from inspecting the relevant page object directories.

---

## Process

### 1. Extract feature name

Parse `[featureName]` from the issue title. This controls every path decision below.

### 2. Inspect existing Page Objects

**For `[client]`:** Read `pages/client/` and `generated/pages/client/`. List every Page Object.

**For non-client:** Read `generated/pages/<featureName>/`. List every Page Object.
Then use Playwright MCP to navigate the site and snapshot pages needed for this issue.

### 3. Map acceptance criteria to pages

Mark each required page as REUSE (exists) or GENERATE (missing).

### 4. Generate missing Page Objects

For each GENERATE page:
- `[client]` → follow existing `pages/client/` structure, save to `generated/pages/client/`.
- non-client → use Playwright MCP snapshot locators, save to `generated/pages/<featureName>/`.

### 5. Generate the Playwright test file

One `.spec.ts` file per scenario. One `test()` block per acceptance criterion.

---

## Import Decision Table

| Scenario | Import |
|----------|--------|
| `[client]` — test starts from authenticated state (dashboard, cart, checkout) | `import { test } from '../../../utils/fixture'` + `import { expect } from '@playwright/test'` |
| `[client]` — test navigates to login/register page manually | `import { test, expect } from '@playwright/test'` |
| Any non-client feature | `import { test, expect } from '@playwright/test'` |

**Why this matters for client:** `utils/fixture` loads pre-stored auth state. If the test then navigates to the login page, the context closes immediately. Rule: touches login form → use `@playwright/test`. Starts post-login → use `utils/fixture`.

---

## Example: `[client]` test from authenticated state

```typescript
import { test } from '../../../utils/fixture'
import { expect } from '@playwright/test'
import { PageManager } from '../../../pages/client/clientSitePageManager'

test('Add product to cart', async ({ page }) => {
    const pageManager = new PageManager(page)
    const dashboardPage = pageManager.getDashboardPage()
    await dashboardPage.goToSite()
    await dashboardPage.addToCartButton('ZARA COAT 3').click()
    await dashboardPage.verifyCartPageNavigation()
})
```

## Example: `[client]` test navigating to login page

```typescript
import { test, expect } from '@playwright/test'
import { LoginPage } from '../../../pages/client/loginPage'

test('Verify user is redirected to dashboard after valid login', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goToSite()
    await loginPage.loginToSite('aryas1@test.com', 'Aryas@123')
    await loginPage.verifyLoginSuccessful()
})
```

## Example: `[saucedemo]` test (non-client)

```typescript
import { test, expect } from '@playwright/test'
import { saucedemoConfig } from '../../../utils/saucedemo/ApiUtils'
import { LoginPage } from '../../pages/saucedemo/LoginPage'

test('Verify user can log in with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goToSite()
    await loginPage.loginToSite(saucedemoConfig.username, saucedemoConfig.password)
    await loginPage.verifyLoginSuccessful()
})
```

---

## File Save Locations

| featureName | Page Objects | Test specs |
|-------------|-------------|------------|
| `client`    | `generated/pages/client/` | `generated/tests/client/` |
| `saucedemo` | `generated/pages/saucedemo/` | `generated/tests/saucedemo/` |
| other        | `generated/pages/<featureName>/` | `generated/tests/<featureName>/` |

---

## Summary to Present After Generation

```
GitHub Issue: #<id> — <title>
Feature: <featureName>
HIPAA Status: SAFE

Page Objects Reused:
  - pages/client/loginPage.ts             (client only)
  - generated/pages/saucedemo/LoginPage.ts  (if existed before)

Page Objects Generated:
  - generated/pages/saucedemo/LoginPage.ts

Tests Generated:
  - generated/tests/saucedemo/login.spec.ts

Validation command: npm run gen:validate:saucedemo
```

---

## Rules

- Never modify `pages/`, `tests/`, or top-level `utils/*.ts`.
- Never create duplicate Page Objects.
- Never use `page.locator()` inline inside test bodies.
- Never use `page.waitForTimeout()`.
- For non-client features: always use Playwright MCP to get real locators — never guess.
- Reuse existing Page Objects in `generated/pages/<featureName>/` before generating new ones.
