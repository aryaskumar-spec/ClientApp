# ClientApp — AI-Assisted Playwright Test Framework

A multi-site Playwright e2e test automation framework, extended with an AI-powered test generation pipeline using **Kiro**, **GitHub MCP**, and **Playwright MCP**.

Provide a GitHub Issue ID with a `[featureName]` tag in the title. Kiro retrieves the issue, validates HIPAA compliance, inspects the existing framework (and live DOM via Playwright MCP for new sites), generates Page Objects and test files scoped to the feature, validates them, and opens a Pull Request — fully automated.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Supported Sites](#supported-sites)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [AI Test Generation](#ai-test-generation)
- [Automated Validation Hook](#automated-validation-hook)
- [CI/CD](#cicd)
- [Framework Architecture](#framework-architecture)
- [Page Object Guidelines](#page-object-guidelines)
- [Test Categories](#test-categories)
- [Contributing](#contributing)

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Playwright](https://playwright.dev) v1.60+ | Test runner and browser automation |
| TypeScript (ES2020) | Language |
| Chromium | Browser (headless in CI, headed locally) |
| GitHub Actions | CI pipeline |
| Azure Playwright Testing | Cloud test execution (optional) |
| Kiro AI | Test generation orchestration |
| GitHub MCP | GitHub Issue retrieval |
| Playwright MCP | Live DOM inspection for locator generation |

---

## Project Structure

```
ClientApp/
├── ai/
│   ├── workflow.md                        # AI generation workflow steps
│   └── prompts/
│       ├── framework.prompt.md            # Page Object and test generation rules
│       ├── project-context.prompt.md      # Project structure and import rules
│       ├── hipaa.prompt.md                # HIPAA/PHI validation rules
│       └── testcase.prompt.md             # Test case generation instructions
│
├── config/
│   └── github.yml                         # GitHub MCP repo configuration
│
├── pages/
│   └── client/                            # Handwritten Page Objects — do not modify
│       ├── clientSitePageManager.ts
│       ├── loginPage.ts
│       ├── dashboardPage.ts
│       ├── cartPage.ts
│       ├── checkoutPage.ts
│       └── registerUserPage.ts
│
├── tests/
│   └── client/                            # Handwritten test specs — do not modify
│       ├── orderProduct.spec.ts
│       ├── orderProductViaApi.spec.ts
│       ├── networkInterception.spec.ts
│       ├── securityTesting.spec.ts
│       └── registerUser.spec.ts
│
├── generated/
│   ├── pages/
│   │   ├── client/                        # AI-generated Page Objects for client site
│   │   ├── saucedemo/                     # AI-generated Page Objects for saucedemo
│   │   └── <featureName>/                 # AI-generated Page Objects for other sites
│   └── tests/
│       ├── client/                        # AI-generated tests for client site
│       ├── saucedemo/                     # AI-generated tests for saucedemo
│       └── <featureName>/                 # AI-generated tests for other sites
│
├── utils/
│   ├── fixture.ts                         # Custom test fixture — client site only
│   ├── testUsers.ts                       # SiteConfig, credentials, worker config
│   ├── ApiUtils.ts                        # HTTP API helper — client site only
│   ├── storageHelper.ts                   # Auth token reader — client site only
│   ├── clientSiteSingleData.json          # Single test dataset
│   ├── clientSiteMultipleData.json        # Parameterized test dataset
│   └── saucedemo/
│       └── ApiUtils.ts                    # Auth config for saucedemo
│   └── <featureName>/
│       └── ApiUtils.ts                    # Auth config for other sites
│
├── storage/
│   └── client/                            # Runtime auth state — not committed to git
│       └── user-{N}.json
│
├── .kiro/
│   ├── hooks/
│   │   └── validate-generated-tests.kiro.hook   # Auto-validate + PR hook
│   ├── settings/
│   │   ├── mcp.json                       # MCP server config — not committed
│   │   └── mcp.example.json               # Template — copy and fill in your PAT
│   └── steering/                          # Kiro framework guidance documents
│
├── .github/
│   └── workflows/
│       └── playwright.yml                 # CI pipeline
│
├── global-setup.ts                        # Pre-test API authentication for all workers
├── playwright.config.ts                   # Main Playwright config (all projects)
└── playwright.service.config.ts           # Azure Playwright Testing config
```

---

## Supported Sites

| Feature name | URL | Page Objects | Auth pattern |
|---|---|---|---|
| `client` | https://rahulshettyacademy.com/client | `pages/client/` (handwritten) + `generated/pages/client/` | Pre-stored auth state via `global-setup.ts` |
| `saucedemo` | https://www.saucedemo.com | `generated/pages/saucedemo/` | UI login using `utils/saucedemo/ApiUtils.ts` credentials |

To add a new site, create an issue with `[featureName]` in the title and `URL: <url>` in the body — the framework handles the rest.

---

## Getting Started

### Prerequisites

- Node.js LTS
- [Kiro IDE](https://kiro.dev)
- A GitHub Personal Access Token with `repo` scope

### Install dependencies

```bash
npm ci
```

### Configure MCP servers

Copy the example config and add your GitHub PAT:

```bash
cp .kiro/settings/mcp.example.json .kiro/settings/mcp.json
```

Edit `.kiro/settings/mcp.json` and replace `<YOUR_GITHUB_PAT>` with your token. This file is gitignored — never commit your token.

The Playwright MCP server (`@playwright/mcp`) is pre-configured and requires no additional setup — `npx` downloads it on first use.

### Configure the target repository

Edit `config/github.yml`:

```yaml
repository:
  owner: your-github-username
  repo: your-repo-name
```

---

## Running Tests

### Handwritten tests — client site (local)

```bash
npm run client
```

Runs all tests under `tests/client/` using Chromium (headed).

### API-tagged tests only

```bash
npm run apiLogin
```

Runs only tests tagged with `@Api` in the test name.

### Generated tests — by feature

```bash
npm run gen:validate:client      # generated/tests/client/
npm run gen:validate:saucedemo   # generated/tests/saucedemo/
npm run gen:validate:conduit     # generated/tests/conduit/
```

All run headless with 1 worker. These are also what the auto-validation hook runs after generation.

### CI (GitHub Actions)

```bash
npm run client
```

Currently runs directly on the GitHub Actions runner. See [CI/CD](#cicd) for optional Azure Playwright Testing setup.

---

## AI Test Generation

The core feature of this framework. Kiro generates Playwright tests directly from GitHub Issues.

### Issue title convention (strict — required)

```
[featureName] <test case description>
```

Examples:
```
[client] Verify coupon is applied at checkout
[saucedemo] Verify user can login with valid credentials
[conduit] Verify article creation
```

Issues without a `[featureName]` tag are rejected by the generation workflow.

For non-client features, the issue body must also include:
```
URL: https://www.example.com
```

### How to trigger

In Kiro chat:

```
Generate a Playwright test from GitHub Issue #<issue-number>
```

### What happens automatically

```
1. Retrieve GitHub Issue via GitHub MCP
       ↓
2. Parse [featureName] from issue title
       ↓
3. HIPAA validation — blocked if PHI detected
       ↓
4. If featureName == 'client':
      Inspect pages/client/ and generated/pages/client/
      Reuse existing Page Objects
   If featureName is new site:
      Use Playwright MCP to navigate the URL and snapshot live DOM
      Extract real locators from the DOM
      Check generated/pages/<featureName>/ for existing Page Objects
       ↓
5. Generate missing Page Objects → generated/pages/<featureName>/
       ↓
6. Generate Playwright tests → generated/tests/<featureName>/
       ↓
7. Auto-validation hook fires (see below)
       ↓
8. Pull Request created on GitHub
```

### HIPAA validation

Before any code is generated, the issue content is checked against a list of Protected Health Information (PHI) categories including Patient Name, SSN, Medical Record Number, Diagnosis, and others. Generation is blocked if any PHI is detected.

### Playwright MCP — live DOM inspection

For non-client features, Kiro uses Playwright MCP to navigate the target URL and take an accessibility snapshot before writing a single line of code. Locators are extracted from the real DOM — never guessed. Temporary snapshot files are written to `.playwright-mcp/` and are gitignored.

### Import rules for generated tests

| Scenario | Correct import |
|----------|---------------|
| `[client]` — test starts post-login (dashboard, cart, etc.) | `import { test } from '../../../utils/fixture'` |
| `[client]` — test navigates to login/register page manually | `import { test, expect } from '@playwright/test'` |
| Any non-client feature | `import { test, expect } from '@playwright/test'` |

---

## Automated Validation Hook

A Kiro hook (`validate-generated-tests`) fires automatically whenever a `.spec.ts` file is saved under `generated/tests/**`.

### What it does

**Step 0 — Detect feature** from the saved file path to select the right validate command and git scope.

**Phase 1 — Validate** (up to 3 self-correction attempts):
1. Runs the feature-appropriate validate command (e.g. `npm run gen:validate:saucedemo`)
2. If tests pass → proceed to Phase 2
3. If tests fail → diagnose the error, fix only files in `generated/pages/<featureName>/` or `generated/tests/<featureName>/`, retry
4. After 3 failed attempts → stop and report to the user — no PR created

**Phase 2 — Create PR** (only if all tests pass):
1. Creates branch `generated-tests/<featureName>/issue-<N>`
2. Commits only files under `generated/pages/<featureName>/`, `generated/tests/<featureName>/`, and `utils/<featureName>/` if newly created
3. Opens a Pull Request via GitHub MCP with a structured description
4. Reports the PR URL in chat

No PR is ever created if any test is still failing.

---

## CI/CD

The GitHub Actions pipeline runs on push and pull request to `main`/`master`, and supports manual dispatch.

```yaml
on:
  workflow_dispatch:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
```

Currently CI runs `npm run client` directly on the GitHub Actions runner (headless Chromium).

### Optional: Azure Playwright Testing Service

Replace the test run step in `.github/workflows/playwright.yml`:

```yaml
# Replace this:
- name: Run Playwright Tests
  run: npm run client

# With this:
- name: Azure Login
  uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
- name: Run Playwright Tests
  env:
    PLAYWRIGHT_SERVICE_URL: ${{ vars.PLAYWRIGHT_SERVICE_URL }}
  run: npm run azureRun
```

Required GitHub secrets:

| Secret | Purpose |
|--------|---------|
| `AZURE_CLIENT_ID` | Azure app registration client ID |
| `AZURE_TENANT_ID` | Azure tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |

Required GitHub variable:

| Variable | Purpose |
|----------|---------|
| `PLAYWRIGHT_SERVICE_URL` | Azure Playwright Testing endpoint |

---

## Framework Architecture

### Three layers

```
Test Layer          tests/client/*.spec.ts          (handwritten)
                    generated/tests/<feature>/      (AI-generated)
       │ uses
Page Object Layer   pages/client/                   (handwritten — client only)
                    generated/pages/<feature>/      (AI-generated — all sites)
       │ uses
Utility Layer       utils/                          (client: fixture, ApiUtils, testUsers)
                    utils/<featureName>/ApiUtils.ts (non-client: credentials + getToken)
```

Dependencies flow downward only. Tests never import from other tests. Page Objects never import from tests.

### Pre-authentication — client site

`global-setup.ts` logs in all workers via API before any test runs. Each worker gets its own dedicated user and storage state file (`storage/client/user-N.json`). Tests load this state via `utils/fixture.ts` — no UI login ever performed.

```
Worker 0 → storage/client/user-0.json (aryas1@test.com)
Worker 1 → storage/client/user-1.json (aryas2@test.com)
...
Worker 5 → storage/client/user-5.json (aryas6@test.com)
```

### Auth — non-client sites

Credentials live in `utils/<featureName>/ApiUtils.ts`. Generated tests perform UI login directly using those credentials. No `global-setup.ts` involvement.

### PageManager pattern — client only

```typescript
const pageManager = new PageManager(page)
const dashboardPage = pageManager.getDashboardPage()
```

Non-client generated tests instantiate page objects directly:

```typescript
const loginPage = new LoginPage(page)
```

---

## Page Object Guidelines

- `readonly page: Page` is always the first property
- Static locators are `readonly` properties set in the constructor
- Dynamic locators (data-dependent) are synchronous methods returning `Locator`
- Navigation method is always named `goToSite()`
- All assertion methods are prefixed `verify` and are `async`
- No `page.waitForTimeout()`, no hardcoded test data, no inline `expect()` outside of `verify*` methods
- For non-client features: locators always come from a live Playwright MCP DOM snapshot — never guessed

### Locator priority

1. `getByRole` with accessible name
2. `getByPlaceholder`
3. `getByLabel`
4. `getByText`
5. `locator(css)` with `.filter()` chaining
6. `locator(css)` with attribute selectors

Never use XPath.

---

## Test Categories

| Category | Location | Pattern |
|----------|----------|---------|
| UI flow | `tests/client/orderProduct.spec.ts` | PageManager throughout, fixture data |
| Hybrid API+UI | `tests/client/orderProductViaApi.spec.ts` | ApiUtils for setup, UI for assertion |
| Network interception | `tests/client/networkInterception.spec.ts` | `page.route()` mock + `waitForResponse` |
| Security/authorization | `tests/client/securityTesting.spec.ts` | `route.continue({ url })` rewrite |
| AI-generated — client | `generated/tests/client/` | Generated from `[client]` GitHub Issues |
| AI-generated — saucedemo | `generated/tests/saucedemo/` | Generated from `[saucedemo]` GitHub Issues |
| AI-generated — other | `generated/tests/<featureName>/` | Generated from `[featureName]` GitHub Issues |

---

## Contributing

- **Never modify** files under `pages/`, `tests/`, or top-level `utils/*.ts`
- All AI-generated artifacts go to `generated/pages/<featureName>/` and `generated/tests/<featureName>/` only
- Auth utilities for new sites go to `utils/<featureName>/ApiUtils.ts`
- Handwritten tests follow the patterns in `.kiro/steering/` — read those before adding new tests
- Storage files (`storage/`) are runtime-only and gitignored — never commit them
- Playwright MCP snapshots (`.playwright-mcp/`) are gitignored — never commit them
- Use `test.skip()` to disable a test — never delete or comment out the test body
- Issue titles must follow `[featureName] <description>` — generation is rejected otherwise
