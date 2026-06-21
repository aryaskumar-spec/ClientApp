# Architecture

## Three-Layer Architecture

Dependencies flow downward only. Each layer has one responsibility.

```
┌─────────────────────────────────────┐
│            Test Layer               │
│         tests/client/*.spec.ts      │
│  (orchestrates flows, asserts)      │
└───────────────┬─────────────────────┘
                │ uses
┌───────────────▼─────────────────────┐
│          Page Object Layer          │
│  pages/client/                      │
│  PageManager → page classes         │
│  (locators, actions, assertions)    │
└───────────────┬─────────────────────┘
                │ uses
┌───────────────▼─────────────────────┐
│          Utility / Infra Layer      │
│  utils/                             │
│  fixture.ts, ApiUtils.ts,           │
│  storageHelper.ts, testUsers.ts,    │
│  *.json data files                  │
└─────────────────────────────────────┘
```

## Authentication Flow

`global-setup.ts` runs once before all tests. Tests never login via UI.

```
For each worker (0 to siteConfig.workers-1):
  → Read storage/client/user-N.json
  → Decode JWT, check expiry (5-min buffer)
  → If valid: skip
  → If expired/missing:
      POST /api/ecom/auth/login
      Extract token + userId
      Open browser → goto baseURL
      Inject into localStorage: token, userId
      context.storageState() → storage/client/user-N.json
      Close browser + dispose apiContext
```

Each test loads the saved state via the custom `page` fixture in `fixture.ts`:
```typescript
const workerIndex = testInfo.workerIndex % siteConfig.workers;
const storageState = `storage/${siteConfig.name}/user-${workerIndex}.json`;
const context = await browser.newContext({ storageState });
```

## PageManager Pattern

`clientSitePageManager.ts` is the only place page classes are instantiated. Tests call getters only.

```typescript
const pm = new PageManager(page);
pm.getDashboardPage().addToCartButton('ZARA COAT 3').click();
pm.getCheckoutPage().verifyCouponApplied();
```

Adding a new page: create class → add `readonly` property → instantiate in constructor → add getter.

## Parallel Execution

`siteConfig.workers = 6` drives everything. Workers and users are 1-to-1:

```
Worker 0 → user-0.json (aryas1@test.com)
Worker 1 → user-1.json (aryas2@test.com)
...
Worker 5 → user-5.json (aryas6@test.com)
```

The modulo cap in `fixture.ts` and `storageHelper.ts` prevents out-of-bounds if Playwright spawns extra workers.

## Configuration Split

| File | When used |
|---|---|
| `playwright.config.ts` | Local runs (`npm run client`) |
| `playwright.service.config.ts` | CI Azure runs (`npm run azureRun`) |

`playwright.service.config.ts` extends `playwright.config.ts` — it adds Azure connection only, never duplicates base settings. The `projects` array is driven by `siteConfig.name` so the config file never needs editing when changing sites.
