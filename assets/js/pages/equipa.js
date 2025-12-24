// ----------------------
// PAGINA EQUIPA
// ----------------------

// ----------------------
// CONFIGURAÇÃO DOS SHEETS
// ----------------------
const SHEETS = {
    jogos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=0&single=true&output=csv",
    equipas: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1253685309&single=true&output=csv",
    jogadores: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1795344515&single=true&output=csv",
    sponsors: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1241588928&single=true&output=csv"
};

// ----------------------
// PEGAR PARAMETRO DA URL
// ----------------------
function getTeamFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('team') || '';
}
const TEAM_NAME = getTeamFromURL();
// Normaliza nome da equipa para usar como pasta
function folderNameFromTeam(team){
    if(!team) return "";
    return team
        .normalize("NFD")                   // remove acentos
        .replace(/[\u0300-\u036f]/g, "")    // remove diacríticos
        .replace(/\s+/g, "_")               // espaços → underline
        .replace(/[^a-zA-Z0-9_]/g,"");      // remove caracteres inválidos
}

// ----------------------
// FUNÇÃO AUXILIAR PARA LER CSV
// ----------------------
async function fetchCSV(url) {
    const res = await fetch(url);
    const text = await res.text();
    const lines = text.trim().split("\n");
    const headers = lines.shift().split(",");
    return lines.map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); 
        let obj = {};
        headers.forEach((h,i) => obj[h.trim()] = values[i] ? values[i].trim().replace(/^"|"$/g, "") : "");
        return obj;
    });
}

