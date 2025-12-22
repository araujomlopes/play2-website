// Parser CSV robusto: ignora espaços, aspas e vírgulas extras
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0]
    .match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
    .map(h => h.replace(/^["\s,]+|["\s,]+$/g,''));

  return lines.slice(1).map(line => {
    const values = line
      .match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
      ?.map(v => v.replace(/^["\s,]+|["\s,]+$/g,'')) || [];

    const obj = {};
    headers.forEach((h,i) => obj[h] = values[i] || "");
    return obj;
  });
}

async function fetchCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  return parseCSV(text);
}

function padRank(n){
  return n < 10 ? '0' + n : String(n);
}

async function updateStandings() {
  const urlEquipas = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1253685309&single=true&output=csv";
  const urlJogos  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=0&single=true&output=csv";

  const [equipas, jogos] = await Promise.all([
    fetchCSV(urlEquipas),
    fetchCSV(urlJogos)
  ]);

  const statsMap = {};

  // === EQUIPAS (corrigido para Logopng) ===
  equipas.forEach(team => {
    if (!team.Team) return;

    statsMap[team.Team.trim()] = {
      Team: team.Team.trim(),
      Logo: team.Logopng ? team.Logopng.trim() : "",
      Sponsor: "",
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      yellow: 0,
      red: 0,
      goals: 0
    };
  });

  // === JOGOS ===
  jogos.forEach(j => {
    const home = statsMap[j.HomeTeam?.trim()];
    const away = statsMap[j.AwayTeam?.trim()];
    if (!home || !away) return;

    home.played++;
    away.played++;

    const hg = parseInt(j.HomeGoals) || 0;
    const ag = parseInt(j.AwayGoals) || 0;

    home.goals += hg;
    away.goals += ag;

    home.yellow += parseInt(j.YellowsHome) || 0;
    home.red    += parseInt(j.RedsHome) || 0;
    away.yellow += parseInt(j.YellowsAway) || 0;
    away.red    += parseInt(j.RedsAway) || 0;

    if (hg > ag) {
      home.won++;
      away.lost++;
    } else if (hg < ag) {
      away.won++;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
    }
  });

  const tbody = document.getElementById('uefaStandings');
  tbody.innerHTML = "";

  const sortedTeams = Object.values(statsMap).sort(
    (a, b) => (b.played * 3 + b.won - b.lost) - (a.played * 3 + a.won - a.lost)
  );

  sortedTeams.forEach((t, i) => {
    const row = document.createElement('div');
    row.className = 'uefa-row';

    row.innerHTML = `
      <div class="col-rank">${padRank(i + 1)}</div>
      <div class="col-team">
        <div class="team-logo">
          <img src="${t.Logo}" alt="${t.Team} logo">
        </div>
        <div class="team-info">
          <div class="team-name">${t.Team}</div>
          <div class="team-country">Sponsor: —</div>
        </div>
      </div>
      <div class="col-stat matches">${t.played}</div>
      <div class="col-stat">${t.won}</div>
      <div class="col-stat">${t.drawn}</div>
      <div class="col-stat">${t.lost}</div>
      <div class="col-stat">${t.yellow}</div>
      <div class="col-stat">${t.red}</div>
      <div class="col-stat">${t.goals}</div>
    `;

    tbody.appendChild(row);
  });
}

updateStandings();