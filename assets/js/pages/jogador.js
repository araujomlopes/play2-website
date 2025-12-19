 
 

 // ===== SEGUNDO SCRIT INICIO =====
 // ===============================
  // CONFIGURAÇÃO: URL DO CSV / SHEET
  const SHEET_CSV_URL = 'LINK_DO_SEU_CSV_PUBLICO';

  // ===============================
  // FUNÇÃO PARA ATUALIZAR ESTATÍSTICAS DO JOGADOR
  function updatePlayerStats(data) {
    document.querySelector('.firstName').textContent = data.firstName;
    document.querySelector('.lastName').textContent = data.lastName;
    document.querySelector('.player-number').textContent = data.number;
    document.querySelector('.player-position').textContent = data.position;
    document.querySelector('.player-club').textContent = data.club;
    document.querySelector('.club-logo').src = data.clubLogo;
    document.querySelector('.player-photo img').src = data.photo;

    // Stats
    document.getElementById('birthdate').textContent = data.birthdate;
    document.getElementById('birthplace').textContent = data.birthplace;
    document.getElementById('nationality').textContent = data.nationality;
    document.getElementById('height').textContent = data.height;
    document.getElementById('preferredFoot').textContent = data.preferredFoot;
    document.getElementById('clubSince').textContent = data.clubSince;
    document.getElementById('goals').textContent = data.goals;
    document.getElementById('yellowCards').textContent = data.yellowCards;
    document.getElementById('redCards').textContent = data.redCards;
    document.getElementById('yellowRedCards').textContent = data.yellowRedCards;

    // Atualiza Donut e Barras
    document.querySelector('.donut-number-new').textContent = data.games;
    document.querySelector('.bar-fill.wins').style.width = data.wins + '%';
    document.querySelector('.bar-value').textContent = data.wins;
  }

  // ===============================
  // FUNÇÃO PARA PREENCHER JOGOS (slider)
  function updatePlayerMatches(matches) {
    const track = document.querySelector('.mu-slider-track');
    track.innerHTML = ''; // limpa cards existentes
    matches.forEach(match => {
      const card = document.createElement('div');
      card.classList.add('mu-card');
      card.innerHTML = `
        <img class="league" src="${match.leagueLogo}" alt="">
        <p class="info">${match.date}, ${match.stadium}</p>
        <div class="score">
          <img src="${match.teamAlogo}" alt="">
          <span>${match.score}</span>
          <img src="${match.teamBlogo}" alt="">
        </div>
        <div class="teams"><span>${match.teamA}</span><span>VS</span><span>${match.teamB}</span></div>
      `;
      track.appendChild(card);
    });
  }

  // ===============================
  // FUNÇÃO PARA CARREGAR CSV
  Papa.parse(SHEET_CSV_URL, {
    download: true,
    header: true,
    complete: function(results) {
      const playerData = results.data[0]; // assume 1 jogador por página
      updatePlayerStats(playerData);

      const matches = results.data; // ou outro range para jogos
      updatePlayerMatches(matches);
    }
  });
  
  // ===== SEGUNDO SCRIT FIM =====

  


 
 
 
 
 
 
 
 
 
 
 
 
 // ===== PRIMEIRO SCRIT INICIO =====
