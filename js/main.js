// js/main.js
import { 
    renderAllCurrencies, 
    renderCrypto, 
    renderOilPrices, 
    renderGasProducers, 
    renderMetals, 
    renderStocks 
} from './render.js';

import { loadCBRRatesWithChange } from './rates.js';   // ← добавим позже

document.addEventListener('DOMContentLoaded', () => {
    console.log('%c✅ Экономический дашборд запущен', 'color: #00ff88; font-size: 16px; font-weight: bold');

    // 1. Сначала рендерим все списки
    renderAllCurrencies();
    renderCrypto();
    renderOilPrices();
    renderGasProducers();
    renderMetals();
    renderStocks();

    console.log('Все блоки отрендерены');

    // 2. Загружаем актуальные курсы
    loadCBRRatesWithChange();

    // Автообновление каждые 10 минут
    setInterval(loadCBRRatesWithChange, 10 * 60 * 1000);
});