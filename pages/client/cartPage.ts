import { Page, Locator, expect, request } from "@playwright/test";
import { ApiUtils } from "../../utils/ApiUtils";

export class CartPage {
    readonly page: Page;
    readonly cart: Locator;
    readonly cartItems: Locator

    constructor(page: Page) {
        this.page = page
        this.cart = page.locator('div[class="cart"]');
        this.cartItems = page.locator('div[class="cart"] ul')
    }    

    async clearCart(workerIndex: number): Promise<void> {
        const apiContext = await request.newContext();
        const apiUtils = new ApiUtils(apiContext, workerIndex);
        const cartItems = await apiUtils.getCartItems()
        if (!cartItems || cartItems.length === 0) {
            //console.log('🛒 Cart is already empty');
            await apiContext.dispose();
            return;
        }

        for (const item of cartItems) {
            await apiUtils.deleteCartItem(item._id)
        }

        await apiContext.dispose();
        console.log('✅ Cart cleared successfully');
    }

    getProductBuyNow(productName: string) {
        return this.cart.filter({ hasText: `${productName}` }).getByRole('button', { name: 'Buy Now' }).first()
    }

    async verifyCheckoutPageNavigation() {
        await expect(this.page).toHaveURL(/dashboard\/order/);
    }
}