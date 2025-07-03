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

async function handleCraft() {
  showLoading(true);

  try {
    const recipes = await fetchJSON('https://api.guildwars2.com/v2/recipes');
    const limitedRecipes = recipes.slice(0, 200); // Limit to first 200 recipes for speed

    const recipeData = await fetchJSON(`https://api.guildwars2.com/v2/recipes?ids=${limitedRecipes.join(',')}`);
    const itemIds = [...new Set(recipeData.map(r => r.output_item_id).concat(recipeData.flatMap(r => r.ingredients.map(i => i.item_id))))];

    const [itemDetails, prices] = await Promise.all([
      fetchJSON(`https://api.guildwars2.com/v2/items?ids=${itemIds.join(',')}`),
      fetchJSON(`https://api.guildwars2.com/v2/commerce/prices?ids=${itemIds.join(',')}`)
    ]);

    const priceMap = Object.fromEntries(prices.map(p => [p.id, p]));
    const itemMap = Object.fromEntries(itemDetails.map(i => [i.id, i]));

    const profits = [];

    for (const recipe of recipeData) {
      const outputPrice = priceMap[recipe.output_item_id];
      const outputItem = itemMap[recipe.output_item_id];

      if (!outputPrice || !outputPrice.sells || !outputPrice.sells.unit_price || outputItem.flags?.includes('AccountBound')) continue;

      const sellPrice = outputPrice.sells.unit_price;
      const sellAfterFee = Math.floor(sellPrice * 0.85);

      let cost = 0;
      let missing = false;

      for (const ing of recipe.ingredients) {
        const p = priceMap[ing.item_id];
        if (!p || !p.buys || !p.buys.unit_price) {
          missing = true;
          break;
        }
        cost += p.buys.unit_price * ing.count;
      }

      if (missing) continue;

      const profit = sellAfterFee - cost;
      if (profit > 0) {
        profits.push({
          name: outputItem.name,
          profit,
          cost,
          sell: sellPrice,
          ingredients: recipe.ingredients.map(i => {
            const ingItem = itemMap[i.item_id];
            const ingPrice = priceMap[i.item_id]?.buys?.unit_price || 0;
            return `${i.count}x ${ingItem?.name || 'Unknown'} @ ${formatCopper(ingPrice)}`;
          }).join(', ')
        });
      }
    }

    profits.sort((a, b) => b.profit - a.profit);
    const top = profits.slice(0, 20);

    showResults(top, 'Crafting');
  } catch (err) {
    showError("Error loading crafting data: " + err.message);
  }

  showLoading(false);
}
