# Playwright Guidelines

## Active Configuration (`playwright.config.ts`)

| Setting | Value | Notes |
|---|---|---|
| `retries` | `1` | One retry before marking failed |
| `fullyParallel` | `true` | All tests run in parallel |
| `workers` | `6` (from `siteConfig.workers`) | Must match user count |
| `browserName` | `chromium` | No cross-browser runs |
| `headless` | `false` | Headed locally; Azure enforces headless |
| `video` | `retain-on-failure` | Captured only on failure |
| `screenshot` | `only-on-failure` | Captured only on failure |
| `trace` | `retain-on-failure` | Captured only on failure |
| `reporter` | `html`, open on failure | CI overrides to `open: 'never'` |

## Running Tests

```bash
npm run client      # Local — all client tests
npm run apiLogin    # Local — @Api-tagged tests only
npm run azureRun    # CI — Azure Playwright Testing Service
```

## Global Setup

Registered via `globalSetup: './global-setup.ts'`. Runs once before any test.

- Never login via UI in a test. All auth happens in global setup.
- Throws with a descriptive error if API login fails — aborts the entire run.
- JWT expiry checked with 5-min buffer before re-authenticating.
- `storage/` directory and subdirectories are created if missing.
- Storage files are runtime-only — not committed to git.

See `architecture.md` for the full auth flow diagram.

## Waiting and Synchronization

- Never use `page.waitForTimeout()`.
- Use `await locator.waitFor()` before interacting with elements that may load slowly — e.g., `await checkoutPage.creditCardNumberField.waitFor()`.
- Use `await expect(locator).toBeVisible()` to wait-and-assert in one call.
- Use `await page.waitForResponse(url)` after triggering a request that must complete before asserting.
- Use `pressSequentially` with `delay` for autocomplete inputs:
  ```typescript
  await checkoutPage.country.pressSequentially(data.countryName.substring(0, 3), { delay: 150 });
  ```

## Network Interception

Two patterns are in use. Both require URL constants at the top of the spec file.

**Response mocking** (`networkInterception.spec.ts`):
```typescript
await page.route(GET_CUSTOMER_ORDERS, async route => {
    const response = await page.request.fetch(route.request());
    route.fulfill({ response, body: JSON.stringify(responseWithNoOrders) });
});
await page.waitForResponse(GET_CUSTOMER_ORDERS);
```
Always pass the original `response` to preserve status codes and headers — only override `body`.

**URL rewriting** (`securityTesting.spec.ts`):
```typescript
await page.route(`${GET_ORDER_DETAILS_BY_ID}*`, route =>
    route.continue({ url: `${GET_ORDER_DETAILS_BY_ID}621661f884b053f6765465b6` })
);
```

`page.route()` is only for mocking browser network traffic. For real API calls (state setup/teardown), use `ApiUtils` — see `api-guidelines.md`.

## Projects Configuration

Driven by `siteConfig` — never hardcode names or URLs in the config:
```typescript
projects: [{
    name: siteConfig.name,                     // 'client'
    testDir: `./tests/${siteConfig.name}`,     // './tests/client'
    workers: siteConfig.workers,               // 6
    use: { baseURL: siteConfig.baseURL },
}]
```

`playwright.service.config.ts` is an infra-only file. Never add test logic to it. See `ci-cd.md` for CI-specific differences.
