# Requirements Document

## Introduction

**Feature:** Place Product Order

End-to-end purchase workflow enabling an authenticated customer to select a product, add it to their cart, complete payment and shipping details at checkout (including coupon redemption), place an order, receive confirmation, and immediately verify the order appears in their personal order history.

**Business Objective:** Enable an authenticated customer to browse the product catalogue, add a specific product to their cart, complete payment and shipping details at checkout (including coupon redemption), place an order, receive an order confirmation, and immediately verify that the new order appears in their personal order history.

**Actors:**

| Actor | Description |
|---|---|
| Registered Customer | An existing user with a valid account who is already authenticated |
| E-commerce Platform | The Rahul Shetty Academy client application that processes the purchase |

**Preconditions:**
1. The customer holds a registered and active account on the platform.
2. The customer is authenticated — a valid session exists before the workflow begins.
3. The product to be purchased is listed and available in the catalogue.
4. The customer's account has a pre-associated credit card number on file that auto-populates at checkout.
5. A valid promotional coupon code exists in the system (`rahulshettyacademy`).
6. The cart may contain items from a previous session; the workflow handles this by proceeding with the intended product.

## Glossary

| Term | Definition |
|---|---|
| Dashboard | The authenticated landing page displaying the product catalogue |
| Cart | The shopping cart where products are staged before checkout |
| Checkout page | The order page where payment details, coupon, and country are entered |
| Coupon | A promotional code that applies a discount when entered at checkout |
| Order reference number | A unique identifier generated for each placed order, used to track it in order history |
| Buy Now | The button in the cart that initiates checkout for a specific product |
| Add To Cart | The button on each product card that adds the product to the customer's cart |
| My Orders | The order history page listing all orders placed by the customer |
| Pre-populated | A field whose value is automatically filled by the platform from the customer's account data |

## Requirements

### Requirement 1: Authenticated Access

**User Story:** As a registered customer, I want the product dashboard to be accessible only when I am authenticated, so that my account and order data remain secure.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access the dashboard THEN the platform must redirect them to the login page
2. WHEN an authenticated customer navigates to the dashboard THEN the product catalogue is displayed and accessible
3. IF a customer's session expires mid-workflow THEN the platform redirects to login and the in-progress order is not persisted

---

### Requirement 2: Product Discovery and Add to Cart

**User Story:** As an authenticated customer, I want to browse the product catalogue and add a specific product to my cart, so that I can proceed to purchase it.

#### Acceptance Criteria

1. WHEN the customer lands on the dashboard THEN the product catalogue displays available products with each card showing the product name and an **Add To Cart** button
2. WHEN the customer clicks **Add To Cart** on a product THEN exactly that product is added to the customer's cart
3. WHEN the customer clicks the **Cart** navigation item after adding a product THEN the application navigates to the cart page and the added product is present
4. WHEN the purchase workflow runs for "iphone 13 pro" AND for "ZARA COAT 3" THEN both products can be added to the cart and the workflow completes successfully for each

---

### Requirement 3: Cart Review and Checkout Initiation

**User Story:** As an authenticated customer, I want to review my cart and initiate checkout for a specific product, so that I can proceed to payment.

#### Acceptance Criteria

1. WHEN the customer is on the cart page THEN all products the customer has added are displayed
2. WHEN the customer is on the cart page THEN each cart item includes a **Buy Now** button
3. WHEN the customer clicks **Buy Now** on a cart item THEN the application navigates to the checkout/order page

---

### Requirement 4: Checkout — Payment Details

**User Story:** As an authenticated customer, I want the checkout page to pre-populate my saved card number and allow me to enter CVV and cardholder name, so that I can complete payment without re-entering my full card details.

#### Acceptance Criteria

1. WHEN the checkout page loads THEN the credit card number field is automatically populated with the card number associated with the customer's account
2. WHEN the checkout page loads THEN the credit card number field value matches the card on file exactly — no partial match or format difference is acceptable
3. WHEN the customer is on the checkout page THEN the CVV field and cardholder name field are editable
4. GIVEN the checkout page has loaded WHEN the customer enters a CVV and cardholder name THEN those values are accepted

