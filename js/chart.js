//chart.js/ 

import { t } from './i18n.js'; // Подключаем перевод

let myChart = null;
let currentChartCoin = 'BTC'; 

const cryptoFacts = {
    BTC: { color: '#f7931a', facts: { "2017-12": "Первый глобальный хайп: BTC почти достигает $20,000.", "2018-12": "Криптозима: дно медвежьего рынка, цена около $3,100.", "2020-05": "Третий халвинг Биткоина (награда снижена до 6.25 BTC).", "2021-11": "Пик бычьего рынка: ATH на уровне $69,000.", "2022-11": "Крах криптобиржи FTX: падение ниже $16,000.", "2024-01": "В США официально одобрены спотовые Bitcoin ETF.", "2024-03": "Новый исторический максимум (ATH) выше $73,000." } },
    ETH: { color: '#627eea', facts: { "2017-12": "Бум ICO на базе смарт-контрактов Ethereum.", "2018-12": "Дно после ICO-бума, цена падает до $80.", "2020-08": "Лето DeFi (Децентрализованных финансов).", "2021-11": "Исторический максимум (ATH) около $4,800.", "2022-09": "The Merge: переход сети на стейкинг (PoS).", "2024-05": "Одобрение спотовых Ethereum ETF в США." } },
    SOL: { color: '#00ffa3', facts: { "2020-03": "Запуск бета-версии основной сети (Mainnet) Solana.", "2021-11": "Пик «Solana Summer»: исторический максимум (ATH) около $260.", "2022-11": "Крах FTX обрушивает цену SOL ниже $10.", "2023-12": "Мощное восстановление экосистемы на фоне бума мем-коинов.", "2024-03": "Возвращение цены к отметкам выше $200." } },
    BNB: { color: '#f3ba2f', facts: { "2017-07": "Запуск биржи Binance и ICO (цена монеты ~$0.10).", "2020-09": "Запуск Binance Smart Chain (BSC), начало бума DeFi.", "2021-05": "Исторический максимум (ATH) около $690.", "2023-11": "Штраф от США на $4.3 млрд и уход Чанпэна Чжао (CZ).", "2024-06": "Новый исторический максимум (ATH) выше $710." } },
    XRP: { color: '#00aae4', facts: { "2018-01": "Глобальный хайп: исторический максимум (ATH) на уровне $3.84.", "2020-12": "SEC подает иск против Ripple.", "2021-04": "Мощный отскок выше $1.80 несмотря на суды.", "2023-07": "Частичная победа в суде: XRP признан не-ценной бумагой.", "2024-08": "Официальное завершение многолетнего суда с SEC." } }
};

