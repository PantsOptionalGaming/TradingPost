const loading = document.getElementById('loading');
const results = document.getElementById('results');

function showLoading() {
  loading.style.display = 'block';
  results.innerHTML = '';
}

function hideLoading() {
  loading.style.display = 'none';
}

function showResults(items) {
  if (!items.length) {
    results.innerHTML = '<p>No profitable items found.</p>';
    return;
  }
  results.innerHTML = items.map(item => `
    <div class="result-item">
      <strong>${item.name}</strong><br/>
      Buy: ${item.buy}c | Sell: ${item.sell}c | Profit: ${item.profit}c
    </div>
  `).join('');
}

async function loadFlips() {
  showLoading();
  try {
    const listingsRes = await fetch('https://api.guildwars2.com/v2/commerce/listings');
    const ids = await listingsRes.json();
    const sampleIds = ids.slice(0, 20);

    const [items, prices] = await Promise.all([
      fetch(`https://api.guildwars2.com/v2/items?ids=${sampleIds.join(',')}`).then(r => r.json()),
      fetch(`https://api.guildwars2.com/v2/commerce/prices?ids=${sampleIds.join(',')}`).then(r => r.json())
    ]);

    const resultsData = sampleIds.map(id => {
      const item = items.find(i => i.id === id);
      const price = prices.find(p => p.id === id);
      if (!item || !price || !price.buys.unit_price || !price.sells.unit_price) return null;

      const buy = price.buys.unit_price;
      const sell = price.sells.unit_price;
      const afterFees = Math.floor(sell * 0.85);
      const profit = afterFees - buy;

      return {
        name: item.name,
        buy: buy,
        sell: sell,
        profit: profit
      };
    }).filter(item => item && item.profit > 0);

    hideLoading();
    showResults(resultsData.sort((a, b) => b.profit - a.profit));
  } catch (err) {
    hideLoading();
    results.innerHTML = '<p>Error fetching data. Try again later.</p>';
    console.error(err);
  }
}

function loadCrafts() {
  showLoading();
  setTimeout(() => {
    hideLoading();
    results.innerHTML = '<p>Crafting logic not implemented yet.</p>';
  }, 1000);
}

function loadSalvage() {
  showLoading();
  setTimeout(() => {
    hideLoading();
    results.innerHTML = '<p>Salvage logic not implemented yet.</p>';
  }, 1000);
}

function loadForge() {
  showLoading();
  setTimeout(() => {
    hideLoading();
    results.innerHTML = '<p>Mystic Forge logic not implemented yet.</p>';
  }, 1000);
}

function loadTrending() {
  showLoading();
  setTimeout(() => {
    hideLoading();
    results.innerHTML = '<p>Trending logic not implemented yet.</p>';
  }, 1000);
}