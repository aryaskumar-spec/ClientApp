import { APIRequestContext } from '@playwright/test';
import { siteConfig } from './testUsers';
import { getTokenFromStorage, getUserIdFromStorage } from './storageHelper';

export class ApiUtils {
    private apiContext: APIRequestContext;
    private token: string;
    private userId: string;

    constructor(apiContext: APIRequestContext, workerIndex: number){
        this.apiContext = apiContext;
        this.token = getTokenFromStorage(workerIndex)
        this.userId = getUserIdFromStorage(workerIndex)
    }

    private get ORDER_CREATE_URL() {
        return `${siteConfig.apiBaseURL}order/create-order`;
    }

    private get REMOVE_FROM_CART_URL() {
        return `${siteConfig.apiBaseURL}user/remove-from-cart/`;
    }

    private get USER_CART() {
        return `${siteConfig.apiBaseURL}user/get-cart-products/${this.userId}`;
    }

    // ── Order ──────────────────────────────────────────────

    async createOrder(orderPayload: any): Promise<string> {
        const orderCreationResponse = await this.apiContext.post(this.ORDER_CREATE_URL, {
            data: orderPayload,
            headers: {
                'authorization': this.token,
                'content-type': 'application/json'
            }
        });

        const orderCreationResponseJson = await orderCreationResponse.json();
        const orderId = orderCreationResponseJson.orders[0];
        //console.log(`✅ Order created: ${orderId}`);
        return orderId;
    }

    // ── Cart ───────────────────────────────────────────────

    async getCartItems(): Promise<any> {
        const cartResponse = await this.apiContext.get(this.USER_CART, {
            headers: { authorization: this.token }
        })
        const cartBody = await cartResponse.json();
        const cartItems = cartBody.data;
        //console.log(`✅ Cart Items fetched`);
        return cartItems
    }

    async deleteCartItem(itemId: any): Promise<any> {
        await this.apiContext.delete(`${this.REMOVE_FROM_CART_URL}${itemId}`, {
            headers: { authorization: this.token }
        })
        console.log(`🗑️ Removed item ${itemId} from cart`);
    }
}