document.addEventListener("DOMContentLoaded", async () => {

  const urlParams = new URLSearchParams(window.location.search);
  const PLAYER_NAME = urlParams.get("player") || "Dickson";

  const SHEETS = {
    jogos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=0&single=true&output=csv",
    equipas: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1253685309&single=true&output=csv",
    jogadores: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1795344515&single=true&output=csv"
  };

  const loadCSV = url => new Promise(res =>
    Papa.parse(url,{download:true,header:true,complete:r=>res(r.data)})
  );

  const normalize = s => (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  const safeNumber = val => { const n = Number(String(val||"0").replace(",",".").trim()); return isNaN(n)?0:n; };
  const countCards = val => {
    if(!val) return 0;
    const v = String(val).trim();
    if(!isNaN(v)) return Number(v);
    return v.split(",").filter(x=>x.trim()!=="").length;
  };

  // Carrega todos os CSVs
  const [jogos,equipas,jogadores] = await Promise.all([
    loadCSV(SHEETS.jogos),
    loadCSV(SHEETS.equipas),
    loadCSV(SHEETS.jogadores)
  ]);

  const player = jogadores.find(p => normalize(p.Player) === normalize(PLAYER_NAME));
  if(!player) return;

  const teamKey = normalize(player.Team);
  const team = equipas.find(e => normalize(e.Team) === teamKey);

  // ===== BANNER RESPONSIVO (lazy-load) =====
  if(player && team){
    const teamFolder = team.Team.replace(/\s+/g,'_'); // Substitui espaços por underline
    const picture = document.querySelector(".bg-texture-container");
    const img = picture.querySelector("img");
    const sources = picture.querySelectorAll("source");

    sources[0].dataset.srcset = `assets/images/banner_players/${teamFolder}/1920.webp`;
    sources[1].dataset.srcset = `assets/images/banner_players/${teamFolder}/1200.webp`;
    sources[2].dataset.srcset = `assets/images/banner_players/${teamFolder}/800.webp`;
    img.dataset.src = `assets/images/banner_players/${teamFolder}/800.webp`;

    // Lazy load usando IntersectionObserver
    const obs = new IntersectionObserver((entries, observer)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          sources.forEach(s=>s.srcset=s.dataset.srcset);
          img.src = img.dataset.src;
          observer.disconnect();
        }
      });
    });
    obs.observe(picture);
  }

  // ===== HEADER DO JOGADOR =====
  document.querySelector(".player-number").textContent = player.Number;
  document.querySelector(".firstName").textContent = player.Player;
  document.querySelector(".lastName").textContent = player.Apelido;
  document.querySelector(".player-position").textContent = player.Position;
  document.querySelector(".player-club").textContent = player.Team;

  const playerImg = document.querySelector(".player-photo img");
  playerImg.dataset.src = `assets/images/player_stats_perfil_images/${PLAYER_NAME}.webp`;

  const playerImgObserver = new IntersectionObserver((entries, observer)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        playerImg.src = playerImg.dataset.src;
        observer.disconnect();
      }
    });
  });
  playerImgObserver.observe(playerImg);

  if(team){
    const clubLogo = document.querySelector(".club-logo");
    clubLogo.dataset.src = `assets/images/team-logo/${team.Logopng}`;
    const clubObserver = new IntersectionObserver((entries, observer)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          clubLogo.src = clubLogo.dataset.src;
          observer.disconnect();
        }
      });
    });
    clubObserver.observe(clubLogo);
  }

  // ===== FILTRAR JOGOS DO JOGADOR =====
  const jogosTeam = jogos.filter(j =>
    normalize(j.HomeTeam) === teamKey || normalize(j.AwayTeam) === teamKey
  );

  let wins=0, draws=0, defeats=0, goals=0, yellow=0, red=0, yellowRed=0;

  jogosTeam.forEach(j => {
    const hg = safeNumber(j.HomeGoals);
    const ag = safeNumber(j.AwayGoals);
    const isHome = normalize(j.HomeTeam) === teamKey;

    if(hg === ag) draws++;
    else if((hg > ag && isHome) || (ag > hg && !isHome)) wins++;
    else defeats++;

    goals += isHome ? hg : ag;
    yellow += countCards(isHome ? j.YellowsHome : j.YellowsAway);
    red += countCards(isHome ? j.RedsHome : j.RedsAway);
    yellowRed += countCards(isHome ? j["Yellow red Home"] : j["Yellow red Away"]);
  });

  const totalGames = Math.max(jogosTeam.length, 1);

  // ===== DONUT e BARRAS =====
  const donut = document.querySelector(".donut-svg-new");
  const c = 2*Math.PI*15.5;
  const w = (wins/totalGames)*c;
  const d = (draws/totalGames)*c;
  const l = (defeats/totalGames)*c;

  donut.innerHTML = `
    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" stroke-width="3"/>
    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#00D600" stroke-width="3"
      stroke-dasharray="0 ${c}" transform="rotate(-90 18 18)"/>
    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1E40FF" stroke-width="3"
      stroke-dasharray="0 ${c}" stroke-dashoffset="0" transform="rotate(-90 18 18)"/>
    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#9CA3AF" stroke-width="3"
      stroke-dasharray="0 ${c}" stroke-dashoffset="0" transform="rotate(-90 18 18)"/>
  `;
  const animateDonut = () => {
    const circles = donut.querySelectorAll("circle");
    circles[1].animate([{strokeDasharray:`0 ${c}`},{strokeDasharray:`${w} ${c}`}],{duration:800,fill:"forwards"});
    circles[2].animate([{strokeDasharray:`0 ${c}`,strokeDashoffset:`0`},{strokeDasharray:`${d} ${c}`,strokeDashoffset:`-${w}`}],{duration:800,fill:"forwards"});
    circles[3].animate([{strokeDasharray:`0 ${c}`,strokeDashoffset:`0`},{strokeDasharray:`${l} ${c}`,strokeDashoffset:`-${w+d}`}],{duration:800,fill:"forwards"});
  };
  animateDonut();
  document.querySelector(".donut-number-new").textContent = jogosTeam.length;

  const stats = document.querySelectorAll(".ks-right .stat-number");
  [
    player["Data de nascimento"],
    player["Local de Nascimento"],
    player["Nacionalidade"],
    player["Altura"],
    player["Pé preferido"],
    player["No clube desde"],
    goals, yellow, red, yellowRed
  ].forEach((v,i)=>{ stats[i].textContent = v ?? 0; });

  const bars = {
    wins: document.querySelector(".bar-fill.wins"),
    draws: document.querySelector(".bar-fill.draws"),
    defeats: document.querySelector(".bar-fill.defeats")
  };
  const barValues = [wins, draws, defeats];
  Object.keys(bars).forEach((key,i)=>{
    bars[key].style.width = "0%";
    bars[key].style.transition = "width 0.8s ease";
    setTimeout(()=> bars[key].style.width = (barValues[i]/totalGames*100)+"%", 50);
  });

  const barTexts = document.querySelectorAll(".bar-row .bar-value");
  barTexts[0].textContent = wins;
  barTexts[1].textContent = draws;
  barTexts[2].textContent = defeats;

  // ===== SLIDER JOGOS (lazy-load) =====
  const track = document.querySelector(".mu-slider-track");
  track.innerHTML = "";
  jogosTeam.forEach(j => {
    const home = equipas.find(e=>normalize(e.Team)===normalize(j.HomeTeam));
    const away = equipas.find(e=>normalize(e.Team)===normalize(j.AwayTeam));
    const homeGoals = j.HomeGoals?.trim()!=="" ? safeNumber(j.HomeGoals) : null;
    const awayGoals = j.AwayGoals?.trim()!=="" ? safeNumber(j.AwayGoals) : null;
    const scoreDisplay = (homeGoals===null && awayGoals===null) ? j["Time"] : `${homeGoals} - ${awayGoals}`;

    const card = document.createElement("div");
    card.className = "mu-card";
    card.innerHTML = `
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

  // Lazy-load de imagens do slider
  const sliderImages = track.querySelectorAll("img[data-src]");
  const imgObserver = new IntersectionObserver((entries, obs)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.src = entry.target.dataset.src;
        entry.target.removeAttribute("data-src");
        obs.unobserve(entry.target);
      }
    });
  }, {root: track, threshold: 0.1});
  sliderImages.forEach(img=>imgObserver.observe(img));

  // ===== SLIDER NAV =====
  const btnPrev = document.querySelector(".mu-slider-btn.prev");
  const btnNext = document.querySelector(".mu-slider-btn.next");
  const STEP = 280;
  btnPrev.onclick = () => track.scrollBy({ left:-STEP, behavior:"smooth" });
  btnNext.onclick = () => track.scrollBy({ left: STEP, behavior:"smooth" });

  // ===== DRAG & SWIPE =====
  let isDown=false, startX, scrollLeft;
  track.addEventListener("mousedown", e=>{ isDown=true; startX=e.pageX-track.offsetLeft; scrollLeft=track.scrollLeft; });
  track.addEventListener("mouseleave", ()=>{ isDown=false; });
  track.addEventListener("mouseup", ()=>{ isDown=false; });
  track.addEventListener("mousemove", e=>{ if(!isDown) return; e.preventDefault(); const x=e.pageX-track.offsetLeft; const walk=(x-startX)*1.5; track.scrollLeft=scrollLeft-walk; });

  track.addEventListener("touchstart", e=>{ isDown=true; startX=e.touches[0].pageX-track.offsetLeft; scrollLeft=track.scrollLeft; });
  track.addEventListener("touchend", ()=>{ isDown=false; });
  track.addEventListener("touchmove", e=>{ if(!isDown) return; const x=e.touches[0].pageX-track.offsetLeft; const walk=(x-startX)*1.5; track.scrollLeft=scrollLeft-walk; });

});

 // ===== PRIMEIRO SCRIT FIM =====



