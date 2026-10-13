import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/loginpage';
import testdata from './testdata/testdata.json';

test.describe('sales tests', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('create order from sales menu', async ({ page }) => {
        await loginPage.login(testdata.email, testdata.password);
        await expect(page).toHaveURL(/dashboard/);

        const salesLink = page.getByRole('link', { name: /^(المبيعات|Sales)$/ });
        await expect(salesLink).toBeVisible();
        await salesLink.click();

        const createOrder = page.getByText(/^(إنشاء طلب|Create Order)$/).first();
        await expect(createOrder).toBeVisible();
        await createOrder.click();


    });
});