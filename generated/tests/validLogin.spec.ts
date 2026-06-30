import { test, expect } from '@playwright/test'
import { PageManager } from '../../pages/client/clientSitePageManager'
import { siteConfig } from '../../utils/testUsers'

/**
 * GitHub Issue #3 — Valid Login Scenarios
 *
 * Acceptance Criteria:
 *   - Navigate to Login Page
 *   - Enter valid username
 *   - Enter valid password
 *   - Click Login
 *   - Verify the URL is changed with '/dashboard/'
 *
 * Uses base @playwright/test (not utils/fixture) because this test navigates
 * to the login page directly — the auth fixture conflicts with manual login navigation.
 * Credentials sourced from siteConfig — never hardcoded.
 */
test('Verify user is redirected to dashboard after valid login', async ({ page }) => {
    const pageManager = new PageManager(page)
    const loginPage = pageManager.getLoginPage()

    const { username, password } = siteConfig.users[0]

    await loginPage.goToSite()
    await loginPage.loginToSite(username, password)
    await loginPage.verifyLoginSuccessful()
})
