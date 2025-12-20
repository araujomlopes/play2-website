// =======================
// FUNÇÕES UTILITÁRIAS
// =======================
const normalize = s => (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const safeNumber = val => { const n = Number(String(val||"0").replace(",",".").trim()); return isNaN(n)?0:n; };
const countCards = val => { if(!val) return 0; const v=String(val).trim(); if(!isNaN(v)) return Number(v); return v.split(",").filter(x=>x.trim()!=="").length; };

// =======================
// CARREGAR CSV (OFFLINE + LOCALSTORAGE)
// =======================
async function carregarCSV(url, storageKey){
  try {
    const res = await fetch(url);
    const text = await res.text();
    const lines = text.trim().split('\n');
    const headers = lines.shift().split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const data = lines.map(l=>{
      const values = l.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const obj = {};
      headers.forEach((h,i)=>obj[h.trim()] = values[i]?values[i].trim().replace(/^"|"$/g,""):"");
      return obj;
    });
    localStorage.setItem(storageKey, JSON.stringify(data));
    return data;
  } catch(e){
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  }
}

// =======================
// MAIN PLAYER PAGE
// =======================
document.addEventListener("DOMContentLoaded", async ()=>{
  const urlParams = new URLSearchParams(window.location.search);
  const PLAYER_NAME = urlParams.get("player") || "Dickson";

  const SHEETS = {
    jogos: "https://docs.google.com/spreadsheets/d/e/.../pub?gid=0&single=true&output=csv",
    equipas: "https://docs.google.com/spreadsheets/d/e/.../pub?gid=1253685309&single=true&output=csv",
    jogadores: "https://docs.google.com/spreadsheets/d/e/.../pub?gid=1795344515&single=true&output=csv"
  };

  const [jogos,equipas,jogadores] = await Promise.all([
    carregarCSV(SHEETS.jogos, "jogos"),
    carregarCSV(SHEETS.equipas, "equipas"),
    carregarCSV(SHEETS.jogadores, "jogadores")
  ]);

  const player = jogadores.find(p=>normalize(p.Player)===normalize(PLAYER_NAME));
  if(!player) return;
  const teamKey = normalize(player.Team);
  const team = equipas.find(e=>normalize(e.Team)===teamKey);

  // ===== HEADER DO JOGADOR =====
  document.querySelector(".player-number").textContent = player.Number;
  document.querySelector(".firstName").textContent = player.Player;
  document.querySelector(".lastName").textContent = player.Apelido;
  document.querySelector(".player-position").textContent = player.Position;
  document.querySelector(".player-club").textContent = player.Team;

  const playerImg = document.querySelector(".player-photo img");
  playerImg.dataset.src = `assets/images/player_stats_perfil_images/${PLAYER_NAME}.webp`;
  new IntersectionObserver((entries, obs)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.src = entry.target.dataset.src; obs.disconnect(); }
    });
  }).observe(playerImg);

  if(team){
    const clubLogo = document.querySelector(".club-logo");
    clubLogo.dataset.src = `assets/images/team-logo/${team.Logopng}`;
    new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){ entry.target.src = entry.target.dataset.src; obs.disconnect(); }
      });
    }).observe(clubLogo);
  }

  // ===== FILTRAR JOGOS =====
  const jogosTeam = jogos.filter(j=>normalize(j.HomeTeam)===teamKey || normalize(j.AwayTeam)===teamKey);
  let wins=0, draws=0, defeats=0, goals=0, yellow=0, red=0, yellowRed=0;
  jogosTeam.forEach(j=>{
    const hg=safeNumber(j.HomeGoals), ag=safeNumber(j.AwayGoals);
    const isHome = normalize(j.HomeTeam)===teamKey;
    if(hg===ag) draws++; else if((hg>ag&&isHome)||(ag>hg&&!isHome)) wins++; else defeats++;
    goals += isHome?hg:ag;
    yellow += countCards(isHome?j.YellowsHome:j.YellowsAway);
    red += countCards(isHome?j.RedsHome:j.RedsAway);
    yellowRed += countCards(isHome?j["Yellow red Home"]:j["Yellow red Away"]);
  });
  const totalGames = Math.max(jogosTeam.length,1);

  // ===== DONUT =====
  const donut=document.querySelector(".donut-svg-new");
  const c=2*Math.PI*15.5;
  const w=(wins/totalGames)*c, d=(draws/totalGames)*c, l=(defeats/totalGames)*c;
  donut.innerHTML = `
    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" stroke-width="3"/>
    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#00D600" stroke-width="3" stroke-dasharray="0 ${c}" transform="rotate(-90 18 18)"/>
    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1E40FF" stroke-width="3" stroke-dasharray="0 ${c}" stroke-dashoffset="0" transform="rotate(-90 18 18)"/>
    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#9CA3AF" stroke-width="3" stroke-dasharray="0 ${c}" stroke-dashoffset="0" transform="rotate(-90 18 18)"/>
  `;
  const circles = donut.querySelectorAll("circle");
  circles[1].animate([{strokeDasharray:`0 ${c}`},{strokeDasharray:`${w} ${c}`}],{duration:800,fill:"forwards"});
  circles[2].animate([{strokeDasharray:`0 ${c}`},{strokeDasharray:`${d} ${c}`, strokeDashoffset:`-${w}`}],{duration:800,fill:"forwards"});
  circles[3].animate([{strokeDasharray:`0 ${c}`},{strokeDasharray:`${l} ${c}`, strokeDashoffset:`-${w+d}`}],{duration:800,fill:"forwards"});
  document.querySelector(".donut-number-new").textContent = jogosTeam.length;

  // ===== STATS NUMÉRICOS =====
  const stats=document.querySelectorAll(".ks-right .stat-number");
  [player["Data de nascimento"],player["Local de Nascimento"],player["Nacionalidade"],player["Altura"],player["Pé preferido"],player["No clube desde"],goals,yellow,red,yellowRed].forEach((v,i)=>stats[i].textContent=v??0);

  // ===== BARRAS =====
  const bars={wins: document.querySelector(".bar-fill.wins"), draws: document.querySelector(".bar-fill.draws"), defeats: document.querySelector(".bar-fill.defeats")};
  const barValues=[wins,draws,defeats];
  Object.keys(bars).forEach((key,i)=>{
    bars[key].style.width="0%";
    bars[key].style.transition="width 0.8s ease";
    setTimeout(()=>bars[key].style.width=(barValues[i]/totalGames*100)+"%",50);
  });
  const barTexts=document.querySelectorAll(".bar-row .bar-value");
  [wins,draws,defeats].forEach((v,i)=>barTexts[i].textContent=v);

  // ===== SLIDER =====
  const track=document.querySelector(".mu-slider-track");
  track.innerHTML="";
  jogosTeam.forEach(j=>{
    const home = equipas.find(e=>normalize(e.Team)===normalize(j.HomeTeam));
    const away = equipas.find(e=>normalize(e.Team)===normalize(j.AwayTeam));
    const homeGoals = j.HomeGoals?.trim()!==""?safeNumber(j.HomeGoals):null;
    const awayGoals = j.AwayGoals?.trim()!==""?safeNumber(j.AwayGoals):null;
    const scoreDisplay=(homeGoals===null && awayGoals===null)?j["Time"]:`${homeGoals} - ${awayGoals}`;
    const card=document.createElement("div");
    card.className="mu-card";
    card.innerHTML=`
      <p class="info">${j.Data}, ${j["Local do jogo"]}</p>
      <div class="score">
        <img data-src="assets/images/team-logo/${home?.Logopng||""}" alt="">
        <span>${scoreDisplay}</span>
        <img data-src="assets/images/team-logo/${away?.Logopng||""}" alt="">
      </div>
      <div class="teams"><span>${j.HomeTeam}</span><span>VS</span><span>${j.AwayTeam}</span></div>
    `;
    track.appendChild(card);
  });

  // Lazy-load slider images
  track.querySelectorAll("img[data-src]").forEach(img=>{
    new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){ entry.target.src=entry.target.dataset.src; entry.target.removeAttribute("data-src"); obs.unobserve(entry.target); }
      });
    }, {root: track, threshold:0.1}).observe(img);
  });

  // Slider nav
  const STEP=280;
  document.querySelector(".mu-slider-btn.prev").onclick = ()=>track.scrollBy({left:-STEP,behavior:"smooth"});
  document.querySelector(".mu-slider-btn.next").onclick = ()=>track.scrollBy({left:STEP,behavior:"smooth"});

  // Drag & Swipe
  let isDown=false,startX,scrollLeft;
  track.addEventListener("mousedown",e=>{isDown=true;startX=e.pageX-track.offsetLeft;scrollLeft=track.scrollLeft;});
  track.addEventListener("mouseleave",()=>{isDown=false;});
  track.addEventListener("mouseup",()=>{isDown=false;});
  track.addEventListener("mousemove",e=>{if(!isDown) return;e.preventDefault();const x=e.pageX-track.offsetLeft;const walk=(x-startX)*1.5;track.scrollLeft=scrollLeft-walk;});
  track.addEventListener("touchstart",e=>{isDown=true;startX=e.touches[0].pageX-track.offsetLeft;scrollLeft=track.scrollLeft;});
  track.addEventListener("touchend",()=>{isDown=false;});
  track.addEventListener("touchmove",e=>{if(!isDown) return;const x=e.touches[0].pageX-track.offsetLeft;const walk=(x-startX)*1.5;track.scrollLeft=scrollLeft-walk;});
});
