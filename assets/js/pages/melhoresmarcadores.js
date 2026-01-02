/* =====================================================
   Página: Melhores Marcadores
   Componente: UEFA Style Player Carousel
   Função: Scroll horizontal com botões e drag
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector('.carousel-track');
  const btnLeft = document.querySelector('.carousel-btn.left');
  const btnRight = document.querySelector('.carousel-btn.right');

  const scrollAmount = 283;

  const smoothScrollBy = (el, dist) =>
    el.scrollTo({ left: el.scrollLeft + dist, behavior: 'smooth' });

  btnLeft.addEventListener('click', () => smoothScrollBy(track, -scrollAmount));
  btnRight.addEventListener('click', () => smoothScrollBy(track, scrollAmount));

  let isDown = false, startX, scrollLeft;

  track.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });

  track.addEventListener('mouseleave', () => isDown = false);
  track.addEventListener('mouseup', () => isDown = false);

  track.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = x - startX;
    track.scrollLeft = scrollLeft - walk;
  });
});

/* =====================================================
   Google Sheets
   ===================================================== */

const URLS = {
  ficha_jogo: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=0&single=true&output=csv",
  jogadores: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1795344515&single=true&output=csv",
  equipas: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1253685309&single=true&output=csv"
};

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(",").map(h => h.trim());
  return lines.map(l => {
    const vals = l.split(",");
    return headers.reduce((o, h, i) => ({ ...o, [h]: vals[i] ? vals[i].trim() : "" }), {});
  });
}

function cleanName(s) {
  return (s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* =====================================================
   TOP 6 CAROUSEL
   ===================================================== */

(async function () {
  try {
    const [fText, jText, eText] = await Promise.all([
      fetch(URLS.ficha_jogo).then(r => r.text()),
      fetch(URLS.jogadores).then(r => r.text()),
      fetch(URLS.equipas).then(r => r.text())
    ]);

    const fichas = parseCSV(fText);
    const jogadores = parseCSV(jText);
    const equipas = parseCSV(eText);

    const teamLogos = {};
    equipas.forEach(e => {
      if (e.Team && e.Logopng) {
        teamLogos[cleanName(e.Team)] = e.Logopng;
      }
    });

    const stats = {};

    jogadores.forEach(j => {
      const name = cleanName(j.Player);
      if (!name) return;

      stats[name] = {
        gols: 0,
        jogos: 0,
        team: j.Team || "",
        position: j.Position || "",
        image: j.foto_topscore_x || `${name.replace(/\s+/g,'_')}.webp`
      };
    });

    fichas.forEach(f => {
      function processScorers(str) {
        if (!str) return [];
        return str.split(",").map(e => {
          const [n, q] = e.split(":");
          return { name: cleanName(n), goals: Number(q) || 1 };
        });
      }

      [...processScorers(f.ScorersHome), ...processScorers(f.ScorersAway)]
        .forEach(s => stats[s.name] && (stats[s.name].gols += s.goals));

      function processPlayers(str) {
        if (!str) return [];
        return str.split(",").map(p => cleanName(p));
      }

      [...processPlayers(f.PlayersHome), ...processPlayers(f.PlayersAway)]
        .forEach(p => stats[p] && (stats[p].jogos += 1));
    });

    const top6 = Object.entries(stats)
      .map(([n, d]) => ({ name: n, ...d }))
      .sort((a, b) => b.gols - a.gols || a.name.localeCompare(b.name))
      .slice(0, 6);

    const track = document.querySelector('.carousel-track');

    track.innerHTML = top6.map(p => {
      const logo = teamLogos[cleanName(p.team)];
      return `
      <div class="player-card">
        <div class="player-image-wrapper">
          <img class="player-photo"
               src="assets/images/perfil_jogador/foto_topscore_x/${p.image}"
               onerror="this.onerror=null;this.src='assets/images/silhouette/silhouette_topscore-x.svg';">
          <img class="team-logo"
               src="assets/images/team-logo/${logo || 'logo_default.svg'}"
               alt="${p.team}">
        </div>
        <h3>${p.name}</h3>
        <p class="position">${p.position || "-"}</p>
        <div class="stats">
          <div><span class="golos_estat">${p.gols}</span><strong>Golos</strong></div>
          <div><span class="golos_estat">${p.jogos}</span><strong>Jogos</strong></div>
        </div>
      </div>`;
    }).join("");

  } catch (e) {
    console.error("Erro carregando marcadores:", e);
  }
})();

/* =====================================================
   GRID TOP SCORERS
   ===================================================== */

async function updateOfficialGrid() {
  const [fText, jText, eText] = await Promise.all([
    fetch(URLS.ficha_jogo).then(r => r.text()),
    fetch(URLS.jogadores).then(r => r.text()),
    fetch(URLS.equipas).then(r => r.text())
  ]);

  const fichas = parseCSV(fText);
  const jogadores = parseCSV(jText);
  const equipas = parseCSV(eText);

  const teamLogos = {};
  equipas.forEach(e => {
    if (e.Team && e.Logopng) {
      teamLogos[cleanName(e.Team)] = e.Logopng;
    }
  });

  const stats = {};
  jogadores.forEach(j => {
    if (!j.Player) return;
    stats[j.Player] = {
      golos: 0,
      team: j.Team || "",
      position: j.Position || "",
      image: j.foto_top_score || `${j.Player.replace(/\s+/g,'_')}.webp`
    };
  });

  fichas.forEach(f => {
    ["ScorersHome","ScorersAway"].forEach(col => {
      if (!f[col]) return;
      f[col].split(",").forEach(s => {
        const [n,q] = s.split(":").map(x=>x.trim());
        stats[n] && (stats[n].golos += Number(q)||1);
      });
    });
  });

  const grid = document.getElementById("official-grid");
  grid.innerHTML = "";

  Object.entries(stats).sort((a,b)=>b[1].golos-a[1].golos).forEach(([name,d])=>{
    const logo = teamLogos[cleanName(d.team)];
    const card = document.createElement("div");
    card.className = "rider-card";
    card.innerHTML = `
      <div class="rider-img">
        <img src="assets/images/perfil_jogador/foto_top_score/${d.image}"
             onerror="this.onerror=null;this.src='assets/images/silhouette/silhouette_foto_top_score.svg';">
      </div>
      <div class="rider-content">
        <h3 class="rider-name">${name}</h3>
        <div class="rider-meta">
          <img src="assets/images/team-logo/${logo || 'logo_default.svg'}" class="flag">
          <span>${d.team} | ${d.position}</span>
        </div>
      </div>
      <span class="rider-number">${d.golos}</span>
    `;
    grid.appendChild(card);
  });
}

updateOfficialGrid();
