import { test, expect } from '@playwright/test';
import testdata from './testdata/testdata.json';

test.describe('Login API Tests', () => {

    test('POST - Login API', async ({ page }) => {

        const baseURL = 'https://shady.dev.gosharry.com';

        // فتح صفحة تسجيل الدخول لتجهيز الجلسة والكوكيز
        await page.goto(`${baseURL}/auth`);

        // قراءة CSRF Token
        const csrfToken = await page
            .locator('meta[name="csrf-token"]')
            .getAttribute('content');

        expect(csrfToken).toBeTruthy();

        // تسجيل وقت البداية
        const startTime = Date.now();

        // إرسال طلب تسجيل الدخول
        const response = await page.request.post(`${baseURL}/auth/login`, {
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

        const responseTime = Date.now() - startTime;
        const status = response.status();
        const responseBody = await response.text();

        // تحويل الاستجابة إلى JSON
        let body: { success?: boolean; redirect_url?: string; message?: string };

        try {
            body = JSON.parse(responseBody);
        } catch {
            console.log(
                [
                    '',
                    'Response is not valid JSON.',
                    `HTTP Status  : ${status}`,
                    `Response Time: ${responseTime} ms`,
                    '',
                ].join('\n')
            );
            throw new Error('Login API returned an invalid JSON response.');
        }

        // نتائج التحققات
        const checks = [
            { name: 'HTTP response is successful', pass: response.ok() },
            { name: 'Login success is true', pass: body.success === true },
            {
                name: 'Redirect URL is correct',
                pass: body.redirect_url === `${baseURL}/auth/auto-login`,
            },
        ];

        // تجميع التقرير كله في نص واحد وطباعته مرة واحدة فقط
        const report = [
            '',
            '========================================',
            '           LOGIN API TEST',
            '========================================',
            '',
            'REQUEST',
            'Method       : POST',
            'Endpoint     : /auth/login',
            'Content-Type : application/json',
            '',
            'RESPONSE',
            `Status Code  : ${status}`,
            `Response Time: ${responseTime} ms`,
            'Response Body:',
            JSON.stringify(
                {
                    success: body.success,
                    redirect_url: body.redirect_url,
                    message: body.message,
                },
                null,
                2
            ),
            '',
            'TEST RESULT',
            ...checks.map(c => `${c.pass ? 'PASS' : 'FAIL'} - ${c.name}`),
            '========================================',
            '',
        ].join('\n');

        console.log(report);

        // التحققات الفعلية
        expect(response.ok(), `Expected successful HTTP response, received ${status}`).toBeTruthy();
        expect(body.success, 'Login API should return success: true').toBe(true);
        expect(body.redirect_url).toBe(`${baseURL}/auth/auto-login`);
    });

});