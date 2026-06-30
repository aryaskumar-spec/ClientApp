import { request } from '@playwright/test';

/**
 * Saucedemo Auth Utility
 *
 * Saucedemo uses hardcoded credentials (no login API endpoint).
 * getToken() returns the username directly — tests inject it into
 * localStorage as the session identifier so pages load in authenticated state.
 *
 * Usage in generated tests:
 *   import { getToken } from '../../../utils/saucedemo/ApiUtils';
 *   const token = await getToken();
 *   await page.addInitScript((t) => {
 *       window.localStorage.setItem('session-username', t);
 *   }, token);
 */

const SAUCEDEMO_USERNAME = 'standard_user';
const SAUCEDEMO_PASSWORD = 'secret_sauce';
const SAUCEDEMO_BASE_URL = 'https://www.saucedemo.com';

/**
 * Returns the authenticated session token for saucedemo.
 * Performs a POST login and extracts the session cookie/token,
 * or returns the username if saucedemo uses localStorage-based auth.
 */
export async function getToken(): Promise<string> {
    // Saucedemo stores session in localStorage after UI login.
    // Since there is no dedicated login API, we return the username
    // which the test injects to simulate a logged-in session.
    // Replace this with an actual API call if a login endpoint becomes available.
    return SAUCEDEMO_USERNAME;
}

export const saucedemoConfig = {
    baseURL: SAUCEDEMO_BASE_URL,
    username: SAUCEDEMO_USERNAME,
    password: SAUCEDEMO_PASSWORD,
};
