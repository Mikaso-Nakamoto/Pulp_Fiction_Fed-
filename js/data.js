// js/data.js
export const currencyGroups = {
    major: [
        { code: "USD", flag: "us", name: "USD" },
        { code: "EUR", flag: "eu", name: "EUR" },
        { code: "GBP", flag: "gb", name: "GBP" },
        { code: "JPY", flag: "jp", name: "JPY" },
        { code: "CNY", flag: "cn", name: "CNY" },
        { code: "CHF", flag: "ch", name: "CHF" },
    ],

    other: [
        { code: "CAD", flag: "ca", name: "CAD" },
        { code: "AUD", flag: "au", name: "AUD" },
        { code: "NZD", flag: "nz", name: "NZD" },
        { code: "SEK", flag: "se", name: "SEK" },
        { code: "NOK", flag: "no", name: "NOK" },
        { code: "DKK", flag: "dk", name: "DKK" },
        { code: "PLN", flag: "pl", name: "PLN" },
        { code: "CZK", flag: "cz", name: "CZK" },
        { code: "HUF", flag: "hu", name: "HUF" }
    ],

    asia: [
        { code: "HKD", flag: "hk", name: "HKD" },
        { code: "SGD", flag: "sg", name: "SGD" },
        { code: "KRW", flag: "kr", name: "KRW" },
        { code: "INR", flag: "in", name: "INR" },
        { code: "TRY", flag: "tr", name: "TRY" },
        { code: "BRL", flag: "br", name: "BRL" },
        { code: "ZAR", flag: "za", name: "ZAR" },
        { code: "MXN", flag: "mx", name: "MXN" },
        { code: "THB", flag: "th", name: "THB" },
        { code: "MYR", flag: "my", name: "MYR" },
        { code: "IDR", flag: "id", name: "IDR" },
        { code: "PHP", flag: "ph", name: "PHP" }
    ],

    middleEast: [
        { code: "AED", flag: "ae", name: "AED" },
        { code: "SAR", flag: "sa", name: "SAR" },
        { code: "QAR", flag: "qa", name: "QAR" },
        { code: "KWD", flag: "kw", name: "KWD" },
        { code: "BHD", flag: "bh", name: "BHD" },
        { code: "OMR", flag: "om", name: "OMR" },
        { code: "JOD", flag: "jo", name: "JOD" },
        { code: "ILS", flag: "il", name: "ILS" },
        { code: "EGP", flag: "eg", name: "EGP" }
    ],

    cis: [
        { code: "RUB", flag: "ru", name: "RUB" }, 
        { code: "BYN", flag: "by", name: "BYN" },
        { code: "KZT", flag: "kz", name: "KZT" },
        { code: "UAH", flag: "ua", name: "UAH" },
        { code: "AMD", flag: "am", name: "AMD" },
        { code: "GEL", flag: "ge", name: "GEL" },
        { code: "AZN", flag: "az", name: "AZN" },
        { code: "TJS", flag: "tj", name: "TJS" },
        { code: "UZS", flag: "uz", name: "UZS" }
    ]
};

export const cryptoList = [
    { symbol: "BTC",  icon: "btc.svg",   className: "btci",    price: "00000", unit: "USDT" },
    { symbol: "ETH",  icon: "eth.svg",   className: "ethi",    price: "0000",  unit: "USDT" },
    { symbol: "USDT", icon: "usdt.svg",  className: "usdti",   price: "1.00",  unit: "USD" },
    { symbol: "USDC", icon: "usdc.svg",  className: "usdci",   price: "1.00",  unit: "USD" },
    { symbol: "USDE", icon: "usde.svg",  className: "usdei",   price: "1.00",  unit: "USD" },
    { symbol: "BNB",  icon: "bnb.svg",   className: "bnbi",    price: "000",   unit: "USDT" },
    { symbol: "SOL",  icon: "sol.svg",   className: "soli",    price: "000",   unit: "USDT" },
    { symbol: "XRP",  icon: "xrp.svg",   className: "xmpi",    price: "0.00",  unit: "USDT" },
    { symbol: "LTC",  icon: "ltc.svg",   className: "ltci",    price: "0.00",  unit: "USDT" },
    { symbol: "DOGE", icon: "doge.svg",  className: "dogei",   price: "0.00",  unit: "USDT" },
    { symbol: "TRUMP",icon: "Trump.png", className: "trumpi",  price: "0.00",  unit: "USDT" },
    { symbol: "PEPE", icon: "pepe.svg",  className: "pepei",   price: "0.000000", unit: "USDT" },
    { symbol: "TON",  icon: "ton.svg",   className: "toni",    price: "0.00",  unit: "USDT" },
    { symbol: "TRX",  icon: "tron.svg",  className: "trx",     price: "0.00",  unit: "USDT" },
    { symbol: "ADA",  icon: "ada.svg",   className: "adai",    price: "0.00",  unit: "USDT" },
    { symbol: "AVAX", icon: "avax.svg",  className: "avaxi",   price: "00",    unit: "USDT" },
    { symbol: "LINK", icon: "link.svg",  className: "linki",   price: "00",    unit: "USDT" },
    { symbol: "PAXG", icon: "paxg.svg",  className: "paxgi",   price: "0000",  unit: "USDT", extra: "<small>(токенизированное золото)</small>" },
    { symbol: "XAUT", icon: "xaut.svg",  className: "xauti",   price: "0000",  unit: "USDT", extra: "<small>(Tether Gold)</small>" }
];

