const API_BASE = 'https://api.guildwars2.com/v2';
const TP_BASE = 'https://api.guildwars2.com/v2/commerce/listings';
const TP_PRICES = 'https://api.guildwars2.com/v2/commerce/prices';
const RECIPES = 'https://api.guildwars2.com/v2/recipes';
const FORGE_RECIPES = 'https://api.guildwars2.com/v2/mystic-forge/recipes';

const MODES = ['flip', 'craft', 'salvage', 'forge'];
const RESULTS_LIMIT = 20;

const loadingEl = document.getElementById('loading');
const resultsEl = document.getElementById('results');
const buttons = {
  flip: document.getElementById('flip-btn'),
  craft: document.getElementById('craft-btn'),
  salvage: document.getElementById('salvage-btn'),
  forge: document.getElementById('forge-btn')
};

let itemsData = null;
let listingsData = null;
let recipesData = null;
let forgeRecipesData = null;
let pricesData = null;

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function copperToGoldSilverCopper(copper) {
  const gold = Math.floor(copper / 10000);
  copper -= gold * 10000;
  const silver = Math.floor(copper / 100);
  copper -= silver * 100;
  return `${gold}g ${silver}s ${copper}c`;
}

function showLoading(show) {
  loadingEl.classList.toggle('hidden', !show);
}

function clearResults() {
  resultsEl.innerHTML = '';
}

function setActiveButton(mode) {
  MODES.forEach(m => {
    buttons[m].classList.toggle('active', m === mode);
  });
}

async function loadAllData() {
  showLoading(true);

  // Parallel fetch
  const [
    items,
    listings,
    recipes,
    forgeRecipes,
    prices
  ] = await Promise.all([
    fetchJSON(`${API_BASE}/items`),
    fetchJSON(`${TP_BASE}`),
    fetchJSON(`${RECIPES}`),
    fetchJSON(`${FORGE_RECIPES}`),
    fetchJSON(`${TP_PRICES}`)
  ]);

  itemsData = items;
  listingsData = listings;
  recipesData = recipes;
  forgeRecipesData = forgeRecipes;
  pricesData = prices;

  showLoading(false);
}

function isAccountBound(item) {
  if (!item) return true; // safety
  return item.flags && item.flags.includes('AccountBound');
}

function getListing(id) {
  return listingsData.find(l => l.id === id);
}

function getPrice(id) {
  return pricesData.find(p => p.id === id);
}

// Profit calculations:

function calcFlipProfit(itemId) {
  const listing = getListing(itemId);
  const price = getPrice(itemId);
  if (!listing || !price) return null;

  // Use buy_order (what you pay) and sell_listing (what you sell for)
  const buyOrder = listing.buy_order?.unit_price ?? 0;
  const sellListing = listing.sells?.unit_price ?? 0;
  if (buyOrder === 0 || sellListing === 0) return null;

  // 15% TP fee on selling price
  const fee = Math.floor(sellListing * 0.15);
  const profit = sellListing - fee - buyOrder;
  return profit > 0 ? { profit, buyOrder, sellListing } : null;
}

function calcCraftProfit(itemId) {
  if (!recipesData.includes(itemId)) return null;

  // Get recipe detail
  // Note: The API has /v2/recipes/{id} not item id but recipe id
  // We'll skip deep crafting logic here for now, will improve later
  return null;
}

function calcSalvageProfit(itemId) {
  // Needs salvage expected values — complex, placeholder null
  return null;
}

function calcForgeProfit(itemId) {
  // Complex mystic forge calc placeholder
  return null;
}

async function displayFlip() {
  setActiveButton('flip');
  clearResults();
  showLoading(true);

  // Fetch detailed item info for all item IDs
  // To reduce API calls, limit to a smaller subset
  const topItems = [];

  for (let i = 0; i < itemsData.length && topItems.length < RESULTS_LIMIT * 3; i++) {
    const itemId = itemsData[i];
    try {
      const itemDetail = await fetchJSON(`${API_BASE}/items/${itemId}`);
      if (isAccountBound(itemDetail)) continue;
      const profitData = calcFlipProfit(itemId);
      if (profitData) {
        topItems.push({ id: itemId, name: itemDetail.name, ...profitData });
      }
    } catch (e) {
      continue;
    }
  }

  // Sort descending profit
  topItems.sort((a, b) => b.profit - a.profit);

  // Display top RESULTS_LIMIT items
  const shownItems = topItems.slice(0, RESULTS_LIMIT);

  if (shownItems.length === 0) {
    resultsEl.textContent = 'No profitable flips found.';
  } else {
    const table = document.createElement('table');
    table.innerHTML = `
      <thead><tr>
        <th>Item</th><th>Buy Order</th><th>Sell Listing</th><th>Profit</th>
      </tr></thead>
      <tbody>
        ${shownItems.map(item => `
          <tr>
            <td>${item.name}</td>
            <td>${copperToGoldSilverCopper(item.buyOrder)}</td>
            <td>${copperToGoldSilverCopper(item.sellListing)}</td>
            <td>${copperToGoldSilverCopper(item.profit)}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    resultsEl.appendChild(table);
  }
  showLoading(false);
}

// TODO: implement craft, salvage, forge display

buttons.flip.addEventListener('click', () => displayFlip());
buttons.craft.addEventListener('click', () => alert('Craft feature not implemented yet.'));
buttons.salvage.addEventListener('click', () => alert('Salvage feature not implemented yet.'));
buttons.forge.addEventListener('click', () => alert('Mystic Forge feature not implemented yet.'));

// Initial load all data on page load:
window.onload = () => {
  loadAllData().catch(e => {
    showLoading(false);
    resultsEl.textContent = 'Failed to load data: ' + e.message;
  });
};
