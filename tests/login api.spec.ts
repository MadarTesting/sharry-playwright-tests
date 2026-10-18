// بنستورد الأدوات اللي هنحتاجها من بلاي رايت: التيست، وتأكيد النتايج، والصفحة
import { test, expect, Page } from '@playwright/test';
// بنسحب بيانات الدخول (الإيميل والباسورد) من ملف جيسون بره عشان منكتبهاش ع المكشوف هنا
import testdata from './testdata/testdata.json';

// ده عنوان الموقع الرئيسي اللي هنهجم عليه ونجرب عليه التيستات
const baseURL = 'https://shady.dev.gosharry.com';

// ===== دوال مساعدة =====

// دالة مخصوصة تفتح الصفحة وتلطش مفتاح الـ CSRF عشان السيرفر يرضى يستقبل مننا
async function getCsrfToken(page: Page): Promise<string> {
    // بنقول للمتصفح: روح يا سيدي افتحلي صفحة تسجيل الدخول
    await page.goto(`${baseURL}/auth`);
    // بنمسك الميتا تاج اللي السيرفر راميلنا فيه توكن الحماية، وناخد قيمته
    const token = await page
        .locator('meta[name="csrf-token"]')
        .getAttribute('content');
    // بنتأكد ونحلف إن التوكن طلع مش فاضي وموجود فعلاً
    expect(token).toBeTruthy();
    // بنرجع التوكن عشان اللي نده ع الدالة يستنفع بيه
    return token!;
}

// دالة بتبعت طلب تسجيل الدخول بالبيانات وتجيبلك كل تفاصيل الرد من طقطق لسلامو عليكم
async function sendLogin(page: Page, email: string, password: string) {
    // بننده ع الدالة اللي فوق عشان تجيبلنا توكن الـ CSRF الأول قبل ما نتحرك
    const csrfToken = await getCsrfToken(page);
    // بنسجل اللحظة اللي بدأنا فيها عشان نحسب السيرفر هياخد وقت أد إيه في الرد
    const startTime = Date.now();

    // بنبعت طلب POST رسمي للسيرفر على إند بوينت الدخول بالهيدرز والبيانات
    const response = await page.request.post(`${baseURL}/auth/login`, {
        // بنظبط ترويسة الطلب (الهيدرز) عشان نفهم السيرفر إحنا عايزين نكلمه إزاي
        headers: {
            // بنقوله بنقبل الرد يرجع بصيغة جيسون أو كلام عادي
            Accept: 'application/json, text/plain, */*',
            // بنعرفه إن البيانات اللي إحنا باعتينها نوعها جيسون
            'Content-Type': 'application/json',
            // بنديله التوكن اللي لطشناه عشان يعرف إننا جايين من الصفحة مش هاكرز
            'X-CSRF-TOKEN': csrfToken,
            // بنقوله الطلب ده جاي عن طريق أجاكس من تحت لتحت
            'X-Requested-With': 'XMLHttpRequest',
        },
        // البيانات الفعلية: الإيميل والباسورد ومعاهم التوكن في البودي زيادة تأكيد
        data: { email, password, _token: csrfToken },
    });

    // بنطرح الوقت الحالي من وقت البداية عشان نعرف السيرفر خد كام ملي ثانية
    const responseTime = Date.now() - startTime;
    // بناخد كود الحالة (الستاتس كود) زي 200 لو تمام أو 401 لو طردنا
    const status = response.status();
    // بنقرا الرد اللي رجع كله كنص خام زي ما جه من بطن السيرفر
    const rawBody = await response.text();

    // بنجهز متغير نشيل فيه الرد لما نفككه كـ JSON
    let body: any = null;
    // بنجرب نحول النص لـ JSON، لو نفع كان بها.. لو منفعش منقعش
    try {
        // بنحول النص الخام لكائن جيسون نقدر نتعامل معاه
        body = JSON.parse(rawBody);
    } catch {
        // لو السيرفر رامي صفحة HTML أو كلام مش جيسون، بنسيبها فاضية من غير ما نضرب إيرور
        body = null;
    }

    // بنرجع شروة الحاجات دي كلها في باكيدج واحدة للي بينادي
    return { response, status, responseTime, rawBody, body };
}

// دالة شياكة بتطبع تقرير مفصل في الكونسول شبه شاشة البوستمان بالظبط
function printReport(
    // عنوان التيست عشان نميزه في الطباعة
    title: string,
    // النتيجة اللي جت من السيرفر (كود و وقت وبودي)
    result: { status: number; responseTime: number; rawBody: string; body: any },
    // قائمة التأكيدات وكل واحدة نجحت ولا فشلت
    checks: { name: string; pass: boolean }[]
) {
    // لو الرد جيسون بنفرده ونجمله بسطور ومسافات، ولو نص عادي بنقصقص أول 500 حرف عشان الزحمة
    const bodyText = result.body
        ? JSON.stringify(result.body, null, 2)
        : result.rawBody.substring(0, 500);

    // بنطبع في الكونسول بلوك محترم ومنسق بكل تفاصيل الريكويست والريسبونس
    console.log(
        [
            '',
            '========================================',
            // بنطبع عنوان التيست هنا ف النص
            `  ${title}`,
            '========================================',
            '',
            'REQUEST',
            // نوع الطلب بوست
            'Method       : POST',
            // مسار الرابط اللي بعتنا عليه
            'Endpoint     : /auth/login',
            // نوع المحتوى اللي اتبعث
            'Content-Type : application/json',
            '',
            'RESPONSE',
            // كود الحالة اللي السيرفر رد بيه
            `Status Code  : ${result.status}`,
            // الوقت اللي خده الطلب بالملي ثانية
            `Response Time: ${result.responseTime} ms`,
            'Response Body:',
            // البودي بعد ما ظبطنا شكله فوق
            bodyText,
            '',
            'TEST RESULT',
            // بنلف على كل تشيك ونكتب جنبه PASS لو عدا أو FAIL لو لبس في الحيط
            ...checks.map(c => `${c.pass ? 'PASS' : 'FAIL'} - ${c.name}`),
            '========================================',
            '',
        ].join('\n')
    );
}

