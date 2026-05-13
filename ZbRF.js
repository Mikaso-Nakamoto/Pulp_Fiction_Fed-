
// Основная функция загрузки курсов
async function loadAllRates() {
  try {
    // 1. Загружаем официальные курсы ЦБ РФ
    const cbrRes = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    const cbrData = await cbrRes.json();
    const Valute = cbrData.Valute || {};
    const cbrDate = cbrData.Date;

    // 2. Загружаем недостающие валюты из fawazahmed0
    const extraRes = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/rub.min.json');
    const extraData = await extraRes.json();
    const extraRates = extraData.rub || {};   // курсы относительно 1 RUB

    // Вспомогательная функция
    function updateRate(flagClass, charCode) {
      const element = document.querySelector(`.fi-${flagClass} + .rate`);
      if (!element) return;

      // Сначала пытаемся взять из ЦБ
      if (Valute[charCode]) {
        const value = parseFloat(Valute[charCode].Value);
        const formatted = value.toFixed(4).replace('.', ',');
        element.textContent = `${formatted} ₽`;
        element.style.color = '';
      } 
      // Если нет в ЦБ — берём из fawazahmed0
      else if (extraRates[charCode.toLowerCase()]) {
        const ratePerRub = extraRates[charCode.toLowerCase()];           // сколько foreign за 1 RUB
        const valueInRub = (1 / ratePerRub).toFixed(4);                  // сколько RUB за 1 foreign
        const formatted = valueInRub.replace('.', ',');
        element.textContent = `${formatted} ₽`;
        element.style.color = '#0066cc';   // синий цвет, чтобы было видно, что из другого источника
      } 
      else {
        element.textContent = 'нет данных';
        element.style.color = '#888';
      }
    }

    // === Заполняем все валюты ===
    // Основные
    updateRate('us', 'USD');
    updateRate('eu', 'EUR');
    updateRate('gb', 'GBP');
    updateRate('jp', 'JPY');
    updateRate('cn', 'CNY');
    updateRate('ch', 'CHF');

    // Другие важные
    updateRate('ca', 'CAD');
    updateRate('au', 'AUD');
    updateRate('nz', 'NZD');
    updateRate('se', 'SEK');
    updateRate('no', 'NOK');
    updateRate('dk', 'DKK');
    updateRate('pl', 'PLN');
    updateRate('cz', 'CZK');
    updateRate('hu', 'HUF');

    // Азиатские и ближневосточные
    updateRate('hk', 'HKD');
    updateRate('sg', 'SGD');
    updateRate('kr', 'KRW');
    updateRate('in', 'INR');
    updateRate('tr', 'TRY');
    updateRate('br', 'BRL');
    updateRate('za', 'ZAR');
    updateRate('mx', 'MXN');
    updateRate('th', 'THB');
    updateRate('my', 'MYR');
    updateRate('id', 'IDR');
    updateRate('ph', 'PHP');

    // Ближний Восток
    updateRate('ae', 'AED');
    updateRate('sa', 'SAR');
    updateRate('qa', 'QAR');
    updateRate('kw', 'KWD');
    updateRate('bh', 'BHD');
    updateRate('om', 'OMR');
    updateRate('jo', 'JOD');
    updateRate('il', 'ILS');
    updateRate('eg', 'EGP');

    // СНГ
    updateRate('by', 'BYN');
    updateRate('kz', 'KZT');
    updateRate('ua', 'UAH');
    updateRate('am', 'AMD');
    updateRate('ge', 'GEL');
    updateRate('az', 'AZN');
    updateRate('tj', 'TJS');
    updateRate('uz', 'UZS');

    // Обновляем дату
    const small = document.querySelector('.sidebar-content small');
    if (small) {
      small.innerHTML = `обновлено: ${cbrDate} (ЦБ) + fawazahmed0 • 
        <a href="https://cbr.ru/currency_base/daily/" target="_blank">ЦБ РФ</a>`;
    }

    console.log('✅ Курсы загружены (ЦБ + fawazahmed0)');

  } catch (error) {
    console.error('❌ Ошибка загрузки курсов:', error);
  }
}

