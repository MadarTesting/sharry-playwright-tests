// بنستورد test عشان نكتب التيست و expect عشان نتحقق من النتايج من مكتبة playwright
import { test, expect } from '@playwright/test';

// الرابط الأساسي للموقع، بنجيبه من المتغيرات البيئية ولو مش موجود بنستعمل رابط السيرفر ده
const baseURL = process.env.BASE_URL ?? 'https://shady.dev.gosharry.com';

// ===== دوال توليد البيانات العشوائية =====

// دالة بتطلع لنا نص عشوائي بحروف وأرقام بطول معين (افتراضياً 6 حروف)
const randomString = (length = 6): string =>
    // بنولد رقم عشوائي ونحوله لنظام 36 وناخد حتة منه
    Math.random().toString(36).substring(2, 2 + length);

// دالة بتولد شوية أرقام عشوائية بطول محدد
const randomDigits = (length: number): string =>
    // بنعمل مصفوفة بالطول المطلوب ونملى كل خانة برقم عشوائي من 0 لـ 9 ونلزقهم في بعض
    Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

// دالة تختار عنصر عشوائي من أي لستة نديها لها
const pick = <T,>(items: T[]): T =>
    // بنحسب رقم عشوائي ونضرب في طول اللستة عشان نطلع بعنصر عشوائي
    items[Math.floor(Math.random() * items.length)];

// دالة بتخلي أول حرف في الكلمة كابيتال وباقي الكلمة ينزل زي ما هو
const capitalize = (s: string): string =>
    // بناخد أول حرف ونكبره ونلزق فيه باقي الكلمة من تاني حرف
    s.charAt(0).toUpperCase() + s.slice(1);

// لستة بأسماء أولى عشوائية عشان نختار منها
const firstNames = ['Ahmed', 'Omar', 'Khaled', 'Youssef', 'Sara', 'Nour', 'Mona', 'Ali', 'Hassan', 'Layla'];

// لستة بأسماء العائلات عشان نركب اسم كامل
const lastNames = ['Hassan', 'Ibrahim', 'Mahmoud', 'Saleh', 'Nasser', 'Farouk', 'Salem', 'Adel'];

// كلمات شائعة بنستخدمها عشان نألف أسماء شركات تبان حقيقية
const companyWords = ['Tech', 'Trade', 'Soft', 'Group', 'Systems', 'Store', 'Global', 'Logistics'];

// دومينات الإيميلات اللي بنختار منها
const emailDomains = ['gmail.com', 'outlook.com', 'yahoo.com'];

// دالة بتركب اسم كامل عشوائي من الاسم الأول واسم العيلة
const randomName = (): string => `${pick(firstNames)} ${pick(lastNames)}`;

// دالة بتعمل إيميل عشوائي، وحاطين فيه التاريخ بالملي ثانية علشان نضمن إنه عمره ما يتكرر في السيرفر
const randomEmail = (): string =>
    // بنجمع نص عشوائي + وقت اللحظة دي بالملي ثانية + دومين الإيميل
    `${randomString(6)}${Date.now()}@${pick(emailDomains)}`;

// دالة بتعمل رقم موبايل سعودي عشوائي بيبدأ برقم 5 ووراه 8 أرقام عشوائية
const randomPhone = (): string => `5${randomDigits(8)}`;

// دالة بتولد اسم شركة عشوائي أول حرف كابيتال ومعاه كلمة من كلمات الشركات
const randomCompany = (): string =>
    // بنكبر أول حرف من نص عشوائي ونلزق فيه كلمة شركة عشوائية
    `${capitalize(randomString(5))} ${pick(companyWords)}`;

// ===== الاختبارات =====

