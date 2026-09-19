const responsiveCss = document.createElement('link');
responsiveCss.rel = 'stylesheet';
responsiveCss.href = '/responsive-fixes.css?v=20260919b';
if (!document.querySelector('link[href*="responsive-fixes.css"]')) {
  document.head.appendChild(responsiveCss);
}

const WHATSAPP_URL = 'https://wa.link/97pbtb';
const BOOKING_HOSTS = ['hotels.cloudbeds.com', 'frame2.hotelpms.io', 'hotelpms.io'];

const routeCommercialTrafficToWhatsApp = () => {
  document.querySelectorAll('a[href]').forEach((link) => {
    let url;
    try {
      url = new URL(link.getAttribute('href'), window.location.origin);
    } catch (_) {
      return;
    }

    const isBookingEngine = BOOKING_HOSTS.some((host) =>
      url.hostname === host || url.hostname.endsWith(`.${host}`)
    );

    const isReserveCta = /^(reservar|reservar ahora|consultar disponibilidad)$/i.test(
      link.textContent.trim()
    );

    if (isBookingEngine || (isReserveCta && link.classList.contains('btn'))) {
      link.href = WHATSAPP_URL;
      link.removeAttribute('target');
      link.setAttribute('rel', 'nofollow');

      if (isBookingEngine || /^reservar/i.test(link.textContent.trim())) {
        link.textContent = 'Consultar por WhatsApp';
        link.setAttribute('aria-label', 'Consultar disponibilidad por WhatsApp');
      }
    }
  });

  document.querySelectorAll('.trust-grid span').forEach((item) => {
    if (/online o por whatsapp/i.test(item.textContent)) {
      item.textContent = 'por WhatsApp';
    }
  });

  document.querySelectorAll('.check-list span').forEach((item) => {
    if (/reserva online/i.test(item.textContent)) {
      item.textContent = 'Reserva por WhatsApp';
    }
  });
};

routeCommercialTrafficToWhatsApp();

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
