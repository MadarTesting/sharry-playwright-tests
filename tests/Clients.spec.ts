import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/loginpage';
import { CustomerPage } from './pages/newcustomer';
import { randomSaudiMobile, randomEmail } from './utils/random';
import testdata from './testdata/testdata.json';

test.describe('customer tests', () => {
    let customerPage: CustomerPage;

    test.beforeEach(async ({ page }) => {
        // 1) لينك اللوجن وتسجيل الدخول
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(testdata.email, testdata.password);
        await expect(page).toHaveURL(/dashboard/);

        // 2) العملاء ثم إضافة عميل
        customerPage = new CustomerPage(page);
        await customerPage.openCreateForm();
    });

    test('create customer - male', async ({ page }) => {
        await customerPage.createMaleCustomer({
            firstName: 'Test',
            lastName: `User${Date.now().toString().slice(-4)}`,
            email: randomEmail(),
            phone: randomSaudiMobile(),
            dob: '1995-05-20',
        });
        await customerPage.expectCustomerSaved();
        await page.pause();
    });
});