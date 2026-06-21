# Specification: Place Product Order

## Feature Name

Place Product Order — end-to-end purchase workflow from product discovery through order confirmation and history verification.

---

## Business Objective

Enable an authenticated customer to browse the product catalogue, add a specific product to their cart, complete payment and shipping details at checkout (including coupon redemption), place an order, receive an order confirmation, and immediately verify that the new order appears in their personal order history.

---

## Actors

| Actor | Description |
|---|---|
| Registered Customer | An existing user with a valid account who is already authenticated |
| E-commerce Platform | The Rahul Shetty Academy client application that processes the purchase |

---

## Preconditions

1. The customer holds a registered and active account on the platform.
2. The customer is authenticated — a valid session exists before the workflow begins.
3. The product to be purchased is listed and available in the catalogue.
4. The customer's account has a pre-associated credit card number on file that auto-populates at checkout.
5. A valid promotional coupon code exists in the system (`rahulshettyacademy`).
6. The cart may contain items from a previous session; the workflow handles this by proceeding with the intended product.

---

## User Workflow

### Step 1 — Browse the Product Catalogue
The customer lands on the product dashboard. The catalogue displays available products.

### Step 2 — Add Product to Cart
The customer locates the desired product by name and clicks **Add To Cart**. The platform adds the item to the customer's shopping cart.

### Step 3 — Navigate to Cart
The customer clicks the **Cart** navigation item. The platform navigates to the cart page, where the added product is visible.

### Step 4 — Initiate Checkout
From the cart, the customer clicks **Buy Now** on the desired product. The platform navigates to the checkout/order page.

### Step 5 — Review and Complete Payment Details
On the checkout page:
- The customer verifies that the credit card number field is pre-populated with the card on file.
- The customer enters the CVV security code.
- The customer enters the cardholder name.

### Step 6 — Apply Promotional Coupon
The customer enters a coupon code and clicks **Apply Coupon**. The platform confirms the coupon is applied with a visible success indicator (`* Coupon Applied`).

### Step 7 — Select Shipping Country
The customer types the first few characters of their country name into the country search field. The platform presents matching suggestions. The customer selects their country from the list.

### Step 8 — Place the Order
The customer clicks **Place Order**. The platform processes the order and navigates to an order confirmation page.

### Step 9 — Confirm Order Success
The platform displays a "Thankyou for the order." confirmation message and an order reference number on the confirmation page.

### Step 10 — Verify Order in Order History
The customer navigates to **My Orders**. The platform displays the order history page. The newly placed order's reference number is visible in the list.

---

## Functional Requirements

### FR-01: Authenticated Access
The customer must be authenticated before the dashboard is accessible. Unauthenticated users must not reach the product catalogue.

### FR-02: Product Discovery
The dashboard must display a searchable, filterable product catalogue. Each product card must show the product name and include an **Add To Cart** button.

### FR-03: Add to Cart
Clicking **Add To Cart** on a product must add exactly that product to the customer's cart. The cart count or cart contents must reflect the addition.

### FR-04: Cart Review
The cart page must display all products the customer has added. Each cart item must include a **Buy Now** button to initiate checkout for that specific product.

### FR-05: Credit Card Pre-population
The checkout page must automatically populate the credit card number field with the payment card associated with the customer's account. The customer must be able to verify this value before proceeding.

### FR-06: Payment Detail Entry
The customer must be able to enter CVV and cardholder name. These fields must be editable.

### FR-07: Coupon Application
The checkout page must accept a promotional coupon code. Upon successful application, the page must display a visible confirmation (`* Coupon Applied`). An invalid or expired coupon must not display this confirmation.

### FR-08: Country Selection
The checkout page must provide a searchable country selector. Typing partial country name must return matching suggestions. Selecting a country from the suggestions must populate the shipping country field.

### FR-09: Order Placement
Clicking **Place Order** must submit the order with all entered details (card number, CVV, cardholder name, coupon, country). The platform must process and persist the order.

### FR-10: Order Confirmation Page
After successful order placement, the platform must navigate to a confirmation page containing:
- A success message: "Thankyou for the order."
- The order reference number, identifiable in the page content.

### FR-11: Order History Persistence
The newly placed order must appear in the customer's order history immediately after placement. The order reference number shown on the confirmation page must match the entry in the order history list.

### FR-12: Multiple Product Support
The full purchase workflow must function correctly for different products (e.g., "iphone 13 pro", "ZARA COAT 3") without any product-specific special handling.

---

## Acceptance Criteria

### AC-01: Cart Navigation
**Given** an authenticated customer on the dashboard  
**When** the customer adds a product and clicks the Cart navigation item  
**Then** the application navigates to the cart page and the product is present in the cart

### AC-02: Checkout Navigation
**Given** a product is in the cart  
**When** the customer clicks **Buy Now**  
**Then** the application navigates to the checkout/order page

### AC-03: Credit Card Pre-population
**Given** the customer is on the checkout page  
**When** the page loads  
**Then** the credit card number field contains the card number associated with the customer's account and the value matches exactly

### AC-04: Coupon Application
**Given** the customer enters the coupon code `rahulshettyacademy`  
**When** the customer clicks **Apply Coupon**  
**Then** the text `* Coupon Applied` becomes visible on the page

### AC-05: Country Selection
**Given** the customer types the first 3 characters of a country name  
**When** the autocomplete suggestions appear  
**Then** selecting the matching country populates the shipping country field correctly

### AC-06: Order Confirmation
**Given** all payment and shipping details are complete  
**When** the customer clicks **Place Order**  
**Then** the application navigates to the thank-you page and displays "Thankyou for the order."

### AC-07: Order Reference Number
**Given** the order confirmation page is displayed  
**Then** an order reference number is visible on the page

