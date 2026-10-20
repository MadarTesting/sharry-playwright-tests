import { test, expect } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'https://shady.dev.gosharry.com';

// ===== دوال توليد البيانات العشوائية =====
const randomString = (length = 6): string =>
    Math.random().toString(36).substring(2, 2 + length);

const randomDigits = (length: number): string =>
    Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

const pick = <T,>(items: T[]): T =>
    items[Math.floor(Math.random() * items.length)];

const capitalize = (s: string): string =>
    s.charAt(0).toUpperCase() + s.slice(1);

const firstNames = ['Ahmed', 'Omar', 'Khaled', 'Youssef', 'Sara', 'Nour', 'Mona', 'Ali', 'Hassan', 'Layla'];
const lastNames = ['Hassan', 'Ibrahim', 'Mahmoud', 'Saleh', 'Nasser', 'Farouk', 'Salem', 'Adel'];
const companyWords = ['Tech', 'Trade', 'Soft', 'Group', 'Systems', 'Store', 'Global', 'Logistics'];
const emailDomains = ['gmail.com', 'outlook.com', 'yahoo.com'];

const randomName = (): string => `${pick(firstNames)} ${pick(lastNames)}`;

// الإيميل فيه Date.now() علشان يكون فريد في كل تشغيل
const randomEmail = (): string =>
    `${randomString(6)}${Date.now()}@${pick(emailDomains)}`;

// رقم سعودي: 9 أرقام تبدأ بـ 5
const randomPhone = (): string => `5${randomDigits(8)}`;

const randomCompany = (): string =>
    `${capitalize(randomString(5))} ${pick(companyWords)}`;

// ===== الاختبارات =====
test.describe('Register API Tests', () => {

    test('POST - Register API (valid data)', async ({ page }) => {

        // الباسورد هو الوحيد الثابت، وباقي الداتا عشوائية
        const password = process.env.TEST_PASSWORD ?? 'Test@12345';

        const userData = {
            name: randomName(),
            email: randomEmail(),
            phone: randomPhone(),
            country_code: '+966',
            password,
            password_confirmation: password,
            company_name: randomCompany(),
        };

        // فتح صفحة التسجيل لتجهيز الجلسة والكوكيز
        await page.goto(`${baseURL}/register`);

        // قراءة CSRF Token
        const csrfToken = await page
            .locator('meta[name="csrf-token"]')
            .getAttribute('content');

        expect(csrfToken).toBeTruthy();

        // تسجيل وقت البداية
        const startTime = Date.now();

        // إرسال طلب التسجيل
        const response = await page.request.post(`${baseURL}/auth/register`, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken!,
                'X-Requested-With': 'XMLHttpRequest',
                Origin: baseURL,
                Referer: `${baseURL}/register`,
            },
            data: userData,
        });

        const responseTime = Date.now() - startTime;
        const status = response.status();
        const rawBody = await response.text();

        // لو الرد JSON نحوله، وإلا نحتفظ بالنص الخام
        let body: any = null;
        try {
            body = JSON.parse(rawBody);
        } catch {
            body = null;
        }

        const bodyText = body
            ? JSON.stringify(body, null, 2)
            : rawBody.substring(0, 500);

        // نتائج التحققات
        const checks = [
            { name: 'HTTP response is successful', pass: response.ok() },
            { name: 'Response is valid JSON', pass: body !== null },
            { name: 'Response time is under 5000 ms', pass: responseTime < 5000 },
        ];

        // تجميع التقرير كله وطباعته مرة واحدة (الباسورد مش بيتطبع)
        console.log(
            [
                '',
                '========================================',
                '          REGISTER API TEST',
                '========================================',
                '',
                'REQUEST',
                'Method       : POST',
                'Endpoint     : /auth/register',
                'Content-Type : application/json',
                `Name         : ${userData.name}`,
                `Email        : ${userData.email}`,
                `Phone        : ${userData.country_code} ${userData.phone}`,
                `Company      : ${userData.company_name}`,
                '',
                'RESPONSE',
                `Status Code  : ${status}`,
                `Response Time: ${responseTime} ms`,
                'Response Body:',
                bodyText,
                '',
                'TEST RESULT',
                ...checks.map(c => `${c.pass ? 'PASS' : 'FAIL'} - ${c.name}`),
                '========================================',
                '',
            ].join('\n')
        );

        // التحققات الفعلية
        expect(response.ok(), `Expected successful response, received ${status}`).toBeTruthy();
        expect(body, 'Response should be valid JSON').not.toBeNull();
        expect(responseTime).toBeLessThan(5000);
    });

});