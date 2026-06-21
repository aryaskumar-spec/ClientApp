# Framework Overview

## What This Is

A Playwright e2e test automation framework for the Rahul Shetty Academy e-commerce client app (`rahulshettyacademy.com/client`), written in TypeScript with Page Object Model and a centralized PageManager.

## Technology Stack

- **Test runner**: `@playwright/test` v1.60+
- **Language**: TypeScript (ES2020, CommonJS)
- **Browser**: Chromium only (headless: false locally)
- **CI/CD**: GitHub Actions + Azure Playwright Testing Service
- **Authentication**: JWT-based, pre-authenticated in `global-setup.ts`
- **API**: Playwright's `request` context via `ApiUtils`

## Application Under Test

- **Frontend**: `https://rahulshettyacademy.com/client`
- **API base**: `https://rahulshettyacademy.com/api/ecom/`
- **Flows covered**: login, product browsing, add to cart, checkout, order history, network mocking, authorization

## Key Design Decisions

1. **Pre-authentication**: Workers log in once via API at global setup. Tests never perform UI login — they load `storage/client/user-N.json` directly.
2. **Worker-to-user mapping**: Worker N always maps to `siteConfig.users[N]` via modulo cap (`workerIndex % siteConfig.workers`).
3. **Token validity check**: `global-setup.ts` decodes JWT expiry and skips re-login if valid (5-min buffer).
4. **PageManager**: All page objects are accessed through `PageManager` — tests never call `new LoginPage(page)` directly.
5. **Fixture extension**: `utils/fixture.ts` exports a custom `test` that injects a pre-authenticated `page` and typed `data` object.
6. **Hybrid tests**: `ApiUtils` enables API state setup (e.g., create order) followed by UI verification in the same test.

## Document Map

| Topic | Steering file |
|---|---|
| Folder layout and naming rules | `folder-structure.md` |
| Auth flow, layers, parallel execution | `architecture.md` |
| TypeScript conventions, naming | `coding-standards.md` |
| Config, retries, waiting, network interception | `playwright-guidelines.md` |
| Page object structure and PageManager | `page-object-guidelines.md` |
| Locator selection and patterns | `locator-strategy.md` |
| Test categories, assertions, skipping | `testing-principles.md` |
| Custom fixture usage | `fixtures.md` |
| ApiUtils, hybrid tests, URL management | `api-guidelines.md` |
| All utility files reference | `utilities.md` |
| Test data sources and selection | `test-data-management.md` |
| GitHub Actions, Azure config | `ci-cd.md` |
