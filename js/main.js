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

   try {   
        renderAllCurrencies();
        renderCrypto();
        renderStocks();
        initConverter();
        renderMoex();
        
        initMobileAccordions(); // Наш аккордеон из прошлого шага
        initMobileConverter();  // <---- ДОБАВЛЯЕМ СЮДА
    
    } catch (error) {
        console.error(`ошибка загрузки блоков:`, error);
    }
    
    // initI18n();
    // loadRates();
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

// Функция для мобильных всплывающих списков конвертера
function initMobileConverter() {
    // Находим кнопки-флаги (их две: отдаю и получаю)
    const headers = document.querySelectorAll('.exchange-card .currency-header');
    
    // Находим сами списки
    const fromDropdown = document.querySelector('.currency-selector.left');
    const toDropdown = document.querySelector('.currency-selector.right');

    if (headers.length < 2) return;

    // Клик по первой кнопке (Отдаю)
    headers[0].addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.stopPropagation();
            fromDropdown.classList.add('show-modal');
            toDropdown.classList.remove('show-modal');
            document.body.classList.add('modal-open');
        }
    });

    // Клик по второй кнопке (Получаю)
    headers[1].addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.stopPropagation();
            toDropdown.classList.add('show-modal');
            fromDropdown.classList.remove('show-modal');
            document.body.classList.add('modal-open');
        }
    });

    // Закрываем окно, когда пользователь выбрал валюту
    document.querySelectorAll('.currency-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                fromDropdown.classList.remove('show-modal');
                toDropdown.classList.remove('show-modal');
                document.body.classList.remove('modal-open');
            }
        });
    });

    // Закрываем окно при клике мимо него (на темный фон)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && document.body.classList.contains('modal-open')) {
            // Если клик был НЕ по списку валют
            if (!e.target.closest('.currency-selector')) {
                fromDropdown.classList.remove('show-modal');
                toDropdown.classList.remove('show-modal');
                document.body.classList.remove('modal-open');
            }
        }
    });
}