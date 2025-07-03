const API_BASE = 'https://api.guildwars2.com/v2';
const TP_LISTINGS = `${API_BASE}/commerce/listings`;
const TP_PRICES = `${API_BASE}/commerce/prices`;
const RECIPES = `${API_BASE}/recipes`;
const FORGE_RECIPES = `${API_BASE}/recipes`; // correct endpoint for recipes

let itemsData = [];
let listingsData = [];
let pricesData = [];
let recipesData = [];

const resultsEl = document.getElementById('results');
const loadingEl = document.getElementById('loading');

function showLoading(show) {
  loadingEl.classList.toggle('hidden', !show);
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function loadAllData() {
  showLoading(true);
  resultsEl.innerHTML = '';

  try {
    const [itemIds, listings, prices, recipes] = await Promise.all([
      fetchJSON(`${API_BASE}/items?ids=all`),
      fetchJSON(TP_LISTINGS),
      fetchJSON(TP_PRICES),
      fetchJSON(RECIPES),
    ]);

    itemsData = itemIds;
    listingsData = listings;
    pricesData = prices;
    recipesData = recipes;

    resultsEl.innerHTML = `<p style="color:#3ea6ff">✅ Data loaded successfully. Click a button below.</p>`;
  } catch (err) {
    resultsEl.innerHTML = `<p style="color:red">❌ Failed to load data: ${err.message}</p>`;
  } finally {
    showLoading(false);
  }
}

function copperToGSC(copper) {
  const g = Math.floor(copper / 10000);
  const s = Math.floor((copper % 10000) / 100);
  const c = copper % 100;
  return `${g}g ${s}s ${c}c`;
}

function getListingData(id) {
  return listingsData.find(item => item.id === id);
}

function getPriceData(id) {
  return pricesData.find(item => item.id === id);
}

function calcFlipList() {
  const profits = [];

  for (let i = 0; i < itemsData.length; i++) {
    const itemId = itemsData[i];
    const listing = getListingData(itemId);
    if (!listing || listing.buy_order.unit_price === 0) continue;

    const priceData = getPriceData(itemId);
    if (!priceData || priceData.sells.unit_price === 0) continue;

    const buy = listing.buy_order.unit_price;
    const sell = priceData.sells.unit_price;
    const fee = Math.floor(sell * 0.15);
    const profit = sell - fee - buy;

    if (profit > 0) profits.push({ id: itemId, buy, sell, profit });
  }
  profits.sort((a, b) => b.profit - a.profit);
  return profits.slice(0, 20); // top 20
}

async function displayFlipResults() {
  showLoading(true);
  resultsEl.innerHTML = '';

  const flipList = calcFlipList();
  if (!flipList.length) {
    resultsEl.innerHTML = `<p style="color:#ff8c00">No profitable flips found.</p>`;
    showLoading(false);
    return;
  }

  const itemDetails = await Promise.all(
    flipList.map(f => fetchJSON(`${API_BASE}/items/${f.id}`))
  );

  let html = '<table><thead><tr><th>Item</th><th>Buy Order</th><th>Sell Listing</th><th>Profit</th></tr></thead><tbody>';
  flipList.forEach((f, idx) => {
    const name = itemDetails[idx]?.name || 'Unknown';
    html += `<tr>
      <td>${name}</td>
      <td>${copperToGSC(f.buy)}</td>
      <td>${copperToGSC(f.sell)}</td>
      <td>${copperToGSC(f.profit)}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  resultsEl.innerHTML = html;
  showLoading(false);
}

document.getElementById('flip-btn').addEventListener('click', () => {
  setActive('flip');
  displayFlipResults();
});

// Placeholder handlers
document.getElementById('craft-btn').addEventListener('click', () => setActive('craft'));
document.getElementById('salvage-btn').addEventListener('click', () => setActive('salvage'));
document.getElementById('forge-btn').addEventListener('click', () => setActive('forge'));

function setActive(mode) {
  ['flip-btn','craft-btn','salvage-btn','forge-btn'].forEach(id => {
    document.getElementById(id).classList.toggle('active', id === mode + '-btn');
  });
}

window.addEventListener('load', loadAllData);
