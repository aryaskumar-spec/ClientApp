import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://rahulshettyacademy.com/client/#/auth/login');
  await page.getByRole('textbox', { name: 'email@example.com' }).fill('aryas@test.com');
  await page.getByRole('textbox', { name: 'enter your passsword' }).fill('Aryas@123');
  await page.getByRole('button', { name: 'Login' }).click();
  const products = page.locator('div.card')
  await products.first().waitFor()
  const ourProduct = products.filter({has: page.getByText('ZARA COAT 3')}).first()
  await ourProduct.getByRole('button', { name: ' Add To Cart' }).click();
  await page.getByRole('button', { name: '   Cart' }).click();
  await page.getByRole('button', { name: 'Buy Now❯' }).click();
  await page.getByRole('textbox').nth(1).fill('424');
  await page.getByRole('textbox').nth(2).fill('Arya S Kumar');
  await page.getByRole('textbox', { name: 'Select Country' }).pressSequentially('Ind');
  await page.getByText('India', {exact: true}).click();
  await page.getByText('Place Order').click();
  await expect(page.getByRole('heading', { name: 'Thankyou for the order.' })).toBeVisible()
});