// ===== الاختبارات =====
// هنا بنبدأ نجمع اختبارات تسجيل الدخول كلها تحت شمسية واحدة
test.describe('Login API Tests', () => {

    // ---------- Positive ----------
    // أول تجربة: بنجرب ندخل ببيانات سليمة وصحيحة مية مية
    test('POST - Login API (valid credentials)', async ({ page }) => {
        // بنبعت طلب تسجيل الدخول بالإيميل والباسورد الأصليين بتوعنا
        const result = await sendLogin(page, testdata.email, testdata.password);
        // بنفرط النتيجة وناخد الريسبونس وكود الحالة ومحتوى الرد
        const { response, status, body } = result;

        // بنجهز لستة الشروط اللي هنراجع عليها ونتأكد منها
        const checks = [
            // نتأكد إن السيرفر بلع الطلب ومقالش لأ (يعني كود 200 وعيلته)
            { name: 'HTTP response is successful', pass: response.ok() },
            // نتأكد إن في البودي كاتب لنا النجاح = ترو صراحة
            { name: 'Login success is true', pass: body?.success === true },
            // نتأكد إنه باعتلنا رابط التحويل المظبوط اللي هيدخلنا ع الحساب
            {
                name: 'Redirect URL is correct',
                pass: body?.redirect_url === `${baseURL}/auth/auto-login`,
            },
        ];
        // بنطبع التقرير المظبوط في الكونسول عشان نشوف النتيجة بعنينا
        printReport('LOGIN API TEST - VALID', result, checks);

        // تأكيد رسمي من بلاي رايت إن الرد نجح، ولو فشل يزعق ويقولنا الستاتس كود كام
        expect(response.ok(), `Expected successful response, received ${status}`).toBeTruthy();
        // تأكيد رسمي إن مفتاح النجاح قيمته ترو
        expect(body?.success, 'Login API should return success: true').toBe(true);
        // تأكيد رسمي إن رابط التحويل طالع لصفحة الأوتو لوجين المظبوطة
        expect(body?.redirect_url).toBe(`${baseURL}/auth/auto-login`);
    });

    // ---------- Negative 1: باسورد غلط ----------
    // تاني تجربة: بنجرب نحط باسورد مضروب ونشوف هيعمل إيه
    test('POST - Login API (wrong password)', async ({ page }) => {
        // بنبعت الإيميل الصح بس معاه باسورد متألف من دماغنا
        const result = await sendLogin(page, testdata.email, 'WrongPassword@123');
        // بنفرط النتيجة عشان نشيك عليها
        const { response, status, body } = result;

        // بنجهز التشيكات بتاعة حالة الفشل
        const checks = [
            // المفروض الطلب يفشل وميكونش ok خالص
            { name: 'HTTP response is NOT successful', pass: !response.ok() },
            // المفروض النجاح ميبقاش ترو
            { name: 'Login success is not true', pass: body?.success !== true },
            // المفروض ميبعتلناش رابط تحويل يدخلنا الموقع
            { name: 'No redirect URL returned', pass: !body?.redirect_url },
        ];
        // نطبع التقرير في الكونسول عشان نتفرج ع الفشل المتوقع
        printReport('LOGIN API TEST - WRONG PASSWORD', result, checks);

        // بنتأكد رسمياً إن الرد مش ok وإنه رفض الدخول
        expect(response.ok(), `Login should fail, received ${status}`).toBeFalsy();
        // بنتأكد إن النجاح مش راجع بترو
        expect(body?.success).not.toBe(true);
        // بنتأكد إن مفيش رابط تحويل أصلاً رجع في الرد
        expect(body?.redirect_url).toBeUndefined();
    });

    // ---------- Negative 2: إيميل غير مسجل ----------
    // تالت تجربة: بنجرب ندخل بإيميل وهمي مش متسجل في السيستم أصلاً
    test('POST - Login API (unregistered email)', async ({ page }) => {
        // بنخترع إيميل عشوائي بالوقت الحالي عشان نضمن إنه مش موجود في الداتابيز
        const randomEmail = `notfound_${Date.now()}@gmail.com`;
        // بنبعت طلب الدخول بالإيميل العشوائي ده وباسورد وهمي
        const result = await sendLogin(page, randomEmail, 'SomePassword@123');
        // بنفرط النتيجة كالعادة
        const { response, status, body } = result;

        // لستة التأكيدات بتاعة الإيميل اللي مش موجود
        const checks = [
            // لازم السيرفر يرفض الطلب
            { name: 'HTTP response is NOT successful', pass: !response.ok() },
            // لازم النجاح ميبقاش ترو
            { name: 'Login success is not true', pass: body?.success !== true },
            // ومفيش أي رابط تحويل يرجع
            { name: 'No redirect URL returned', pass: !body?.redirect_url },
        ];
        // بنطبع تقرير التيست ده في الكونسول
        printReport('LOGIN API TEST - UNREGISTERED EMAIL', result, checks);

        // تأكيد رسمي إن الطلب باظ ومعداش
        expect(response.ok(), `Login should fail, received ${status}`).toBeFalsy();
        // تأكيد إن النجاح مش ترو
        expect(body?.success).not.toBe(true);
        // تأكيد إن رابط التحويل ملوش وجود
        expect(body?.redirect_url).toBeUndefined();
    });

});