async function fetchBinanceData(coin) {
    const symbol = coin + 'USDT';
    try {
        const [klinesRes, livePriceRes] = await Promise.all([
            fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1M&limit=1000`),
            fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
        ]);
        return { klines: await klinesRes.json(), exactCurrentPrice: parseFloat((await livePriceRes.json()).price) };
    } catch (error) { return null; }
}

const verticalLinePlugin = {
    id: 'verticalLine',
    afterDraw: chart => {
        if (chart.tooltip?._active?.length) {
            const ctx = chart.ctx; const x = chart.tooltip._active[0].element.x;
            ctx.save(); ctx.beginPath(); ctx.moveTo(x, chart.scales.y.top); ctx.lineTo(x, chart.scales.y.bottom);
            ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.restore();
        }
    }
};

export async function initCryptoChart() {
    const ctx = document.getElementById('cryptoChart');
    if (!ctx) return;

    async function renderChart(coin) {
        const titleEl = document.querySelector('.chart-title');
        if (titleEl && !isTvMode) titleEl.textContent = t('chartLoading');

        const rawData = await fetchBinanceData(coin);
        if (!rawData || rawData.klines.length === 0) {
            if (titleEl) titleEl.textContent = t('chartError');
            return;
        }

        const coinColor = cryptoFacts[coin].color;
        const factData = cryptoFacts[coin].facts;
        const labels = [], prices = [], pointRadiuses = [], pointColors = [], factsArray = [];

        rawData.klines.forEach((kline, index) => {
            const dateObj = new Date(kline[0]);
            const ym = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
            labels.push(`${String(dateObj.getMonth() + 1).padStart(2, '0')}.${dateObj.getFullYear()}`);
            prices.push(index === rawData.klines.length - 1 ? rawData.exactCurrentPrice : parseFloat(kline[4]));
            factsArray.push(factData[ym] || null);
            pointRadiuses.push(factData[ym] ? 5 : 0);
            pointColors.push(factData[ym] ? '#fff' : 'transparent');
        });

        if (myChart) myChart.destroy();
        myChart = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets: [{ label: coin, data: prices, borderColor: coinColor, backgroundColor: 'transparent', borderWidth: 2, tension: 0.15, pointRadius: pointRadiuses, pointBackgroundColor: pointColors, pointBorderColor: coinColor, pointBorderWidth: 2, pointHoverRadius: 6, pointHoverBackgroundColor: 'rgba(30, 30, 30, 0.9)', pointHoverBorderColor: coinColor, pointHoverBorderWidth: 3 }] },
            plugins: [verticalLinePlugin],
            options: {
                responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(20, 20, 20, 0.95)', titleColor: '#aaa', bodyColor: '#fff', titleFont: { size: 12, weight: 'normal' }, bodyFont: { size: 14, weight: 'bold' }, padding: 12, cornerRadius: 8, displayColors: false, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
                        callbacks: {
                            title: function(context) { return `${t('date')}: ${context[0].label}`; },
                            label: function(context) { return `${t('price')}: $${context.raw.toLocaleString('en-US', { maximumFractionDigits: 2 })}`; }
                        }
                    }
                },
                scales: { x: { grid: { display: false }, ticks: { color: '#777', maxTicksLimit: 8 } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#777' }, position: 'right' } },
                onHover: (event, elements) => {
                    const tooltip = document.getElementById('history-tooltip');
                    if (!tooltip) return;
                    if (elements.length > 0 && factsArray[elements[0].index]) {
                        tooltip.innerHTML = `<h5 style="margin:0 0 5px 0; font-size: 13px;">${labels[elements[0].index]}</h5>${factsArray[elements[0].index]}`;
                        tooltip.style.borderColor = coinColor; tooltip.querySelector('h5').style.color = coinColor;
                        tooltip.style.left = event.x + 'px'; tooltip.style.top = (event.y + 40) + 'px';
                        tooltip.classList.add('show');
                        return;
                    }
                    tooltip.classList.remove('show');
                }
            }
        });
        if (titleEl && !isTvMode) titleEl.textContent = t('chartHist');
    }

    let isTvMode = false;
    const tvToggleBtn = document.getElementById('tv-toggle-btn');
    const histContainer = document.getElementById('hist-advanced-chart'); 
    const tvContainer = document.getElementById('tv-advanced-chart');     
    const titleEl = document.querySelector('.chart-title');

    function renderTvChart(coin) {
        if (!tvContainer) return;
        tvContainer.innerHTML = ''; 
        const script = document.createElement('script'); script.type = 'text/javascript'; script.src = 'https://s3.tradingview.com/tv.js';
        script.onload = () => { new TradingView.widget({ "autosize": true, "symbol": "BINANCE:" + coin + "USDT", "interval": "D", "theme": "dark", "style": "1", "locale": document.documentElement.lang || "ru", "enable_publishing": false, "backgroundColor": "rgba(20, 20, 20, 0.95)", "gridColor": "rgba(255, 255, 255, 0.05)", "hide_top_toolbar": false, "save_image": false, "container_id": "tv-advanced-chart" }); };
        document.head.appendChild(script);
    }

    if (tvToggleBtn) {
        tvToggleBtn.addEventListener('click', () => {
            isTvMode = !isTvMode;
            if (isTvMode) {
                tvToggleBtn.style.color = '#00ff88'; tvToggleBtn.style.borderColor = '#00ff88';
                if(titleEl) titleEl.textContent = t('chartPro');
                if(histContainer) histContainer.style.display = 'none'; if(tvContainer) tvContainer.style.display = 'block';
                renderTvChart(currentChartCoin);
            } else {
                tvToggleBtn.style.color = '#aaa'; tvToggleBtn.style.borderColor = '#555';
                if(titleEl) titleEl.textContent = t('chartHist');
                if(tvContainer) tvContainer.style.display = 'none'; if(histContainer) histContainer.style.display = 'block';
                renderChart(currentChartCoin);
            }
        });
    }

    const allTabs = document.querySelectorAll('.chart-tab');
    allTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            allTabs.forEach(t => t.classList.remove('active')); e.target.classList.add('active');
            currentChartCoin = e.target.id.split('-')[1];
            if (isTvMode) {
                isTvMode = false; if(tvToggleBtn) { tvToggleBtn.style.color = '#aaa'; tvToggleBtn.style.borderColor = '#555'; }
                if(titleEl) titleEl.textContent = t('chartHist');
                if(tvContainer) tvContainer.style.display = 'none'; if(histContainer) histContainer.style.display = 'block';
            }
            renderChart(currentChartCoin);
        });
    });
    renderChart('BTC');
}

export function updateChartLivePrice(coin, newPrice) {
    if (myChart && currentChartCoin === coin) {
        const prices = myChart.data.datasets[0].data;
        prices[prices.length - 1] = parseFloat(newPrice);
        myChart.update('none');
    }
}