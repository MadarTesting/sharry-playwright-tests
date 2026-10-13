import { expect, type Locator, type Page } from '@playwright/test';

export class RegisterPage {
  //============= variables =============
  readonly page: Page;
  readonly url = 'https://dev.gosharry.com/register';

  //============= locators ==============
  readonly nameInput: Locator;
  readonly companyInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;

  //============= constructor ===========
  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator("//input[@id='register-name']");
    this.companyInput = page.locator("//input[@id='register-company']");
    this.phoneInput = page.locator("//input[@id='register-phone']");
    this.emailInput = page.locator("//input[@id='register-email']");
    this.passwordInput = page.locator("//input[@id='register-password']");
    this.confirmPasswordInput = page.locator("//input[@id='register-password-confirm']");
    this.submitButton = page.locator("//button[@type='submit']");
  }

  //============= methods ===============
  async goto() {
    await this.page.goto(this.url);
  }

  //============= actions ===============
  async register(
    name: string,
    company: string,
    phone: string,
    email: string,
    password: string,
    confirmPassword: string
  ) {
    await this.nameInput.fill(name);
    await this.companyInput.fill(company);
    await this.phoneInput.fill(phone);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.submitButton.click();
  }

  //============= assertions ============
  async expectRegisterSuccess() {
    
    await expect(this.page).not.toHaveURL(this.url);
  }
}