### AC-08: Order History Entry
**Given** an order has just been placed  
**When** the customer navigates to My Orders  
**Then** the order reference number from the confirmation page is visible in the order history list

### AC-09: Multiple Products
**Given** the full purchase workflow is executed  
**When** executed for "iphone 13 pro" (country: India)  
**And** executed for "ZARA COAT 3" (country: Cuba)  
**Then** both complete successfully and each generates a unique order visible in history

---

## Business Rules

### BR-01: One Product Per Checkout
Each checkout transaction is initiated from a single product's **Buy Now** button in the cart. The workflow does not support placing a multi-item order in a single transaction.

### BR-02: Coupon Mandatory
The workflow includes coupon application as a standard step. The order cannot proceed to **Place Order** without a coupon code being entered and applied.

### BR-03: Card on File
Credit card number is pre-populated from the customer's account. The customer does not enter the card number manually during checkout — they only complete the CVV and cardholder name.

### BR-04: Country Required
A shipping country must be selected from the autocomplete list before placing the order. Free-text entry alone is not sufficient — the country must be selected from the suggestions.

### BR-05: Order History is Immediate
The order must appear in order history without any refresh or manual navigation delay. The transition from confirmation page to order history and the appearance of the order ID are part of the same workflow.

### BR-06: Unique Order Reference per Transaction
Each successfully placed order generates a unique reference number. This number is the primary identifier linking the confirmation page to the order history entry.

---

## Validation Rules

| Field | Rule |
|---|---|
| Credit card number | Must match the card on file exactly — no partial match or format difference |
| CVV | Entered by the customer; 3-digit numeric code |
| Cardholder name | Free text; must not be empty |
| Coupon code | Must be an exact, case-sensitive match to a valid active code |
| Country | Must be selected from the autocomplete dropdown; cannot be a free-text value |
| Product name | Must match an existing product in the catalogue exactly (case-sensitive) |

---

## Error Scenarios

### ES-01: Invalid Coupon Code
If the customer enters an invalid or expired coupon code and clicks **Apply Coupon**, the `* Coupon Applied` confirmation must not appear. The order should not proceed as if a discount was applied.

### ES-02: Product Not Found in Catalogue
If the product name does not match any item in the catalogue, **Add To Cart** cannot be clicked. The workflow cannot proceed.

### ES-03: Product Not in Cart
If the customer navigates to the cart and the intended product is not present (e.g., was removed or never added), the **Buy Now** button for that product will not be available.

### ES-04: Country Not Matching Autocomplete
If the typed characters do not match any country in the system, no suggestion appears and no country can be selected. **Place Order** cannot be completed without a country.

### ES-05: Session Expiry
If the customer's session expires mid-workflow, the platform should redirect to the login page. The in-progress order would be lost and the customer would need to re-authenticate and restart.

---

## Edge Cases

### EC-01: Duplicate Product in Cart
If the same product was added to the cart in a previous session and not cleared, a duplicate entry may appear in the cart. The **Buy Now** action targets the first matching instance.

### EC-02: Country Autocomplete Exact Match Required
The country field requires the customer to type enough characters to uniquely identify the country, then select from the suggestion list. Typing a full country name without selecting from the list does not satisfy the shipping country requirement.

### EC-03: Credit Card Field Already Populated
The credit card number field is pre-populated when the checkout page loads. The customer should not overwrite this value — the expected workflow is to verify it, not re-enter it.

### EC-04: Order Reference Number Format
The order reference number displayed on the confirmation page is embedded in a string with pipe (`|`) delimiters. The actual order ID is the segment after the `|` character, trimmed of whitespace.

### EC-05: Multiple Concurrent Sessions
Because each test user has a dedicated account, cart state is user-specific. Concurrent sessions on the same user account could cause cart state conflicts, but this is prevented by the 1-to-1 worker-to-user mapping in this test environment.

---

## Dependencies

| Dependency | Description |
|---|---|
| Authentication system | Customer must be authenticated before any part of this workflow is accessible |
| Product catalogue service | Must return available products for the dashboard to display |
| Cart service | Must persist cart additions and return current cart contents |
| Payment processing | Must accept card number, CVV, and cardholder name; must pre-populate card number from account |
| Coupon validation service | Must validate coupon codes and return confirmation of application |
| Country data | Must provide a searchable list of countries for the shipping field autocomplete |
| Order management service | Must create an order, return an order reference, and immediately reflect it in the customer's order history |

---

## Assumptions

1. The customer is already registered — account creation is not part of this workflow.
2. Authentication is handled before the workflow begins — the customer starts on the authenticated dashboard.
3. The pre-associated credit card is already stored against the customer's account — the customer never enters a full card number during checkout.
4. The coupon code `rahulshettyacademy` is active and valid in the test environment.
5. Product names ("iphone 13 pro", "ZARA COAT 3") exist in the catalogue and are available for purchase.
6. The order history is accessible from the same session immediately after placing an order, without re-authentication.
7. The platform is a single-page Angular application — navigation is client-side routing, not full page loads.

---

## Out of Scope

- User registration and account creation
- Login and authentication steps (handled as a precondition)
- Multi-item checkout (adding more than one product to a single order)
- Payment failure scenarios (declined card, expired card)
- Order cancellation or returns
- Guest checkout (unauthenticated purchase)
- Address management beyond country selection
- Product search, filtering, or sorting on the dashboard
- Wishlist or save-for-later functionality
- Email confirmation of order placement
- Stock availability checking or out-of-stock handling
- Coupon stacking (applying more than one coupon)
- Price display or discount amount verification
- Cross-browser behaviour (workflow is verified on Chromium only)
