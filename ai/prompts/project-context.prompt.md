# Project Context

## Applications Under Test

| Feature name | URL | Notes |
|--------------|-----|-------|
| `client`     | https://rahulshettyacademy.com/client | Handwritten POs in `pages/client/` |
| `saucedemo`  | https://www.saucedemo.com | AI-generated only |
| `conduit`    | https://conduit.bonfire.com.br | AI-generated only |

Feature name is always taken from the issue title: `[featureName] <description>`

---

## Framework

Playwright with TypeScript, Page Object Model (POM).
Custom test fixture in `utils/fixture.ts` (client only).
PageManager pattern — for `client` only. Non-client features instantiate page objects directly.

---

## Folder Structure

```
pages/
└── client/                          ← handwritten POs for client site (DO NOT MODIFY)
    ├── clientSitePageManager.ts
    ├── loginPage.ts
    ├── dashboardPage.ts
    ├── cartPage.ts
    ├── checkoutPage.ts
    └── registerUserPage.ts

tests/
└── client/                          ← handwritten tests for client site (DO NOT MODIFY)
    └── *.spec.ts

utils/                               ← flat files are client-specific (DO NOT MODIFY)
    ├── fixture.ts
    ├── testUsers.ts
    ├── ApiUtils.ts
    ├── storageHelper.ts
    ├── clientSiteSingleData.json
    └── clientSiteMultipleData.json
utils/
└── saucedemo/
    └── ApiUtils.ts                  ← per-feature auth utility
└── <featureName>/
    └── ApiUtils.ts

generated/
├── pages/
│   ├── client/                      ← AI-generated POs for client
│   ├── saucedemo/                   ← AI-generated POs for saucedemo
│   └── <featureName>/               ← AI-generated POs for other features
└── tests/
    ├── client/                      ← AI-generated tests for client
    ├── saucedemo/                   ← AI-generated tests for saucedemo
    └── <featureName>/               ← AI-generated tests for other features
```

---

## Client Site — Existing Page Objects

Inspect `pages/client/` before generating anything for `[client]` issues.

Existing pages: `loginPage.ts`, `dashboardPage.ts`, `cartPage.ts`, `checkoutPage.ts`, `registerUserPage.ts`.

Also check `generated/pages/client/` for any previously AI-generated pages.

Reuse them — never duplicate.

---

## Non-Client Sites — Page Object Discovery

For `[saucedemo]`, `[conduit]`, and other features:
1. Check `generated/pages/<featureName>/` for any existing AI-generated Page Objects first.
2. If a Page Object for the needed page already exists — reuse it.
3. If missing — use Playwright MCP to navigate and snapshot the live page, then generate.

---

## Import Paths by Feature and Test Type

### `[client]` — test starts from authenticated state (dashboard, cart, checkout, etc.)
```typescript
import { test } from '../../../utils/fixture'
import { expect } from '@playwright/test'
import { PageManager } from '../../../pages/client/clientSitePageManager'
```

### `[client]` — test navigates to login or register page manually
```typescript
import { test, expect } from '@playwright/test'
```
(Do NOT use `utils/fixture` — it loads stored auth state which conflicts with manual login navigation)

### `[saucedemo]` or any non-client feature
```typescript
import { test, expect } from '@playwright/test'
import { saucedemoConfig } from '../../../utils/saucedemo/ApiUtils'
import { LoginPage } from '../../pages/saucedemo/LoginPage'
```

All paths are relative from the test file location:
- `generated/tests/<featureName>/` → `../../../` to reach project root

---

## PageManager Usage (client only)

Always instantiate `PageManager` and use its getters. Never instantiate page objects directly in client tests that use the fixture.

```typescript
const pageManager = new PageManager(page)
const dashboardPage = pageManager.getDashboardPage()
```

For non-client features, instantiate the page object directly:
```typescript
const loginPage = new LoginPage(page)
```

---

## Auth Pattern by Feature

| Feature  | Auth approach |
|----------|--------------|
| `client` — post-login | `utils/fixture` injects pre-stored auth state — no UI login |
| `client` — login flow | Manual navigation to login page, interact with form |
| non-client | Perform UI login in the test using credentials from `utils/<featureName>/ApiUtils.ts` |

---

## Custom Fixture (client only)

`utils/fixture.ts` exports a custom `test` that provides:
- `page` — pre-authenticated browser page (no UI login needed)
- `data` — typed test data: `productName`, `creditCardNumber`, `name`, `cvv`, `couponValue`, `countryName`

Use `{ page, data }` destructuring to access both.
This fixture is for `client` tests only.

---

## Naming Conventions

| Artifact | Pattern | Example |
|----------|---------|---------|
| Page Object file | `PascalCasePage.ts` | `LoginPage.ts` |
| Page Object class | `PascalCasePage` | `LoginPage` |
| Test file | `camelCase.spec.ts` | `login.spec.ts` |
| Navigation method | `goToSite()` | `goToSite()` |
| Assertion method | `verify` prefix | `verifyLoginSuccessful()` |

---

## Generation Policy

Never modify files under `pages/`, `tests/`, or top-level `utils/*.ts`.
Only generate new artifacts inside:
- `generated/pages/<featureName>/`
- `generated/tests/<featureName>/`
- `utils/<featureName>/ApiUtils.ts` (if not already present)
