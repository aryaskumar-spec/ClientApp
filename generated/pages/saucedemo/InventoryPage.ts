import { Page, Locator, expect } from "@playwright/test";

export class InventoryPage {
    readonly page: Page;
    readonly productsTitle: Locator;
    readonly inventoryList: Locator;

    constructor(page: Page) {
        this.page = page;
        this.productsTitle = page.getByText('Products');
        this.inventoryList = page.locator('.inventory_list');
    }

    async verifyProductsPageDisplayed() {
        //Assert the Products heading is visible — confirms successful login and page load
        await expect(this.productsTitle).toBeVisible();
        await expect(this.page).toHaveURL(/inventory\.html/);
    }
}
