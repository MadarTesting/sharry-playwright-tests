import { test } from '@playwright/test';
import { LoginPage } from './pages/loginpage';
import testdata from './testdata/testdata.json';
const parsed_data = testdata;

test.describe('documentation tests', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('valid login', async ({ page }) => {
        await loginPage.login(parsed_data.email, parsed_data.password);
        //await loginPage.expectLoginSuccess();
        await page.waitForTimeout(2000);
        await page.locator("a[contains(text(),'توثيق')").click();
    });
}); 