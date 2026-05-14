// js/converter.js
import { currencyGroups, cryptoList } from './data.js';

let fromCurrency = "USD";
let toCurrency = "RUB";
let rates = {}; 

async function loadCBRRates() {
    try {
        const cbrRes = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
        const cbrData = await cbrRes.json();

        rates = {};
        
        Object.keys(cbrData.Valute).forEach(code => {
            const valute = cbrData.Valute[code];
            rates[code] = {
                current: parseFloat(valute.Value) / parseFloat(valute.Nominal),
                previous: parseFloat(valute.Previous) / parseFloat(valute.Nominal)
            };
        });

        try {
            const globalRes = await fetch('https://open.er-api.com/v6/latest/USD');
            const globalData = await globalRes.json();
            const usdToRub = rates["USD"] ? rates["USD"].current : globalData.rates["RUB"];

            Object.keys(globalData.rates).forEach(code => {
                if (!rates[code] && code !== "RUB") {
                    const price = usdToRub / globalData.rates[code];
                    rates[code] = { current: price, previous: price };
                }
            });

            
        } catch (globalError) {
            console.error('❌ Ошибка загрузки глобальных курсов', globalError);
        }
        
        updateConversion();
        updateSidebarRates();

    } catch (error) {
        console.error('❌ Ошибка загрузки курсов ЦБ:', error);
    }
}

async function loadCryptoRates() {
    try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await res.json();

        const binanceRates = {};
        data.forEach(ticker => {
            binanceRates[ticker.symbol] = {
                price: parseFloat(ticker.lastPrice),
                percent: parseFloat(ticker.priceChangePercent)
            };
        });

        const usdToRub = rates["USD"] ? rates["USD"].current : 90;

        document.querySelectorAll('#CriptoVVV li').forEach(li => {
            const symbol = li.dataset.symbol;
            if (!symbol) return;

            const priceEl = li.querySelector('.crypto-price');
            const changeEl = li.querySelector('.crypto-change');

            let tickerName = symbol + "USDT"; 
            let coinPriceUsd = 0; 

            if (symbol === "USDT" || symbol === "USDC" || symbol === "USDE") {
                coinPriceUsd = 1;
                if(priceEl) priceEl.textContent = "1.0000";
                if(changeEl) changeEl.innerHTML = `<span class="change-neutral">— 0.00%</span>`;
            } else {
                const coinData = binanceRates[tickerName];
                if (coinData) {
                    coinPriceUsd = coinData.price;
                    if (priceEl && changeEl) {
                        let decimals = coinPriceUsd < 1 ? 6 : 2;
                        priceEl.textContent = coinPriceUsd.toFixed(decimals);

                        let colorClass = "change-neutral";
                        let arrow = "—"; let sign = "";

                        if (coinData.percent > 0) { colorClass = "change-up"; arrow = "↑"; sign = "+"; } 
                        else if (coinData.percent < 0) { colorClass = "change-down"; arrow = "↓"; }

                        changeEl.innerHTML = `<span class="${colorClass}">${arrow} ${Math.abs(coinData.percent).toFixed(2)}%</span>`;
                    }
                } else {
                    if (priceEl) priceEl.textContent = "Нет данных";
                }
            }

            if (coinPriceUsd > 0) {
                rates[symbol] = { current: coinPriceUsd * usdToRub, previous: coinPriceUsd * usdToRub };
            }
        });

        updateConversion();
    } catch (error) {
        console.error('❌ Ошибка загрузки криптовалют:', error);
    }
}

