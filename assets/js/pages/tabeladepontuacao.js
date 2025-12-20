/* =========================================================
   TABELA DE PONTUAÇÃO — UEFA Style
   - Alterna entre views simplificada / completa
   - Carrega dados de Google Sheets (CSV)
   - Calcula pontos, golos, forma (últimos 5 jogos)
   - Critérios FIFA (confronto direto / mini-liga)
   - Lazy-load de logos
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  // ------------------ CONTROLO DE TABS ------------------
  const tabs = document.querySelectorAll(".uefa-table .tab");
  const simplified = document.getElementById("simplified");
  const full = document.getElementById("full");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const view = tab.dataset.view;
      simplified.classList.remove("active");
      full.classList.remove("active");
      if(view==="simplified") simplified.classList.add("active");
      if(view==="full") full.classList.add("active");
    });
  });

});

// ------------------ FUNÇÃO PARA CARREGAR CSV ------------------
async function fetchCSV(url, cacheKey){
  try{
    const res = await fetch(url);
    const text = await res.text();
    const [headerLine,...lines] = text.trim().split("\n");
    const headers = headerLine.split(",").map(h=>h.trim());
    const data = lines.map(line=>{
      const cols = line.split(",").map(c=>c.trim());
      const obj = {};
      headers.forEach((h,i)=>obj[h]=cols[i]||"");
      return obj;
    });
    localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  }catch(e){
    const cached = localStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : [];
  }
}

// ------------------ LAZY LOAD LOGOS ------------------
function lazyLoadLogos(container=document){
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

// ------------------ CALCULAR TABELA ------------------
(async function(){
  const sheets = {
    ficha_jogo: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=0&single=true&output=csv",
    equipas: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1253685309&single=true&output=csv",
    jogadores: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1795344515&single=true&output=csv"
  };

  const [ficha_jogo, equipas, jogadores] = await Promise.all([
    fetchCSV(sheets.ficha_jogo,"tabela_ficha"),
    fetchCSV(sheets.equipas,"tabela_equipas"),
    fetchCSV(sheets.jogadores,"tabela_jogadores")
  ]);

  // ------------------ LOGOS ------------------
  const logos = {};
  equipas.forEach(e=>{
    logos[e.Team?.trim()] = e.Logopng ? e.Logopng.trim() : "";
  });

  function getLogo(teamName){
    const logoFile = logos[teamName?.trim()];
    return logoFile
      ? (logoFile.startsWith("http") ? logoFile : `assets/images/team-logo/${logoFile}`)
      : "assets/images/team-logo/default.svg";
  }

  // ------------------ CALCULO DE PONTOS E FORMA ------------------
  const teams = {};

  ficha_jogo.forEach(match=>{
    const home = match.HomeTeam?.trim();
    const away = match.AwayTeam?.trim();
    const hg = parseInt(match.HomeGoals);
    const ag = parseInt(match.AwayGoals);
    if(!home || !away || isNaN(hg) || isNaN(ag)) return;

    [home, away].forEach(t=>{
      if(!teams[t]){
        teams[t]={ name:t, played:0, wins:0, draws:0, losses:0, gf:0, ga:0, points:0, form:[] };
      }
    });

    teams[home].played++;
    teams[away].played++;
    teams[home].gf += hg; teams[home].ga += ag;
    teams[away].gf += ag; teams[away].ga += hg;

    if(hg>ag){
      teams[home].wins++; teams[away].losses++;
      teams[home].points += 3;
      teams[home].form.push("win"); teams[away].form.push("loss");
    }else if(hg<ag){
      teams[away].wins++; teams[home].losses++;
      teams[away].points += 3;
      teams[away].form.push("win"); teams[home].form.push("loss");
    }else{
      teams[home].draws++; teams[away].draws++;
      teams[home].points++; teams[away].points++;
      teams[home].form.push("draw"); teams[away].form.push("draw");
    }
  });

  // ------------------ REGRAS FIFA / CONFRONTO DIRETO ------------------
  function compareTeams(a,b){
    if(a.points!==b.points) return b.points - a.points;

    const tiedTeams = Object.values(teams).filter(t=>t.points===a.points);
    if(tiedTeams.length>1){
      const miniStats={};
      tiedTeams.forEach(t=> miniStats[t.name]={ pts:0, gd:0, gf:0 });
      ficha_jogo.forEach(m=>{
        const home = m.HomeTeam.trim();
        const away = m.AwayTeam.trim();
        const hg = parseInt(m.HomeGoals);
        const ag = parseInt(m.AwayGoals);
        if(!miniStats[home]||!miniStats[away]) return;
        if(hg>ag) miniStats[home].pts +=3;
        else if(hg<ag) miniStats[away].pts +=3;
        else { miniStats[home].pts++; miniStats[away].pts++; }
        miniStats[home].gd += hg-ag; miniStats[away].gd += ag-hg;
        miniStats[home].gf += hg; miniStats[away].gf += ag;
      });
      const A = miniStats[a.name]; const B = miniStats[b.name];
      if(A && B){
        if(A.pts!==B.pts) return B.pts - A.pts;
        if(A.gd!==B.gd) return B.gd - A.gd;
        if(A.gf!==B.gf) return B.gf - A.gf;
      }
    }

    const diffA = a.gf - a.ga; const diffB = b.gf - b.ga;
    if(diffA!==diffB) return diffB - diffA;
    if(a.gf!==b.gf) return b.gf - a.gf;
    return Math.random()-0.5;
  }

  const sortedTeams = Object.values(teams).sort(compareTeams);

  // ------------------ FORM (últimos 5 jogos) ------------------
  const FORM_MAX=5;
  function renderForm(team){
    const f = (team.form||[]).slice(-FORM_MAX).reverse();
    if(!f.length) return "";
    return f.map(r=>{
      const cls = r==="win"?"win":(r==="draw"?"draw":"loss");
      return `<span class="match-form ${cls}"></span>`;
    }).join("");
  }

  // ------------------ PREENCHER TABELAS ------------------
  const simplified = document.querySelector("#simplified tbody");
  const full = document.querySelector("#full tbody");
  simplified.innerHTML=""; full.innerHTML="";

  sortedTeams.forEach((t,i)=>{
    const diff = t.gf - t.ga;
    const logo = getLogo(t.name);

    simplified.innerHTML+=`
      <tr>
        <td>${i+1}</td>
        <td><div class="team"><img data-src="${logo}"><span>${t.name}</span></div></td>
        <td>${t.played}</td>
        <td>${diff}</td>
        <td><b>${t.points}</b></td>
        <td><div class="form">${renderForm(t)}</div></td>
      </tr>`;

    full.innerHTML+=`
      <tr>
        <td>${i+1}</td>
        <td><img data-src="${logo}" width="30"></td>
        <td><span>${t.name}</span></td>
        <td>${t.played}</td>
        <td>${t.wins}</td>
        <td>${t.draws}</td>
        <td>${t.losses}</td>
        <td>${t.gf}</td>
        <td>${t.ga}</td>
        <td>${diff>0?"+"+diff:diff}</td>
        <td><b>${t.points}</b></td>
        <td><div class="form">${renderForm(t)}</div></td>
      </tr>`;
  });

  lazyLoadLogos(document);

})();
