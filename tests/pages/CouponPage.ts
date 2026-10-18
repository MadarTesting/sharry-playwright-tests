
import { expect, type Locator, type Page } from '@playwright/test';

export interface CouponData {
    name: string;
    description: string;
    code: string;
    usesPerCoupon: string;
    usagePerCustomer: string;
    discountAmount: string;
    discountQuantity: string;
    discountStep: string;
}

export class CouponPage {
    readonly page: Page;

    // Text fields
    readonly nameInput: Locator;
    readonly descriptionInput: Locator;
    readonly couponCodeInput: Locator;
    readonly usesPerCouponInput: Locator;
    readonly usagePerCustomerInput: Locator;
    readonly discountAmountInput: Locator;
    readonly discountQuantityInput: Locator;
    readonly discountStepInput: Locator;

    // Dropdowns
    readonly couponTypeSelect: Locator;
    readonly autoGenerationSelect: Locator;
    readonly actionTypeSelect: Locator;

    // Labels
    readonly defaultChannelLabel: Locator;
    readonly guestLabel: Locator;

    // Buttons
    readonly saveButton: Locator;
    readonly addCouponButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Form fields
        this.nameInput = page.locator("//input[@id='name']");
        this.descriptionInput = page.locator("//textarea[@id='description']");
        this.couponCodeInput = page.locator("//input[@id='coupon_code']");

        this.usesPerCouponInput = page.locator(
            "//input[@id='uses_per_coupon']"
        );

        this.usagePerCustomerInput = page.locator(
            "//input[@id='usage_per_customer']"
        );

        this.discountAmountInput = page.locator(
            "//input[@id='discount_amount']"
        );

        this.discountQuantityInput = page.locator(
            "//input[@id='discount_quantity']"
        );

        this.discountStepInput = page.locator(
            "//input[@id='discount_step']"
        );

        // Dropdowns
        this.couponTypeSelect = page.locator(
            "//select[@id='coupon_type']"
        );

        this.autoGenerationSelect = page.locator(
            "//select[@id='use_auto_generation']"
        );

        this.actionTypeSelect = page.locator(
            "//select[@id='action_type']"
        );

        // Labels
        this.defaultChannelLabel = page.locator(
            "//label[normalize-space()='Default Channel']"
        );

        this.guestLabel = page.locator(
            "//label[normalize-space()='Guest']"
        );

        // Add coupon link
        this.addCouponButton = page.locator(
            "//a[contains(normalize-space(.),'اضافه كوبون')]"
        );

        // Save button
        this.saveButton = page.getByRole('button', {
            name: /^(حفظ.*|Save.*)$/i,
        }).first();
    }

    // Fill input fields
    private async fillField(input: Locator, value: string) {
        await expect(input).toBeVisible();
        await input.fill(value);
    }

    // Select dropdown option
    private async selectFirstOption(select: Locator) {
        await expect(select).toBeVisible();

        const options = select.locator('option');
        const count = await options.count();

        if (count < 2) {
            throw new Error(
                'Dropdown does not have an available option to select.'
            );
        }

        await select.selectOption({ index: 1 });
    }

    // Open Add Coupon page
    async openAddCouponPage() {
        await expect(this.addCouponButton).toBeVisible();
        await this.addCouponButton.click();

        await expect(this.nameInput).toBeVisible();
    }

    // General information
    async fillGeneralInfo(name: string, description: string) {
        await this.fillField(this.nameInput, name);
        await this.fillField(this.descriptionInput, description);
    }

    // Coupon settings
    async selectCouponType() {
        await this.selectFirstOption(this.couponTypeSelect);
    }

    async selectAutoGeneration() {
        await this.selectFirstOption(this.autoGenerationSelect);
    }

    async selectActionType() {
        await this.selectFirstOption(this.actionTypeSelect);
    }

    // Coupon code
    async fillCouponCode(code: string) {
        await this.fillField(this.couponCodeInput, code);
    }

    // Usage limits
    async fillUsageLimits(
        usesPerCoupon: string,
        usagePerCustomer: string
    ) {
        await this.fillField(
            this.usesPerCouponInput,
            usesPerCoupon
        );

        await this.fillField(
            this.usagePerCustomerInput,
            usagePerCustomer
        );
    }

    // Discount information
    async fillDiscount(
        amount: string,
        quantity: string,
        step: string
    ) {
        await this.fillField(
            this.discountAmountInput,
            amount
        );

        await this.fillField(
            this.discountQuantityInput,
            quantity
        );

        await this.fillField(
            this.discountStepInput,
            step
        );
    }

    // Checkbox options
    async chooseDefaultChannel() {
        await expect(this.defaultChannelLabel).toBeVisible();
        await this.defaultChannelLabel.click();
    }

    async chooseGuestGroup() {
        await expect(this.guestLabel).toBeVisible();
        await this.guestLabel.click();
    }

    // Fill the complete coupon form
    async fillCouponForm(data: CouponData) {
        await this.fillGeneralInfo(
            data.name,
            data.description
        );

        await this.selectCouponType();
        await this.selectAutoGeneration();

        await this.fillCouponCode(data.code);

        await this.fillUsageLimits(
            data.usesPerCoupon,
            data.usagePerCustomer
        );

        await this.selectActionType();

        await this.fillDiscount(
            data.discountAmount,
            data.discountQuantity,
            data.discountStep
        );

        await this.chooseDefaultChannel();
        await this.chooseGuestGroup();
    }

    // Save coupon
    async save() {
        await expect(this.saveButton).toBeVisible();
        await expect(this.saveButton).toBeEnabled();

        await this.saveButton.click();
    }

    // Create coupon
    async createCoupon(data: CouponData) {
        await this.fillCouponForm(data);
        await this.save();
    }

    // Verify coupon saved
    async expectCouponSaved() {
        await expect(this.nameInput).toBeHidden();
    }
}
