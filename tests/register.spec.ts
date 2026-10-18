// Import Playwright test functions
import { test } from '@playwright/test';
// Import the RegisterPage page object
import { RegisterPage } from './pages/registerpage';

// Define a test suite for registration
test.describe('register tests', () => {
    // Variable to hold the page object instance
    let registerPage: RegisterPage;

    // Before each test, create a new RegisterPage and navigate to the page
    test.beforeEach(async ({ page }) => {
        registerPage = new RegisterPage(page);
        await registerPage.goto();
    });

    // Test case for a valid registration flow
    test('valid register', async () => {
        // Generate a unique email for each test run
        const uniqueEmail = `test${Date.now()}@example.com`;
        // Generate a random company name
        const randomCompany = `company${Date.now()}`;
        // Generate a random user name
        const randomName = `Test User${Date.now()}`;
        // Generate a random Saudi mobile number (local format)
        const randomPhone = `05${Math.floor(10000000 + Math.random() * 90000000)}`;
        // Perform the registration using the page object
        await registerPage.register(
            randomName,
            randomCompany,
            randomPhone,
            uniqueEmail,
            'Password@123',
            'Password@123'
        );
        // Verify that registration succeeded
        // await registerPage.expectRegisterSuccess();
    });

});