# ClientApp — AI-Assisted Playwright Test Framework

A Playwright e2e test automation framework for the [Rahul Shetty Academy e-commerce client app](https://rahulshettyacademy.com/client), extended with an AI-powered test generation pipeline using **Kiro** and **GitHub MCP**.

Provide a GitHub Issue ID. Kiro retrieves the issue, validates HIPAA compliance, inspects the existing framework, generates Page Objects and test files, validates them, and opens a Pull Request — fully automated.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
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
| Azure Playwright Testing | Cloud test execution |
| Kiro AI | Test generation orchestration |
| GitHub MCP | GitHub Issue retrieval |

---

## Project Structure

```
ClientApp/
├── ai/
│   ├── workflow.md                  # AI generation workflow steps
│   └── prompts/
│       ├── framework.prompt.md      # Page Object and test generation rules
│       ├── project-context.prompt.md # Project structure and import rules
│       ├── hipaa.prompt.md          # HIPAA/PHI validation rules
│       └── testcase.prompt.md       # Test case generation instructions
│
├── config/
│   └── github.yml                   # GitHub MCP repo configuration
│
├── pages/
│   └── client/                      # Handwritten Page Objects (do not modify)
│       ├── clientSitePageManager.ts
│       ├── loginPage.ts
│       ├── dashboardPage.ts
│       ├── cartPage.ts
│       ├── checkoutPage.ts
│       └── registerUserPage.ts
│
├── tests/
│   └── client/                      # Handwritten test specs (do not modify)
│       ├── orderProduct.spec.ts
│       ├── orderProductViaApi.spec.ts
│       ├── networkInterception.spec.ts
│       ├── securityTesting.spec.ts
│       └── registerUser.spec.ts
│
├── generated/
│   ├── pages/                       # AI-generated Page Objects
│   └── tests/                       # AI-generated test specs
│
├── utils/
│   ├── fixture.ts                   # Custom test fixture (pre-auth page + data)
│   ├── testUsers.ts                 # SiteConfig, credentials, worker config
│   ├── ApiUtils.ts                  # HTTP API helper
│   ├── storageHelper.ts             # Reads auth tokens from storage state
│   ├── clientSiteSingleData.json    # Single test dataset
│   └── clientSiteMultipleData.json  # Parameterized test dataset
│
├── storage/
│   └── client/                      # Runtime auth state (not committed to git)
│       └── user-{N}.json
│
├── .kiro/
│   ├── hooks/
│   │   └── validate-generated-tests.kiro.hook  # Auto-validate + PR hook
│   ├── settings/
│   │   ├── mcp.json                 # GitHub MCP server config (not committed)
│   │   └── mcp.example.json         # Template — copy and fill in your PAT
│   └── steering/                    # Kiro framework guidance documents
│
├── .github/
│   └── workflows/
│       └── playwright.yml           # CI pipeline
│
├── global-setup.ts                  # Pre-test API authentication for all workers
├── playwright.config.ts             # Main Playwright config
└── playwright.service.config.ts     # Azure Playwright Testing config
```

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

### Configure GitHub MCP

Copy the example config and add your GitHub PAT:

```bash
cp .kiro/settings/mcp.example.json .kiro/settings/mcp.json
```

Edit `.kiro/settings/mcp.json` and replace `<YOUR_GITHUB_PAT>` with your token. This file is gitignored — never commit your token.

### Configure the target repository

Edit `config/github.yml`:

```yaml
repository:
  owner: your-github-username
  repo: your-repo-name
```

---

## Running Tests

### Handwritten tests (local)

```bash
npm run client
```

Runs all tests under `tests/client/` using Chromium (headed).

### API-tagged tests only

```bash
npm run apiLogin
```

Runs only tests tagged with `@Api` in the test name.

### Generated tests only

```bash
npm run gen:validate
```

Runs all tests under `generated/tests/` using Chromium (headless). This is what the auto-validation hook runs after generation.

### CI (Azure Playwright Testing)

```bash
npm run azureRun
```

Runs the `client` project via Azure Playwright Testing Service. Requires Azure OIDC credentials — use in CI only.

---

## AI Test Generation

The core feature of this framework. Kiro generates Playwright tests directly from GitHub Issues.

### How to trigger

In Kiro chat, type:

```
Generate a Playwright test from GitHub Issue #<issue-number>
```

### What happens automatically

```
1. Retrieve GitHub Issue via GitHub MCP
       ↓
2. HIPAA validation (hipaa.prompt.md)
   — blocked if PHI detected
       ↓
3. Inspect existing framework
   pages/client/, tests/client/, utils/
       ↓
4. Reuse existing Page Objects where possible
       ↓
5. Generate missing Page Objects → generated/pages/
       ↓
6. Generate Playwright tests → generated/tests/
       ↓
7. Auto-validation hook fires (see below)
       ↓
8. Pull Request created on GitHub
```

### HIPAA validation

Before any code is generated, the issue content is checked against a list of Protected Health Information (PHI) categories including Patient Name, SSN, Medical Record Number, Diagnosis, and others. Generation is blocked if any PHI is detected.

### Import rule for generated tests

| Scenario | Correct import |
|----------|---------------|
| Test navigates to login/register page | `import { test, expect } from '@playwright/test'` |
| Test starts from authenticated state (dashboard, cart, etc.) | `import { test } from '../../utils/fixture'` |

The custom fixture in `utils/fixture.ts` loads stored auth state. Using it for tests that navigate to the login page manually causes a context conflict.

---

## Automated Validation Hook

A Kiro hook (`validate-generated-tests`) fires automatically whenever a file is saved to `generated/tests/`.

### What it does

**Phase 1 — Validate** (up to 3 self-correction attempts):
1. Runs `npm run gen:validate`
2. If tests pass → proceed to Phase 2
3. If tests fail → diagnose the error, fix the generated file(s), retry
4. After 3 failed attempts → stop and report to the user with a full diagnosis

**Phase 2 — Create PR** (only if all tests pass):
1. Creates branch `generated-tests/issue-<N>`
2. Commits only files under `generated/pages/` and `generated/tests/`
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

CI can use Azure Playwright Testing Service with OIDC authentication (no stored secrets). Currently its not used as the subscription has expired. Required GitHub secrets:

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

Replace Test Run command :

```yaml
- name: Run Playwright Tests
  run: npm run client
```
with below codes in playwright.yml, to make use of Azure Playwright Testing Service

```yaml
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

## Framework Architecture

### Three layers

```
Test Layer          tests/client/*.spec.ts
                    generated/tests/*.spec.ts
       │ uses
Page Object Layer   pages/client/ (handwritten)
                    generated/pages/ (AI-generated)
       │ uses
Utility Layer       utils/ (fixture, ApiUtils, testUsers, storageHelper)
```

Dependencies flow downward only. Tests never import from other tests. Page Objects never import from tests.

### Pre-authentication

`global-setup.ts` logs in all workers via API before any test runs. Each worker gets its own dedicated user and storage state file (`storage/client/user-N.json`). Tests never perform UI login.

### PageManager pattern

All page objects are accessed through `PageManager`. Tests never instantiate page objects directly:

```typescript
const pageManager = new PageManager(page)
const dashboardPage = pageManager.getDashboardPage()
```

### Worker-to-user mapping

```
Worker 0 → storage/client/user-0.json (aryas1@test.com)
Worker 1 → storage/client/user-1.json (aryas2@test.com)
...
Worker 5 → storage/client/user-5.json (aryas6@test.com)
```

---

## Page Object Guidelines

- `readonly page: Page` is always the first property
- Static locators are `readonly` properties set in the constructor
- Dynamic locators (data-dependent) are synchronous methods returning `Locator`
- Navigation method is always named `goToSite()`
- All assertion methods are prefixed `verify` and are `async`
- No `page.waitForTimeout()`, no hardcoded test data, no inline `expect()` outside of `verify*` methods

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

| Category | File | Pattern |
|----------|------|---------|
| UI flow | `orderProduct.spec.ts` | PageManager throughout, fixture data |
| Hybrid API+UI | `orderProductViaApi.spec.ts` | ApiUtils for setup, UI for assertion |
| Network interception | `networkInterception.spec.ts` | `page.route()` mock + `waitForResponse` |
| Security/authorization | `securityTesting.spec.ts` | `route.continue({ url })` rewrite |
| AI-generated | `generated/tests/*.spec.ts` | Generated from GitHub Issues |

---

## Contributing

- **Never modify** files under `pages/`, `tests/`, or `utils/` directly when working with AI generation
- All AI-generated artifacts go to `generated/pages/` and `generated/tests/` only
- Handwritten tests follow the patterns in `.kiro/steering/` — read those before adding new tests
- Storage files (`storage/`) are runtime-only and gitignored — never commit them
- Use `test.skip()` to disable a test — never delete or comment out the test body

## GitHub MCP Setup

1. Copy the example configuration:
```bash
cp .kiro/settings/mcp.example.json .kiro/settings/mcp.json
```
2. Generate a GitHub Personal Access Token.
3. Replace `<YOUR_GITHUB_PAT>` in `.kiro/settings/mcp.json` with your token.
4. Restart Kiro.

## Prompt to generate testcases and raise pull request
Generate a Playwright test from GitHub Issue #${issueId}