// Запуск
document.addEventListener('DOMContentLoaded', loadAllRates);

// Обновление раз в 30 минут (можно реже)
setInterval(loadAllRates, 30 * 60 * 1000);



// === Загрузка курсов с изменением (ЦБ + fawazahmed0) ===
async function loadCBRRatesWithChange() {
  try {
    // 1. Курсы сегодня от ЦБ
    const todayRes = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    const todayData = await todayRes.json();
    const todayValute = todayData.Valute || {};
    const updateDate = todayData.Date;

    // 2. Курсы вчера от ЦБ (только для официальных валют)
    let prevValute = {};
    try {
      const prevRes = await fetch(`https://www.cbr-xml-daily.ru/daily_json.js?date=${todayData.PreviousDate.replace(/\./g, '')}`);
      const prevData = await prevRes.json();
      prevValute = prevData.Valute || {};
    } catch (e) {
      console.warn('Не удалось загрузить вчерашние курсы ЦБ');
    }

    // 3. Дополнительные валюты из fawazahmed0
    let extraRates = {};
    try {
      const extraRes = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/rub.min.json');
      const extraData = await extraRes.json();
      extraRates = extraData.rub || {};
    } catch (e) {
      console.warn('Не удалось загрузить данные из fawazahmed0');
    }

    function updateRateAndChange(charCode) {
      const li = document.querySelector(`li[data-code="${charCode}"]`);
      if (!li) return;

      const rateEl = li.querySelector('.rate');
      const changeEl = li.querySelector('.change');

      // === Если валюта есть в ЦБ ===
      if (todayValute[charCode]) {
        const todayRate = parseFloat(todayValute[charCode].Value);
        rateEl.textContent = todayRate.toFixed(4).replace('.', ',') + ' ₽';

        if (prevValute[charCode]) {
          const prevRate = parseFloat(prevValute[charCode].Value);
          const diff = todayRate - prevRate;
          const percent = ((diff / prevRate) * 100).toFixed(2);

          let arrow = '—';
          let cls = 'zero';

          if (diff > 0.0005) { arrow = '↑'; cls = 'up'; }
          else if (diff < -0.0005) { arrow = '↓'; cls = 'down'; }

          changeEl.innerHTML = `${arrow} ${Math.abs(diff).toFixed(4)} (${percent}%)`;
          changeEl.className = `change ${cls}`;
        } else {
          changeEl.innerHTML = '—';
          changeEl.className = 'change zero';
        }
      } 
      // === Если валюты нет в ЦБ — берём из fawazahmed0 ===
      else if (extraRates[charCode.toLowerCase()]) {
        const ratePerRub = extraRates[charCode.toLowerCase()];
        const rateInRub = (1 / ratePerRub).toFixed(4);
        rateEl.textContent = rateInRub.replace('.', ',') + ' ₽';
        
        changeEl.innerHTML = '<small style="color:#666; font-size:0.85em;">(market)</small>';
        changeEl.className = 'change zero';
      } 
      else {
        rateEl.textContent = 'нет данных';
        changeEl.textContent = '';
      }
    }

    // Список всех валют
    const allCodes = ['USD','EUR','GBP','JPY','CNY','CHF','CAD','AUD','NZD','SEK','NOK','DKK','PLN','CZK','HUF',
                      'HKD','SGD','KRW','INR','TRY','BRL','ZAR','MXN','THB','MYR','IDR','PHP',
                      'AED','SAR','QAR','KWD','BHD','OMR','JOD','ILS','EGP',
                      'BYN','KZT','UAH','AMD','GEL','AZN','TJS','UZS'];

    allCodes.forEach(code => updateRateAndChange(code));

    // Обновляем дату
    document.getElementById('update-date').textContent = updateDate;

  } catch (err) {
    console.error('Ошибка загрузки курсов:', err);
  }
}

// Запуск
document.addEventListener('DOMContentLoaded', loadCBRRatesWithChange);
setInterval(loadCBRRatesWithChange, 30 * 60 * 1000);   // каждые 30 минут