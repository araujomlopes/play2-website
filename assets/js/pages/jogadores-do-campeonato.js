function parseCSV(text) {
  const rows = [];
  const lines = text.split(/\r?\n/);
  if (!lines.length) return [];

  const headers = lines[0]
    .match(/(?:\"([^\"]*)\"|([^\",]+))/g)
    .map(h => h.replace(/^"|"$/g, '').trim());

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values = [];
    let inQuotes = false;
    let value = '';

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"' && line[c - 1] !== '\\') {
        inQuotes = !inQuotes;
        continue;
      }
      if (char === ',' && !inQuotes) {
        values.push(value.trim());
        value = '';
        continue;
      }
      value += char;
    }
    values.push(value.trim());

    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i] || "");
    rows.push(obj);
  }
  return rows;
}

async function fetchCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  return parseCSV(text);
}

async function updateTopScorers() {

  const urlFichas = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=0&single=true&output=csv";
  const urlEquipas = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1253685309&single=true&output=csv";
  const urlJogadores = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1795344515&single=true&output=csv";

  const [fichas, equipas, jogadores] = await Promise.all([
    fetchCSV(urlFichas),
    fetchCSV(urlEquipas),
    fetchCSV(urlJogadores)
  ]);

  const stats = {};
  const clubSet = new Set();

  jogadores.forEach(j => {
    const name = j.Player.trim();
    if (!name) return;

    stats[name] = {
      golos: 0,
      team: j.Team,
      position: j.Position || "",
      image: j.foto_lista
        ? `assets/images/perfil_jogador/foto_lista/${j.foto_lista}`
        : "assets/images/silhouette/silhouette_foto_lista.svg"
    };

    if (j.Team) clubSet.add(j.Team);
  });

  const selectClub = document.getElementById("ts-club-select");
  clubSet.forEach(club => {
    const opt = document.createElement("option");
    opt.value = club;
    opt.textContent = club;
    selectClub.appendChild(opt);
  });

  fichas.forEach(f => {
    ["ScorersHome", "ScorersAway"].forEach(col => {
      const scorers = f[col];
      if (!scorers) return;

      const regex = /(.*?):\s*(\d+)/g;
      let match;
      while ((match = regex.exec(scorers)) !== null) {
        const name = match[1].trim();
        const goals = parseInt(match[2]) || 0;
        if (stats[name]) stats[name].golos += goals;
      }
    });
  });

  const grouped = {
    "Guarda-redes": [],
    "Fixos": [],
    "Alas": [],
    "Pivôs": []
  };

  Object.entries(stats).forEach(([name, data]) => {
    const pos = (data.position || "").toLowerCase();

    if (pos.includes("guarda")) grouped["Guarda-redes"].push({ playerName: name, ...data });
    else if (pos.includes("fixo")) grouped["Fixos"].push({ playerName: name, ...data });
    else if (pos.includes("ala")) grouped["Alas"].push({ playerName: name, ...data });
    else if (pos.includes("piv")) grouped["Pivôs"].push({ playerName: name, ...data });
  });

  const displayOrder = ["Guarda-redes", "Fixos", "Alas", "Pivôs"];
  displayOrder.forEach(pos => {
    grouped[pos].sort((a, b) => a.playerName.localeCompare(b.playerName));
  });

  const grid = document.querySelector(".scorers-grid");
  grid.innerHTML = "";

  function cardHTML(p) {
    const link = `jogador.html?player=${encodeURIComponent(p.playerName)}`;
    return `
      <div class="scorer-card">
        <div class="ts-rank"><p class="ts-rank__label">${p.rank}</p></div>
        <div class="player-info">
          <a href="${link}">
            <img src="${p.image}" class="player-photo"
              onerror="this.onerror=null;this.src='assets/images/silhouette/silhouette_foto_lista.svg';">
          </a>
          <div class="player-text">
            <a href="${link}"><h3>${p.playerName}</h3></a>
            <p>${p.position}</p>
          </div>
        </div>
      </div>`;
  }

  let rankCounter = 1;

  displayOrder.forEach(pos => {
    if (!grouped[pos].length) return;

    grid.innerHTML += `
      <h2 class="pos-title" style="
        grid-column:1/-1;
        margin:20px 0 0;
        font-family: var(--font-secondary);
        font-size: var(--fs-xl);
        font-weight: var(--fw-semibold);
        color: var(--color-text-primary);
      ">${pos}</h2>`;

    grouped[pos].forEach(p => {
      p.rank = rankCounter++;
      grid.innerHTML += cardHTML(p);
    });
  });

  function filterCards() {
    const term = document.getElementById("ts-search").value
      .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const clubTerm = document.getElementById("ts-club-select").value;

    document.querySelectorAll(".scorer-card").forEach(card => {
      const name = card.querySelector("h3").textContent
        .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const posi = card.querySelector("p").textContent
        .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const team = stats[card.querySelector("h3").textContent].team;

      let show = name.includes(term) || posi.includes(term);
      if (clubTerm) show = show && team === clubTerm;

      card.style.display = show ? "" : "none";
    });
  }

  document.getElementById("ts-search").addEventListener("input", filterCards);
  document.getElementById("ts-club-select").addEventListener("change", filterCards);
}

updateTopScorers();
