import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
    //============= variables =============
    readonly page: Page;
    readonly url = 'https://dev.gosharry.com/auth';

    //============= locators ==============
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;

    //============= constructor ===========
    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.locator("//input[@id='gs-login-email']");
        this.passwordInput = page.locator("//input[@id='gs-login-password']");
        this.submitButton = page.locator("//button[@type='submit']");
    }

    //============= methods ===============
    async goto() {
        await this.page.goto(this.url);
    }

    //============= actions ===============
    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }

    //============= assertions ============
    async expectLoginSuccess() {
       
        await expect(this.page).not.toHaveURL(this.url);
    }
}