// ----------------------
// LIMPAR NOMES
// ----------------------
function cleanPlayerName(name) {
    if(!name) return "";
    let cleaned = name.replace(/["']/g, "");
    cleaned = cleaned.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let id = cleaned.toLowerCase().replace(/[^a-z0-9]/g, "");
    return { display: cleaned, id: id };
}

// ----------------------
// VARIÁVEIS GLOBAIS
// ----------------------
let allTeams = [];
let allPlayers = [];
let allMatches = [];

// ----------------------
// CARREGAR DADOS DA EQUIPA
// ----------------------
async function loadTeamData() {
    allTeams = await fetchCSV(SHEETS.equipas);
    const team = allTeams.find(t => t.Team === TEAM_NAME);
    if(!team) return console.error("Team not found:", TEAM_NAME);

    // Atualiza título da equipa
    const headerTitle = document.querySelector(".team-title");
    if(headerTitle) headerTitle.textContent = team.Team;

    // ----------------------
    // Atualiza nome do sponsor usando a sheet "sponsors"
    // ----------------------
    const allSponsors = await fetchCSV(SHEETS.sponsors);
    const sponsorData = allSponsors.find(s => s.Equipa === TEAM_NAME);
    const sponsorElem = document.querySelector(".team-sponsor");
    if(sponsorElem && sponsorData && sponsorData.Sponsor) sponsorElem.textContent = sponsorData.Sponsor;

    // ----------------------
    // Atualiza banner com 1 imagem otimizada (UEFA/FIFA/ESPN best practice)
    // ----------------------
    updateTeamBanner();
}

// ----------------------
// // ----------------------
// Atualiza banner de forma responsiva (desktop, tablet e mobile)
// ----------------------
function updateTeamBanner() {
    const bgPicture = document.getElementById("team-banner-picture");
    if (!bgPicture) return;

    const folder = folderNameFromTeam(TEAM_NAME);

    const desktopSource = bgPicture.querySelector('source[media="(min-width: 1440px)"]');
    const tabletSource  = bgPicture.querySelector('source[media="(min-width: 768px)"]');
    const img           = bgPicture.querySelector("img");

    if (desktopSource) desktopSource.srcset = `assets/images/banner/${folder}/banner-3840.webp`;
    if (tabletSource)  tabletSource.srcset  = `assets/images/banner/${folder}/banner-2560.webp`;
    if (img) {
        img.src = `assets/images/banner/${folder}/banner-920.webp`;
        img.alt = `${TEAM_NAME} Banner`;
    }
}


// Atualiza se a tela for redimensionada
window.addEventListener("resize", updateTeamBanner);



// Atualiza se a tela for redimensionada
window.addEventListener("resize", updateTeamBanner);

// ----------------------
// CARREGAR JOGOS
// ----------------------
async function loadMatches() {
    allMatches = await fetchCSV(SHEETS.jogos);
    const teamMatches = allMatches.filter(j => j.HomeTeam === TEAM_NAME || j.AwayTeam === TEAM_NAME);
    const track = document.querySelector(".mu-slider-track");
    if(!track) return;

    track.innerHTML = "";
    teamMatches.forEach(j => {
        const home = j.HomeTeam, away = j.AwayTeam;
        const scoreHome = j.HomeGoals || "", scoreAway = j.AwayGoals || "";
        const homeTeamData = allTeams.find(t => t.Team===home);
        const awayTeamData = allTeams.find(t => t.Team===away);

        const card = document.createElement("div");
        card.className = "mu-card";
        card.innerHTML = `
            <img class="league" src="//via.placeholder.com/150x50?text=League" alt="">
            <p class="info">${j.Data}, ${j.Time}, ${j["Local do jogo"]}</p>
            <div class="score">
                <img src="assets/images/team-logo/${homeTeamData?.Logopng || 'placeholder.svg'}" alt="${home}">
                <span>${scoreHome} - ${scoreAway}</span>
                <img src="assets/images/team-logo/${awayTeamData?.Logopng || 'placeholder.svg'}" alt="${away}">
            </div>
            <div class="teams"><span>${home}</span><span>VS</span><span>${away}</span></div>
        `;
        track.appendChild(card);
    });
}

// ----------------------
// CARREGAR JOGADORES / SQUAD
// ----------------------
async function loadSquad() {
    allPlayers = await fetchCSV(SHEETS.jogadores);
    const teamPlayers = allPlayers.filter(p => p.Team === TEAM_NAME);
    const carousel = document.querySelector(".squad-carousel");
    if(!carousel) return;

    carousel.innerHTML = "";
    teamPlayers.forEach(p => {
        const { display, id } = cleanPlayerName(p.Player);
        const div = document.createElement("div");
        div.className = "squad-player";
        div.innerHTML = `
            <a href="jogador.html?player=${encodeURIComponent(p.Player)}">
                <div class="squad-player-img"><img src="${p["Image png 75x75px"] || p.Image}" alt="${display}"></div>
                <div class="squad-player-name">${display}</div>
                <div class="squad-player-role">${p.Position}</div>
            </a>
        `;
        carousel.appendChild(div);
    });
}

// ----------------------
// CALCULAR E ANIMAR ESTATÍSTICAS
// ----------------------
function animateDonut(fromValue, toValue, duration, callback) {
    const start = performance.now();
    function animate(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const value = fromValue + (toValue - fromValue) * progress;
        callback(value);
        if(progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

function calculateStats() {
    const teamMatches = allMatches.filter(j =>
        (j.HomeTeam === TEAM_NAME || j.AwayTeam === TEAM_NAME) &&
        j.HomeGoals !== "" && j.AwayGoals !== ""
    );

    let wins=0, draws=0, defeats=0;
    let goalsFor=0, goalsAgainst=0, yellows=0, reds=0;

    teamMatches.forEach(j => {
        const homeScore = parseInt(j.HomeGoals||0);
        const awayScore = parseInt(j.AwayGoals||0);

        if(j.HomeTeam === TEAM_NAME){
            goalsFor += homeScore;
            goalsAgainst += awayScore;
            yellows += j.YellowsHome ? j.YellowsHome.split(",").filter(x=>x.trim()!=="").length : 0;
            reds += j.RedsHome ? j.RedsHome.split(",").filter(x=>x.trim()!=="").length : 0;
            if(homeScore > awayScore) wins++;
            else if(homeScore === awayScore) draws++;
            else defeats++;
        } else {
            goalsFor += awayScore;
            goalsAgainst += homeScore;
            yellows += j.YellowsAway ? j.YellowsAway.split(",").filter(x=>x.trim()!=="").length : 0;
            reds += j.RedsAway ? j.RedsAway.split(",").filter(x=>x.trim()!=="").length : 0;
            if(awayScore > homeScore) wins++;
            else if(awayScore === homeScore) draws++;
            else defeats++;
        }
    });

    const total = wins + draws + defeats;
    const CIRC = 97.4;

    const donutWins  = document.querySelector(".donut-svg-new circle:nth-of-type(2)");
    const donutDraws = document.querySelector(".donut-svg-new circle:nth-of-type(3)");

    animateDonut(0, total ? (wins/total)*CIRC : 0, 1000, val => {
        if(donutWins) donutWins.setAttribute("stroke-dasharray", `${val} ${CIRC - val}`);
        if(donutWins) donutWins.setAttribute("stroke-dashoffset", 0);
    });

    animateDonut(0, total ? (draws/total)*CIRC : 0, 1000, val => {
        if(donutDraws) donutDraws.setAttribute("stroke-dasharray", `${val} ${CIRC - val}`);
        if(donutDraws) donutDraws.setAttribute("stroke-dashoffset", -((wins/total)*CIRC));
    });

    animateDonut(0, total, 1000, val => {
        const donutNum = document.querySelector(".donut-number-new");
        if(donutNum) donutNum.textContent = Math.round(val);
    });

    // animação das barras
    const barWin = document.querySelector(".bar-fill.wins");
    const barDraw = document.querySelector(".bar-fill.draws");
    const barDef = document.querySelector(".bar-fill.defeats");
    animateDonut(0, total ? (wins/total*100) : 0, 1000, val => { if(barWin) barWin.style.width = val+"%"; });
    animateDonut(0, total ? (draws/total*100) : 0, 1000, val => { if(barDraw) barDraw.style.width = val+"%"; });
    animateDonut(0, total ? (defeats/total*100) : 0, 1000, val => { if(barDef) barDef.style.width = val+"%"; });

    // Atualiza números das barras
    const barValues = document.querySelectorAll(".bar-row .bar-value");
    if(barValues.length>=3){
        barValues[0].textContent = wins;
        barValues[1].textContent = draws;
        barValues[2].textContent = defeats;
    }

    // Cards da direita
    document.getElementById("stat-team").textContent = goalsFor;
    document.getElementById("stat-goals").textContent = goalsAgainst;
    document.getElementById("stat-yellows").textContent = yellows;
    document.getElementById("stat-reds").textContent = reds;
}

// ----------------------
// INICIALIZAR TUDO
// ----------------------
async function initTeamPage() {
    await loadTeamData();
    await loadMatches();
    await loadSquad();
    calculateStats();
}

document.addEventListener("DOMContentLoaded", initTeamPage);

// ----------------------
// SLIDER SQUAD
// ----------------------
const squadCarousel = document.querySelector('.squad-carousel');
const squadButtons = document.querySelectorAll('.squad-nav-btn');
if(squadButtons[0]) squadButtons[0].addEventListener('click', () => { squadCarousel.scrollBy({ left:-300, behavior:'smooth' }); });
if(squadButtons[1]) squadButtons[1].addEventListener('click', () => { squadCarousel.scrollBy({ left:300, behavior:'smooth' }); });

// ----------------------
// SLIDER DE JOGOS
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector('.mu-slider-track');
    const btnPrev = document.querySelector('.mu-slider-btn.prev');
    const btnNext = document.querySelector('.mu-slider-btn.next');
    if(!track) return;
    const scrollAmount = 283;
    const smoothScrollBy = (distance) => { track.scrollTo({ left: track.scrollLeft + distance, behavior:'smooth' }); };
    btnPrev?.addEventListener('click', () => smoothScrollBy(-scrollAmount));
    btnNext?.addEventListener('click', () => smoothScrollBy(scrollAmount));

    let isDown=false, startX, scrollLeft;
    const start=(x)=>{isDown=true; track.classList.add('dragging'); startX=x; scrollLeft=track.scrollLeft;};
    const move=(x)=>{if(isDown) track.scrollLeft=scrollLeft-(x-startX);};
    const end=()=>{isDown=false; track.classList.remove('dragging');};
    track.addEventListener('mousedown', e=>start(e.pageX));
    track.addEventListener('mousemove', e=>move(e.pageX));
    window.addEventListener('mouseup', end);
    track.addEventListener('touchstart', e=>start(e.touches[0].pageX),{passive:true});
    track.addEventListener('touchmove', e=>move(e.touches[0].pageX),{passive:true});
    track.addEventListener('touchend', end);
});

// ----------------------
// PAGINA EQUIPA
// ----------------------



// ----------------------
// SLIDER INICIO
// ----------------------

document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector('.mu-slider-track');
    const btnPrev = document.querySelector('.mu-slider-btn.prev');
    const btnNext = document.querySelector('.mu-slider-btn.next');
    const scrollAmount = 283;
    const smoothScrollBy = (distance) => { track.scrollTo({ left: track.scrollLeft + distance, behavior:'smooth' }); };
    btnPrev.addEventListener('click', () => smoothScrollBy(-scrollAmount));
    btnNext.addEventListener('click', () => smoothScrollBy(scrollAmount));
    let isDown=false, startX, scrollLeft;
    const start=(x)=>{isDown=true; track.classList.add('dragging'); startX=x; scrollLeft=track.scrollLeft;};
    const move=(x)=>{if(isDown) track.scrollLeft=scrollLeft-(x-startX);};
    const end=()=>{isDown=false; track.classList.remove('dragging');};
    track.addEventListener('mousedown', e=>start(e.pageX));
    track.addEventListener('mousemove', e=>move(e.pageX));
    window.addEventListener('mouseup', end);
    track.addEventListener('touchstart', e=>start(e.touches[0].pageX),{passive:true});
    track.addEventListener('touchmove', e=>move(e.touches[0].pageX),{passive:true});
    track.addEventListener('touchend', end);
});





const carousel = document.querySelector('.squad-carousel');
const buttons = document.querySelectorAll('.squad-nav-btn');
buttons[0].addEventListener('click', () => { carousel.scrollBy({ left:-300, behavior:'smooth' }); });
buttons[1].addEventListener('click', () => { carousel.scrollBy({ left:300, behavior:'smooth' }); });


// ----------------------
// SLIDER FIM
// ----------------------



// ----------------------
// SQUAD INICIO
// ----------------------

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.squad-carousel');
    const buttons = document.querySelectorAll('.squad-nav-btn');
    if (buttons.length >= 2) {
        buttons[0].addEventListener('click', () => { 
            carousel.scrollBy({ left:-300, behavior:'smooth' }); 
        });
        buttons[1].addEventListener('click', () => { 
            carousel.scrollBy({ left:300, behavior:'smooth' }); 
        });
    }
});

// ----------------------
// SQUAD FIM
// ----------------------

