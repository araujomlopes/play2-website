// ----------------------
// TOGGLE MENU
// ----------------------
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    navToggle?.addEventListener('click', function() {
        const nav = document.getElementById('nav');
        nav.classList.toggle('show');
        this.setAttribute('aria-expanded', nav.classList.contains('show') ? 'true' : 'false');
    });
});

// ----------------------
// FUNÇÃO BASE PARA CARREGAR CSV + LOCALSTORAGE
// ----------------------
async function carregarCSVSheets(url, storageKey) {
  try {
    const response = await fetch(url);
    const texto = await response.text();

    const linhas = texto.trim().split('\n');
    const cabecalhos = linhas.shift().split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

    const dados = linhas.map(linha => {
      const valores = linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      let obj = {};
      cabecalhos.forEach((cab,i)=> {
        obj[cab.trim()] = valores[i] ? valores[i].trim().replace(/^"|"$/g,"") : "";
      });
      return obj;
    });

    localStorage.setItem(storageKey, JSON.stringify(dados));
    return dados;
  } catch(e) {
    const guardado = localStorage.getItem(storageKey);
    return guardado ? JSON.parse(guardado) : [];
  }
}

// ----------------------
// ATUALIZAR ESTATÍSTICAS DOS JOGADORES
// ----------------------
async function updatePlayerStats() {
  const fichaURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=0&single=true&output=csv";
  const equipasURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1253685309&single=true&output=csv";
  const jogadoresURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1795344515&single=true&output=csv";

  const [ficha, equipas, jogadores] = await Promise.all([
    carregarCSVSheets(fichaURL, 'ficha_jogo'),
    carregarCSVSheets(equipasURL, 'equipas'),
    carregarCSVSheets(jogadoresURL, 'jogadores')
  ]);

  // Mapeamento de logos por equipe
  const teamMap = {};
  equipas.forEach(team => {
    teamMap[team.Team] = team.Logopng || "";
  });

  // Inicializa stats
  const stats = {};
  jogadores.forEach(j => {
    stats[j.Player] = {
      Player: j.Player,
      Team: j.Team,
      Position: j.Position,
      Image: j.Image || "",
      Jogos: 0,
      Golos: 0,
      Yellows: 0,
      Reds: 0,
      GPG: 0
    };
  });

  // Calcula stats
  ficha.forEach(game => {
    // Home scorers
    if(game.ScorersHome) {
      const regex = /([^:,]+):?\s*(\d+)?/g;
      let match;
      while((match = regex.exec(game.ScorersHome)) !== null) {
        const player = match[1].trim();
        const goals = parseInt(match[2]||"1");
        if(stats[player]) stats[player].Golos += goals;
      }
    }
    if(game.YellowsHome) game.YellowsHome.split(",").forEach(p => { if(stats[p.trim()]) stats[p.trim()].Yellows++ });
    if(game.RedsHome) game.RedsHome.split(",").forEach(p => { if(stats[p.trim()]) stats[p.trim()].Reds++ });

    // Away scorers
    if(game.ScorersAway) {
      const regex = /([^:,]+):?\s*(\d+)?/g;
      let match;
      while((match = regex.exec(game.ScorersAway)) !== null) {
        const player = match[1].trim();
        const goals = parseInt(match[2]||"1");
        if(stats[player]) stats[player].Golos += goals;
      }
    }
    if(game.YellowsAway) game.YellowsAway.split(",").forEach(p => { if(stats[p.trim()]) stats[p.trim()].Yellows++ });
    if(game.RedsAway) game.RedsAway.split(",").forEach(p => { if(stats[p.trim()]) stats[p.trim()].Reds++ });

    // Jogos
    if(game.PlayersHome) game.PlayersHome.split(",").forEach(p => { if(stats[p.trim()]) stats[p.trim()].Jogos++ });
    if(game.PlayersAway) game.PlayersAway.split(",").forEach(p => { if(stats[p.trim()]) stats[p.trim()].Jogos++ });
  });

  // Calcula GPG
  Object.values(stats).forEach(p => {
    p.GPG = p.Jogos>0 ? (p.Golos/p.Jogos).toFixed(2) : 0;
  });

  // Ordena
  const sortedPlayers = Object.values(stats).sort((a,b)=>b.Golos - a.Golos);

  // Atualiza HTML
  const tbody = document.querySelector(".stats-table tbody");
  if(!tbody) return;
  tbody.innerHTML = "";

  sortedPlayers.forEach((p,i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="rank-cell">${(i+1).toString().padStart(2,'0')}</td>
      <td class="player-cell">
        <div class="player-info">
          <div class="avatar-wrapper">
            <img src="${p.Image}" class="avatar" />
            <img src="${teamMap[p.Team]}" class="team-stamp bottom-right" />
          </div>
          <div class="ptext">
            <div class="pname" title="${p.Player}">${p.Player}</div>
            <div class="pteam desktop-only"><span class="team">${p.Team}</span>-<span class="role">${p.Position}</span></div>
            <div class="pteam mobile-only"><span class="role">${p.Position}</span></div>
          </div>
        </div>
      </td>
      <td class="data-cell">${p.Jogos}</td>
      <td class="data-cell">${p.Yellows}</td>
      <td class="data-cell">${p.Reds}</td>
      <td class="data-cell">${p.Golos}</td>
      <td class="data-cell">${p.GPG}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ----------------------
// EXECUTAR AO CARREGAR
// ----------------------
document.addEventListener("DOMContentLoaded", updatePlayerStats);