export const oilPrices = [
    { name: "Brent", unit: "$/баррель", price: "0000", extra: "(0000 $/галлон • 0000 $/литр)" },
    { name: "WTI",   unit: "$/баррель", price: "0000", extra: "(0000 $/галлон • 0000 $/литр)" },
    { name: "Urals", unit: "$/баррель", price: "0000", extra: "(0000 $/галлон • 0000 $/литр)" }
];

export const gasProducers = [
    { name: "Gazprom (РФ)",              unit: "$/тыс. м³", price: "0000" },
    { name: "Cheniere Energy (США, LNG)", unit: "$/ммБТЕ",  price: "0000" },
    { name: "ExxonMobil (США)",          unit: "$/ммБТЕ",  price: "0000" },
    { name: "Shell (Европа/Нидерланды)", unit: "$/ммБТЕ",  price: "0000" },
    { name: "TotalEnergies (Франция)",   unit: "$/ммБТЕ",  price: "0000" }
];

export const metalsList = [
    { symbol: "XAU", name: "Золото",          unit: "₽/г", price: "0000" },
    { symbol: "XAG", name: "Серебро",         unit: "₽/г", price: "000" },
    { symbol: "XPT", name: "Платина",         unit: "₽/г", price: "0000" },
    { symbol: "XPD", name: "Палладий",        unit: "₽/г", price: "0000" },
    { symbol: "XRH", name: "Родий",           unit: "₽/г", price: "0000" },
    { symbol: "Ir",  name: "Иридий",          unit: "₽/г", price: "0000" },
    { symbol: "Ru",  name: "Рутений",         unit: "₽/г", price: "0000" },
    { symbol: "Os",  name: "Осмий",           unit: "₽/г", price: "0000" },
    { symbol: "Cu",  name: "Медь",            unit: "₽/т", price: "0000" },
    { symbol: "Li",  name: "Литий",           unit: "₽/т", price: "0000" },
    { symbol: "Co",  name: "Кобальт",         unit: "₽/т", price: "0000" },
    { symbol: "Ni",  name: "Никель",          unit: "₽/т", price: "0000" },
    { symbol: "REE", name: "Редкоземельные элементы", unit: "₽/т", price: "0000" },
    { symbol: "W",   name: "Вольфрам",        unit: "₽/т", price: "0000" },
    { symbol: "Ta",  name: "Тантал",          unit: "₽/т", price: "0000" }
];

export const stocksArr = [
        { title: "BLK (BlackRock)", value: 12, typeOfValue: "$" },
        { title: "NVDA (NVIDIA)", value: 12, typeOfValue: "$" },
        { title: "AAPL (Apple)", value: 12, typeOfValue: "$" },
        { title: "GOOGL (Alphabet)", value: 12, typeOfValue: "$" },
        { title: "X (TWTR)", value: 12, typeOfValue: "$" },
        { title: "Netflix (NFLX)", value: 12, typeOfValue: "$" },
        { title: "MSFT (Microsoft)", value: 12, typeOfValue: "$" },
        { title: "AMZN (Amazon)", value: 12, typeOfValue: "$" },
        { title: "META (Meta)", value: 12, typeOfValue: "$" },
        { title: "TSLA (Tesla)", value: 12, typeOfValue: "$" },
        { title: "AVGO (Broadcom)", value: 12, typeOfValue: "$" },
        { title: "JPM (JPMorgan)", value: 12, typeOfValue: "$" },
        { title: "V (Visa)", value: 12, typeOfValue: "$" },
        { title: "MA (Mastercard)", value: 12, typeOfValue: "$" },
        { title: "American Express (AmEx)", value: 12, typeOfValue: "$" },
        { title: "UnionPay (UP I)", value: 12, typeOfValue: "$" },
        { title: "LLY (Eli Lilly)", value: 12, typeOfValue: "$" },
        { title: "XOM (ExxonMobil)", value: 12, typeOfValue: "$" },
        { title: "JNJ (Johnson & Johnson)", value: 12, typeOfValue: "$" },
        { title: "PG (Procter & Gamble)", value: 12, typeOfValue: "$" },
        { title: "ASML (Нидерланды)", value: 12, typeOfValue: "$" },
        { title: "TSM (TSMC)", value: 12, typeOfValue: "$" },
        { title: "BABA (Alibaba)", value: 12, typeOfValue: "$" },
        { title: "TCEHY (Tencent)", value: 12, typeOfValue: "$" },
        { title: "ROSN (Роснефть)", value: 12, typeOfValue: "$" },
        { title: "LKOH (Лукойл)", value: 12, typeOfValue: "$" },
        { title: "GAZP (Газпром)", value: 12, typeOfValue: "$" },
        { title: "SBER (Сбер)", value: 12, typeOfValue: "$" },
        { title: "NVTK (Новатэк)", value: 12, typeOfValue: "$" },
        { title: "PLTR (Palantir)", value: 12, typeOfValue: "$" },
        { title: "AMD (AMD)", value: 12, typeOfValue: "$" },
        { title: "INTEL (INTC)", value: 12, typeOfValue: "$" },
        { title: "COST (Costco)", value: 12, typeOfValue: "$" },
];