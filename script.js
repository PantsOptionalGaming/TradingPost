
async function fetchData(type) {
  const results = document.getElementById("results");
  results.innerHTML = "<p>Loading " + type + " data...</p>";

  try {
    if (type === 'flip') {
      const res = await fetch('https://api.guildwars2.com/v2/commerce/prices');
      const ids = await res.json();
      const sampleIds = ids.slice(0, 50); // For demo
      const prices = await Promise.all(sampleIds.map(id => fetch(`https://api.guildwars2.com/v2/commerce/prices/${id}`).then(r => r.json())));
      const items = await Promise.all(sampleIds.map(id => fetch(`https://api.guildwars2.com/v2/items/${id}`).then(r => r.json())));

      const data = prices.map((p, i) => {
        const item = items[i];
        const buy = p.buys.unit_price;
        const sell = p.sells.unit_price;
        const profit = Math.floor(sell * 0.85) - buy;
        return { name: item.name, buy, sell, profit };
      });

      const sorted = data.filter(i => i.profit > 50).sort((a, b) => b.profit - a.profit).slice(0, 20);

      results.innerHTML = "<h2>Top 20 Flip Opportunities</h2><ul>" +
        sorted.map(i => `<li><strong>${i.name}</strong>: Buy @ ${i.buy}, Sell @ ${i.sell}, Profit = ${i.profit}</li>`).join("") +
        "</ul>";
    } else {
      results.innerHTML = "<p>" + type + " feature coming soon...</p>";
    }
  } catch (err) {
    console.error("Error fetching data", err);
    results.innerHTML = "<p>Error loading data.</p>";
  }
}
