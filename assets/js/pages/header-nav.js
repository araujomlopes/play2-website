console.log('HEADER NAV JS CARREGADO');

document.addEventListener('DOMContentLoaded', () => {

  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav');

  if (!navToggle || !navList) {
    console.warn('NAV ELEMENTOS NÃO ENCONTRADOS');
    return;
  }

  /* MENU PRINCIPAL */
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';

    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navList.classList.toggle('show', !isOpen);

    document.body.classList.toggle('menu-open', !isOpen);
    document.documentElement.classList.toggle('menu-open', !isOpen);
  });

  /* SUBMENU MOBILE */
  document.querySelectorAll('.has-submenu > a').forEach(link => {
    link.addEventListener('click', e => {

      if (window.innerWidth >= 880) return;

      e.preventDefault();

      link.parentElement.classList.toggle('open');
    });
  });

});
