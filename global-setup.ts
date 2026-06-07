import { request, chromium } from '@playwright/test';
import { siteConfig } from './utils/testUsers';
import * as fs from 'fs';

// Check if stored token is still valid
async function isTokenValid(storageFilePath: string, site: any): Promise<boolean> {
  // If file doesn't exist, token is invalid
  if (!fs.existsSync(storageFilePath)) return false;

  try {
    const raw = fs.readFileSync(storageFilePath, 'utf-8');
    const storageState = JSON.parse(raw);

    // Extract token from localStorage
    const origin = storageState.origins?.find((o: any) =>
      o.origin.includes(new URL(site.baseURL).hostname)
    );
    const tokenEntry = origin?.localStorage?.find((entry: any) =>
      entry.name === 'token'  // ← adjust key if needed
    );

    if (!tokenEntry?.value) return false;

    // Decode JWT and check expiry
    const payload = JSON.parse(
      Buffer.from(tokenEntry.value.split('.')[1], 'base64').toString()
    );

    const expiryTime = payload.exp * 1000; // convert to ms
    const currentTime = Date.now();
    const bufferTime = 5 * 60 * 1000;     // 5 min buffer

    const isValid = expiryTime - currentTime > bufferTime;

    //console.log(`🔍 Token for ${storageFilePath}: ${isValid ? 'still valid ✅' : 'expired ❌'}`);

    return isValid;

  } catch (e) {
    console.log(`⚠️ Could not parse token for ${storageFilePath}, will re-login`);
    return false;
  }
}

async function globalSetup() {
  if (!fs.existsSync('storage')) fs.mkdirSync('storage');
    const siteFolder = `storage/${siteConfig.name}`;
    if (!fs.existsSync(siteFolder)) fs.mkdirSync(siteFolder);

    for (let i = 0; i < siteConfig.workers; i++) {
      const storageFilePath = `${siteFolder}/user-${i}.json`;

      // ✅ Skip login if token is still valid
      if (await isTokenValid(storageFilePath, siteConfig)) {
        //console.log(`⏭️ Skipping login for worker ${i} — token still valid`);
        continue;
      }

      // Step 1 — API login
      const apiContext = await request.newContext();
      const response = await apiContext.post(
        `${siteConfig.apiBaseURL}/${siteConfig.loginEndpoint}`,
        {
          data: {
            userEmail: siteConfig.users[i].username,
            userPassword: siteConfig.users[i].password,
          }
        }
      );

      const body = await response.json();
      const token = body.token;
      const userId = body.userId;  // ← check exact key from API response

      if (!token) {
        throw new Error(`❌ Login failed for worker ${i} — ${siteConfig.users[i].username}`);
      }

      // Step 2 — Open browser, inject token into localStorage
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(siteConfig.baseURL);

      await page.evaluate(({ t, uid }) => {
        localStorage.setItem('token', t);
        localStorage.setItem('userId', uid);  // ← save userId too
      }, { t: token, uid: userId });

      // Step 3 — Save storage state
      await context.storageState({ path: storageFilePath });
      await browser.close();
      await apiContext.dispose();

      console.log(`✅ [${siteConfig.name}] Token, userId stored for worker ${i} — ${siteConfig.users[i].username}`);
    }
  }
export default globalSetup;