// ==================== АНАЛИТИКА: ИНДЕКС СТРАХА И ЖАДНОСТИ ====================
async function loadMarketAnalytics() {
    try {
        const res = await fetch('https://api.alternative.me/fng/?limit=1');
        const data = await res.json();
        
        if (data && data.data && data.data[0]) {
            const value = parseInt(data.data[0].value);
            
            const valueEl = document.getElementById('fng-value');
            const statusEl = document.getElementById('fng-status');
            const needleEl = document.getElementById('fng-needle');

            if (valueEl && statusEl && needleEl) {
                valueEl.textContent = value;
                
                let color = "#888";
                let ruStatus = "Нейтрально";

                if (value <= 25) { color = "#ff4d4d"; ruStatus = "Жесткий страх"; }
                else if (value <= 45) { color = "#ffcc00"; ruStatus = "Страх"; }
                else if (value <= 54) { color = "#dbdbdb"; ruStatus = "Нейтрально"; }
                else if (value <= 74) { color = "#99cc33"; ruStatus = "Жадность"; }
                else { color = "#00cc66"; ruStatus = "Дикая жадность"; }

                valueEl.style.color = color;
                statusEl.style.color = color;
                statusEl.textContent = ruStatus;

                // МАТЕМАТИКА ВРАЩЕНИЯ СТРЕЛКИ
                // Переводим значение от 0-100 в угол от -90 до +90 градусов
                const angle = (value / 100) * 180 - 90;
                
                // Вращаем стрелку! (В CSS уже заложена плавная анимация transition)
                needleEl.style.transform = `rotate(${angle}deg)`;
            }
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки Индекса:', error);
    }
}

function getRate(code) {
    if (code === "RUB") return 1;
    return rates[code] ? rates[code].current : null;
}

function calculateRate(from, to) {
    if (from === to) return 1;
    const fromRate = getRate(from);
    const toRate = getRate(to);
    if (!fromRate || !toRate) return null;
    return fromRate / toRate;
}

function updateCurrencyDisplay(side, code) {
    const flagEl = document.getElementById(side + '-flag');
    const codeEl = document.getElementById(side + '-code');

    if (!flagEl || !codeEl) return;

    const data = getCurrencyData(code);
    if (!data) return;

    if (data.type === 'fiat') {
        flagEl.innerHTML = `<span class="fi fi-${data.flag}"></span>`;
    } else {
        flagEl.innerHTML = `<img src="./iconss/${data.icon}" style="width:38px;height:38px;border-radius:6px;" alt="${data.code}">`;
    }
    codeEl.textContent = data.code;
}

function updateConversion(event) {
    const fromInput = document.getElementById('from-amount');
    const toInput = document.getElementById('to-amount');
    let isReverse = false;

    if (event && (event.target.id === 'from-amount' || event.target.id === 'to-amount')) {
        let target = event.target;
        isReverse = target.id === 'to-amount';
        
        let val = target.value.replace(/,/g, '.');
        val = val.replace(/[^0-9.]/g, '');
        let parts = val.split('.');
        if (parts.length > 2) {
            val = parts[0] + '.' + parts.slice(1).join('');
        }
        if (target.value !== val) target.value = val;
    }

    document.getElementById('from-currency-name').textContent = fromCurrency;
    document.getElementById('to-currency-name').textContent = toCurrency;

    const rate = calculateRate(fromCurrency, toCurrency);

    const formatNumber = (num) => {
        if (num === 0) return "0.0000";
        if (Math.abs(num) < 0.0001) return num.toFixed(8);
        if (Math.abs(num) < 0.01) return num.toFixed(6);
        return num.toFixed(4);
    };

    if (rate !== null) {
        document.getElementById('exchange-rate').textContent = formatNumber(rate);

        if (!isReverse) {
            let amount = parseFloat(fromInput.value); 
            if (isNaN(amount) || fromInput.value === '') toInput.value = ''; 
            else toInput.value = formatNumber(amount * rate);
        } else {
            let amount = parseFloat(toInput.value);
            if (isNaN(amount) || toInput.value === '') fromInput.value = ''; 
            else fromInput.value = formatNumber(amount / rate);
        }
    } else {
        if (!isReverse) toInput.value = "—"; else fromInput.value = "—";
        document.getElementById('exchange-rate').textContent = "—";
    }
}

function updateInfoPanel(code) {
    const data = getCurrencyData(code);
    const nameEl = document.getElementById('info-currency-name');
    const descEl = document.getElementById('info-description');

    if (!data) return;
    nameEl.textContent = `${code} — ${data.type === 'fiat' ? 'национальная валюта' : 'криптовалюта'}`;
    descEl.textContent = currencyDescriptions[code] || "Информация о данной валюте скоро появится.";
}

function updateSidebarRates() {
    document.querySelectorAll('#currencies-major li, #currencies-other li, #currencies-asia li, #currencies-middleeast li, #currencies-cis li').forEach(li => {
        const code = li.dataset.code;
        if (!code) return;

        const rateEl = li.querySelector('.rate');
        const changeEl = li.querySelector('.change'); 
        
        if (code === "RUB") {
            if (rateEl) rateEl.textContent = "1 ₽";
            if (changeEl) changeEl.innerHTML = `<span class="change-neutral">— 0.00 (0.00%)</span>`;
            return;
        }

        const data = rates[code];
        
        if (data && rateEl && changeEl) {
            rateEl.textContent = data.current.toFixed(2) + " ₽";

            const diff = data.current - data.previous;
            const percent = data.previous ? (diff / data.previous) * 100 : 0;

            let colorClass = "change-neutral"; let arrow = "—"; let sign = "";

            if (diff > 0.001) { colorClass = "change-up"; arrow = "↑"; sign = "+"; } 
            else if (diff < -0.001) { colorClass = "change-down"; arrow = "↓"; }

            const diffStr = Math.abs(diff).toFixed(4); 
            const percentStr = Math.abs(percent).toFixed(2);

            changeEl.innerHTML = `<span class="${colorClass}">${arrow} ${diffStr} (${sign}${percentStr}%)</span>`;
        } else if (rateEl && changeEl) {
            rateEl.textContent = "—"; changeEl.innerHTML = "";
        }
    });
}

function renderList(containerId, selectedCode) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const allCurrencies = [
        ...Object.values(currencyGroups).flat().map(item => ({...item, type: 'fiat'})),
        ...cryptoList.map(item => ({code: item.symbol, type: 'crypto', icon: item.icon}))
    ];

    allCurrencies.forEach(curr => {
        const div = document.createElement('div');
        div.className = `currency-item ${curr.code === selectedCode ? 'active' : ''}`;

        if (curr.type === 'fiat') div.innerHTML = `<span class="fi fi-${curr.flag}"></span><span class="code">${curr.code}</span>`;
        else div.innerHTML = `<img src="./iconss/${curr.icon}" style="width:26px;height:26px;border-radius:4px;"> <span class="code">${curr.code}</span>`;

        div.onclick = () => {
            if (containerId === 'from-list') fromCurrency = curr.code;
            else toCurrency = curr.code;

            renderList('from-list', fromCurrency);
            renderList('to-list', toCurrency);

            updateCurrencyDisplay('from', fromCurrency);
            updateCurrencyDisplay('to', toCurrency);
            updateConversion();

            if (containerId === 'to-list') updateInfoPanel(toCurrency);
        };
        container.appendChild(div);
    });
}

