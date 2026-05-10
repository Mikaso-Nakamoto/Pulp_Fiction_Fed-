// js/rates.js
export async function loadCBRRatesWithChange() {
    try {
        const todayRes = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
        const todayData = await todayRes.json();
        const todayValute = todayData.Valute || {};
        const updateDate = todayData.Date;

        // Вчерашние курсы
        let prevValute = {};
        try {
            const prevRes = await fetch(`https://www.cbr-xml-daily.ru/daily_json.js?date=${todayData.PreviousDate.replace(/\./g, '')}`);
            const prevData = await prevRes.json();
            prevValute = prevData.Valute || {};
        } catch (e) {
            console.warn('Не удалось загрузить вчерашние курсы');
        }

        function updateRateAndChange(charCode) {
            const li = document.querySelector(`li[data-code="${charCode}"]`);
            if (!li) return;

            const rateEl = li.querySelector('.rate');
            const changeEl = li.querySelector('.change');

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
                    changeEl.textContent = '—';
                }
            } else {
                rateEl.textContent = '—';
                changeEl.textContent = '';
            }
        }

        const allCodes = ['USD','EUR','GBP','JPY','CNY','CHF','CAD','AUD','NZD','SEK','NOK','DKK','PLN','CZK','HUF',
                         'HKD','SGD','KRW','INR','TRY','BRL','ZAR','MXN','THB','MYR','IDR','PHP',
                         'AED','SAR','QAR','KWD','BHD','OMR','JOD','ILS','EGP',
                         'BYN','KZT','UAH','AMD','GEL','AZN','TJS','UZS'];

        allCodes.forEach(code => updateRateAndChange(code));

        // Обновляем дату
        const dateEl = document.getElementById('update-date');
        if (dateEl) dateEl.textContent = updateDate;

        console.log('✅ Курсы валют обновлены');

    } catch (err) {
        console.error('❌ Ошибка загрузки курсов ЦБ:', err);
    }
}