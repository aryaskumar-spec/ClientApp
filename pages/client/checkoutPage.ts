import { Page, Locator, expect } from "@playwright/test";

export class CheckoutPage {
    readonly page: Page;
    readonly creditCardNumberField: Locator
    readonly cvvField: Locator
    readonly nameOnCardField: Locator
    readonly coupon: Locator
    readonly applyButton: Locator
    readonly placeOrderButton: Locator
    readonly country: Locator

    constructor(page: Page) {
        this.page = page
        this.creditCardNumberField = page.getByRole('textbox').nth(0)
        this.cvvField = page.getByRole('textbox').nth(1)
        this.nameOnCardField = page.getByRole('textbox').nth(2)
        this.coupon = page.getByRole('textbox').nth(3)
        this.applyButton = page.getByRole('button', { name: 'Apply Coupon' })
        this.placeOrderButton = page.getByText('Place Order');
        this.country = page.getByPlaceholder("Select Country")
    }

    //Assert that credit card number field is not empty and has the expected value
    async verifyCreditCardPrePopulatedValue(creditCardNumber: string) {
        const creditCardNumberValue = await this.creditCardNumberField.inputValue();
        expect(creditCardNumberValue).toBe(creditCardNumber);
    }

    //Assert email id in shipping info
    async verifyEmailIdInShippingInfo(emailId: string) {
        await expect(this.page.getByText(emailId)).toBeVisible();
    }

    //Assert that coupon is applied
    async verifyCouponApplied() {
        await expect(this.page.locator('p:has-text("* Coupon Applied")')).toBeVisible();
    }

    async verifyThankyouPageNavigation() {
        //Assert navigation to order confirmation page and verify order details
        await expect(this.page).toHaveURL(/dashboard\/thank/);
        expect(this.page.locator('.hero-primary')).toHaveText(' Thankyou for the order. ');
    }

    async verifyOrderIdVisibleInOrderHistory() {
        const orderNumberString = await this.page.locator('td.em-spacer-1 label.ng-star-inserted').textContent();
        const orderNumber = orderNumberString?.trim().split('|')[1]?.trim() || " ";
        const orderHistory = this.page.locator('label[routerlink="/dashboard/myorders"]')
        await orderHistory.click()
        //Assert navigation to order history page and verify that the order number is visible in order history
        await expect(this.page).toHaveURL(/dashboard\/myorders/);
        await expect(this.page.getByText(orderNumber)).toBeVisible();
    }
}