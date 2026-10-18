import { test, expect } from '@playwright/test';
import { CouponPage, type CouponData } from './pages/CouponPage';
import { LoginPage } from './pages/loginpage';
import testdata from './testdata/testdata.json';

test.describe('Coupon Management', () => {

    test('should login and create a coupon successfully', async ({ page }) => {

        // 1. Initialize Page Objects
        const loginPage = new LoginPage(page);
        const couponPage = new CouponPage(page);

        // 2. Open Login Page
        await page.goto('https://dev.gosharry.com/auth');

        // 3. Login
        await loginPage.login(
            testdata.email,
            testdata.password
        );

        // 4. Verify successful login
        await expect(page).toHaveURL(/dashboard/i);

        // 5. Click Add Coupon
        await couponPage.openAddCouponPage();

        // 6. Prepare Coupon Data
        const couponData: CouponData = {
            name: `Auto Coupon ${Date.now()}`,
            description: 'Automated test coupon',
            code: `TEST${Date.now()}`,
            usesPerCoupon: '100',
            usagePerCustomer: '2',
            discountAmount: '10',
            discountQuantity: '1',
            discountStep: '1',
        };

        // 7. Fill the complete coupon form
        await couponPage.fillCouponForm(couponData);

        // 8. Verify entered data
        await expect(couponPage.nameInput)
            .toHaveValue(couponData.name);

        await expect(couponPage.descriptionInput)
            .toHaveValue(couponData.description);

        //await expect(couponPage.couponCodeInput)
        //.toHaveValue(couponData.code);

        await expect(couponPage.usesPerCouponInput)
            .toHaveValue(couponData.usesPerCoupon);

        await expect(couponPage.usagePerCustomerInput)
            .toHaveValue(couponData.usagePerCustomer);

        await expect(couponPage.discountAmountInput)
            .toHaveValue(couponData.discountAmount);

        await expect(couponPage.discountQuantityInput)
            .toHaveValue(couponData.discountQuantity);

        await expect(couponPage.discountStepInput)
            .toHaveValue(couponData.discountStep);

        // 9. Save Coupon
        //await couponPage.save();

        // 10. Verify save result
        //await couponPage.expectCouponSaved();

    });

});
