const responsiveCss = document.createElement('link');
responsiveCss.rel = 'stylesheet';
responsiveCss.href = '/responsive-fixes.css?v=20260919';
if (!document.querySelector('link[href*="responsive-fixes.css"]')) {
  document.head.appendChild(responsiveCss);
}

const menuBtn = document.getElementById('menu-btn');
const nav = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('#nav-links a');

if (menuBtn && nav) {
  const closeMenu = () => {
    nav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  };

  menuBtn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
