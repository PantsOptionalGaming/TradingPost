const API_BASE = 'https://api.guildwars2.com/v2';
const TP_LISTINGS = `${API_BASE}/commerce/listings`;
const TP_PRICES = `${API_BASE}/commerce/prices`;
const RECIPES = `${API_BASE}/recipes`;
const FORGE_RECIPES = `${API_BASE}/recipes`; // No specific forge endpoint exists, this is the right one

let itemsData = [];
let listingsData = [];
let pricesData = [];
let recipesData = [];

const resultsEl = document.getElementById('results');

function showLoading(show) {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.style.display = show ? 'block' : 'none';
}

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

async function loadAllData() {
  try {
    showLoading(true);
    resultsEl.innerHTML = ''; // clear old content

    const [
      itemIds,
      listings,
      prices,
      recipes
    ] = await Promise.all([
      fetchJSON(`${API_BASE}/items?ids=all`),
      fetchJSON(TP_LISTINGS),
      fetchJSON(TP_PRICES),
      fetchJSON(RECIPES)
    ]);

    itemsData = itemIds;
    listingsData = listings;
    pricesData = prices;
    recipesData = recipes;

    resultsEl.innerHTML = '<p style="color:lime">✅ Data loaded successfully. Click a button to begin.</p>';
  } catch (err) {
    console.error('Data Load Error:', err);
    resultsEl.innerHTML = `<p style="color:red">❌ Failed to load data: ${err.message}</p>`;
  } finally {
    showLoading(false);
  }
}

// Example button handlers
document.getElementById('flip-btn').addEventListener('click', () => {
  showLoading(true);
  resultsEl.innerHTML = '';
  setTimeout(() => {
    displayFlipResults(); // Your custom function that analyzes data
    showLoading(false);
  }, 500);
});

document.getElementById('craft-btn').addEventListener('click', () => {
  showLoading(true);
  resultsEl.innerHTML = '';
  setTimeout(() => {
    displayCraftResults(); // Your custom function that analyzes data
    showLoading(false);
  }, 500);
});

// You can define other buttons (Salvage, Mystic Forge) below similarly

// Run data fetch on load
window.addEventListener('load', loadAllData);
