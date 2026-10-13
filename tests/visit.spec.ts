import { test, expect } from '@playwright/test';

test('visit sharry website', async ({ page }) => {
  await page.goto('https://dev.gosharry.com/auth');
  await expect(page).toHaveTitle('مرحباً — sharry');
  await page.pause();
});
