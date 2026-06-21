# Page Object Guidelines

## Structure

Every page has its own class. Order within the class is fixed:

```typescript
import { Page, Locator, expect } from "@playwright/test";

export class ExamplePage {
    readonly page: Page;           // always first
    readonly someField: Locator;   // static locators next
    readonly submitButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.someField = page.getByRole('textbox', { name: 'Field Label' });
        this.submitButton = page.getByRole('button', { name: 'Submit' });
    }

    async goToSite() { ... }           // navigation
    async doSomething() { ... }        // actions
    async verifySomething() { ... }    // assertions last
}
```

For locator selection inside constructors, follow the priority order in `locator-strategy.md`.

## Static vs Dynamic Locators

Static locators (same for every test) → `readonly` class property in constructor.

Dynamic locators (depend on runtime data) → synchronous method returning `Locator`:

```typescript
// Not async — Locator objects are lazy, no browser interaction until acted on
addToCartButton(productName: string) {
    return this.page.locator('.card-body')
        .filter({ hasText: productName })
        .first()
        .getByRole('button', { name: 'Add To Cart' });
}

getProductBuyNow(productName: string) {
    return this.cart.filter({ hasText: productName })
        .getByRole('button', { name: 'Buy Now' }).first();
}
```

## Navigation Methods

Named `goToSite()` on every page object. URLs are hardcoded only here — never in test files.

Tests start from the post-login state (storage state loaded by fixture), so `goToSite()` navigates directly to the authenticated page — no login step.

## Verification Methods

Prefix all assertion methods with `verify`. They are `async` and use `await expect(...)` internally:

| Pattern | Example method |
|---|---|
| URL navigation | `verifyCartPageNavigation()`, `verifyCheckoutPageNavigation()` |
| Visibility | `verifyCouponApplied()`, `verifyLoginSuccessful()` |
| Field value | `verifyCreditCardPrePopulatedValue(creditCardNumber)` |
| Combined flow | `verifyOrderIdVisibleInOrderHistory()` |

Multi-step verifications (extract value → navigate → assert) are encapsulated in one method:

```typescript
async verifyOrderIdVisibleInOrderHistory() {
    const orderNumberString = await this.page
        .locator('td.em-spacer-1 label.ng-star-inserted').textContent();
    const orderNumber = orderNumberString?.trim().split('|')[1]?.trim() || " ";
    await this.page.locator('label[routerlink="/dashboard/myorders"]').click();
    await expect(this.page).toHaveURL(/dashboard\/myorders/);
    await expect(this.page.getByText(orderNumber)).toBeVisible();
}
```

Combined navigate+fill+assert methods are also acceptable for test entry points:
```typescript
async loginToTheSiteSuccessfully(username: string, password: string) {
    await this.page.goto('https://rahulshettyacademy.com/client');
    await this.email.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
    await expect(this.page).toHaveURL(/dashboard\/dash/);
}
```

## PageManager Registration

Every new page object must be added to `clientSitePageManager.ts`:

```typescript
import { NewPage } from "./newPage";

export class PageManager {
    readonly newPage: NewPage;

    constructor(page: Page) {
        this.newPage = new NewPage(page);
    }

    getNewPage() { return this.newPage; }
}
```

## API Calls Inside Page Objects

Acceptable only for setup/teardown (e.g., clearing cart state). Pattern from `CartPage.clearCart()`:

```typescript
async clearCart(workerIndex: number): Promise<void> {
    const apiContext = await request.newContext();
    const apiUtils = new ApiUtils(apiContext, workerIndex);
    const cartItems = await apiUtils.getCartItems();
    for (const item of cartItems) {
        await apiUtils.deleteCartItem(item._id);
    }
    await apiContext.dispose();  // always dispose
}
```

Rules: `Promise<void>` return, `workerIndex` as parameter (never hardcoded), no assertions inside.

## What Page Objects Must Not Do

- No `test()` or `test.describe()` blocks
- No `testInfo` access
- No hardcoded test data — accept as method parameters
- No imports from `fixture.ts`
- No `page.waitForTimeout()`
