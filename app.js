// Utility: Fetch JSON helper with error handling
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Show loading UI
function showLoading() {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('results').innerHTML = '';
}

// Hide loading UI
function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

// Convert copper to gold.silver.copper string
function formatCoins(copper) {
  if (typeof copper !== 'number' || copper < 0) return '0c';
  const gold = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  const copperRemainder = copper % 100;
  let result = '';
  if (gold) result += gold + 'g ';
  if (silver) result += silver + 's ';
  if (copperRemainder || (!gold && !silver)) result += copperRemainder + 'c';
  return result.trim();
}

// Fetch Flip data and display top 20 profitable flips
async function fetchFlipData() {
  showLoading();

  // Manage button active state
  document.getElementById('flip-btn').classList.add('active');

  try {
    // Get all prices
    const priceData = await fetchJSON('https://api.guildwars2.com/v2/commerce/prices');

    // Filter valid ids only and limit to first 200
    const allItemIds = priceData
      .map(entry => entry.id)
      .filter(id => typeof id === 'number' && !isNaN(id))
      .slice(0, 200);

    // Fetch item details in batches (max 200 per request)
    const chunkSize = 100;
    let itemDetails = [];
    for (let i = 0; i < allItemIds.length; i += chunkSize) {
      const chunk = allItemIds.slice(i, i + chunkSize);
      const url = `https://api.guildwars2.com/v2/items?ids=${chunk.join(',')}`;
      const detailsChunk = await fetchJSON(url);
      itemDetails = itemDetails.concat(detailsChunk);
    }

    // Map item id -> details for easy lookup
    const detailsMap = {};
    itemDetails.forEach(item => {
      detailsMap[item.id] = item;
    });

    // Calculate profit and filter out account bound and invalid items
    const profitableItems = priceData
      .map(entry => {
        const details = detailsMap[entry.id];
        if (!details || details.flags.includes('AccountBound')) return null; // exclude account bound

        const buyPrice = entry.buys?.unit_price || 0;
        const sellPrice = entry.sells?.unit_price || 0;
        if (buyPrice <= 0 || sellPrice <= 0) return null;

        // Profit after 15% trading post fee on sell price
        const profit = sellPrice * 0.85 - buyPrice;
        if (profit <= 0) return null;

        return {
          id: entry.id,
          name: details.name,
          buyPrice,
          sellPrice,
          profit,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 20);

    // Display results
    if (profitableItems.length === 0) {
      document.getElementById('results').innerHTML = '<p>No profitable flips found.</p>';
    } else {
      let html = `<table class="results-table">
        <thead><tr>
          <th>Item Name</th><th>Buy Order</th><th>Sell Price</th><th>Profit</th>
        </tr></thead><tbody>`;
      profitableItems.forEach(item => {
        html += `<tr>
          <td>${item.name}</td>
          <td>${formatCoins(item.buyPrice)}</td>
          <td>${formatCoins(item.sellPrice)}</td>
          <td>${formatCoins(Math.floor(item.profit))}</td>
        </tr>`;
      });
      html += '</tbody></table>';
      document.getElementById('results').innerHTML = html;
    }
  } catch (error) {
    document.getElementById('results').innerHTML = `<p class="error">Failed to load data: ${error.message}</p>`;
  } finally {
    hideLoading();
    document.getElementById('flip-btn').classList.remove('active');
  }
}

// Attach event listener to Flip button
document.getElementById('flip-btn').addEventListener('click', fetchFlipData);
