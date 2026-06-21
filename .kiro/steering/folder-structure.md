# Folder Structure

## Root Layout

```
ClientApp/
├── .github/
│   └── workflows/
│       └── playwright.yml          # GitHub Actions CI pipeline
├── .kiro/
│   └── steering/                   # Kiro steering documents (this folder)
├── jsFiles/
│   └── excelSheetActions.js        # Standalone Excel utility (not part of test framework)
├── pages/
│   └── client/                     # Page objects for the client site
│       ├── clientSitePageManager.ts
│       ├── loginPage.ts
│       ├── dashboardPage.ts
│       ├── cartPage.ts
│       ├── checkoutPage.ts
│       └── registerUserPage.ts
├── storage/
│   └── client/                     # Generated auth state files (not committed to git)
│       ├── user-0.json
│       ├── user-1.json
│       └── user-N.json
├── tests/
│   └── client/                     # Test spec files for the client site
│       ├── orderProduct.spec.ts
│       ├── orderProductViaApi.spec.ts
│       ├── networkInterception.spec.ts
│       ├── securityTesting.spec.ts
│       ├── registerUser.spec.ts
│       └── test-2.spec.ts
├── utils/
│   ├── ApiUtils.ts                 # API helper class
│   ├── fixture.ts                  # Custom test fixture (page + data)
│   ├── storageHelper.ts            # Reads token/userId from storage files
│   ├── testUsers.ts                # SiteConfig and TestUser definitions
│   ├── clientSiteSingleData.json   # Single test data object
│   └── clientSiteMultipleData.json # Array of test data for parameterized tests
├── global-setup.ts                 # Pre-test authentication for all workers
├── playwright.config.ts            # Main Playwright configuration
├── playwright.service.config.ts    # Azure Playwright Testing Service config
├── package.json
├── package-lock.json
├── tsconfig.json
└── state.json                      # (Playwright internal state)
```

## Directory Conventions

### `pages/`
- Organized by site name: `pages/{siteName}/`
- Currently: `pages/client/`
- Each site has its own `PageManager` file and individual page object files
- When adding a new site (e.g., `admin`), create `pages/admin/` with its own `adminSitePageManager.ts`

### `tests/`
- Organized by site name: `tests/{siteName}/`
- Currently: `tests/client/`
- The `testDir` in `playwright.config.ts` projects points to `./tests/${siteConfig.name}`, so the folder name must match `siteConfig.name`
- All test files use the `.spec.ts` extension

### `utils/`
- Flat directory — no subdirectories
- Contains shared infrastructure: config, fixtures, API helpers, data files
- Data JSON files live here alongside TypeScript utilities

### `storage/`
- Organized by site name: `storage/{siteName}/`
- Files named `user-{N}.json` where N matches the worker index (0-based)
- Created programmatically by `global-setup.ts` — never create or edit manually
- Not committed to git (add `storage/` to `.gitignore`)

### `jsFiles/`
- Standalone JavaScript utility scripts not part of the test execution pipeline
- Currently contains only `excelSheetActions.js` for Excel file manipulation
- Do not import from this directory in TypeScript test or page files

## Naming Rules for New Files

| What you're adding | Where it goes | Filename pattern |
|---|---|---|
| New page object | `pages/client/` | `{pageName}Page.ts` |
| New spec file | `tests/client/` | `{featureName}.spec.ts` |
| New API utility | `utils/` | `{Name}Utils.ts` |
| New helper module | `utils/` | `{helperName}.ts` |
| New test data (single) | `utils/` | `clientSite{Scenario}Data.json` |
| New test data (multi) | `utils/` | `clientSite{Scenario}MultipleData.json` |
| New standalone script | `jsFiles/` | `{scriptName}.js` |

## What Does Not Belong in Each Directory

- `pages/` — no test logic, no direct `request.newContext()` calls (exception: `cartPage.ts` uses API for cart cleanup, which is acceptable as a setup helper tied to a page action)
- `tests/` — no locator definitions, no hardcoded URLs (use `siteConfig.baseURL`)
- `utils/` — no Playwright `test()` blocks, no page navigation logic
- `storage/` — no manually created files, no committed files
- `jsFiles/` — no TypeScript, no Playwright test imports
