import { currencyGroups, cryptoList } from './data.js';
import { updateChartLivePrice } from './chart.js';
import { t } from './i18n.js'; // ПЕРЕВОД!

let fromCurrency = "USD", toCurrency = "RUB", rates = {}; 

async function loadCBRRates() {
    try {
        const cbrRes = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
        const cbrData = await cbrRes.json();
        rates = {};
        Object.keys(cbrData.Valute).forEach(code => {
            const valute = cbrData.Valute[code];
            rates[code] = { current: parseFloat(valute.Value) / parseFloat(valute.Nominal), previous: parseFloat(valute.Previous) / parseFloat(valute.Nominal) };
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
        } catch (e) {}
        updateConversion(); updateSidebarRates();
    } catch (e) {}
}

async function loadCryptoRates() {
    try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await res.json();
        const binanceRates = {};
        data.forEach(ticker => { binanceRates[ticker.symbol] = { price: parseFloat(ticker.lastPrice), percent: parseFloat(ticker.priceChangePercent) }; });

        const usdToRub = rates["USD"] ? rates["USD"].current : 90;

        document.querySelectorAll('#CriptoVVV li').forEach(li => {
            const symbol = li.dataset.symbol; if (!symbol) return;
            const priceEl = li.querySelector('.crypto-price');
            const changeEl = li.querySelector('.crypto-change');

            let coinPriceUsd = 0; 
            if (["USDT", "USDC", "USDE"].includes(symbol)) {
                coinPriceUsd = 1;
                if(priceEl) priceEl.textContent = "1.0000";
                if(changeEl) changeEl.innerHTML = `<span class="change-neutral">— 0.00%</span>`;
            } else {
                const coinData = binanceRates[symbol + "USDT"];
                if (coinData) {
                    coinPriceUsd = coinData.price;
                    if (priceEl && changeEl) {
                        priceEl.textContent = coinPriceUsd.toFixed(coinPriceUsd < 1 ? 6 : 2);
                        if (symbol === 'BTC' || symbol === 'ETH') updateChartLivePrice(symbol, coinPriceUsd);
                        let colorClass = "change-neutral", arrow = "—", sign = "";
                        if (coinData.percent > 0) { colorClass = "change-up"; arrow = "↑"; sign = "+"; } else if (coinData.percent < 0) { colorClass = "change-down"; arrow = "↓"; }
                        changeEl.innerHTML = `<span class="${colorClass}">${arrow} ${Math.abs(coinData.percent).toFixed(2)}%</span>`;
                    }
                } else if (priceEl) priceEl.textContent = t('noData');
            }
            if (coinPriceUsd > 0) rates[symbol] = { current: coinPriceUsd * usdToRub, previous: coinPriceUsd * usdToRub };

            const gridRateEl = document.getElementById(`grid-rate-${symbol}`);
            if (gridRateEl && coinPriceUsd > 0) gridRateEl.textContent = coinPriceUsd.toFixed(coinPriceUsd < 1 ? 6 : 2) + " $";
        });
        updateConversion();
    } catch (e) {}
}

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
                let color = "#888", statusKey = "fngNeutral";
                if (value <= 25) { color = "#ff4d4d"; statusKey = "fngExtremeFear"; }
                else if (value <= 45) { color = "#ffcc00"; statusKey = "fngFear"; }
                else if (value <= 54) { color = "#dbdbdb"; statusKey = "fngNeutral"; }
                else if (value <= 74) { color = "#99cc33"; statusKey = "fngGreed"; }
                else { color = "#00cc66"; statusKey = "fngExtremeGreed"; }

                valueEl.style.color = color; statusEl.style.color = color;
                statusEl.textContent = t(statusKey);
                needleEl.style.transform = `rotate(${(value / 100) * 180 - 90}deg)`;
            }
        }
    } catch (e) {}
}

