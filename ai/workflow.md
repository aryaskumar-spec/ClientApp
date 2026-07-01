# AI Workflow — GitHub Issue Test Generation

## Trigger

The user provides a GitHub Issue ID. Kiro executes the following steps.

---

## Step 1 — Parse Feature Name and URL from Issue

Read the GitHub Issue using GitHub MCP.
- Repository: `aryaskumar-spec/ClientApp` (from `config/github.yml`)
- Retrieve: title, description, comments, labels, acceptance criteria.

Extract the feature name from the issue title using the strict format:

```
[featureName] <Test case description>
```

Examples:
- `[client] Verify coupon is applied at checkout` → featureName = `client`
- `[saucedemo] Create a login test case`          → featureName = `saucedemo`
- `[conduit] Verify article creation`             → featureName = `conduit`

If the title does NOT follow this format, stop and ask the user to rename the issue.

For non-client features, extract the URL from the issue body:
```
URL: https://www.saucedemo.com
```

If featureName is `client`, skip URL extraction — the URL is already known (`https://rahulshettyacademy.com/client`).

---

## Step 2 — HIPAA Validation

Run HIPAA validation using `ai/prompts/hipaa.prompt.md`.
- If BLOCKED: stop immediately and report the reason. Do not generate any files.
- If SAFE: continue.

---

## Step 3 — Branch on Feature Type

### If featureName == `client`

Inspect the existing framework:
- Read `pages/client/` to discover all existing Page Objects.
- Read `pages/client/clientSitePageManager.ts` to understand which pages are registered.
- Read `tests/client/` to understand existing test patterns.
- Read `utils/fixture.ts` to understand the custom `test` fixture and `TestData` shape.
- Read `utils/testUsers.ts` to understand `siteConfig`.
- Check `generated/pages/client/` for any previously AI-generated Page Objects that can be reused.

Skip Playwright MCP navigation — all pages are known from the existing codebase.

### If featureName is NOT `client` (new site)

1. Check `generated/pages/<featureName>/` — list any existing Page Objects already generated for this feature.
2. Check `utils/<featureName>/ApiUtils.ts` — if missing, generate it following the pattern in `utils/saucedemo/ApiUtils.ts`.
3. Use Playwright MCP to inspect the live application:
   - Navigate to the URL extracted from the issue.
   - Take a snapshot of each page involved in the acceptance criteria.
   - Extract locators using the priority order from `.kiro/steering/locator-strategy.md`.
4. Use the snapshot data to generate accurate Page Objects.

---

## Step 4 — Determine Which Page Objects Are Needed

Map each step in the acceptance criteria to a page.

For `client`: check `pages/client/` first, then `generated/pages/client/`.
For other features: check `generated/pages/<featureName>/` only.

Mark each as REUSE (exists) or GENERATE (missing).

---

## Step 5 — Generate Missing Page Objects

For each GENERATE page, follow `ai/prompts/framework.prompt.md`.

Save location:
- `client` → `generated/pages/client/<FeatureName>Page.ts`
- other     → `generated/pages/<featureName>/<FeatureName>Page.ts`

Do NOT create a PageManager for non-client features — tests instantiate page objects directly.

---

## Step 6 — Generate Playwright Test File

Follow `ai/prompts/testcase.prompt.md`.

Save location:
- `client` → `generated/tests/client/<testName>.spec.ts`
- other     → `generated/tests/<featureName>/<testName>.spec.ts`

Import rules by feature:

| Feature  | `test` import | Auth pattern |
|----------|---------------|--------------|
| `client` — post-login flow | `import { test } from '../../../utils/fixture'` | Pre-stored auth state via fixture |
| `client` — login/register flow | `import { test, expect } from '@playwright/test'` | Manual navigation to login page |
| non-client | `import { test, expect } from '@playwright/test'` | Inject token via `page.addInitScript()` using `utils/<featureName>/ApiUtils.ts` |

---

## Step 7 — Validate Script to Use

Determine the correct validation command from the feature name:

| featureName | Command |
|-------------|---------|
| `client`    | `npm run gen:validate:client` |
| `saucedemo` | `npm run gen:validate:saucedemo` |
| `conduit`   | `npm run gen:validate:conduit` |
| other        | `npx playwright test --project=generated-<featureName> --reporter=list` |

---

## Step 8 — Present Generation Summary

```
GitHub Issue: #<id> — <title>
Feature: <featureName>
HIPAA Status: SAFE

Page Objects Reused:
  - pages/client/loginPage.ts   (client only)
  - generated/pages/saucedemo/LoginPage.ts  (if existed before)

Page Objects Generated:
  - generated/pages/saucedemo/LoginPage.ts

Tests Generated:
  - generated/tests/saucedemo/login.spec.ts

Validation command: npm run gen:validate:saucedemo
```

---

## Step 9 — Auto-Validation and PR (hook fires automatically)

The `validate-generated-tests` hook fires after Step 7 file saves:
- Runs the feature-appropriate validate command (up to 3 self-correction attempts)
- If all tests pass: creates branch `generated-tests/<featureName>/issue-<N>`, commits only files under `generated/pages/<featureName>/` and `generated/tests/<featureName>/` (plus `utils/<featureName>/` if newly created), opens a PR
- If tests cannot be fixed after 3 attempts: reports to the user and stops — no PR is created

---

## Hard Rules

- Never modify any file under `pages/`, `tests/`, or `utils/` (top-level flat files).
- Never write generated files anywhere other than `generated/pages/<featureName>/` or `generated/tests/<featureName>/`.
- Never write `utils/<featureName>/` files outside the feature's subfolder.
- Never skip HIPAA validation.
- Never skip the `[featureName]` title check — reject issues that don't follow the format.
- For non-client features, always use Playwright MCP to inspect the live page before writing locators.
- Reuse existing Page Objects in `generated/pages/<featureName>/` before generating new ones.
