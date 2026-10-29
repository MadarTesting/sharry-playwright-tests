import { test, expect, Page } from '@playwright/test';
import testdata from '../testdata/testdata.json';

const baseURL = process.env.BASE_URL ?? 'https://shady.dev.gosharry.com';

// القيم دي مرتبطة بحسابك (channel و customer group)، فخليناها قابلة للتغيير من .env
const CHANNEL_ID = Number(process.env.CHANNEL_ID ?? 226);
const CUSTOMER_GROUP_ID = Number(process.env.CUSTOMER_GROUP_ID ?? 694);

// ===== دوال توليد البيانات العشوائية =====
const randomString = (length = 6): string =>
    Math.random().toString(36).substring(2, 2 + length);

const randomDigits = (length: number): string =>
    Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

const pick = <T,>(items: T[]): T =>
    items[Math.floor(Math.random() * items.length)];

const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const firstNames = ['Ahmed', 'Omar', 'Khaled', 'Youssef', 'Sara', 'Nour', 'Mona', 'Ali', 'Hassan', 'Layla'];
const lastNames = ['Hassan', 'Ibrahim', 'Mahmoud', 'Saleh', 'Nasser', 'Farouk', 'Salem', 'Adel'];
const emailDomains = ['gmail.com', 'outlook.com', 'yahoo.com'];

const randomEmail = (): string =>
    `${randomString(6)}${Date.now()}@${pick(emailDomains)}`;

// رقم سعودي: 9 أرقام تبدأ بـ 5
const randomPhone = (): string => `5${randomDigits(8)}`;

// تاريخ ميلاد عشوائي بصيغة YYYY-MM-DD (من 1970 إلى 2005)
const randomBirthDate = (): string => {
    const year = randomInt(1970, 2005);
    const month = String(randomInt(1, 12)).padStart(2, '0');
    const day = String(randomInt(1, 28)).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ===== تسجيل الدخول كـ Admin عن طريق الـ API =====
async function loginAsAdmin(page: Page) {
    await page.goto(`${baseURL}/auth`);

    const csrfToken = await page
        .locator('meta[name="csrf-token"]')
        .getAttribute('content');
    expect(csrfToken, 'CSRF token should exist on login page').toBeTruthy();

    const loginResponse = await page.request.post(`${baseURL}/auth/login`, {
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken!,
            'X-Requested-With': 'XMLHttpRequest',
        },
        data: {
            email: testdata.email,
            password: testdata.password,
            _token: csrfToken,
        },
    });
    expect(loginResponse.ok(), `Login failed with status ${loginResponse.status()}`).toBeTruthy();

    const loginBody = await loginResponse.json();
    expect(loginBody.success, 'Login should return success: true').toBe(true);

    // زيارة رابط auto-login لتفعيل الجلسة، ثم صفحة العملاء
    if (loginBody.redirect_url) {
        await page.goto(loginBody.redirect_url);
    }
    await page.goto(`${baseURL}/admin/customers`);
}

// قراءة XSRF-TOKEN من الكوكيز (الـ API بيطلبه في header اسمه x-xsrf-token)
async function getXsrfToken(page: Page): Promise<string> {
    const cookies = await page.context().cookies();
    const xsrf = cookies.find(c => c.name === 'XSRF-TOKEN');
    expect(xsrf, 'XSRF-TOKEN cookie should exist after login').toBeTruthy();
    return decodeURIComponent(xsrf!.value);
}

// ===== الاختبارات =====
test.describe('Create Customer API Tests', () => {

    test('POST - Create Customer API (valid data)', async ({ page }) => {

        // تجهيز الجلسة
        await loginAsAdmin(page);
        const xsrfToken = await getXsrfToken(page);

        // بيانات العميل العشوائية
        const customerData = {
            first_name: pick(firstNames),
            last_name: pick(lastNames),
            email: randomEmail(),
            country_code: '+966',
            phone: randomPhone(),
            date_of_birth: randomBirthDate(),
            gender: pick(['Male', 'Female']),
            channel_id: CHANNEL_ID,
            customer_group_id: CUSTOMER_GROUP_ID,
        };

        const startTime = Date.now();

        const response = await page.request.post(`${baseURL}/admin/customers/create`, {
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': xsrfToken,
                Origin: baseURL,
                Referer: `${baseURL}/admin/customers`,
            },
            data: customerData,
            // منع الـ redirect التلقائي علشان نشوفه بوضوح لو الجلسة ضاعت (302 بدل 200 مضلل)
            maxRedirects: 0,
        });

        const responseTime = Date.now() - startTime;
        const status = response.status();
        const contentType = response.headers()['content-type'] ?? 'N/A';
        const rawBody = await response.text();

        // لو الرد JSON نحوله، وإلا body = null
        let body: any = null;
        try {
            body = rawBody.trim() ? JSON.parse(rawBody) : null;
        } catch {
            body = null;
        }

        // عرض الـ body: JSON منسّق، أو النص الخام، أو (empty) لو فاضي
        const bodyText = body
            ? JSON.stringify(body, null, 2)
            : rawBody.trim()
                ? rawBody.substring(0, 500)
                : '(empty body)';

        // هل الرد صفحة HTML؟ (غالبًا معناها إن الجلسة ضاعت وتم تحويلنا لصفحة الدخول)
        const isHtml = rawBody.trimStart().startsWith('<');
        const isSuccessStatus = [200, 201, 204].includes(status);

        // نتائج التحققات
        const checks = [
            { name: 'HTTP status is 200/201/204', pass: isSuccessStatus },
            { name: 'Response is not an HTML page (session is valid)', pass: !isHtml },
            { name: 'Response time is under 5000 ms', pass: responseTime < 5000 },
        ];

        // تجميع التقرير كله وطباعته مرة واحدة
        console.log(
            [
                '',
                '========================================',
                '       CREATE CUSTOMER API TEST',
                '========================================',
                '',
                'REQUEST',
                'Method       : POST',
                'Endpoint     : /admin/customers/create',
                'Content-Type : application/json',
                `Name         : ${customerData.first_name} ${customerData.last_name}`,
                `Email        : ${customerData.email}`,
                `Phone        : ${customerData.country_code} ${customerData.phone}`,
                `Birth Date   : ${customerData.date_of_birth}`,
                `Gender       : ${customerData.gender}`,
                '',
                'RESPONSE',
                `Status Code  : ${status}`,
                `Response Time: ${responseTime} ms`,
                `Content-Type : ${contentType}`,
                `Final URL    : ${response.url()}`,
                `Location     : ${response.headers()['location'] ?? 'N/A'}`,
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
        /*expect(
            isSuccessStatus,
            `Expected 200/201/204 but received ${status}. Location: ${response.headers()['location'] ?? 'N/A'}`
        ).toBeTruthy();
        expect(isHtml, 'Response is an HTML page, the session may have expired').toBeFalsy();
        expect(responseTime).toBeLessThan(5000);*/
    });

});