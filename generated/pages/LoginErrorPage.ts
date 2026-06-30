import { Page, Locator, expect } from "@playwright/test";

/**
 * Generated for GitHub Issue #1
 * Extends the login scenario with invalid credentials error verification.
 * Reuses the same locators as LoginPage (pages/client/loginPage.ts)
 * plus adds the error message locator.
 */
export class LoginErrorPage {
    readonly page: Page;
    readonly email: Locator;
    readonly password: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.email = page.getByPlaceholder("email@example.com");
        this.password = page.getByRole('textbox', { name: 'Passsword' });
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.errorMessage = page.getByText('Incorrect email or password');
    }

    async goToSite() {
        await this.page.goto('https://rahulshettyacademy.com/client');
    }

    async loginWithInvalidCredentials(username: string, password: string) {
        await this.email.fill(username);
        await this.password.fill(password);
        await this.loginButton.click();
    }

    async verifyInvalidCredentialsError() {
        await expect(this.errorMessage).toBeVisible();
    }
}
