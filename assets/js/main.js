document.addEventListener('DOMContentLoaded', () => {

  const mount = document.getElementById('footer');
  if (!mount) return;

  fetch('partials/footer.html')
    .then(res => {
      if (!res.ok) throw new Error('Footer não encontrado');
      return res.text();
    })
    .then(html => {
      mount.innerHTML = html;

      // Ano automático
      const year = mount.querySelector('#rioYear');
      if (year) {
        year.textContent = new Date().getFullYear();
      }
    })
    .catch(err => console.error('Erro ao carregar footer:', err));

});






// ===============================
// GLOBAL UI (Header / Nav) START
// ===============================

document.addEventListener('DOMContentLoaded', () => {

  // Inject header
  const headerSlot = document.getElementById('header');
  if (headerSlot) {
    fetch('/partials/header.html')
      .then(res => res.text())
      .then(html => {
        headerSlot.innerHTML = html;
        initHeader();
      })
      .catch(err => console.error('Header load error', err));
  }

  function initHeader() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('show');
      toggle.setAttribute('aria-expanded', isOpen);
    });
  }

});

// ===============================
// GLOBAL UI (Header / Nav) END
// ===============================