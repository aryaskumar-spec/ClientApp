# Coding Standards

## TypeScript Rules

- All framework files are `.ts`. `jsFiles/excelSheetActions.js` is a standalone script — not part of the framework.
- Use `import`, never `require`, in `.ts` files.
- Declare explicit types for all interfaces. Reference `TestUser` and `SiteConfig` in `testUsers.ts` as the pattern.
- `tsconfig.json`: `ES2020` target, `commonjs` modules, `esModuleInterop: true`.

## Naming Conventions

### Files
| Type | Pattern | Example |
|---|---|---|
| Page object | `camelCase` + `Page.ts` | `loginPage.ts` |
| Page manager | `camelCase` + `PageManager.ts` | `clientSitePageManager.ts` |
| Test spec | `camelCase` + `.spec.ts` | `orderProduct.spec.ts` |
| Utility class | `PascalCase` + `Utils.ts` | `ApiUtils.ts` |
| Helper module | `camelCase.ts` | `storageHelper.ts` |
| Data file (single) | `camelCase` + `Data.json` | `clientSiteSingleData.json` |
| Data file (multi) | `camelCase` + `MultipleData.json` | `clientSiteMultipleData.json` |

### Classes and Interfaces
- Page classes: `PascalCase` + `Page` — `LoginPage`, `CartPage`
- Utility classes: `PascalCase` + `Utils` — `ApiUtils`
- Interfaces: `PascalCase`, no `I` prefix — `TestUser`, `SiteConfig`, `TestData`

### Methods
- Navigation: `goToSite()` — no suffix, consistent across all page objects
- Actions: descriptive verb + noun — `addToCartButton()`, `clearCart()`
- Assertions: `verify` prefix — `verifyLoginSuccessful()`, `verifyCouponApplied()`
- PageManager getters: `get` prefix — `getLoginPage()`, `getCartPage()`

### Variables and Properties
- Locator class properties: `readonly camelCase` — `loginButton`, `creditCardNumberField`
- Local test variables: `camelCase` — `pageManager`, `workerIndex`
- File-scope URL constants: `SCREAMING_SNAKE_CASE` — `GET_CUSTOMER_ORDERS`, `BASE_URL`
- Private class fields: `private` — `private token`, `private apiContext`

## Access Modifiers

- Page properties and locators: always `readonly`
- API endpoint URLs in `ApiUtils`: `private get` — computed from `siteConfig.apiBaseURL`, never inline strings
- Auth fields in `ApiUtils`: `private` — `token`, `userId`, `apiContext`

## Async Rules

- All Playwright interactions must be `await`ed.
- Methods that interact with the browser are `async`.
- Locator methods that return a `Locator` object (not a Promise) are synchronous — `addToCartButton(name)` and `getProductBuyNow(name)` are not `async`.

## Assertions

- UI assertions belong in page object `verify*` methods, not inline in test files.
- Exception: inline `expect` is acceptable in hybrid API+UI tests and network interception tests.
- Always import `expect` from `@playwright/test`.
- URL assertions always use regex: `await expect(page).toHaveURL(/dashboard\/dash/)`.
- Visibility: `await expect(locator).toBeVisible()` — never `locator.isVisible()` in a conditional.

## Imports

- Relative imports only: `../../utils/fixture`, `../../pages/client/clientSitePageManager`
- Named imports: `import { test } from '../../utils/fixture'`
- JSON: `import data from '../../utils/clientSiteSingleData.json'` (default import)

## Comments and Logging

- Inline comments explain assertion intent: `//Assert that coupon is applied`
- Emoji prefixes in `console.log` for CI readability: `✅` success, `❌` error, `⚠️` warning, `🗑️` deletion, `⏭️` skipped
- Debug `console.log` may be commented out (`//console.log(...)`) during development — clean up before merging

## Test File Rules

- Import `test` from `utils/fixture`, not `@playwright/test`, for authenticated tests or `data` fixture use
- Disable tests with `test.skip(...)` — never delete or comment out the test body
- Tag network interception tests with `@Api` in the test name (enables `npm run apiLogin`)
- Use `testInfo.workerIndex` or `testInfo.parallelIndex` when worker-specific logic is needed
