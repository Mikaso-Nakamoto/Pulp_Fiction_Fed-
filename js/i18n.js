// js/i18n.js
import { localeConfig, defaultLocale } from './localeConfig.js';
import { translations } from './translations.js';

let currentLocale = defaultLocale;

export function getCurrentLocale() {
    return currentLocale;
}

export function setLocale(localeCode) {
    if (!localeConfig[localeCode]) {
        console.warn(`Локаль ${localeCode} не найдена, использую ${defaultLocale}`);
        localeCode = defaultLocale;
    }

    currentLocale = localeCode;
    localStorage.setItem('preferredLocale', localeCode);
    document.documentElement.lang = localeCode;

    applyTranslations();
    console.log(`✅ Локаль изменена на: ${localeCode} (${localeConfig[localeCode].name})`);
}

function applyTranslations() {
    const locale = localeConfig[currentLocale];
    const t = translations[currentLocale] || translations.ru;

    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.dataset.key;
        if (t[key]) {
            el.textContent = t[key];
        }
    });

    // Обновляем заголовок страницы
    document.title = t.siteTitle || "Pulp Fiction Fed";
}

// Инициализация
export function initI18n() {
    const saved = localStorage.getItem('preferredLocale');
    const initialLocale = saved && localeConfig[saved] ? saved : defaultLocale;
    
    setLocale(initialLocale);
}


