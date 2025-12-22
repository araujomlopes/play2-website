
// Função do toggle do menu (antes inline no onclick)
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    navToggle.addEventListener('click', function() {
        const nav = document.getElementById('nav');
        nav.classList.toggle('show');
        this.setAttribute('aria-expanded', nav.classList.contains('show') ? 'true' : 'false');
    });
});

// Função do toggle do menu (antes inline no onclick FIM)





// CSV INICIO  (GOOGLESHEETS)
// Função para parsear CSV
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g).map(h => h.replace(/"/g,'').trim());
  const data = lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/"/g,'').trim()) || [];
    const obj = {};
    headers.forEach((h,i) => obj[h] = values[i] || "");
    return obj;
  });
  return data;
}

// Função para buscar CSV
async function fetchCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  return parseCSV(text);
}

// Função principal para atualizar estatísticas
async function updatePlayerStats() {
  const fichaURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=0&single=true&output=csv";
  const equipasURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1253685309&single=true&output=csv";
  const jogadoresURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1795344515&single=true&output=csv";

  const [ficha, equipas, jogadores] = await Promise.all([
    fetchCSV(fichaURL),
    fetchCSV(equipasURL),
    fetchCSV(jogadoresURL)
  ]);

  // Mapeamento de equipas para logos
  const teamMap = {};
  equipas.forEach(team => {
    teamMap[team.Team] = team.Logo;
  });

  // Inicializa stats de cada jogador
  const stats = {};
  jogadores.forEach(j => {
    stats[j.Player] = {
      Player: j.Player,
      Team: j.Team,
      Position: j.Position,
      Image: j.Image,
      Jogos: 0,
      Golos: 0,
      Yellows: 0,
      Reds: 0,
      GPG: 0
    };
  });

  // Calcula estatísticas com base na ficha de jogos
  ficha.forEach(game => {
    // Home team
    if(game.ScorersHome) {
      const regex = /([^:,]+):?\s*(\d+)?/g;
      let match;
      while((match = regex.exec(game.ScorersHome)) !== null) {
        const player = match[1].trim();
        const goals = parseInt(match[2]||"1");
        if(stats[player]) stats[player].Golos += goals;
      }
    }

    if(game.YellowsHome) {
      game.YellowsHome.split(",").forEach(p => {
        const player = p.trim();
        if(stats[player]) stats[player].Yellows += 1;
      });
    }
    if(game.RedsHome) {
      game.RedsHome.split(",").forEach(p => {
        const player = p.trim();
        if(stats[player]) stats[player].Reds += 1;
      });
    }

    // Away team
    if(game.ScorersAway) {
      const regex = /([^:,]+):?\s*(\d+)?/g;
      let match;
      while((match = regex.exec(game.ScorersAway)) !== null) {
        const player = match[1].trim();
        const goals = parseInt(match[2]||"1");
        if(stats[player]) stats[player].Golos += goals;
      }
    }

    if(game.YellowsAway) {
      game.YellowsAway.split(",").forEach(p => {
        const player = p.trim();
        if(stats[player]) stats[player].Yellows += 1;
      });
    }
    if(game.RedsAway) {
      game.RedsAway.split(",").forEach(p => {
        const player = p.trim();
        if(stats[player]) stats[player].Reds += 1;
      });
    }

    // Incrementa jogos
    if(game.PlayersHome) game.PlayersHome.split(",").forEach(p => { if(stats[p.trim()]) stats[p.trim()].Jogos +=1; });
    if(game.PlayersAway) game.PlayersAway.split(",").forEach(p => { if(stats[p.trim()]) stats[p.trim()].Jogos +=1; });
  });

  // Calcula GPG
  Object.values(stats).forEach(p => {
    p.GPG = p.Jogos>0 ? (p.Golos/p.Jogos).toFixed(2) : 0;
  });

  // Ordena por golos
  const sortedPlayers = Object.values(stats).sort((a,b) => b.Golos - a.Golos);

  // Atualiza tabela HTML
  const tbody = document.querySelector(".stats-table tbody");
  tbody.innerHTML = "";
  sortedPlayers.forEach((p, i) => {
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

// Chama função
updatePlayerStats();





