# API Guidelines

## Purpose

API calls in this framework serve two purposes only:
1. **State setup** — create orders, clear cart before a UI test
2. **Hybrid verification** — create via API, then assert in the UI

There are no pure API-only tests. Every API call feeds a UI assertion or prepares state for one.

## ApiUtils — Usage

All HTTP calls go through `utils/ApiUtils.ts`. Always instantiate with `APIRequestContext` and `workerIndex`:

```typescript
const apiContext = await request.newContext();
const apiUtils = new ApiUtils(apiContext, testInfo.workerIndex);
// ... use apiUtils ...
await apiContext.dispose();  // caller's responsibility, not ApiUtils
```

`ApiUtils` reads `token` and `userId` from storage automatically via `storageHelper`. Never hardcode tokens or user IDs.

## Existing Methods

| Method | HTTP | Endpoint | Returns |
|---|---|---|---|
| `createOrder(payload)` | POST | `/order/create-order` | `orderId: string` |
| `getCartItems()` | GET | `/user/get-cart-products/:userId` | items array |
| `deleteCartItem(itemId)` | DELETE | `/user/remove-from-cart/:itemId` | void |

## URL Management

All endpoint URLs are `private get` properties — never inline strings in method bodies:

```typescript
private get ORDER_CREATE_URL() {
    return `${siteConfig.apiBaseURL}order/create-order`;
}
private get USER_CART() {
    return `${siteConfig.apiBaseURL}user/get-cart-products/${this.userId}`;
}
```

Base URL always from `siteConfig.apiBaseURL`. Dynamic segments (userId) interpolated via getters.

## Adding New Methods

```typescript
async getOrderDetails(orderId: string): Promise<any> {
    const response = await this.apiContext.get(
        `${siteConfig.apiBaseURL}order/get-orders-details?id=${orderId}`,
        { headers: { authorization: this.token } }
    );
    const body = await response.json();
    return body.orders[0];   // return only what the caller needs
}
```

Rules: always `await` response, always `.json()` to parse, extract specific fields (not whole response), log completion with emoji prefix.

## Hybrid API+UI Test Pattern

```typescript
test('Check whether created orderid is visible in history page', async ({ page }, testInfo) => {
    const apiContext = await request.newContext();
    const apiUtils = new ApiUtils(apiContext, testInfo.workerIndex);

    const orderId = await apiUtils.createOrder(orderPayload);
    await apiContext.dispose();

    await page.goto(siteConfig.baseURL);
    await expect(page).toHaveURL(/dashboard\/dash/);
    await expect(page.getByText(orderId)).toBeVisible();
});
```

## API Payloads

Define as `const` at the top of the spec file:
```typescript
const orderPayload = {
    orders: [{ country: "Angola", productOrderedId: "6960ea76c941646b7a8b3dd5" }]
}
```

## ApiUtils vs `page.route()`

| Use | Tool |
|---|---|
| Real HTTP calls for state setup/teardown | `ApiUtils` |
| Mocking or rewriting browser network responses | `page.route()` |

`page.route()` only affects the browser context — it has no effect on `request.newContext()` calls. Never use it for setup. See `playwright-guidelines.md` for network interception patterns.

## storageHelper Access Rule

`storageHelper` is a private implementation detail of `ApiUtils`. Do not import it in tests or page objects:

```typescript
// ✅
const apiUtils = new ApiUtils(apiContext, testInfo.workerIndex);

// ❌ bypasses the abstraction
const token = getTokenFromStorage(testInfo.workerIndex);
```
