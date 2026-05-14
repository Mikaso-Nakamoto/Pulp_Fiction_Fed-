// js/main.js

import { initConverter } from './converter.js';
import { 
    renderAllCurrencies, 
    renderCrypto, 
    renderOilPrices, 
    renderGasProducers, 
    renderMoex,
    renderStocks 
} from './render.js';


document.addEventListener('DOMContentLoaded', () => {
    console.log('%c✅ Экономический дашборд запущен', 'color: #00ff88; font-size: 16px;');

   try{   // Рендерим структуру
    renderAllCurrencies();
    renderCrypto();
    renderStocks();
    initConverter();
    renderMoex();
    initMobileAccordions(); 
    }

    catch (error){
            console.error(`ошибка загрузки блоков`)
    }
    // Инициализируем мультиязычность
    //initI18n(); временно

    // Загружаем курсы в соответствии с выбранной локалью
    loadRates();
});


// В js/main.js или отдельно
const langToggle = document.getElementById('langToggle');
const langDropdown = document.getElementById('langDropdown');

langToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle('show');
});

// Закрытие при клике вне меню
document.addEventListener('click', () => {
    langDropdown.classList.remove('show');
});

document.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', () => {
        const lang = option.dataset.lang;
        setLocale(lang);           // твоя функция смены языка
        langDropdown.classList.remove('show');
    });
});


// Функция для инициализации мобильного аккордеона
function initMobileAccordions() {
    const headers = document.querySelectorAll('.sidebar-content h4');
    
    headers.forEach(header => {
        const content = header.nextElementSibling;
        
        // Проверяем, что контент есть И это НЕ блок с Индексом страха (класс .paragr)
        if (content && !content.classList.contains('paragr')) {
            
            // Даем этому заголовку специальный класс для стилей кнопки
            header.classList.add('accordion-header');
            
            header.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    header.classList.toggle('active');
                    content.classList.toggle('show');
                }
            });
        }
    });
}
