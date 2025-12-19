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

      // Drag to scroll
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
   Página: Melhores Marcadores
   Componente: UEFA Style Player Carousel
   Função: Scroll horizontal com botões e drag
   ===================================================== */






   /* =====================================================
   Página: Melhores Marcadores
   Componente: UEFA Style Player Carousel
   Função: Carregar dados de jogadores e fichas de jogos via Google Sheets
   ===================================================== */

   const URLS = {
  ficha_jogo: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=0&single=true&output=csv",
  jogadores: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1795344515&single=true&output=csv",
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
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, " ")                             // remove espaços duplicados
    .trim();
}

(async function () {
  try {
    const [fText, jText] = await Promise.all([
      fetch(URLS.ficha_jogo).then(r => r.text()),
      fetch(URLS.jogadores).then(r => r.text())
    ]);

    const fichas = parseCSV(fText);
    const jogadores = parseCSV(jText);

    const stats = {};

    // Criar player base
    jogadores.forEach(j => {
      const name = cleanName(j.Player);
      if (!name) return;

      stats[name] = {
        gols: 0,
        jogos: 0,
        team: j.Team || "",
        position: j.Position || "",
        image: j.Image || `${name.replace(/\s+/g, '_')}.png`
      };
    });

    // -----------------------------------------------------------
    // PROCESSAR FICHA_JOGO: GOLOS + JOGOS
    // -----------------------------------------------------------
    fichas.forEach(f => {

      // ---- PROCESSAR MARCADORES (Nome:Qtd) ----
      function processScorers(str) {
        if (!str) return [];

        return str.split(",").map(e => {
          const [name, qty] = e.split(":");
          return {
            name: cleanName(name),
            goals: Number(qty) || 1
          };
        });
      }

      const scorersHome = processScorers(f.ScorersHome);
      const scorersAway = processScorers(f.ScorersAway);

      // Somar golos
      [...scorersHome, ...scorersAway].forEach(s => {
        if (stats[s.name]) {
          stats[s.name].gols += s.goals;
        }
      });

      // ---- PROCESSAR JOGADORES (lista separada por vírgulas) ----
      function processPlayers(str) {
        if (!str) return [];
        return str.split(",").map(p => cleanName(p));
      }

      const playersHome = processPlayers(f.PlayersHome);
      const playersAway = processPlayers(f.PlayersAway);

      // Contar jogos
      [...playersHome, ...playersAway].forEach(player => {
        if (stats[player]) {
          stats[player].jogos += 1;
        }
      });

    });

    // -----------------------------------------------------------
    // ORDENAR TOP 6
    // -----------------------------------------------------------
    const top6 = Object.entries(stats)
      .map(([n, d]) => ({ name: n, ...d }))
      .sort((a, b) => b.gols - a.gols || a.name.localeCompare(b.name))
      .slice(0, 6);

    const track = document.querySelector('.carousel-track');

    track.innerHTML = top6.map(p => `
      <div class="player-card">
        <div class="player-image-wrapper">
          <img class="player-photo" src="images/${p.image}" alt="${p.name}">
          <img class="team-logo" src="images/teams/${p.team.replace(/\s+/g, '_')}.png" alt="${p.team}">
        </div>

        <h3>${p.name}</h3>
        <p class="position">${p.position || "-"}</p>

        <div class="stats">
          <div>
            <span class="golos_estat">${p.gols}</span>
            <strong>Golos</strong>
          </div>
          <div>
            <span class="golos_estat">${p.jogos}</span>
            <strong>Jogos</strong>
          </div>
        </div>
      </div>
    `).join("");

  } catch (e) {
    console.error("Erro carregando marcadores:", e);
  }
})();






   /* =====================================================
   Página: Melhores Marcadores
   Componente: UEFA Style Player Carousel
   Função: Carregar dados de jogadores e fichas de jogos via Google Sheets
   ===================================================== */
















   /* ===== Script para atualizar e renderizar o grid de melhores marcadores ===== */
 async function updateOfficialGrid() {
      const urlFichas = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=0&single=true&output=csv";
      const urlJogadores = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1795344515&single=true&output=csv";

      function parseCSV(text) {
        const lines = text.trim().split(/\r?\n/);
        const headers = lines.shift().split(",").map(h => h.trim());
        return lines.map(line => {
          const values = line.split(",");
          return headers.reduce((obj,h,i) => ({...obj, [h]: values[i]?values[i].trim():""}), {});
        });
      }

      const [fText,jText] = await Promise.all([
        fetch(urlFichas).then(r=>r.text()),
        fetch(urlJogadores).then(r=>r.text())
      ]);

      const fichas = parseCSV(fText);
      const jogadores = parseCSV(jText);

      const stats = {};
      jogadores.forEach(j=>{
        const name = j.Player.trim();
        if(!name) return;
        stats[name] = {
          golos: 0,
          team: j.Team || "",
          position: j.Position || "",
          image: j.Image || `${name.replace(/\s+/g,'_')}.png`,
          bg: j.BG || 'img/default-bg.jpg'
        };
      });

      fichas.forEach(f=>{
        ["ScorersHome","ScorersAway"].forEach(col=>{
          const scorers = f[col];
          if(!scorers) return;
          scorers.split(",").forEach(s=>{
            const [name,qty] = s.split(":").map(x=>x.trim());
            if(stats[name]) stats[name].golos += Number(qty)||1;
          });
        });
      });

      const sorted = Object.entries(stats).sort((a,b)=>b[1].golos-a[1].golos);
      const grid = document.getElementById("official-grid");
      grid.innerHTML = "";

      sorted.forEach(([name,data],i)=>{
        const card = document.createElement("div");
        card.className = "rider-card";
        card.style.setProperty('--bg', `url('${data.bg}')`);
        card.setAttribute('data-name', name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,'').trim());
        card.setAttribute('data-team', data.team.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,'').trim());
        card.innerHTML = `
          <div class="rider-img">
            <img src="${data.image}" onerror="this.onerror=null; this.src='assets/images/silhouette/silhouetteperfil.png';">
          </div>
          <div class="rider-content">
            <h3 class="rider-name">${name}</h3>
            <div class="rider-meta">
              <img src="images/${data.team.replace(/\s+/g,'_')}.png" class="flag">
              <span>${data.team} | ${data.position}</span>
            </div>
          </div>
          <span class="rider-number">${data.golos}</span>
        `;
        grid.appendChild(card);
      });

      // Pesquisa funcional
      document.getElementById("ts-search").addEventListener("input", function(){
        const term = this.value.normalize("NFD").replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
        document.querySelectorAll(".rider-card").forEach(card=>{
          const nameAttr = card.getAttribute('data-name') || "";
          const teamAttr = card.getAttribute('data-team') || "";
          const nameH3 = card.querySelector(".rider-name")?.textContent || "";
          const nameNormalized = nameH3.normalize("NFD").replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
          const match = nameAttr.includes(term) || teamAttr.includes(term) || nameNormalized.includes(term);
          card.style.display = match ? "" : "none";
        });
      });
    }

    updateOfficialGrid();
    

   /* ===== Script para atualizar e renderizar o grid de melhores marcadores ===== */
