# CI/CD

## Pipeline Overview

CI is handled by GitHub Actions. The workflow file is at `.github/workflows/playwright.yml`. Tests run on **Azure Playwright Testing Service** in CI — not on the GitHub Actions runner directly.

## Trigger Conditions

```yaml
on:
  workflow_dispatch:          # Manual trigger from GitHub UI
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
```

Tests run automatically on every push or pull request to `main`/`master`. Manual runs are also supported via `workflow_dispatch`.

## CI Job Steps

```
1. actions/checkout@v4           — Check out the repository
2. actions/setup-node@v4 (lts/*) — Set up Node.js LTS
3. npm ci                         — Install dependencies (lockfile-based, no mutations)
4. npx playwright install --with-deps — Install Chromium + system dependencies
5. azure/login@v2                 — OIDC login to Azure (no stored secrets)
6. npm run azureRun               — Run tests via Azure Playwright Testing Service
7. upload-artifact@v4             — Upload playwright-report/ (30-day retention)
```

## Azure Authentication

The CI pipeline uses **OIDC-based authentication** (no client secrets stored in GitHub):

```yaml
permissions:
  id-token: write    # Required for OIDC token generation
  contents: read     # Required for checkout

- name: Azure Login
  uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

Required GitHub secrets:
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

Required GitHub variable:
- `PLAYWRIGHT_SERVICE_URL` — the Azure Playwright Testing endpoint URL

The `DefaultAzureCredential` in `playwright.service.config.ts` picks up the OIDC token automatically after the `azure/login` step completes.

## CI vs Local Configuration Differences

| Setting | Local (`playwright.config.ts`) | CI (`playwright.service.config.ts`) |
|---|---|---|
| Workers | 6 | 4 (`--workers=4`) |
| `headless` | `false` | `true` (Azure enforces headless) |
| Reporter | `html` (opens on failure) | `html` (never opens) + Azure reporter |
| Execution | Local Chromium | Azure Playwright Testing (Linux) |
| OS | Developer machine | `ServiceOS.LINUX` |

## The `azureRun` Script

```json
"azureRun": "npx playwright test client --config=playwright.service.config.ts --workers=4"
```

- Targets only the `client` test directory
- Uses the Azure service config, not the default config
- Caps workers at 4 for the cloud run

Never use `npm run azureRun` locally unless you are explicitly testing the Azure integration — it consumes cloud service minutes.

## Artifact Retention

The HTML report is uploaded regardless of pass/fail (`if: ${{ !cancelled() }}`):

```yaml
- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

The `!cancelled()` condition ensures the report is always uploaded even when tests fail, so failure analysis is always available.

## Global Setup in CI

`global-setup.ts` runs in CI exactly as it does locally. It logs in via API for each worker and saves storage state. Since storage files are not committed to git, they are always regenerated at the start of each CI run — the token validity check will find no existing files and perform fresh logins for all workers.

## Dependencies

Use `npm ci` in CI, never `npm install`. `npm ci` uses `package-lock.json` exactly and never modifies it, ensuring reproducible installs.

## What Not to Do in CI

- Do not commit `storage/` files — they are ephemeral and contain session tokens
- Do not commit `playwright-report/` — it is uploaded as a CI artifact
- Do not run `npm run client` in CI — it uses the local config and skips Azure reporting
- Do not store Azure credentials as plain text secrets — use OIDC (`azure/login@v2`)
- Do not increase `--workers` in `azureRun` beyond the number of test users defined in `siteConfig`
