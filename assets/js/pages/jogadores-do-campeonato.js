// =======================
// FUNÇÕES AUXILIARES
// =======================
const normalize = s => (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();

// Parser CSV robusto: ignora aspas e vírgulas extras
function parseCSV(text){
  const lines = text.trim().split(/\r?\n/);
  if(!lines.length) return [];
  const headers = lines[0].match(/(?:\"([^\"]*)\"|([^\",]+))/g).map(h=>h.replace(/^"|"$/g,'').trim());
  const rows = [];
  for(let i=1;i<lines.length;i++){
    const line = lines[i];
    if(!line.trim()) continue;
    const values = [];
    let inQuotes=false,value='';
    for(let c=0;c<line.length;c++){
      const char=line[c];
      if(char==='"' && line[c-1]!=='\\'){inQuotes=!inQuotes; continue;}
      if(char===',' && !inQuotes){values.push(value.trim()); value=''; continue;}
      value+=char;
    }
    values.push(value.trim());
    const obj={};
    headers.forEach((h,j)=>obj[h]=values[j]||"");
    rows.push(obj);
  }
  return rows;
}

// Fetch CSV com fallback para cache (offline-ready)
async function fetchCSV(url){
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error("Network response not ok");
    return parseCSV(await res.text());
  }catch(e){
    console.warn("Falha fetch CSV, tentando cache...", e);
    const cached = await caches.match(url);
    if(cached){
      const text = await cached.text();
      return parseCSV(text);
    }
    return [];
  }
}

// =======================
// ATUALIZA TOP SCORERS
// =======================
async function updateTopScorers(){
  const urlFichas = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=0&single=true&output=csv";
  const urlEquipas = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1253685309&single=true&output=csv";
  const urlJogadores = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1795344515&single=true&output=csv";

  const [fichas,equipas,jogadores] = await Promise.all([fetchCSV(urlFichas),fetchCSV(urlEquipas),fetchCSV(urlJogadores)]);

  const stats={};
  const clubSet=new Set();

  // Preprocess jogadores
  jogadores.forEach(j=>{
    const name=j.Player.trim();
    const pos=j.Position?.trim()||"Outro";
    stats[name]={golos:0,team:j.Team||"",position:pos,image:j.Image||"assets/images/silhouette/silhouette64x64.webp"};
    if(j.Team) clubSet.add(j.Team);
  });

  // Popula select de clubes
  const selectClub=document.getElementById("ts-club-select");
  if(selectClub){
    clubSet.forEach(club=>{
      const opt=document.createElement("option");
      opt.value=club; opt.textContent=club;
      selectClub.appendChild(opt);
    });
  }

  // Contabiliza golos
  fichas.forEach(f=>{
    ["ScorersHome","ScorersAway"].forEach(col=>{
      const scorers=f[col]; if(!scorers) return;
      const regex=/(.*?):\s*(\d+)/g; let match;
      while((match=regex.exec(scorers))!==null){
        const name=match[1].trim(), goals=parseInt(match[2])||0;
        if(stats[name]) stats[name].golos+=goals;
      }
    });
  });

  // Agrupa por posição
  const grouped={"Guarda-redes":[],"Fixos":[],"Alas":[],"Pivôs":[],"Outro":[]};
  Object.entries(stats).forEach(([name,data])=>{
    const pos=(data.position||"Outro").toLowerCase();
    if(pos.includes("guarda")) grouped["Guarda-redes"].push({playerName:name,...data});
    else if(pos.includes("fixo")) grouped["Fixos"].push({playerName:name,...data});
    else if(pos.includes("ala")) grouped["Alas"].push({playerName:name,...data});
    else if(pos.includes("piv")) grouped["Pivôs"].push({playerName:name,...data});
    else grouped["Outro"].push({playerName:name,...data});
  });

  const displayOrder=["Guarda-redes","Fixos","Alas","Pivôs","Outro"];
  displayOrder.forEach(pos=>grouped[pos].sort((a,b)=>a.playerName.localeCompare(b.playerName)));

  const grid=document.querySelector(".scorers-grid");
  if(!grid) return;
  grid.innerHTML="";

  function cardHTML(p){
    const link=`jogador.html?player=${encodeURIComponent(p.playerName)}`;
    return `
      <div class="scorer-card" data-name="${normalize(p.playerName)}" data-team="${normalize(p.team)}">
        <div class="ts-rank"><p class="ts-rank__label">${p.rank}</p></div>
        <div class="player-info">
          <a href="${link}">
            <img src="${p.image}" loading="lazy" class="player-photo" 
                 onerror="this.onerror=null;this.src='assets/images/silhouette/silhouette64x64.webp';">
          </a>
          <div class="player-text">
            <a href="${link}"><h3>${p.playerName}</h3></a>
            <p>${p.position}</p>
          </div>
        </div>
      </div>`;
  }

  // Renderiza usando DocumentFragment
  const fragment = document.createDocumentFragment();
  let rankCounter=1;
  displayOrder.forEach(pos=>{
    if(!grouped[pos].length) return;

    const title = document.createElement("h2");
    title.className="pos-title";
    title.textContent = pos;
    fragment.appendChild(title);

    grouped[pos].forEach(p=>{
      p.rank=rankCounter++;
      const wrapper = document.createElement("div");
      wrapper.innerHTML = cardHTML(p);
      fragment.appendChild(wrapper.firstElementChild);
    });
  });
  grid.appendChild(fragment);

  // =================
  // FILTRO POR NOME / CLUBE
  // =================
  function filterCards(){
    const term=document.getElementById("ts-search")?.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")||"";
    const clubTerm=document.getElementById("ts-club-select")?.value||"";
    const cards=document.querySelectorAll(".scorer-card");
    const titles=document.querySelectorAll(".pos-title");

    cards.forEach(card=>{
      const name=card.dataset.name;
      const team=card.dataset.team;
      const show=(name.includes(term)) && (!clubTerm || team===normalize(clubTerm));
      card.style.display=show?"":"none";
    });

    titles.forEach(title=>{
      let el=title.nextElementSibling; let hasVisible=false;
      while(el && !el.classList.contains("pos-title")){
        if(el.classList.contains("scorer-card") && el.style.display!=="none"){hasVisible=true; break;}
        el=el.nextElementSibling;
      }
      title.style.display=hasVisible?"":"none";
    });
  }

  document.getElementById("ts-search")?.addEventListener("input", filterCards);
  document.getElementById("ts-club-select")?.addEventListener("change", filterCards);
}

updateTopScorers();
