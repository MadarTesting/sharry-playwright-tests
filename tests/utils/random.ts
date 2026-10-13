// رقم موبايل سعودي محلي: 05XXXXXXXX (10 أرقام)
export function randomSaudiMobile(): string {
    const prefixes = ['50', '53', '54', '55', '56', '57', '58', '59'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const rest = Math.floor(Math.random() * 10_000_000).toString().padStart(7, '0');
    return `0${prefix}${rest}`;
}

// نفس الرقم بالصيغة الدولية: 9665XXXXXXXX (من غير + ومن غير صفر)
export function toIntlSaudi(local: string): string {
    return `966${local.slice(1)}`;
}

// إيميل فريد في كل تشغيلة
export function randomEmail(prefix = 'customer'): string {
    return `${prefix}${Date.now()}@example.com`;
}