---

### Requirement 5: Checkout — Coupon Application

**User Story:** As an authenticated customer, I want to apply a promotional coupon code at checkout, so that I receive the associated discount on my order.

#### Acceptance Criteria

1. WHEN the customer enters the coupon code `rahulshettyacademy` and clicks **Apply Coupon** THEN the text `* Coupon Applied` becomes visible on the page
2. WHEN the customer enters an invalid or expired coupon code and clicks **Apply Coupon** THEN the `* Coupon Applied` confirmation does not appear
3. IF no coupon has been applied THEN the order cannot proceed to **Place Order**

---

### Requirement 6: Checkout — Shipping Country Selection

**User Story:** As an authenticated customer, I want to select my shipping country from an autocomplete list, so that the order is associated with the correct destination.

#### Acceptance Criteria

1. WHEN the customer types the first 3 characters of a country name into the country field THEN matching suggestions appear
2. WHEN the customer selects a country from the autocomplete suggestions THEN the shipping country field is populated with the selected country
3. IF the typed characters do not match any country THEN no suggestion appears and no country is selected
4. WHEN the customer types a full country name without selecting from the suggestion list THEN the country field is not considered populated for the purposes of order placement

---

### Requirement 7: Order Placement

**User Story:** As an authenticated customer, I want to place my order after completing all checkout fields, so that my purchase is confirmed and persisted.

#### Acceptance Criteria

1. GIVEN all payment and shipping details are complete WHEN the customer clicks **Place Order** THEN the platform processes the order and navigates to the order confirmation page
2. WHEN the order confirmation page is displayed THEN the page contains the message "Thankyou for the order."
3. WHEN the order confirmation page is displayed THEN an order reference number is visible on the page
4. WHEN an order is placed THEN a unique reference number is generated for that transaction

---

### Requirement 8: Order History Persistence

**User Story:** As an authenticated customer, I want the order I just placed to appear immediately in My Orders, so that I can confirm the order was recorded without any delay.

#### Acceptance Criteria

1. GIVEN an order has just been placed WHEN the customer navigates to My Orders THEN the order history page is displayed
2. WHEN the customer is on the My Orders page THEN the order reference number from the confirmation page is visible in the order history list
3. WHEN the customer transitions from the confirmation page to My Orders THEN the order appears without requiring a page refresh or re-authentication

---

## Business Rules

- **BR-01: One Product Per Checkout** — Each checkout transaction is initiated from a single product's **Buy Now** button. Multi-item checkout is not supported.
- **BR-02: Coupon Mandatory** — A coupon code must be entered and successfully applied before **Place Order** can be used.
- **BR-03: Card on File** — The credit card number is pre-populated from the account. The customer only enters CVV and cardholder name.
- **BR-04: Country Required** — A shipping country must be selected from the autocomplete suggestions. Free-text entry alone is not sufficient.
- **BR-05: Order History is Immediate** — The order must appear in history without refresh or re-authentication after placement.
- **BR-06: Unique Order Reference** — Each placed order generates a unique reference number linking the confirmation page to the order history entry.

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

- **ES-01: Invalid Coupon Code** — If an invalid or expired coupon is applied, `* Coupon Applied` must not appear. The order must not proceed as if a discount was applied.
- **ES-02: Product Not Found** — If the product name does not match any catalogue item, **Add To Cart** is unavailable and the workflow cannot proceed.
- **ES-03: Product Not in Cart** — If the intended product is not in the cart, **Buy Now** for that product is not available.
- **ES-04: Country Not Matching** — If typed characters match no country, no suggestion appears and **Place Order** cannot be completed.
- **ES-05: Session Expiry** — If the session expires mid-workflow, the platform redirects to login and the in-progress order is lost.

---

## Edge Cases

- **EC-01: Duplicate Product in Cart** — If the same product exists multiple times in the cart, **Buy Now** targets the first matching instance.
- **EC-02: Country Autocomplete Selection Required** — Typing a full country name without clicking a suggestion does not satisfy the country requirement.
- **EC-03: Credit Card Field Pre-populated** — The credit card field is pre-populated on load. The customer verifies but does not overwrite it.

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