async function loadAltcoinSeason() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=70&page=1&sparkline=false&price_change_percentage=30d');
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("");

        const ignoreList = ['tether', 'usd-coin', 'steth', 'dai', 'wrapped-bitcoin', 'first-digital-usd', 'we-eth', 'usdd'];
        const top50 = data.filter(c => !ignoreList.includes(c.id)).slice(0, 51); 
        const btc = top50.find(c => c.symbol === 'btc');
        if (!btc || btc.price_change_percentage_30d_in_currency === undefined) throw new Error("");
        
        let betterCount = 0, totalCount = 0;
        top50.forEach(coin => {
            if (coin.symbol !== 'btc' && coin.price_change_percentage_30d_in_currency != null) {
                totalCount++; if (coin.price_change_percentage_30d_in_currency > btc.price_change_percentage_30d_in_currency) betterCount++;
            }
        });

        if (totalCount === 0) throw new Error("");
        updateAltSeasonDOM(Math.round((betterCount / totalCount) * 100));
    } catch (e) { updateAltSeasonDOM(35); }
}

function updateAltSeasonDOM(value) {
    const valueEl = document.getElementById('alt-value'), statusEl = document.getElementById('alt-status'), needleEl = document.getElementById('alt-needle');
    if (valueEl && statusEl && needleEl) {
        valueEl.textContent = value;
        let color = "#dbdbdb", statusKey = "altNeutral";
        if (value <= 25) { color = "#f7931a"; statusKey = "altBtcSeason"; }
        else if (value <= 45) { color = "#ffcc00"; statusKey = "altBtcLean"; }
        else if (value <= 55) { color = "#dbdbdb"; statusKey = "altNeutral"; }
        else if (value <= 75) { color = "#99cc33"; statusKey = "altAltLean"; }
        else { color = "#00cc66"; statusKey = "altSeasonText"; }

        valueEl.style.color = color; statusEl.style.color = color;
        statusEl.textContent = t(statusKey);
        needleEl.style.transform = `rotate(${(value / 100) * 180 - 90}deg)`;
    }
}

function getRate(code) { return code === "RUB" ? 1 : (rates[code] ? rates[code].current : null); }
function calculateRate(from, to) { if (from === to) return 1; const f = getRate(from), t = getRate(to); return (!f || !t) ? null : f / t; }

function updateCurrencyDisplay(side, code) {
    const flagEl = document.getElementById(side + '-flag'), codeEl = document.getElementById(side + '-code');
    if (!flagEl || !codeEl) return;
    const data = getCurrencyData(code); if (!data) return;
    flagEl.innerHTML = data.type === 'fiat' ? `<span class="fi fi-${data.flag}"></span>` : `<img src="./iconss/${data.icon}" style="width:38px;height:38px;border-radius:6px;" alt="${data.code}">`;
    codeEl.textContent = data.code;
}

function updateConversion(event) {
    const fromInput = document.getElementById('from-amount'), toInput = document.getElementById('to-amount');
    let isReverse = false;
    if (event && (event.target.id === 'from-amount' || event.target.id === 'to-amount')) {
        let t = event.target; isReverse = t.id === 'to-amount';
        let val = t.value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
        let parts = val.split('.'); if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
        if (t.value !== val) t.value = val;
    }
    document.getElementById('from-currency-name').textContent = fromCurrency; document.getElementById('to-currency-name').textContent = toCurrency;
    const rate = calculateRate(fromCurrency, toCurrency);
    const format = (num) => { if (num === 0) return "0.0000"; if (Math.abs(num) < 0.0001) return num.toFixed(8); if (Math.abs(num) < 0.01) return num.toFixed(6); return num.toFixed(4); };

    if (rate !== null) {
        document.getElementById('exchange-rate').textContent = format(rate);
        if (!isReverse) { let a = parseFloat(fromInput.value); isNaN(a) || fromInput.value === '' ? toInput.value = '' : toInput.value = format(a * rate); }
        else { let a = parseFloat(toInput.value); isNaN(a) || toInput.value === '' ? fromInput.value = '' : fromInput.value = format(a / rate); }
    } else {
        (!isReverse) ? toInput.value = "—" : fromInput.value = "—"; document.getElementById('exchange-rate').textContent = "—";
    }
}

