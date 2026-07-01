/**
 * GitHub Issue #6 — [saucedemo] Verify user can login with valid credentials
 *
 * Acceptance Criteria:
 *   - Navigate to https://www.saucedemo.com
 *   - Enter username: standard_user
 *   - Enter password: secret_sauce
 *   - Click Login
 *   - Verify the products page is displayed
 *
 * Uses base @playwright/test (not utils/fixture) — saucedemo is a non-client feature.
 * Credentials sourced from utils/saucedemo/ApiUtils.ts — never hardcoded.
 */
import { test, expect } from '@playwright/test';
import { saucedemoConfig } from '../../../utils/saucedemo/ApiUtils';
import { LoginPage } from '../../pages/saucedemo/LoginPage';
import { InventoryPage } from '../../pages/saucedemo/InventoryPage';

test('Verify user can login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goToSite();
    await loginPage.loginToSite(saucedemoConfig.username, saucedemoConfig.password);
    await loginPage.verifyLoginSuccessful();
    await inventoryPage.verifyProductsPageDisplayed();
});
