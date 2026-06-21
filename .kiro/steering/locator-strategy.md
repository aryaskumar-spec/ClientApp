# Locator Strategy

## Locator Priority Order

This framework follows a clear priority for choosing locators, from most preferred to least:

1. `getByRole` with accessible name — most resilient, semantically meaningful
2. `getByPlaceholder` — for input fields where placeholder text is stable
3. `getByLabel` — for form fields associated with a `<label>`
4. `getByText` — for non-interactive text matching (navigation links, messages)
5. `locator(css)` with chaining/filtering — when ARIA locators are insufficient
6. `locator(css)` with attribute selectors — as a last resort for dynamic elements

Never use XPath. Never use index-based locators like `locator('button').nth(0)` without a chaining context — the only acceptable use of `.nth()` is when combined with a specific container locator.

## Patterns Used in This Framework

### `getByRole` with name option
Used for buttons, textboxes, and interactive controls with stable accessible names:
```typescript
page.getByRole('button', { name: 'Login' })
page.getByRole('button', { name: 'Apply Coupon' })
page.getByRole('textbox', { name: 'Passsword' })   // note: typo matches actual placeholder
page.getByRole('combobox')                          // when only one combobox exists on page
page.getByRole('checkbox')                          // when only one checkbox exists on page
```

### `getByPlaceholder`
Used when the placeholder text is the most stable identifier for an input:
```typescript
page.getByPlaceholder("email@example.com")
page.getByPlaceholder("Select Country")
page.getByPlaceholder("enter your number")
```

### `getByLabel`
Used for form fields linked to a visible label element:
```typescript
page.getByLabel('First Name')
page.getByLabel('Last Name')
```

### `getByText`
Used for clicking navigation items, verifying messages, and selecting autocomplete options:
```typescript
page.getByText('Cart')
page.getByText(data.countryName, { exact: true })   // exact: true for autocomplete selections
page.getByText('ORDERS')
page.getByText(' Thankyou for the order. ')
page.getByText(orderId)
```

### CSS locator with `.filter()`
Used to scope a locator to a specific card or list item when the element is inside a repeated container:
```typescript
// Scope to a specific product card by text content
this.page.locator('.card-body')
    .filter({ hasText: productName })
    .first()
    .getByRole('button', { name: 'Add To Cart' })

// Scope within the cart container
this.cart
    .filter({ hasText: productName })
    .getByRole('button', { name: 'Buy Now' })
    .first()
```

The `.filter({ hasText: ... })` pattern is the standard way to disambiguate repeated elements. Always chain `.getByRole()` or `.getByText()` after the filter rather than using a CSS selector for the final target.

### CSS locator with attribute selectors
Used when no ARIA attribute is available:
```typescript
page.locator('div[class="cart"]')           // exact class match
page.locator('div[class="cart"] ul')        // child element of a container
page.locator("input[value='Female']")       // radio button by value attribute
page.locator('label[routerlink="/dashboard/myorders"]')  // Angular router attribute
```

### CSS with pseudo-selector (`:has-text`)
Used for paragraphs or containers that contain specific text:
```typescript
page.locator('p:has-text("* Coupon Applied")')
page.locator("button:has-text('View')")
```

### `nav` scoping
Used to scope navigation-level locators:
```typescript
page.locator('nav').getByText('Cart')
```

### `.nth()` usage
Only acceptable when combined with a meaningful parent locator:
```typescript
// ✅ Scoped to checkout form fields — nth is positional but context is clear
page.getByRole('textbox').nth(0)   // credit card number
page.getByRole('textbox').nth(1)   // CVV
page.getByRole('textbox').nth(2)   // name on card
page.getByRole('textbox').nth(3)   // coupon code
```
Document the field name in a comment next to each `.nth()` locator.

## Locators as Class Properties vs Methods

| Scenario | Approach |
|---|---|
| Static element — same for every test | `readonly` class property set in constructor |
| Element depends on runtime data (product name, ID) | Synchronous method returning `Locator` |

```typescript
// Static — declared in constructor
this.loginButton = page.getByRole('button', { name: 'Login' });

// Dynamic — synchronous method
addToCartButton(productName: string) {
    return this.page.locator('.card-body')
        .filter({ hasText: productName })
        .first()
        .getByRole('button', { name: 'Add To Cart' });
}
```

## Chaining Rules

- Always chain from the most specific stable parent container down to the target element.
- Prefer `container.getByRole(...)` over a flat CSS selector that traverses the full DOM.
- Use `.first()` when a filtered set could still return multiple matches (e.g., same product appears multiple times).

## What to Avoid

| Anti-pattern | Why | Preferred alternative |
|---|---|---|
| `page.locator('button').nth(2)` | Brittle — breaks on DOM reorder | Scope with container + filter |
| XPath (`//div[@class='...']`) | Verbose, fragile | CSS attribute selector or `getByRole` |
| `page.locator('#id')` | IDs are often generated or unstable | `getByRole` or `getByLabel` |
| Hardcoded full URLs in locators | Not a locator issue, but related — use `siteConfig` | Import from `testUsers.ts` |
| `locator.isVisible()` in `if` blocks | Bypasses Playwright's auto-waiting | `await expect(locator).toBeVisible()` |
