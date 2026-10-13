import { expect, type Locator, type Page } from '@playwright/test';

export interface CustomerData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
}

export class CustomerPage {
    //============= variables =============
    readonly page: Page;

    //============= locators ==============
    // التنقل
    readonly customersMenu: Locator;
    readonly addCustomerButton: Locator;

    // الفورم
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly emailInput: Locator;
    readonly phoneInput: Locator;
    readonly dobInput: Locator;
    readonly genderSelect: Locator;
    readonly channelSelect: Locator;
    readonly customerGroupSelect: Locator;
    readonly saveButton: Locator;
    readonly modalTitle: Locator;
    readonly openCalendar: Locator;

    //============= constructor ===========
    constructor(page: Page) {
        this.page = page;

        // القايمة الجانبية ثم زرار إضافة عميل (عربي / إنجليزي)
        this.customersMenu = page.getByRole('link', { name: /^(العملاء|Customers)$/i }).first();
        this.addCustomerButton = page
            .getByText(/^(إضافة عميل|اضافة عميل|إضافة عميل جديد|إنشاء عميل|Add Customer|Create Customer)$/i)
            .first();

        this.firstNameInput = page.locator("//input[@id='first_name']");
        this.lastNameInput = page.locator("//input[@id='last_name']");
        this.emailInput = page.locator("//input[@id='email']");
        this.phoneInput = page.locator("//input[@placeholder='رقم الاتصال']");
        this.dobInput = page.locator("//input[@id='dob']");
        this.genderSelect = page.locator("//select[@id='gender']");
        this.channelSelect = page.locator("//select[@id='channel']");
        this.customerGroupSelect = page.locator("//select[@id='customerGroup']");
        this.saveButton = page.locator(
            "//button[contains(.,'حفظ العميل') or contains(.,'Save Customer')]"
        );
        this.modalTitle = page.getByText(/^(إنشاء عميل جديد|Create New Customer|New Customer)$/i).first();
        this.openCalendar = page.locator('.flatpickr-calendar.open');
    }

    //============= methods ===============
    // من الداشبورد: العملاء ثم إضافة عميل ثم استنى الفورم
    async openCreateForm() {
        await expect(this.customersMenu).toBeVisible();
        await this.customersMenu.click();

        await expect(this.addCustomerButton).toBeVisible();
        await this.addCustomerButton.click();

        await expect(this.firstNameInput).toBeVisible();
    }

    // بتختار الخيار المطلوب، ولو عدد الخيارات أقل بتختار آخر خيار موجود (من غير timeout)
    private async selectByIndex(select: Locator, index: number) {
        await expect(select).toBeVisible();
        const count = await select.locator('option').count();
        if (count === 0) return;
        await select.selectOption({ index: Math.min(index, count - 1) });
    }

    //============= actions ===============
    async fillPersonalInfo(data: CustomerData) {
        await this.firstNameInput.fill(data.firstName);
        await this.lastNameInput.fill(data.lastName);
        await this.emailInput.fill(data.email);
        await this.phoneInput.fill(data.phone);
        await this.dobInput.fill(data.dob);
        await this.closeCalendar();
    }

    // التقويم (flatpickr) بيفضل مفتوح ويغطي زرار الحفظ، فلازم نقفله قبل ما نكمل
    async closeCalendar() {
        await this.dobInput.press('Tab'); // الخروج من الحقل بيقفل التقويم ويثبّت التاريخ
        if (await this.openCalendar.isVisible()) {
            await this.modalTitle.click(); // لو لسه مفتوح اضغط على عنوان النافذة
        }
        await expect(this.openCalendar).toBeHidden();
    }

    // ذكر = أول خيار حقيقي (index 1)
    async selectMaleGender() {
        await this.selectByIndex(this.genderSelect, 1);
    }

    async selectChannel() {
        await this.selectByIndex(this.channelSelect, 1);
    }

    async selectCustomerGroup() {
        await this.selectByIndex(this.customerGroupSelect, 1);
    }

    async save() {
        await expect(this.saveButton).toBeEnabled();
        await this.saveButton.click();
    }

    async createMaleCustomer(data: CustomerData) {
        await this.fillPersonalInfo(data);
        await this.selectMaleGender();
        await this.selectChannel();
        await this.selectCustomerGroup();
        await this.save();
    }

    //============= assertions ============
    async expectCustomerSaved() {
        // مؤقت: بيتأكد إن الفورم اختفت بعد الحفظ.
        // بدّله برسالة النجاح لما تحدد الـ locator بتاعها.
        await expect(this.firstNameInput).toBeHidden();
    }
}