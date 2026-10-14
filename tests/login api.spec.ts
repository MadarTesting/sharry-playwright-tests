
// 1. استيراد test لإنشاء الاختبارات و expect للتحقق من النتائج
import { test, expect } from '@playwright/test';

// 2. استيراد بيانات تسجيل الدخول من ملف JSON خارجي
import testdata from './testdata/testdata.json';

// 3. إنشاء مجموعة اختبارات خاصة بتسجيل الدخول عن طريق الـ API
test.describe('Login API Tests', () => {

    // 4. إنشاء اختبار للتأكد من نجاح تسجيل الدخول باستخدام POST Request
    test('POST - Login API', async ({ page }) => {

        // 5. تحديد الرابط الأساسي للموقع
        const baseURL = 'https://shady.dev.gosharry.com';

        // طباعة عنوان التقرير في الـ Terminal
        console.log('\n========================================');
        console.log('           LOGIN API TEST');
        console.log('========================================');

        // 6. فتح صفحة تسجيل الدخول لتجهيز الجلسة والكوكيز
        await page.goto(`${baseURL}/auth`);

        // 7. البحث عن CSRF Token داخل الصفحة وقراءة قيمته
        const csrfToken = await page
            .locator('meta[name="csrf-token"]')
            .getAttribute('content');

        // التأكد من إن الـ CSRF Token موجود ومش فارغ
        expect(csrfToken).toBeTruthy();

        // 8. تسجيل وقت بداية إرسال الطلب لحساب زمن الاستجابة
        const startTime = Date.now();

        // 9. إرسال طلب POST إلى API تسجيل الدخول
        const response = await page.request.post(
            `${baseURL}/auth/login`,
            {
                headers: {
                    // تحديد أنواع الاستجابات المقبولة
                    Accept: 'application/json, text/plain, */*',

                    // توضيح إن البيانات المرسلة بصيغة JSON
                    'Content-Type': 'application/json',

                    // إرسال CSRF Token للتحقق من الطلب
                    'X-CSRF-TOKEN': csrfToken!,

                    // توضيح إن الطلب صادر عن XMLHttpRequest
                    'X-Requested-With': 'XMLHttpRequest',
                },

                // إرسال بيانات تسجيل الدخول في الـ Request Body
                data: {
                    email: testdata.email,
                    password: testdata.password,
                    _token: csrfToken,
                },
            }
        );

        // 10. حساب زمن الاستجابة بالمللي ثانية
        const responseTime = Date.now() - startTime;

        // 11. استخراج HTTP Status Code من استجابة السيرفر
        const status = response.status();

        // 12. قراءة محتوى الاستجابة كنص مرة واحدة
        const responseBody = await response.text();

        // تعريف شكل البيانات المتوقع رجوعها من الـ API
        let body: {
            success?: boolean;
            redirect_url?: string;
            message?: string;
        };

        // محاولة تحويل نص الاستجابة إلى JSON
        try {
            body = JSON.parse(responseBody);
        } catch {
            // طباعة معلومات أساسية لو الاستجابة مش JSON صالح
            console.log('\nResponse is not valid JSON.');
            console.log('HTTP Status:', status);
            console.log('Response Time:', `${responseTime} ms`);

            // إيقاف الاختبار برسالة توضح سبب المشكلة
            throw new Error(
                'Login API returned an invalid JSON response.'
            );
        }

        // 13. طباعة تفاصيل الطلب في الـ Terminal
        console.log('\nREQUEST');
        console.log('Method       : POST');
        console.log('Endpoint     : /auth/login');
        console.log('Content-Type : application/json');

        // 14. طباعة تفاصيل الاستجابة
        console.log('\nRESPONSE');
        console.log('Status Code  :', status);
        console.log('Response Time:', `${responseTime} ms`);

        // طباعة البيانات غير الحساسة فقط من الـ Response Body
        console.log('Response Body:');
        console.log(
            JSON.stringify(
                {
                    success: body.success,
                    redirect_url: body.redirect_url,
                    message: body.message,
                },
                null,
                2
            )
        );

        // 15. التأكد من إن HTTP Status Code ناجح
        // response.ok() بترجع true لو الحالة من 200 إلى 299
        expect(
            response.ok(),
            `Expected successful HTTP response, received ${status}`
        ).toBeTruthy();

        // 16. التأكد من إن الـ API أكد نجاح تسجيل الدخول
        expect(
            body.success,
            'Login API should return success: true'
        ).toBe(true);

        // 17. التأكد من إن رابط التحويل هو الرابط المتوقع
        expect(body.redirect_url).toBe(
            `${baseURL}/auth/auto-login`
        );

        // 18. طباعة النتيجة النهائية بعد نجاح كل التحققات
        console.log('\nTEST RESULT');
        console.log('PASS - HTTP response is successful');
        console.log('PASS - Login success is true');
        console.log('PASS - Redirect URL is correct');

        // طباعة نهاية التقرير
        console.log('========================================\n');

    });

});