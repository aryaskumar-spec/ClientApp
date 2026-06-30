import { test, expect } from '@playwright/test'
import { LoginErrorPage } from '../pages/LoginErrorPage'

/**
 * GitHub Issue #1 — Login page should display error for invalid credentials
 *
 * Acceptance Criteria:
 *   - Navigate to Login Page
 *   - Enter invalid username
 *   - Enter invalid password
 *   - Click Login
 *   - Verify "Invalid Credentials" is displayed
 *
 * Uses base @playwright/test (not utils/fixture) because this test navigates
 * to the login page directly — the auth fixture would conflict with that.
 */
test('Verify error message is displayed for invalid login credentials', async ({ page }) => {
    const loginErrorPage = new LoginErrorPage(page);

    await loginErrorPage.goToSite();
    await loginErrorPage.loginWithInvalidCredentials('invalid@test.com', 'wrongpassword123');
    await loginErrorPage.verifyInvalidCredentialsError();
});
