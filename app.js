// Helper to convert copper to Gold/Silver/Copper string
function formatCoins(copper) {
  if (typeof copper !== 'number' || copper < 0) return '-';
  const gold = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  const copperRemainder = copper % 100;
  return `${gold}g ${silver}s ${copperRemainder}c`;
}

// Utility to fetch and parse JSON with error handling
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return await res.json();
}

// Clear all active buttons styling
function clearActiveButtons() {
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
}

// Show loading indicator
function showLoading() {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('results').innerHTML = '';
}

// Hide loading indicator
function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

// Show error message in results area
function showError(message) {
  const results = document.getElementById('results');
  results.innerHTML = `<p style="color: red; font-weight:bold;">${message}</p>`;
}

// Fetch Flip data and display top 20 profitable flips
async function fetchFlipData() {
  showLoading();
  try {
    // Get all prices
    const priceData = await fetchJSON('https://api.guildwars2.com/v2/commerce/prices');
    // Filter valid ids only
    const allItemIds = priceData
      .map(entry => entry.id)
      .filter(id => typeof id === 'number' && !isNaN(id))
      .slice(0, 200); // limit to first 200 to reduce load

    // Fetch detailed item info in chunks (max 200 IDs per request)
    const chunkSize = 200;
    const chunks = [];
    for (let i = 0; i < allItemIds.length; i += chunkSize) {
      const chunk = allItemIds.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    const itemDetails = [];
    for (const chunk of chunks) {
      const chunkData = await fetchJSON(`https://api.guildwars2.com/v2/items?ids=${chunk.join(',')}`);
      itemDetails.push(...chunkData);
    }

    // Map id to item details for easy lookup
    const itemMap = new Map(itemDetails.map(item => [item.id, item]));

    // Calculate flips: sell_price - buy_price - fees (15% on sell price)
    const flips = priceData
      .filter(entry => {
        const item = itemMap.get(entry.id);
        if (!item) return false;
        if (item.flags && item.flags.includes('AccountBound')) return false; // exclude bound items
        if (!entry.buys || !entry.sells) return false;
        if (!entry.buys.unit_price || !entry.sells.unit_price) return false;
        return true;
      })
      .map(entry => {
        const buyPrice = entry.buys.unit_price;
        const sellPrice = entry.sells.unit_price;
        const fee = Math.floor(sellPrice * 0.15);
        const profit = sellPrice - buyPrice - fee;
        return {
          id: entry.id,
          name: itemMap.get(entry.id).name,
          buyPrice,
          sellPrice,
          fee,
          profit,
        };
      })
      .filter(flip => flip.profit > 0) // only positive profit
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 20); // top 20

    hideLoading();

    if (flips.length === 0) {
      document.getElementById('results').innerHTML = '<p>No profitable flips found.</p>';
      return;
    }

    // Build table
    let html = `<table><thead><tr>
      <th>Item</th>
      <th>Buy Order</th>
      <th>Sell Listing</th>
      <th>Fee</th>
      <th>Profit</th>
      </tr></thead><tbody>`;

    for (const flip of flips) {
      html += `<tr>
        <td>${flip.name}</td>
        <td>${formatCoins(flip.buyPrice)}</td>
        <td>${formatCoins(flip.sellPrice)}</td>
        <td>${formatCoins(flip.fee)}</td>
        <td>${formatCoins(flip.profit)}</td>
      </tr>`;
    }
    html += '</tbody></table>';

    document.getElementById('results').innerHTML = html;
  } catch (e) {
    hideLoading();
    showError('Failed to load data: ' + e.message);
  }
}

// Placeholder for other modes
async function notImplemented() {
  showError('Logic not yet implemented for this mode.');
  hideLoading();
}

// Setup event listeners
function setupButtons() {
  document.getElementById('flip-btn').addEventListener('click', async () => {
    clearActiveButtons();
    document.getElementById('flip-btn').classList.add('active');
    await fetchFlipData();
  });

  document.getElementById('craft-btn').addEventListener('click', async () => {
    clearActiveButtons();
    document.getElementById('craft-btn').classList.add('active');
    showLoading();
    setTimeout(() => {
      notImplemented();
    }, 500);
  });

  document.getElementById('salvage-btn').addEventListener('click', async () => {
    clearActiveButtons();
    document.getElementById('salvage-btn').classList.add('active');
    showLoading();
    setTimeout(() => {
      notImplemented();
    }, 500);
  });

  document.getElementById('forge-btn').addEventListener('click', async () => {
    clearActiveButtons();
    document.getElementById('forge-btn').classList.add('active');
    showLoading();
    setTimeout(() => {
      notImplemented();
    }, 500);
  });
}

window.onload = () => {
  setupButtons();
};
