const apiBase = "https://api.guildwars2.com/v2";
const loading = document.getElementById("loading");
const results = document.getElementById("results");

function showLoading(message = "Loading builds...") {
  loading.textContent = message;
  loading.style.display = "block";
}

function hideLoading() {
  loading.style.display = "none";
}

function formatCopper(copper) {
  const gold = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  const copperRemainder = copper % 100;
  return `${gold}g ${silver}s ${copperRemainder}c`;
}

// Flip logic (working)
async function runFlip() {
  showLoading("Finding top flip deals...");

  try {
    const itemIds = await fetch(`${apiBase}/commerce/prices`).then(res => res.json());
    const prices = await fetch(`${apiBase}/commerce/prices?ids=${itemIds.slice(0, 200).join(',')}`).then(res => res.json());

    const profitable = prices
      .map(item => {
        const buy = item.buys.unit_price;
        const sell = item.sells.unit_price;
        const profit = Math.floor(sell * 0.85) - buy;
        return { id: item.id, profit, buy, sell };
      })
      .filter(i => i.profit > 0)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 20);

    const items = await fetch(`${apiBase}/items?ids=${profitable.map(i => i.id).join(',')}`).then(res => res.json());

    const output = profitable.map(p => {
      const item = items.find(i => i.id === p.id);
      return `
        <div class="item">
          <strong>${item.name}</strong><br>
          Buy: ${formatCopper(p.buy)}<br>
          Sell: ${formatCopper(p.sell)}<br>
          Profit: ${formatCopper(p.profit)}
        </div>
        <hr>
      `;
    }).join("");

    results.innerHTML = `<h2>Top Flip Opportunities</h2>${output}`;
  } catch (err) {
    results.innerHTML = "<div class='error'>Failed to fetch flip data.</div>";
    console.error(err);
  }

  hideLoading();
}

// Craft logic placeholder
async function runCraft() {
  showLoading("Looking up profitable crafts...");

  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
  results.innerHTML = "<div>No crafting logic committed yet.</div>";

  hideLoading();
}

// Hook buttons
document.getElementById("flipBtn").addEventListener("click", runFlip);
document.getElementById("craftBtn").addEventListener("click", runCraft);
