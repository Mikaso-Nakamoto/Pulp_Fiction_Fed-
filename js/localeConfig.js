// js/localeConfig.js
export const localeConfig = {
    ru: {
        code: "ru",
        name: "Русский",
        flag: "ru",
        currencyBase: "RUB",
        rateSource: "cbr",                    // ЦБ РФ
        newsSources: [
            { name: "РИА Новости", url: "https://ria.ru" },
            { name: "РБК", url: "https://rbc.ru" },
            { name: "Коммерсантъ", url: "https://kommersant.ru" }
        ]
    },

        en: {
        code: "en",
        name: "English",
        flag: "gb",
        currencyBase: "USD",
        rateSource: "mixed",                  // лучший рыночный курс
        newsSources: [
            { name: "Reuters", url: "https://reuters.com" },
            { name: "Bloomberg", url: "https://bloomberg.com" },
            { name: "Financial Times", url: "https://ft.com" }
        ]
    },

        de: {
        code: "de",
        name: "Deutsch",
        flag: "de",
        currencyBase: "EUR",
        rateSource: "ecb",
        newsSources: [
            { name: "Handelsblatt", url: "https://handelsblatt.com" },
            { name: "FAZ", url: "https://faz.net" }
        ]
    },

        kz: {
        code: "kz",
        name: "Қазақша",
        flag: "kz",
        currencyBase: "KZT",
        rateSource: "nbrk",                   // Нацбанк Казахстана
        newsSources: [
            { name: "ҚазАқпарат", url: "https://kazinform.kz" },
            { name: "Informburo", url: "https://informburo.kz" }
        ]
    },


    by: {
        code: "by",
        name: "Беларуская",
        flag: "by",
        currencyBase: "BYN",
        rateSource: "cbr",                    // пока ЦБ РФ (можно позже НБ РБ)
        newsSources: [
            { name: "БЕЛТА", url: "https://belta.by" },
            { name: "Банки.by", url: "https://banki.by" }
        ]
    },

    uc: {
        code: "uc",
        name: "Українська",
        flag: "ua",
        currencyBase: "UAH",
        rateSource: "mixed",
        newsSources: [
            { name: "РБК-Україна", url: "https://www.rbc.ua" },
            { name: "24 канал", url: "https://24tv.ua" }
        ]
    },

    zh: {
        code: "zh",
        name: "中文",
        flag: "cn",
        currencyBase: "CNY",
        rateSource: "mixed",
        newsSources: [
            { name: "Xinhua", url: "http://www.xinhuanet.com" },
            { name: "Caixin", url: "https://www.caixin.com" }
        ]
    },

    jp:{
        code: "jp",
        name: "日本語",
        flag: "jp",
        currencyBase: "JPY",
        rateSource: "mixed",
        newsSources: [
            { name: "NHK", url: "https://www.nhk.or.jp" },
            { name: "Yomiuri Shimbun", url: "https://www.yomiuri.co.jp" }
        ]
    },
    
    kr:{
        code: "kr",
        name: "한국어",
        flag: "kr",
        currencyBase: "KRW",
        rateSource: "mixed",
        newsSources: [
            { name: "Yonhap News Agency", url: "https://www.yonhapnews.co.kr" },
            { name: "Chosun Ilbo", url: "https://www.chosun.com" }
        ]
    },
    
    sr:{
        code: "sr",
        name: "Српски",
        flag: "rs",
        currencyBase: "RSD",
        rateSource: "mixed",
        newsSources: [
            { name: "RTS", url: "https://www.rts.rs" },
            { name: "Blic", url: "https://www.blic.rs" }
        ]
    },
    
    sk: {
        code: "sk",
        name: "Slovenčina",
        flag: "sk",
        currencyBase: "EUR",
        rateSource: "ecb",
        newsSources: [
            { name: " Denník N", url: "https://www.dennikn.sk" },
            { name: " SME", url: "https://www.sme.sk" }
        ]
    },

    sl: {
        code: "sl",
        name: "Slovenščina",
        flag: "si",
        currencyBase: "EUR",
        rateSource: "ecb",
        newsSources: [
            { name: "24ur", url: "https://www.24ur.com" },
            { name: "Slovenski glas", url: "https://www.slovenskiglas.si" }
        ]
    },
    
    pl: {
        code: "pl",
        name: "Polski",
        flag: "pl",
        currencyBase: "PLN",
        rateSource: "ecb",
        newsSources: [
            { name: "Gazeta.pl", url: "https://www.gazeta.pl" },
            { name: "Rzeczpospolita.pl", url: "https://www.rzeczpospolita.pl" }
        ]
    },
    
    fi: {
        code: "fi",
        name: "Suomi",
        flag: "fi",
        currencyBase: "EUR",
        rateSource: "ecb",
        newsSources: [
            { name: "Ilta-Sanomat", url: "https://www.iltasanomat.fi" },
            { name: "Helsingin Sanomat", url: "https://www.helsinginkirjasto.fi" }
        ]
    },
    
    fr: {
        code: "fr",
        name: "Français",
        flag: "fr",
        currencyBase: "EUR",
        rateSource: "ecb",
        newsSources: [
            { name: "Le Monde", url: "https://www.lemonde.fr" },
            { name: "France 24", url: "https://www.france24.com" }
        ]
    },

    hu:{
        code: "hu",
        name: "Magyar",
        flag: "hu",
        currencyBase: "HUF",
        rateSource: "ecb",
        newsSources: [
            { name: "Magyar Hírmondó", url: "https://www.mno.hu" },
            { name: "24.hu", url: "https://www.24.hu" }
        ]
    },

    am:{
        code: "am",
        name: "հայերեն",
        flag: "am",
        currencyBase: "AMD",
        rateSource: "mixed",
        newsSources: [
            { name: " Armenia News", url: "https://www.armeniannews.com" },
            { name: "Daily Armenia", url: "https://www.dailyarmenia.com" }
        ]
    }

};

export const defaultLocale = 'en';