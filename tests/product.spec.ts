import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/loginpage';
import testdata from './testdata/testdata.json';

test.describe('product tests', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('create product with random sku', async ({ page }) => {
        await loginPage.login(testdata.email, testdata.password);
        await expect(page).toHaveURL(/dashboard/);

        const productLink = page.getByRole('link', { name: /^(المنتجات|Products)$/i });
        await expect(productLink).toBeVisible();
        await productLink.click();

        const createProduct = page.getByText(/^(إنشاء منتج|Create Product)$/i).first();
        await expect(createProduct).toBeVisible();
        await createProduct.click();

        const sku = Date.now().toString();
        await page.locator("//select[@name='type']").selectOption({ index: 0 });
        await page.locator("//select[@name='attribute_family_id']").selectOption({ index: 0 });
        await page.locator("//input[@name='sku']").fill(sku);

        const saveButton = page.getByRole('button', { name: /^(حفظ المنتج|Save Product)$/i });
        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        // استنى صفحة تعديل المنتج (حقل الاسم) تظهر
        const nameInput = page.locator("//input[@id='name']");
        await expect(nameInput).toBeVisible();
        const names = ['Laptop', 'Phone', 'Tablet', 'Camera', 'Headphones'];
        const randomName = `${names[Math.floor(Math.random() * names.length)]} ${Date.now().toString().slice(-4)}`;
        await nameInput.fill(randomName);
        // الوصف جوه iframe بتاع محرر النصوص
        const descriptionBody = page.frameLocator('#description_ifr').locator('body');
        await descriptionBody.click();
        await descriptionBody.pressSequentially('description test in everywhere ');
        const png = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            'base64'
        );

        await page.locator("input[id$='_imageInput']").first().setInputFiles({
            name: 'product.png',
            mimeType: 'image/png',
            buffer: png,
        });
        await page.locator("input[id$='_videoInput']").first().setInputFiles({
            name: 'product.mp4',
            mimeType: 'video/mp4',
            buffer: Buffer.from('00000018667479706d703432000000006d70343269736f6d', 'hex'),
        });
        await page.locator("//select[@id='tax_category_id']").selectOption({ index: 1 });
        await page.locator("//input[@id='price']").fill('100');
        await page.locator("//input[@id='weight']").fill('100');
        await page.locator("//button[contains(text(),'حفظ المنتج')]").click();

        await page.pause();
    });
});