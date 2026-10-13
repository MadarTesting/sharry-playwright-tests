import { test } from '@playwright/test';
import { LoginPage } from './pages/loginpage';
import testdata from './testdata/testdata.json';
const parsed_data = testdata;

test.describe('login tests', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('valid login', async ({ page }) => {
        await loginPage.login(parsed_data.email, parsed_data.password);
        //await loginPage.expectLoginSuccess();
        await page.getByText('المبيعات', { exact: true }).isVisible();
    });

    test('invalid login - wrong password', async () => {
        await loginPage.login(parsed_data.email, 'wrong-password');

    });

    //test('empty fields', async () => {
    // await loginPage.login(' ', ' ');
    // await loginPage.submitButton.click();

    //});
});