function updateInfoPanel(code) {
    const data = getCurrencyData(code), nameEl = document.getElementById('info-currency-name'), descEl = document.getElementById('info-description');
    if (!data) return;
    nameEl.textContent = `${code} — ${data.type === 'fiat' ? t('fiatCurrency') : t('cryptoCurrency')}`;
    descEl.textContent = currencyDescriptions[code] || t('noInfo');
}

export function updateSidebarRates() {
    Object.keys(rates).forEach(code => {
        const data = rates[code]; if (!data) return;
        const gridRateEl = document.getElementById(`grid-rate-${code}`);
        const cardEl = document.querySelector(`.currency-card[data-grid-code="${code}"]`); 
        
        if (gridRateEl) gridRateEl.textContent = (code === "RUB") ? "1.00 ₽" : data.current.toFixed(2) + " ₽";
        if (cardEl && code !== "RUB") {
            const diff = data.current - data.previous;
            cardEl.classList.remove('trend-up', 'trend-down');
            if (diff > 0.0001) cardEl.classList.add('trend-up'); else if (diff < -0.0001) cardEl.classList.add('trend-down');
        }

        const sidebarLi = document.querySelector(`.left-sidebar-content li[data-code="${code}"]`);
        if (sidebarLi) {
            const rateEl = sidebarLi.querySelector('.rate'), changeEl = sidebarLi.querySelector('.change');
            if (code === "RUB") { if (rateEl) rateEl.textContent = "1 ₽"; if (changeEl) changeEl.innerHTML = `<span class="change-neutral">— 0.00 (0.00%)</span>`; return; }
            if (rateEl && changeEl) {
                rateEl.textContent = data.current.toFixed(2) + " ₽";
                const diff = data.current - data.previous, percent = data.previous ? (diff / data.previous) * 100 : 0;
                let colorClass = "change-neutral", arrow = "—", sign = "";
                if (diff > 0.001) { colorClass = "change-up"; arrow = "↑"; sign = "+"; } else if (diff < -0.001) { colorClass = "change-down"; arrow = "↓"; }
                changeEl.innerHTML = `<span class="${colorClass}">${arrow} ${Math.abs(diff).toFixed(4)} (${sign}${Math.abs(percent).toFixed(2)}%)</span>`;
            }
        }
    });
}

function renderList(containerId, selectedCode) {
    const container = document.getElementById(containerId); if (!container) return;
    container.innerHTML = '';
    const all = [...Object.values(currencyGroups).flat().map(i => ({...i, type: 'fiat'})), ...cryptoList.map(i => ({code: i.symbol, type: 'crypto', icon: i.icon}))];

    all.forEach(curr => {
        const div = document.createElement('div'); div.className = `currency-item ${curr.code === selectedCode ? 'active' : ''}`;
        div.innerHTML = curr.type === 'fiat' ? `<span class="fi fi-${curr.flag}"></span><span class="code">${curr.code}</span>` : `<img src="./iconss/${curr.icon}" style="width:26px;height:26px;border-radius:4px;"> <span class="code">${curr.code}</span>`;
        div.onclick = () => {
            if (containerId === 'from-list') fromCurrency = curr.code; else toCurrency = curr.code;
            renderList('from-list', fromCurrency); renderList('to-list', toCurrency);
            updateCurrencyDisplay('from', fromCurrency); updateCurrencyDisplay('to', toCurrency); updateConversion();
            if (containerId === 'to-list') updateInfoPanel(toCurrency);
        };
        container.appendChild(div);
    });
}

function getCurrencyData(code) {
    for (let group of Object.values(currencyGroups)) { const found = group.find(i => i.code === code); if (found) return { ...found, type: 'fiat' }; }
    const crypto = cryptoList.find(i => i.symbol === code); return crypto ? { code: crypto.symbol, type: 'crypto', icon: crypto.icon } : null;
}

