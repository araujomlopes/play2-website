// Ano automático INICIO
    (function(){ var el = document.getElementById('rioYear'); if(el) el.textContent = new Date().getFullYear(); })();
    // Fechar o nav ao clicar fora (pequena utilidade)
    document.addEventListener('click', function(e){
      var nav = document.getElementById('nav');
      var toggle = document.querySelector('.nav-toggle');
      if(!nav || !toggle) return;
      if(!nav.contains(e.target) && !toggle.contains(e.target)) nav.classList.remove('show');
    });

    // Ano automático fim