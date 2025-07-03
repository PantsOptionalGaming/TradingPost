const loading = document.getElementById('loading');
const table = document.getElementById('results');

function loadFlips() {
  table.innerHTML = '';
  loading.style.display = 'block';

  fetch("https://api.guildwars2.com/v2/commerce/prices")
    .then(res => res.json())
    .then(ids => {
      const sample = ids.slice(0, 100); // Sample first 100
      return fetch(`https://api.guildwars2.com/v2/commerce/prices?ids=${sample.join(',')}`);
    })
    .then(res => res.json())
    .then(prices => {
      const profitable = prices.map(p => {
        const sellPrice = p.sells.unit_price;
        const buyPrice = p.buys.unit_price;
        const profit = Math.floor(sellPrice * 0.85) - buyPrice;
        return { id: p.id, buyPrice, sellPrice, profit };
      }).filter(p => p.profit > 50);

      return Promise.all(profitable.slice(0, 20).map(p =>
        fetch(`https://api.guildwars2.com/v2/items/${p.id}`)
          .then(res => res.json())
          .then(item => ({ ...p, name: item.name }))
      ));
    })
    .then(items => {
      loading.style.display = 'none';
      if (!items.length) return table.innerHTML = '<tr><td>No profitable items found</td></tr>';

      table.innerHTML = '<tr><th>Item</th><th>Buy Price</th><th>Sell Price</th><th>Profit</th></tr>';
      items.forEach(i => {
        table.innerHTML += `<tr>
          <td>${i.name}</td>
          <td>${copper(i.buyPrice)}</td>
          <td>${copper(i.sellPrice)}</td>
          <td>${copper(i.profit)}</td>
        </tr>`;
      });
    })
    .catch(err => {
      loading.style.display = 'none';
      table.innerHTML = `<tr><td>Error: ${err.message}</td></tr>`;
    });
}

function loadCrafts() {
  table.innerHTML = '';
  loading.style.display = 'block';
  table.innerHTML = '<tr><td>Crafting profit calculation coming soon...</td></tr>';
  loading.style.display = 'none';
}

function copper(value) {
  if (!value) return '0c';
  const gold = Math.floor(value / 10000);
  const silver = Math.floor((value % 10000) / 100);
  const copper = value % 100;
  return \`\${gold}g \${silver}s \${copper}c\`;
}