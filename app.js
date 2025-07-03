const loading = document.getElementById('loading');
const results = document.getElementById('results');

document.getElementById('flip-btn').addEventListener('click', () => {
  showLoading();
  fetchFlipData();
});

document.getElementById('craft-btn').addEventListener('click', () => {
  showLoading();
  showComingSoon('Crafting logic not yet implemented.');
});

document.getElementById('salvage-btn').addEventListener('click', () => {
  showLoading();
  showComingSoon('Salvage logic not yet implemented.');
});

document.getElementById('forge-btn').addEventListener('click', () => {
  showLoading();
  showComingSoon('Mystic Forge logic not yet implemented.');
});

function showLoading() {
  loading.style.display = 'block';
  results.innerHTML = '';
}

function hideLoading() {
  loading.style.display = 'none';
}

function showComingSoon(msg) {
  hideLoading();
  results.innerHTML = `<p>${msg}</p>`;
}

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

async function fetchFlipData() {
  try {
    const priceData = await fetchJSON('https://api.guildwars2.com/v2/commerce/prices');
  const allItemIds = priceData
    .map(entry => entry.id)
    .filter(id => typeof id === 'number' && !isNaN(id))
    .slice(0, 200);


    const detailChunks = [];
    for (let i = 0; i < allItemIds.length; i += 100) {
      const chunk = allItemIds.slice(i, i + 100);
      const details = await fetchJSON(`https://api.guildwars2.com/v2/items?ids=${chunk.join(',')}`);
      detailChunks.push(...details);
    }

    const combined = priceData
      .filter(p => allItemIds.includes(p.id) && p.buys.unit_price > 0 && p.sells.unit_price > 0)
      .map(p => {
        const detail = detailChunks.find(d => d.id === p.id);
        const profitRaw = p.sells.unit_price * 0.85 - p.buys.unit_price;
        return {
          id: p.id,
          name: detail?.name || 'Unknown',
          icon: detail?.icon || '',
          buy: p.buys.unit_price,
          sell: p.sells.unit_price,
          profit: profitRaw
        };
      })
      .filter(item => item.profit > 0)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 20);

    displayResults(combined);
  } catch (err) {
    hideLoading();
    results.innerHTML = `<p style="color:red;">Failed to load data: ${err.message}</p>`;
  }
}

function displayResults(items) {
  hideLoading();
  if (!items.length) {
    results.innerHTML = '<p>No profitable items found.</p>';
    return;
  }

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Item</th>
        <th>Buy Order</th>
        <th>Sell Price</th>
        <th>Profit</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
        <tr>
          <td>
            <img src="${item.icon}" alt="${item.name}" width="24" height="24" style="vertical-align:middle; margin-right:8px;" />
            ${item.name}
          </td>
          <td>${formatCurrency(item.buy)}</td>
          <td>${formatCurrency(item.sell)}</td>
          <td style="color:lime;">${formatCurrency(item.profit)}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
  results.appendChild(table);
}

function formatCurrency(value) {
  const gold = Math.floor(value / 10000);
  const silver = Math.floor((value % 10000) / 100);
  const copper = value % 100;

  return `${gold}🪙 ${silver}🥈 ${copper}🥉`;
}