function getCurrencyData(code) {
    for (let group of Object.values(currencyGroups)) {
        const found = group.find(item => item.code === code);
        if (found) return { ...found, type: 'fiat' };
    }
    const crypto = cryptoList.find(item => item.symbol === code);
    if (crypto) return { code: crypto.symbol, type: 'crypto', icon: crypto.icon };
    return null;
}

export function renderMoex() {
    const container = document.getElementById(`moex-list`);
    if (!container) return;
    container.innerHTML = '';

    moexStocks.forEach(item => {
        const li = document.createElement(`li`);
        li.dataset.symbol = item.symbol;
        li.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <span>${item.name} <small style="color: #888;">(${item.symbol})</small></span>
                <div style="text-align: right;">
                    <span class="moex-price" style="font-weight: bold;">загрузка...</span>
                    <span style="font-size: 0.9em; color: #ccc;">₽</span>
                </div>
            </div>
            <div class="change-container" style="padding-left: 0; margin-top: 2px;">
                <span class="market-change"></span>
            </div>
        `;
        container.appendChild(li);
    });
}
// ==================== АКЦИИ МОСКОВСКОЙ БИРЖИ (MOEX API) ====================
async function loadMoexStocks() {
    try {
        const res = await fetch('https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json?iss.meta=off&iss.only=marketdata');
        const data = await res.json();
        
        const columns = data.marketdata.columns;
        const secidIdx = columns.indexOf('SECID');
        const priceIdx = columns.indexOf('LAST');
        const percentIdx = columns.indexOf('LASTTOPREVPRICE');

        const marketData = data.marketdata.data;

        document.querySelectorAll('#moex-list li').forEach(li => {
            const ticker = li.dataset.symbol;
            if (!ticker) return;

            const row = marketData.find(r => r[secidIdx] === ticker);
            const priceEl = li.querySelector('.moex-price');
            const changeEl = li.querySelector('.market-change');

            if (row && priceEl && changeEl) {
                const price = row[priceIdx];
                const percent = row[percentIdx];

                if (price) {
                    priceEl.textContent = price.toFixed(2);
                } else {
                    priceEl.textContent = "—"; // Если торги закрыты
                }

                if (percent !== null) {
                    let colorClass = "change-neutral";
                    let arrow = "—"; let sign = "";

                    if (percent > 0) { colorClass = "change-up"; arrow = "↑"; sign = "+"; } 
                    else if (percent < 0) { colorClass = "change-down"; arrow = "↓"; }

                    changeEl.innerHTML = `<span class="${colorClass}">${arrow} ${Math.abs(percent).toFixed(2)}%</span>`;
                }
            }
        });
    } catch (error) {
        console.error('❌ Ошибка загрузки данных MOEX:', error);
    }
}
export async function initConverter() {
    renderList('from-list', fromCurrency);
    renderList('to-list', toCurrency);

    updateCurrencyDisplay('from', fromCurrency);
    updateCurrencyDisplay('to', toCurrency);
    updateInfoPanel(toCurrency);

    // Первичная загрузка
    await loadCBRRates();
    loadCryptoRates(); 
    loadMarketAnalytics();
    loadMoexStocks(); 

    // Таймеры обновления в фоне
    setInterval(loadCryptoRates, 10000); // Крипта - каждые 10 сек
    setInterval(loadMoexStocks, 15000);  // Акции РФ - каждые 15 сек
    setInterval(loadCBRRates, 3600000);  // Валюты - раз в час
    setInterval(loadMarketAnalytics, 3600000); // Индекс - раз в час

    document.getElementById('from-amount').addEventListener('input', updateConversion);
    document.getElementById('to-amount').addEventListener('input', updateConversion);
}





const currencyDescriptions = {
USD: "Доллар США — главная резервная валюта мира. Введён в 1792 году. Контролируется Федеральной резервной системой (ФРС).",
EUR: "Евро — официальная валюта 20 стран Еврозоны. Введена в безналичное обращение в 1999 году, в наличное — в 2002 году. Является второй по значимости резервной валютой на планете.",
RUB: "Российский рубль — национальная валюта России. Один из самых старых валютных знаков в мире, существует с XIII века. Современная история валюты началась в 1991 году.",
GBP: "Британский фунт стерлингов — старейшая валюта в непрерывном использовании. Существует более 1200 лет. Считается одной из самых дорогих и стабильных валют мира.",
JPY: "Японская иена — третья по объёму торгов валюта мира. Известна своей стабильностью и низкой инфляцией. Традиционно используется инвесторами как защитный актив.",
CNY: "Китайский юань — официальная валюта Китая. С 2016 года входит в корзину SDR Международного валютного фонда. Её влияние растет пропорционально экономике КНР.",
KZT: "Казахстанский тенге — национальная валюта Казахстана с 1993 года. Название происходит от средневековых тюркских монет. Банкноты тенге признавались одними из самых красивых в мире.",
UAH: "Украинская гривна — национальная валюта Украины, введённая в 1996 году. Название восходит к денежной единице Киевской Руси, использовавшейся ещё в XI веке. Выпускается Национальным банком Украины.",
BYN: "Белорусский рубль — национальная валюта Беларуси. Введён в 1992 году, с 2016 года действует в новой редакции после деноминации. Контролируется Национальным банком Республики Беларусь.",
CHF: "Швейцарский франк — национальная валюта Швейцарии и Лихтенштейна. Известен своей стабильностью и статусом 'тихой гавани' в периоды экономической нестабильности. Практически не подвержен инфляции.",
NZD: "Новозеландский доллар — национальная валюта Новой Зеландии. Часто используется в торговле в Тихоокеанском регионе. На сленге трейдеров валюту часто называют 'киви'.",
SEK: "Шведская крона — национальная валюта Швеции. Введена в 1873 году в рамках Скандинавского монетного союза. Считается одной из самых надежных европейских валют.",
NOK: "Норвежская крона — национальная валюта Норвегии. Введена в 1875 году, её курс часто коррелирует с мировыми ценами на нефть. Входит в список самых стабильных валют Европы.",
CAD: "Канадский доллар — национальная валюта Канады. Введён в 1858 году, известен своей стабильностью и тесными связями с экономикой США. Часто называется 'товарной' валютой из-за экспорта ресурсов.",
AUD: "Австралийский доллар — национальная валюта Австралии. Введён в 1966 году, заменив австралийский фунт. Стал первой в мире валютой, изготовленной из полимерного пластика.",
DKK: "Датская крона — национальная валюта Дании. Введена в 1875 году, известна своей стабильностью и жесткой привязкой к курсу евро. Обслуживает также Гренландию и Фарерские острова.",
PLN: "Польский злотый — национальная валюта Польши. Введён в современном виде в 1924 году. Валюта смогла сохранить свою независимость, несмотря на вступление страны в Евросоюз.",
CZK: "Чешская крона — национальная валюта Чехии. Введена в 1993 году после распада Чехословакии. Является одной из самых востребованных валют в Центральной Европе.",
HUF: "Венгерский форинт — национальная валюта Венгрии. Введён в 1946 году после самой масштабной гиперинфляции в истории. Название происходит от золотых монет Флоренции.",
HKD: "Гонконгский доллар — официальная валюта Гонконга. Введён в 1935 году, выпускается тремя коммерческими банками под контролем властей. Имеет фиксированный курс к доллару США.",
SGD: "Сингапурский доллар — национальная валюта Сингапура. Введён в 1967 году, считается одной из самых стабильных валют Азии. Полностью конвертируем и высоко ценится на мировых рынках.",
KRW: "Южнокорейский вон — национальная валюта Южной Кореи. Введён в современном виде в 1945 году. Отражает мощный технологический и экономический рост страны в последние десятилетия.",
INR: "Индийская рупия — национальная валюта Индии. Введена в историческом виде в 1540 году, современная версия существует с 1947 года. Символ рупии был официально утвержден в 2010 году.",
TRY: "Турецкая лира — национальная валюта Турции. Введена в 1923 году после провозглашения республики. В последние годы подвержена значительной волатильности из-за экономической политики.",
BRL: "Бразильский реал — национальная валюта Бразилии. Введён в 1994 году в рамках программы борьбы с инфляцией. Является ведущей валютой на рынке Латинской Америки.",
ZAR: "Южноафриканский рэнд — национальная валюта Южной Африки. Введён в 1961 году одновременно с провозглашением республики. Название происходит от золотоносного горного хребта.",
MXN: "Мексиканский песо — национальная валюта Мексики. Введён в 1863 году, является самой торгуемой валютой среди развивающихся стран. Происходит от старинных испанских серебряных монет.",
THB: "Таиландский бат — национальная валюта Таиланда. Введён в конце XIX века, считается одной из самых крепких валют Юго-Восточной Азии. Валюта обеспечена значительными золотовалютными резервами.",
MYR: "Малайзийский ринггит — национальная валюта Малайзии. Введён в 1967 году, название в переводе означает 'зубчатый'. Курс валюты сильно зависит от цен на электронику и нефть.",
IDR: "Индонезийская рупия — национальная валюта Индонезии. Введена в 1946 году в период борьбы за независимость. Из-за исторической инфляции имеет высокие номиналы купюр.",
PHP: "Филиппинское песо — национальная валюта Филиппин. Введён в 1852 году, управляется Центральным банком Филиппин. Валюта показывает устойчивость благодаря притоку средств от диаспор.",
AED: "Дирхам ОАЭ — национальная валюта Объединённых Арабских Эмиратов. Введён в 1973 году, имеет фиксированный курс по отношению к доллару США. Считается одной из самых стабильных валют Ближнего Востока.",
SAR: "Саудовский риял — национальная валюта Саудовской Аравии. Введён в 1925 году, жёстко привязан к американскому доллару. Является ключевой валютой в нефтяных расчетах региона.",
QAR: "Катарский риял — национальная валюта Катара. Введён в 1966 году, обеспечен огромными запасами природного газа. Считается крайне стабильным платежным средством.",
KWD: "Кувейтский динар — национальная валюта Кувейта. Введён в 1961 году, является самой дорогой валютой в мире по номиналу. Высокий курс поддерживается колоссальными запасами нефти.",
BHD: "Бахрейнский динар — национальная валюта Бахрейна. Введён в 1965 году, занимает второе место в мире по стоимости. Имеет фиксированный курс к доллару США.",
OMR: "Оманский риял — национальная валюта Омана. Введён в 1970 году, входит в тройку самых дорогих валют планеты. Делится на 1000 байз вместо привычных 100 единиц.",
JOD: "Иорданский динар — национальная валюта Иордании. Введён в 1950 году, сохраняет стабильно высокий курс на протяжении десятилетий. Привязан к доллару США для обеспечения предсказуемости.",
ILS: "Израильский шекель — национальная валюта Израиля. Введён в 1985 году, заменив старый шекель после периода инфляции. Входит в список свободно конвертируемых валют мира.",
EGP: "Египетский фунт — национальная валюта Египта. Введён в 1834 году, является одной из старейших валют Африки. В последнее время подвержен сильным колебаниям курса.",
AMD: "Армянский драм — национальная валюта Армении. Введён в 1993 году после обретения независимости. Название исторически связано с греческой драхмой.",
GEL: "Грузинский лари — национальная валюта Грузии. Введён в 1995 году, название переводится как 'сокровище'. Контролируется Национальным банком Грузии.",
AZN: "Азербайджанский манат — национальная валюта Азербайджана. Введён в 1992 году, дизайн современных купюр разработан создателем евро. Курс зависит от стабильности энергетического сектора.",
TJS: "Таджикский сомони — национальная валюта Таджикистана. Введён в 2000 году, назван в честь основателя первого таджикского государства. Заменил в обращении таджикский рубль.",
UZS: "Узбекский сум — национальная валюта Узбекистана. Введён в 1994 году, название означает 'чистое золото'. Является единственным законным средством платежа в стране.",
BTC: "Биткоин — первая и самая известная криптовалюта, созданная в 2009 году Сатоши Накамото. Она децентрализована и имеет ограниченную эмиссию в 21 миллион монет. Считается 'цифровым золотом' современного мира.",
ETH: "Эфириум — вторая по популярности криптовалюта, запущенная в 2015 году Виталиком Бутериным. Она поддерживает смарт-контракты и децентрализованные приложения. Является основой для большинства проектов в сфере DeFi.",
LTC: "Лайткоин — криптовалюта, созданная в 2011 году Чарли Ли. Работает быстрее биткоина и имеет меньшие комиссии за транзакции. Часто используется как инструмент для мелких повседневных платежей.",
XRP: "Рипл — криптовалюта и платформа для международных платежей, запущенная в 2012 году. Ориентирована на банковский сектор для ускорения трансграничных переводов. Обладает крайне высокой скоростью транзакций.",
ADA: "Кардано — блокчейн-платформа и криптовалюта, запущенная в 2017 году. Построена на основе научных исследований и рецензируемого кода. Делает упор на безопасность, масштабируемость и экологичность.",
PEPE: "Пепе — мемная криптовалюта, вдохновленная популярным интернет-мемом с лягушонком. Не имеет прямого технического применения, но обладает огромным сообществом. Стала одним из самых быстрорастущих активов в своем классе.",
USDT: "Tether — крупнейший стейблкоин в мире, курс которого привязан к доллару США. Используется для сохранения стоимости и быстрых расчетов в криптосфере. Обеспечен реальными фиатными резервами компании Tether.",
USDC: "USD Coin — стейблкоин, привязанный к доллару США в соотношении один к одному. Выпускается консорциумом Centre и проходит регулярные аудиты. Считается одним из самых прозрачных цифровых активов.",
USDE: "USDE — синтетический стейблкоин, привязанный к доллару США. Использует дельта-нейтральные стратегии для поддержания стабильности курса. Является инновационным продуктом в экосистеме Ethena.",
BNB: "Binance Coin — криптовалюта экосистемы крупнейшей биржи Binance. Используется для оплаты комиссий на платформе и в сети BNB Chain. Регулярно проходит процедуру сжигания для контроля предложения.",
SOL: "Solana — высокопроизводительная блокчейн-платформа, запущенная в 2020 году. Известна своей невероятной скоростью обработки операций и низкими комиссиями. Стала главным конкурентом Эфириума в сфере NFT.",
DOT: "Polkadot — блокчейн-протокол, объединяющий различные сети в единую экосистему. Позволяет передавать данные и активы между разными блокчейнами. Делает упор на совместимость и масштабируемость.",
AVAX: "Avalanche — платформа для децентрализованных приложений, запущенная в 2020 году. Обладает высокой скоростью подтверждения транзакций и уникальным механизмом консенсуса. Используется для создания настраиваемых блокчейн-сетей.",
DOGE: "Dogecoin — криптовалюта, созданная в 2013 году как шутка на основе мема с собакой сиба-ину. Несмотря на происхождение, приобрела огромную капитализацию и поддержку знаменитостей. Часто используется для микроплатежей и благотворительности.",
TRUMP: "TrumpCoin — мемная криптовалюта, созданная в поддержку политической деятельности Дональда Трампа. Относится к категории PoliFi-активов, чья стоимость зависит от политических новостей. Не имеет серьезного технического применения.",
TON: "TON — блокчейн-платформа, изначально разработанная командой Telegram. Известна своей масштабируемостью и интеграцией в мессенджер. Используется для создания децентрализованных сервисов и микротранзакций.",
TRX: "Tron — блокчейн-платформа, запущенная в 2017 году для децентрализации интернета. Позволяет создателям контента напрямую взаимодействовать с аудиторией. Является основной сетью для перевода стейблкоинов USDT.",
LINK: "Chainlink — сеть оракулов, обеспечивающая связь смарт-контрактов с внешними данными. Позволяет блокчейнам безопасно взаимодействовать с реальным миром. Является критически важной инфраструктурой для индустрии DeFi.",
PAXG: "PAX Gold — стейблкоин, обеспеченный физическим золотом в соотношении один к одному. Каждый токен соответствует одной тройской унции золота в хранилищах Лондона. Позволяет владеть золотом без сложностей с его хранением.",
XAUT: "Tether Gold — цифровой актив, привязанный к цене физического золота. Обеспечивается слитками, находящимися в швейцарских хранилищах. Сочетает в себе надежность драгметаллов и преимущества блокчейна."

};