async function loadMoexStocks() {
    try {
        const res = await fetch('https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json?iss.meta=off');
        const data = await res.json();
        const md = data.marketdata.data, sec = data.securities.data;
        const mdI = { secid: data.marketdata.columns.indexOf('SECID'), last: data.marketdata.columns.indexOf('LAST'), pct: data.marketdata.columns.indexOf('LASTTOPREVPRICE') };
        const secI = { secid: data.securities.columns.indexOf('SECID'), prev: data.securities.columns.indexOf('PREVPRICE') };

        document.querySelectorAll('#moex-list li').forEach(li => {
            const ticker = li.dataset.symbol; if (!ticker) return;
            const mdRow = md.find(r => r[mdI.secid] === ticker), secRow = sec.find(r => r[secI.secid] === ticker);
            const priceEl = li.querySelector('.moex-price'), changeEl = li.querySelector('.market-change');

            if (mdRow && secRow && priceEl && changeEl) {
                const price = mdRow[mdI.last] !== null ? mdRow[mdI.last] : secRow[secI.prev];
                priceEl.textContent = price != null ? price.toFixed(2) : "—";
                const pct = mdRow[mdI.pct];
                if (pct !== null) {
                    let c = "change-neutral", a = "—";
                    if (pct > 0) { c = "change-up"; a = "↑"; } else if (pct < 0) { c = "change-down"; a = "↓"; }
                    changeEl.innerHTML = `<span class="${c}">${a} ${Math.abs(pct).toFixed(2)}%</span>`;
                } else changeEl.innerHTML = `<span class="change-neutral">— 0.00%</span>`;
            }
        });
    } catch (e) {}
}

export async function initConverter() {
    renderList('from-list', fromCurrency); renderList('to-list', toCurrency);
    
    // Передаем переведенные заголовки категорий!
    initAllCurrenciesGrid();

    updateCurrencyDisplay('from', fromCurrency); updateCurrencyDisplay('to', toCurrency); updateInfoPanel(toCurrency);
    await loadCBRRates(); loadCryptoRates(); loadMarketAnalytics(); loadMoexStocks(); loadAltcoinSeason();
    setInterval(loadCryptoRates, 10000); setInterval(loadMoexStocks, 15000); setInterval(loadCBRRates, 3600000); setInterval(loadMarketAnalytics, 3600000);
    document.getElementById('from-amount').addEventListener('input', updateConversion); document.getElementById('to-amount').addEventListener('input', updateConversion);
}

// Заглушка для сетки (вызывается при старте)
function initAllCurrenciesGrid() {
    const grid = document.getElementById('all-currencies-grid'), toggleBtn = document.getElementById('toggle-grid-view');
    if (!grid) return; grid.innerHTML = '';
    if (toggleBtn) toggleBtn.onclick = () => { grid.classList.toggle('list-view'); toggleBtn.textContent = grid.classList.contains('list-view') ? '▤' : '☰'; };
    const fiats = Object.values(currencyGroups).flat().map(i => ({...i, type: 'fiat'}));
    const cryptos = cryptoList.map(i => ({code: i.symbol, type: 'crypto', icon: i.icon}));

    const renderCategory = (title, items) => {
        const titleEl = document.createElement('div'); titleEl.className = 'grid-category-title'; titleEl.textContent = title; grid.appendChild(titleEl);
        items.forEach(curr => {
            if (curr.code === 'RUB') return;
            const card = document.createElement('div'); card.className = 'currency-card'; card.dataset.gridCode = curr.code;
            let iconHtml = curr.type === 'fiat' ? `<span class="fi fi-${curr.flag}"></span>` : `<img src="./iconss/${curr.icon}" alt="${curr.code}">`;
            card.innerHTML = `<div class="icon-wrapper">${iconHtml}</div><div class="card-code">${curr.code}</div><div class="card-rate" id="grid-rate-${curr.code}">${t('loading')}</div>`;
            card.addEventListener('click', () => { toCurrency = curr.code; renderList('to-list', toCurrency); updateCurrencyDisplay('to', toCurrency); updateConversion(); updateInfoPanel(toCurrency); document.querySelector('.converter-wrapper').scrollIntoView({ behavior: 'smooth' }); });
            grid.appendChild(card);
        });
    };
    renderCategory(t('fiatCategory'), fiats); renderCategory(t('cryptoCategory'), cryptos);
}

// ==========================================
// СЛОВАРЬ (ОСТАВЛЕН НА РУССКОМ - РАБОТАЕТ ВЕЗДЕ)
// ==========================================
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