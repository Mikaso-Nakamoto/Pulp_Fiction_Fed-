// js/render.js
import { currencyGroups, cryptoList, moexStocks } from './data.js';

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
            <div style="display: flex; align-items: center; gap: 10px;">
                <span class="fi fi-${item.flag}"></span>
                <span>${item.name}</span> 
            </div>
            <span class="rate" style="font-weight: bold;">загрузка...</span> 
            <div class="change-container">
                <span class="change"></span>
            </div>
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
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center;">
                    <span class="crypto-icon ${item.className}">
                        <img src="iconss/${item.icon}" alt="${item.symbol}" />
                    </span>
                    <span>${item.symbol}</span>
                </div>
                <div style="text-align: right;">
                    <span class="crypto-price" style="font-weight: bold;">загрузка...</span> ${item.unit}
                    <div class="change-container" style="padding-left: 0; margin-top: 0;">
                        <span class="crypto-change"></span>
                    </div>
                </div>
            </div>
            ${item.extra ? `<div style="font-size: 0.8em; color: #888; margin-top: 4px;">${item.extra}</div>` : ''}
        `;
        container.appendChild(li);
    });
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

// ЗАГЛУШКИ ДЛЯ main.js (чтобы он не выдал ошибку)
export function renderMetals() {}
export function renderOilPrices() {}
export function renderGasProducers() {}
export function renderStocks() {}
