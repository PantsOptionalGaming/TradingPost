<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>GW2 Builds Viewer</title>
<style>
  body {
    font-family: Arial, sans-serif;
    max-width: 900px;
    margin: 20px auto;
    padding: 10px;
  }
  h1 {
    margin-bottom: 20px;
  }
  .button-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 25px;
  }
  button.build-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 110px;
    padding: 8px;
    border: 1px solid #0078d7;
    border-radius: 8px;
    background-color: white;
    cursor: pointer;
    font-weight: bold;
    color: #0078d7;
    transition: background-color 0.2s, color 0.2s;
  }
  button.build-btn:hover {
    background-color: #0078d7;
    color: white;
  }
  button.build-btn img {
    width: 64px;
    height: 64px;
    margin-bottom: 6px;
    object-fit: contain;
  }
  #loading {
    color: #0066cc;
    font-weight: bold;
    margin-top: 10px;
    display: none;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin-top: 15px;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 6px 8px;
    text-align: left;
  }
  th {
    background-color: #f0f0f0;
  }
</style>
</head>
<body>

<h1>Guild Wars 2 Builds</h1>

<!-- Professions -->
<div><strong>Professions:</strong></div>
<div class="button-grid" id="profession-buttons">
  <button class="build-btn" onclick="loadBuilds('profession', 'Warrior')">
    <img src="https://drive.google.com/uc?export=view&id=1YQtPPuvOcf0CmoIxHSzf-7c-NwFQdMW1" alt="Warrior">
    Warrior
  </button>
  <button class="build-btn" onclick="loadBuilds('profession', 'Guardian')">
    <img src="https://drive.google.com/uc?export=view&id=1VmFmnzxzztl1YvHPzeOAtyWW7gwAQ0es" alt="Guardian">
    Guardian
  </button>
  <button class="build-btn" onclick="loadBuilds('profession', 'Elementalist')">
    <img src="https://drive.google.com/uc?export=view&id=1w-kC30snHKKj-t9pHN6LCVgZBrczG0p3" alt="Elementalist">
    Elementalist
  </button>
  <button class="build-btn" onclick="loadBuilds('profession', 'Engineer')">
    <img src="https://drive.google.com/uc?export=view&id=14ESX5xzf2oJXH10_Z9qIR34p3iUd5gXy" alt="Engineer">
    Engineer
  </button>
  <button class="build-btn" onclick="loadBuilds('profession', 'Mesmer')">
    <img src="https://drive.google.com/uc?export=view&id=1-NPzMy3FyNMlFFeE1Jl1wbu1HkJpjM6N" alt="Mesmer">
    Mesmer
  </button>
  <button class="build-btn" onclick="loadBuilds('profession', 'Necromancer')">
    <img src="https://drive.google.com/uc?export=view&id=13EsLnddq9CCd-gaOtiKuC2fVn2ar0RGk" alt="Necromancer">
    Necromancer
  </button>
  <button class="build-btn" onclick="loadBuilds('profession', 'Ranger')">
    <img src="https://drive.google.com/uc?export=view&id=1cqFYvSs8R9j6l5dVHiD3jMA4RZ5vkfcG" alt="Ranger">
    Ranger
  </button>
  <button class="build-btn" onclick="loadBuilds('profession', 'Revenant')">
    <img src="https://drive.google.com/uc?export=view&id=1urzrqdIeLtlq9NXeEPKkWejC5L7lBOtR" alt="Revenant">
    Revenant
  </button>
  <button class="build-btn" onclick="loadBuilds('profession', 'Thief')">
    <img src="https://drive.google.com/uc?export=view&id=1Z17qNALbjfqOZcZklmfEulpg0LXcrrqa" alt="Thief">
    Thief
  </button>
</div>

<!-- Roles -->
<div><strong>Roles:</strong></div>
<div class="button-grid" id="role-buttons">
  <button class="build-btn" onclick="loadBuilds('role', 'Support')">
    <img src="https://drive.google.com/uc?export=view&id=1bxzRtE9gzuMOWuWCfpupIOD8zU5ozNS4" alt="Support">
    Support
  </button>
  <button class="build-btn" onclick="loadBuilds('role', 'Utility Support')">
    <img src="https://drive.google.com/uc?export=view&id=1KOiYOy3C4h2wo5Iw6gkLMqCIdCelmEUx" alt="Utility Support">
    Utility Support
  </button>
  <button class="build-btn" onclick="loadBuilds('role', 'FrontLineDPS')">
    <img src="https://drive.google.com/uc?export=view&id=1HTxQ6pXQ7ILm_10mLX-uonqNamEBVVTY" alt="FrontLine DPS">
    FrontLine DPS
  </button>
  <button class="build-btn" onclick="loadBuilds('role', 'BackLineDPS')">
    <img src="https://drive.google.com/uc?export=view&id=1B6v0j35147u7U-LA2PYBjFHk5LSm9Qt8" alt="BackLine DPS">
    BackLine DPS
  </button>
  <button class="build-btn" onclick="loadBuilds('role', 'BoonStrip')">
    <img src="https://drive.google.com/uc?export=view&id=1QYKgrBpcWTS1JKD6nvy-tgKTbPOUWkAZ" alt="BoonStrip">
    BoonStrip
  </button>
</div>

<div id="loading">Loading builds...</div>

<table id="build-table"></table>

<script>
  const scriptURL = "https://script.google.com/macros/s/AKfycbwAP2IrzRJtHMsJOu-xCLBLhlXrNR1tvRM76-Z_lw8yUkbnus4z-qtryeegcO6OEtmT/exec";

  function loadBuilds(type, value) {
    const loading = document.getElementById('loading');
    const table = document.getElementById('build-table');
    loading.style.display = 'block';
    table.innerHTML = '';

    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());

    window[callbackName] = function(data) {
      delete window[callbackName];
      loading.style.display = 'none';

      if (!data || !data.length) {
        table.innerHTML = '<tr><td>No builds found.</td></tr>';
        return;
      }

      const headers = data[0];
      const rows = data.slice(1);

      let html = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
      rows.forEach(row => {
        html += '<tr>' + row.map(cell => {
          if (typeof cell === 'string' && cell.startsWith('http')) {
            return `<td><a href="${cell}" target="_blank" rel="noopener noreferrer">Link</a></td>`;
          }
          return `<td>${cell}</td>`;
        }).join('') + '</tr>';
      });

      table.innerHTML = html;
    };

    const script = document.createElement('script');
    script.src = `${scriptURL}?filterType=${type}&filterValue=${encodeURIComponent(value)}&callback=${callbackName}`;
    script.onerror = function() {
      loading.style.display = 'none';
      table.innerHTML = '<tr><td>Error loading builds.</td></tr>';
    };
    document.body.appendChild(script);
  }
</script>

</body>
</html>
