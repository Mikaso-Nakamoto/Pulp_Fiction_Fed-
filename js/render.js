// js/render.js
import { currencyGroups, cryptoList, oilPrices, gasProducers, metalsList, stocksArr } from './data.js';
export function renderAllCurrencies() {
    renderCurrencyGroup(`currencies-major`, currencyGroups.major);
    renderCurrencyGroup(`currencies-other`, currencyGroups.other);
    renderCurrencyGroup(`currencies-asia`, currencyGroups.asia);
    renderCurrencyGroup(`currencies-middleeast`, currencyGroups.middleEast);
    renderCurrencyGroup(`currencies-cis`, currencyGroups.cis);
}

function renderCurrencyGroup(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ``;

    items.forEach(item => {
        const li = document.createElement('li');
        li.dataset.code = item.code;
        li.innerHTML = `
            <span class="fi fi-${item.flag}"></span>
            ${item.name} — 
            <span class="rate">00,0000 ₽</span> 
            <span class="change"></span>
        `;
        container.appendChild(li);
    });
}


export function renderCrypto() {
    const container = document.getElementById('CriptoVVV');
    if (!container) return;
    container.innerHTML = ``;

    cryptoList.forEach(item => {
        const li = document.createElement('li');
        li.dataset.symbol = item.symbol;

        li.innerHTML = `
            <span class="crypto-icon ${item.className}">
                <img src="/iconss/${item.icon}" alt="${item.symbol}" />
            </span>
            ${item.symbol} — 
            <span class="crypto-price">${item.price}</span> ${item.unit}
            ${item.extra || ''}
        `;

        container.appendChild(li);
    });
}

export function renderOilPrices() {
    const container = document.getElementById(`oil-prices`);
    if (!container) return;
    container.innerHTML = ``;

    oilPrices.forEach(item => {
        const li = document.createElement(`li`);
        li.dataset.name = item.name;
        li.innerHTML = `${item.name} — <span class="oil-price">${item.price}</span> ${item.unit} ${item.extra ? `<small>${item.extra}</small>` : ``}`;
        container.appendChild(li);
    });
}

export function renderGasProducers() {
    const container = document.getElementById(`gas-producers`);
    if (!container) return;
    container.innerHTML = ``;

    gasProducers.forEach(item => {
        const li = document.createElement(`li`);
        li.innerHTML = `${item.name} — <span class="gas-price">${item.price}</span> ${item.unit}`;
        container.appendChild(li);
    });
}

export function renderMetals() {
    const container = document.getElementById(`metals-list`);
    if (!container) return;
    container.innerHTML = '';

    metalsList.forEach(item => {
        const li = document.createElement(`li`);
        li.dataset.symbol = item.symbol;
        li.innerHTML = `${item.name} (${item.symbol}) — <span class="metal-price">${item.price}</span> ${item.unit}`;
        container.appendChild(li);
    });
}

export function renderStocks() {
    const container = document.getElementById('stocks');
    if (!container) return;
    container.innerHTML = '';

    stocksArr.forEach(stock => {
        const li = document.createElement(`li`);
        li.innerText = `${stock.title} — ${stock.value} ${stock.typeOfValue}`;
        container.appendChild(li);
    });
}

console.log(`Render.ja download`)
window.testRender = (renderAllCurrencies, renderCrypto)