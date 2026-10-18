import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/loginpage';
import testdata from './testdata/testdata.json';

test.describe('order tests', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('create order', async ({ page }) => {
        await loginPage.login(testdata.email, testdata.password);
        await expect(page).toHaveURL(/dashboard/);
        //علشان  لو الموقع  عربي او انجليزي { name: /^(المبيعات|Sales)$/i }
        const salesLink = page.getByRole('link', { name: /^(المبيعات|Sales)$/i });
        await expect(salesLink).toBeVisible();
        await salesLink.click();

        const createOrder = page.getByText(/^(إنشاء طلب|Create Order)$/i).first();
        await expect(createOrder).toBeVisible();
        await createOrder.click();

        // اختيار العميل
        const searchInput = page.locator('//input[@placeholder="ابحث بالبريد أو الاسم"]');
        await expect(searchInput).toBeVisible();
        await searchInput.fill('test');

        // استنى أول نتيجة تظهر واضغط عليها
        const firstResult = page.getByText(/customer\d+@example\.com/).first();
        await expect(firstResult).toBeVisible();
        await firstResult.click();
        await page.pause();
        // تأكد إن قايمه  اختيار العميل اتقفل
        await expect(searchInput).toBeHidden();
        const addProductBtn = page.locator("//button[contains(text(),'إضافة منتج') or contains(text(),'Add Product')]");
        await expect(addProductBtn).toBeVisible();
        await addProductBtn.click();
        await page.getByRole('textbox', { name: /Search by name/i }).fill('Tabl')
        //await page.pause();

    });
});