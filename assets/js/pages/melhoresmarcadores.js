/* =====================================================
   Melhores Marcadores - UEFA Style Player Carousel
   - Scroll horizontal com botões e drag
   - Lazy-load imagens
   - Carregar dados via Google Sheets (offline-ready)
   - Grid oficial de melhores marcadores
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  // ---------------- CAROUSEL ----------------
  const track = document.querySelector('.carousel-track');
  const btnLeft = document.querySelector('.carousel-btn.left');
  const btnRight = document.querySelector('.carousel-btn.right');
  const scrollAmount = 283;

  const smoothScrollBy = (el, dist) =>
    el.scrollTo({ left: el.scrollLeft + dist, behavior: 'smooth' });

  btnLeft?.addEventListener('click', () => smoothScrollBy(track, -scrollAmount));
  btnRight?.addEventListener('click', () => smoothScrollBy(track, scrollAmount));

  // Drag to scroll
  let isDown = false, startX, scrollLeft;
  track?.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - track.offsetLeft; scrollLeft = track.scrollLeft; });
  track?.addEventListener('mouseleave', () => isDown = false);
  track?.addEventListener('mouseup', () => isDown = false);
  track?.addEventListener('mousemove', e => {
    if(!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    track.scrollLeft = scrollLeft - (x - startX);
  });
});

// ---------------- CSV PARSER ROBUSTO ----------------
function parseCSV(text) {
  const rows = [];
  const lines = text.trim().split(/\r?\n/);
  if(!lines.length) return [];
  const headers = lines.shift().split(",").map(h => h.trim());

  for(const line of lines){
    if(!line.trim()) continue;
    const values = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h,i)=> obj[h] = values[i] || "");
    rows.push(obj);
  }
  return rows;
}

// ---------------- CLEAN NAME ----------------
function cleanName(s){
  return (s||"")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/\s+/g," ").trim();
}

// ---------------- FETCH + OFFLINE ----------------
async function fetchCSV(url, cacheKey){
  try{
    const res = await fetch(url);
    const text = await res.text();
    const data = parseCSV(text);
    localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  }catch(e){
    const cached = localStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : [];
  }
}

// ---------------- LAZY LOAD IMAGES ----------------
function lazyLoadImages(container=document){
  const imgs = container.querySelectorAll("img[data-src]");
  const obs = new IntersectionObserver((entries, observer)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.src = entry.target.dataset.src;
        entry.target.removeAttribute("data-src");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.1});
  imgs.forEach(img=>obs.observe(img));
}

// ---------------- CAROUSEL TOP SCORERS ----------------
const URLS = {
  ficha_jogo: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=0&single=true&output=csv",
  jogadores: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1795344515&single=true&output=csv",
};

async function loadTopScorersCarousel(){
  try{
    const [fichas,jogadores] = await Promise.all([
      fetchCSV(URLS.ficha_jogo,"carousel_fichas"),
      fetchCSV(URLS.jogadores,"carousel_jogadores")
    ]);

    const stats = {};
    jogadores.forEach(j=>{
      const name = cleanName(j.Player);
      if(!name) return;
      stats[name] = {
        gols:0,
        jogos:0,
        team:j.Team||"",
        position:j.Position||"",
        image:j.Image||`assets/images/silhouette/silhouetteperfil.png`
      };
    });

    fichas.forEach(f=>{
      ["ScorersHome","ScorersAway"].forEach(col=>{
        const scorers = f[col];
        if(!scorers) return;
        scorers.split(",").forEach(s=>{
          const [name,qty]=s.split(":").map(x=>x.trim());
          const cname = cleanName(name);
          if(stats[cname]) stats[cname].gols += Number(qty)||1;
        });
      });
      ["PlayersHome","PlayersAway"].forEach(col=>{
        const players = f[col];
        if(!players) return;
        players.split(",").forEach(p=>{
          const cname = cleanName(p);
          if(stats[cname]) stats[cname].jogos += 1;
        });
      });
    });

    // Ordena top 6
    const top6 = Object.entries(stats)
      .map(([n,d])=>({name:n,...d}))
      .sort((a,b)=>b.gols - a.gols || a.name.localeCompare(b.name))
      .slice(0,6);

    const track = document.querySelector('.carousel-track');
    track.innerHTML = top6.map(p=>`
      <div class="player-card">
        <div class="player-image-wrapper">
          <img class="player-photo" data-src="${p.image}" alt="${p.name}">
          <img class="team-logo" data-src="assets/images/team-logo/${p.team.replace(/\s+/g,'_')}.png" alt="${p.team}">
        </div>
        <h3>${p.name}</h3>
        <p class="position">${p.position||"-"}</p>
        <div class="stats">
          <div><span>${p.gols}</span><strong>Golos</strong></div>
          <div><span>${p.jogos}</span><strong>Jogos</strong></div>
        </div>
      </div>
    `).join("");

    lazyLoadImages(track);

  }catch(e){ console.error("Erro carregando top scorers carousel:", e);}
}

// ---------------- GRID OFICIAL ----------------
async function updateOfficialGrid(){
  try{
    const [fichas,jogadores] = await Promise.all([
      fetchCSV(URLS.ficha_jogo,"grid_fichas"),
      fetchCSV(URLS.jogadores,"grid_jogadores")
    ]);

    const stats = {};
    jogadores.forEach(j=>{
      const name = cleanName(j.Player);
      if(!name) return;
      stats[name]={
        golos:0,
        team:j.Team||"",
        position:j.Position||"",
        image:j.Image||`assets/images/silhouette/silhouetteperfil.png`,
        bg:j.BG||"assets/images/silhouette/bg_default.jpg"
      };
    });

    fichas.forEach(f=>{
      ["ScorersHome","ScorersAway"].forEach(col=>{
        const scorers = f[col];
        if(!scorers) return;
        scorers.split(",").forEach(s=>{
          const [name,qty]=s.split(":").map(x=>x.trim());
          const cname = cleanName(name);
          if(stats[cname]) stats[cname].golos += Number(qty)||1;
        });
      });
    });

    const sorted = Object.entries(stats)
      .sort((a,b)=>b[1].golos-a[1].golos);

    const grid = document.getElementById("official-grid");
    grid.innerHTML = "";

    sorted.forEach(([name,data])=>{
      const card = document.createElement("div");
      card.className="rider-card";
      card.style.setProperty('--bg',`url('${data.bg}')`);
      card.setAttribute('data-name', name.toLowerCase());
      card.setAttribute('data-team', data.team.toLowerCase());
      card.innerHTML = `
        <div class="rider-img">
          <img data-src="${data.image}" onerror="this.src='assets/images/silhouette/silhouetteperfil.png';">
        </div>
        <div class="rider-content">
          <h3 class="rider-name">${name}</h3>
          <div class="rider-meta">
            <img data-src="assets/images/team-logo/${data.team.replace(/\s+/g,'_')}.png" class="flag">
            <span>${data.team} | ${data.position}</span>
          </div>
        </div>
        <span class="rider-number">${data.golos}</span>
      `;
      grid.appendChild(card);
    });

    lazyLoadImages(grid);

    // Pesquisa funcional
    document.getElementById("ts-search")?.addEventListener("input", function(){
      const term = this.value.normalize("NFD").replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
      document.querySelectorAll(".rider-card").forEach(card=>{
        const nameAttr = card.getAttribute('data-name')||"";
        const teamAttr = card.getAttribute('data-team')||"";
        const nameH3 = card.querySelector(".rider-name")?.textContent||"";
        const nameNormalized = nameH3.normalize("NFD").replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
        const match = nameAttr.includes(term)||teamAttr.includes(term)||nameNormalized.includes(term);
        card.style.display = match?"":"none";
      });
    });

  }catch(e){ console.error("Erro carregando grid oficial:", e);}
}

// ---------------- INIT ----------------
loadTopScorersCarousel();
updateOfficialGrid();
