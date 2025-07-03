const apiBase = "https://api.guildwars2.com/v2";

function showLoading(show) {
  document.getElementById("loading").style.display = show ? "block" : "none";
}

function loadFlip() {
  showLoading(true);
  fetch(apiBase + "/commerce/prices")
    .then(res => res.json())
    .then(async ids => {
      const subset = ids.slice(0, 100); // limit for demo
      const data = await Promise.all(subset.map(id =>
        fetch(apiBase + "/commerce/prices/" + id).then(r => r.json())
      ));
      const items = await Promise.all(subset.map(id =>
        fetch(apiBase + "/items/" + id).then(r => r.json())
      ));

      const results = data.map((d, i) => {
        const item = items[i];
        if (!item || item.flags.includes("AccountBound") || !d.buys || !d.sells) return null;
        const buy = d.buys.unit_price;
        const sell = d.sells.unit_price;
        const profit = Math.floor(sell * 0.85 - buy); // 15% TP fee
        return { name: item.name, buy, sell, profit };
      }).filter(x => x && x.profit > 10);

      results.sort((a, b) => b.profit - a.profit);
      renderResults("Top Flip Items", results.slice(0, 20));
    })
    .catch(err => {
      document.getElementById("results").innerHTML = "Error loading flip data.";
    })
    .finally(() => showLoading(false));
}

function loadCraft() {
  showLoading(true);
  setTimeout(() => {
    renderResults("Top Crafting Items (Coming Soon)", []);
    showLoading(false);
  }, 1000);
}

function loadSalvage() {
  showLoading(true);
  setTimeout(() => {
    renderResults("Top Salvage Items (Coming Soon)", []);
    showLoading(false);
  }, 1000);
}

function loadForge() {
  showLoading(true);
  setTimeout(() => {
    renderResults("Top Mystic Forge Recipes (Coming Soon)", []);
    showLoading(false);
  }, 1000);
}

function loadTrending() {
  showLoading(true);
  setTimeout(() => {
    renderResults("Trending Items (Coming Soon)", []);
    showLoading(false);
  }, 1000);
}

function renderResults(title, list) {
  let html = "<h2>" + title + "</h2>";
  if (!list.length) {
    html += "<p>No data available.</p>";
  } else {
    html += "<table><tr><th>Name</th><th>Buy</th><th>Sell</th><th>Profit</th></tr>";
    list.forEach(item => {
      html += `<tr><td>${item.name}</td><td>${(item.buy/100).toFixed(2)}g</td><td>${(item.sell/100).toFixed(2)}g</td><td>${(item.profit/100).toFixed(2)}g</td></tr>`;
    });
    html += "</table>";
  }
  document.getElementById("results").innerHTML = html;
}