// هنا بنفتح مجموعة الاختبارات الخاصة بالـ Register API
test.describe('Register API Tests', () => {

    // ده التيست الأساسي: بنبعت طلب تسجيل ببيانات مظبوطة وصحيحة
    test('POST - Register API (valid data)', async ({ page }) => {

        // الباسورد هو الوحيد الثابت، بناخده من البيئة أو بنحط القيمة الافتراضية دي
        const password = process.env.TEST_PASSWORD ?? 'Test@12345';

        // بنجهز كائن شايل كل بيانات المستخدم الجديد العشوائية
        const userData = {
            // اسم كامل عشوائي
            name: randomName(),
            // إيميل جديد وفريد من نوعه
            email: randomEmail(),
            // رقم تليفون سعودي عشوائي
            phone: randomPhone(),
            // كود الدولة للسعودية (+966)
            country_code: '+966',
            // الباسورد
            password,
            // تأكيد الباسورد (نفسه بالظبط عشان يطابقوا بعض)
            password_confirmation: password,
            // اسم الشركة عشوائي
            company_name: randomCompany(),
        };

        // بنفتح صفحة التسجيل في المتصفح علشان السيرفر يجهز الجلسة ويدينا الكوكيز والتوكن
        await page.goto(`${baseURL}/register`);

        // بنسحب الـ CSRF Token من الميتا تاج في الصفحة علشان الحماية
        const csrfToken = await page
            // بندور على التاج اللي فيه التوكن
            .locator('meta[name="csrf-token"]')
            // وبناخد القيمة اللي جواه
            .getAttribute('content');

        // بنتأكد إن التوكن موجود وفعلاً راجع بقيمة ومش فاضي
        expect(csrfToken).toBeTruthy();

        // بنسجل وقت البداية بالملي ثانية عشان نحسب الطلب هياخد وقت قد إيه
        const startTime = Date.now();

        // بنبعت طلب POST على السيرفر ببيانات التسجيل
        const response = await page.request.post(`${baseURL}/auth/register`, {
            // ترويسات الطلب (Headers) اللي السيرفر مستنيها
            headers: {
                // بنعرف السيرفر إننا عايزين الرد يرجع بصيغة JSON
                Accept: 'application/json',
                // بنعرف السيرفر إن البيانات اللي باعتينها نوعها JSON
                'Content-Type': 'application/json',
                // بنبعت توكن الحماية اللي طلعناه من الصفحة
                'X-CSRF-TOKEN': csrfToken!,
                // بنعرف السيرفر إن ده طلب Ajax جاي من الكود
                'X-Requested-With': 'XMLHttpRequest',
                // بنقول للسيرفر إحنا باعتين من نفس الدومين
                Origin: baseURL,
                // الصفحة اللي فتحنا منها وبعتنا منها الطلب
                Referer: `${baseURL}/register`,
            },
            // بنحط بيانات المستخدم اللي جمعناها في جسم الطلب (Body)
            data: userData,
        });

        // بنحسب وقت الاستجابة: الوقت الحالي ناقص وقت البداية
        const responseTime = Date.now() - startTime;
        // بنجيب كود حالة الرد من السيرفر (زي 200 أو 201)
        const status = response.status();
        // بنقرأ الرد اللي جالنا كنص خام
        const rawBody = await response.text();

        // متغير بنخزن فيه الرد بعد ما نحوله لـ JSON
        let body: any = null;
        // بنجرب نفك النص الخام
        try {
            // بنحول النص لـ JSON لو كان سليم
            body = JSON.parse(rawBody);
        } catch {
            // لو الرد مش JSON بنخليه null علشان الكود ميعملش إيرور
            body = null;
        }

        // بنجهز شكل النص للطباعة: لو JSON بنظمه ونديله مسافات، ولو نص عادي بناخد أول 500 حرف
        const bodyText = body
            // تحويل الكائن لنص JSON منسق وشيك
            ? JSON.stringify(body, null, 2)
            // قص أول 500 حرف لو نص عادي عشان الطباعة متكونش ضخمة
            : rawBody.substring(0, 500);

        // لستة بكل الفحوصات اللي عايزين نراجع عليها ونطبعها
        const checks = [
            // هل السيرفر رد بحالة نجاح؟ (كود بين 200 لـ 299)
            { name: 'HTTP response is successful', pass: response.ok() },
            // هل الرد عبارة عن JSON صالح ومفهوم؟
            { name: 'Response is valid JSON', pass: body !== null },
            // هل الرد وصل في وقت سريع أقل من 5 ثواني (5000 ملي ثانية)؟
            { name: 'Response time is under 5000 ms', pass: responseTime < 5000 },
        ];

        // بنطبع تقرير مفصل وكامل في الكونسول يوضح كل حاجة حصلت في التيست
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
                // طباعة الاسم العشوائي
                `Name         : ${userData.name}`,
                // طباعة الإيميل العشوائي
                `Email        : ${userData.email}`,
                // طباعة كود الدولة والموبايل
                `Phone        : ${userData.country_code} ${userData.phone}`,
                // طباعة اسم الشركة
                `Company      : ${userData.company_name}`,
                '',
                'RESPONSE',
                // كود حالة الرد اللي رجع من السيرفر
                `Status Code  : ${status}`,
                // الوقت اللي الطلب خده لحد ما رجع
                `Response Time: ${responseTime} ms`,
                'Response Body:',
                // نص الرد المنسق
                bodyText,
                '',
                'TEST RESULT',
                // بنطبع نتيجة كل فحص سواء PASS أو FAIL
                ...checks.map(c => `${c.pass ? 'PASS' : 'FAIL'} - ${c.name}`),
                '========================================',
                '',
            // بنربط كل السطور دي بسطر جديد علشان تطلع منسقة تحت بعضها
            ].join('\n')
        );

        // التحققات الرسمية لـ Playwright: بنتأكد إن الرد ناجح (لو فشل هيطلع رسالة فيها الكود)
        expect(response.ok(), `Expected successful response, received ${status}`).toBeTruthy();
        // بنتأكد إن الرد فعلًا JSON ومش null
        expect(body, 'Response should be valid JSON').not.toBeNull();
        // بنتأكد إن وقت الطلب ميزيدش عن 5 ثواني (5000 ملي ثانية)
        expect(responseTime).toBeLessThan(5000);
    });

});