const URL_FICHA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=0&single=true&output=csv";
const URL_EQUIPAS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1253685309&single=true&output=csv";

function fixHeaders(row) {
  const fixed = {};
  for (let key in row) fixed[key.replace(/,/g, "").trim()] = row[key];
  return fixed;
}

function normalizeName(name) {
  if (!name) return "";
  return String(name).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-_]/g, "").trim().replace(/\s+/g, "_");
}

function loadCSV(url) {
  return new Promise(resolve => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: r => resolve(r.data.map(x => fixHeaders(x))),
      error: () => resolve([])
    });
  });
}

function parseDateTime(d, t) {
  if (!d) return null;
  d = d.trim().replace(/[-.]/g, "/");
  let day, month, year;
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
    let p = d.split("-");
    year = +p[0]; month = +p[1]; day = +p[2];
  } else {
    let p = d.split("/");
    if (p.length < 3) return null;
    day = +p[0]; month = +p[1]; year = +p[2];
    if (year < 100) year += year < 50 ? 2000 : 1900;
  }
  let h = 0, m = 0;
  if (t && /(\d{1,2}):(\d{2})/.test(t)) {
    h = +t.split(":")[0]; m = +t.split(":")[1];
  }
  return new Date(year, month-1, day, h, m);
}

const LOGO_BASE_PATH = "assets/images/team-logo/";
function renderMatchCard(m, tm) {
  const home = m.HomeTeam || "";
  const away = m.AwayTeam || "";
  function getLogo(teamName) {
  const team = tm[teamName];
  if (!team || !team.Logopng) return `${LOGO_BASE_PATH}default.svg`;
  // remove espaços e normaliza nomes
  const fileName = team.Logopng.trim();
  return `${LOGO_BASE_PATH}${fileName}`;
}

const homeLogo = getLogo(home);
const awayLogo = getLogo(away);

  const dateText = m.Data || "";
  const localText = m["Local do jogo"] || "";
  const timeText = m.Time || "";
  const hg = m.HomeGoals ?? "";
  const ag = m.AwayGoals ?? "";
  const hasScore = hg !== "" || ag !== "";

  const compName = m.Competition || "LAGT Campeonato Liga";
  const compSub = `${dateText}${ localText ? " · " + localText : "" }`;

  return `
  <article class="match-card"
           data-jornada="${m.Jornada}"
           data-home="${home}"
           data-away="${away}">
    <header class="match-card__header">
      <img class="comp-badge" src="" onerror="this.style.display='none'">
      <div class="comp-info">
        <div class="comp-name">${compName}</div>
        <div class="comp-sub">${compSub}</div>
      </div>
    </header>

    <div class="match-card__body">
     <div class="home-block">
  <div class="team-name">${home}</div>
</div>

<div class="match-meta">
  <img class="team-logo" src="${homeLogo}">
  <div class="match-time">
    ${ hasScore ? `<strong style="font-size:18px;">${hg} : ${ag}</strong>` : (timeText || "--:--") }
  </div>
  <img class="team-logo" src="${awayLogo}">
</div>

<div class="away-block">
  <div class="team-name">${away}</div>
</div>

    </div>
  </article>
  `;
}

async function loadMatchesAndRender() {
  const [matchesRaw, teamsRaw] = await Promise.all([ loadCSV(URL_FICHA), loadCSV(URL_EQUIPAS) ]);
  const teamMap = {};
  teamsRaw.forEach(t => { if (t.Team) teamMap[t.Team] = t; });

  let matches = matchesRaw.map(m => ({
    ...m,
    __dt: parseDateTime(m.Data, m.Time)
  })).filter(x => x.__dt);

  matches.sort((a,b) => a.__dt - b.__dt);

  const container = document.getElementById("jornadas-container");
  container.innerHTML = "";

  const jornadas = {};
  matches.forEach(m => {
    const j = m.Jornada || "Sem Jornada";
    if (!jornadas[j]) jornadas[j] = [];
    jornadas[j].push(m);
  });

  Object.keys(jornadas).sort((a,b)=>a-b).forEach(j => {
    container.insertAdjacentHTML("beforeend", `<h2 class="section-title">Jornada ${j}</h2>`);
    container.insertAdjacentHTML("beforeend", `<div class="matches-wrap" id="jornada-${j}"></div>`);

    jornadas[j].forEach(m => {
      document
        .getElementById(`jornada-${j}`)
        .insertAdjacentHTML("beforeend", renderMatchCard(m, teamMap));
    });
  });

  loadFilters();
}

loadMatchesAndRender();
setInterval(loadMatchesAndRender, 180000);

function loadFilters() {
  loadMatchdayOptions();
  loadClubOptions();
  applyFilters();
}

function loadMatchdayOptions() {
  const select = document.getElementById("matchdaySelect");
  select.innerHTML = `<option value="all">Jornada</option>`;

  const jornadas = new Set();
  document.querySelectorAll(".match-card").forEach(card => {
    jornadas.add(card.dataset.jornada);
  });

  [...jornadas].sort((a,b)=>a-b).forEach(j => {
    select.insertAdjacentHTML("beforeend", `<option value="${j}">Jornada ${j}</option>`);
  });
}

function loadClubOptions() {
  const select = document.getElementById("clubSelect");
  select.innerHTML = `<option value="all">Todos os Clubes</option>`;

  const clubs = new Set();
  document.querySelectorAll(".match-card").forEach(card => {
    clubs.add(card.dataset.home);
    clubs.add(card.dataset.away);
  });

  [...clubs].sort().forEach(c => {
    select.insertAdjacentHTML("beforeend", `<option value="${c}">${c}</option>`);
  });
}

function applyFilters() {
  const jornada = document.getElementById("matchdaySelect").value;
  const club = document.getElementById("clubSelect").value;

  document.querySelectorAll(".section-title").forEach(t => (t.style.display = "none"));
  document.querySelectorAll(".matches-wrap").forEach(w => (w.style.display = "none"));

  const visible = {};

  document.querySelectorAll(".match-card").forEach(card => {
    const cardJornada = card.dataset.jornada;
    const home = card.dataset.home;
    const away = card.dataset.away;

    let show = true;
    if (jornada !== "all" && jornada !== cardJornada) show = false;
    if (club !== "all" && home !== club && away !== club) show = false;

    card.style.display = show ? "grid" : "none";
    if (show) visible[cardJornada] = true;
  });

  Object.keys(visible).forEach(j => {
    document.querySelector(`#jornada-${j}`).style.display = "grid";
    const title = [...document.querySelectorAll(".section-title")]
      .find(t => t.textContent.includes(`Jornada ${j}`));
    if (title) title.style.display = "block";
  });
}

document.getElementById("matchdaySelect").addEventListener("change", applyFilters);
document.getElementById("clubSelect").addEventListener("change", applyFilters);
