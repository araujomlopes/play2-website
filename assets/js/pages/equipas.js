// ----------------------
// FUNÇÃO BASE PARA CARREGAR CSV + LOCALSTORAGE
// ----------------------
async function carregarCSVSheets(url, storageKey) {
  try {
    const response = await fetch(url);
    const texto = await response.text();

    const linhas = texto.trim().split('\n');
    const cabecalhos = linhas.shift().split(",");

    const dados = linhas.map(linha => {
      const valores = linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); 
      let obj = {};
      cabecalhos.forEach((cab,i)=> {
        obj[cab.trim()] = valores[i] ? valores[i].trim().replace(/^"|"$/g,"") : "";
      });
      return obj;
    });

    localStorage.setItem(storageKey, JSON.stringify(dados));
    return dados;
  } catch(e) {
    const guardado = localStorage.getItem(storageKey);
    return guardado ? JSON.parse(guardado) : [];
  }
}

// ----------------------
// CORES OFICIAIS DAS EQUIPAS
// ----------------------
const teamColors = {
  "007Q FC": "#DDAED7",
  "Ubuntu UD": "#3E92CE",
  "Bahatas": "#213E76",
  "Proletariado": "#E30613",
  "Vanghanu VM": "#008149",
  "Chitas De Aço": "#FFA500"
};

// ----------------------
// CARREGAR SPONSORS
// ----------------------
async function loadSponsors() {
  const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMKb7nNRenJu0293ElDZ7UYSe0bq-GVqU51hPjnheB1E7gD14KXvzwdGdn2VRlQ3vW_ev3nfxXL_4t/pub?gid=1241588928&single=true&output=csv";

  const sponsorsData = await carregarCSVSheets(url, 'sponsors');

  sponsorsData.forEach(s => {
    const container = document.querySelector(`.team-sponsor[data-team="${s.Equipa}"]`);
    if (container) {
      container.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
          <img src="${s.Picture}" style="width:22px; height:22px; object-fit:contain; opacity:0.9;">
          <span style="font-size:14px; color:#444;">${s.Sponsor}</span>
        </div>
      `;
    }
  });
}

loadSponsors();

// ----------------------
// HOVER COM COR DA EQUIPA
// ----------------------
document.querySelectorAll(".team-card").forEach(card => {
  const teamName = card.querySelector(".team-name").textContent.trim();
  const color = teamColors[teamName] || "#e5e7eb"; // fallback cor da equipa

  card.addEventListener("mouseenter", () => {
    card.style.backgroundColor = color;
    card.querySelectorAll("*").forEach(el => el.style.color = "#fff");
    card.style.transition = "0.3s ease";
  });

  card.addEventListener("mouseleave", () => {
    card.style.backgroundColor = "#fff"; // cor original do card
    card.querySelectorAll("*").forEach(el => el.style.color = "#000");
  });
});
