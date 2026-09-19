const responsiveCss = document.createElement('link');
responsiveCss.rel = 'stylesheet';
responsiveCss.href = '/responsive-fixes.css?v=20260919c';
if (!document.querySelector('link[href*="responsive-fixes.css"]')) {
  document.head.appendChild(responsiveCss);
}

const WHATSAPP_FALLBACK = 'https://wa.link/97pbtb';
const BOOKING_HOSTS = ['hotels.cloudbeds.com', 'frame2.hotelpms.io', 'hotelpms.io'];

const pageSource = () => {
  const path = window.location.pathname;
  if (path.includes('hostel-centro-cordoba')) return 'centro';
  if (path.includes('hostel-nueva-cordoba')) return 'nueva-cordoba';
  if (path.includes('hostel-guemes-cordoba')) return 'guemes';
  if (path.includes('hostel-barato-cordoba')) return 'guia-hostel-barato';
  if (path.includes('alojamiento-estudiantes-cordoba')) return 'guia-estudiantes';
  if (path.includes('hostel-mochileros-cordoba')) return 'guia-mochileros';
  if (path.includes('donde-alojarse-cordoba')) return 'guia-donde-alojarse';
  return 'home';
};

const sourceFromCard = (link) => {
  const card = link.closest('.stay-card');
  if (!card) return null;
  const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
  if (title.includes('centro')) return 'centro';
  if (title.includes('nueva córdoba')) return 'nueva-cordoba';
  if (title.includes('güemes') || title.includes('guemes')) return 'guemes';
  return null;
};

const whatsappUrl = ({ source = pageSource(), placement = 'cta', checkin = '', checkout = '' } = {}) => {
  const params = new URLSearchParams({
    source,
    placement,
    page: window.location.pathname || '/',
  });
  if (checkin) params.set('checkin', checkin);
  if (checkout) params.set('checkout', checkout);
  return `/api/whatsapp?${params.toString()}`;
};

const isCommercialLink = (link) => {
  const raw = link.getAttribute('href');
  if (!raw) return false;
  let url;
  try {
    url = new URL(raw, window.location.origin);
  } catch (_) {
    return false;
  }

  const isBookingEngine = BOOKING_HOSTS.some((host) =>
    url.hostname === host || url.hostname.endsWith(`.${host}`)
  );
  const isWhatsApp = url.hostname === 'wa.link' || url.hostname === 'wa.me' || url.hostname === 'api.whatsapp.com';
  const label = link.textContent.trim();
  const isReserveCta = /reservar|consultar disponibilidad|consultar por whatsapp/i.test(label);

  return isBookingEngine || isWhatsApp || (isReserveCta && link.classList.contains('btn'));
};

const routeCommercialTrafficToWhatsApp = () => {
  document.querySelectorAll('a[href]').forEach((link) => {
    if (!isCommercialLink(link)) return;

    const source = link.dataset.waSource || sourceFromCard(link) || pageSource();
    const placement = link.dataset.waPlacement ||
      (link.classList.contains('whatsapp-float') ? 'floating_button' :
      link.classList.contains('nav-cta') ? 'header_cta' : 'cta');

    link.href = whatsappUrl({ source, placement });
    link.removeAttribute('target');
    link.setAttribute('rel', 'nofollow');
    link.dataset.trackedWhatsapp = 'true';

    if (/^reservar$/i.test(link.textContent.trim())) {
      link.textContent = 'Consultar por WhatsApp';
      link.setAttribute('aria-label', 'Consultar disponibilidad por WhatsApp');
    }
  });

  document.querySelectorAll('.trust-grid span').forEach((item) => {
    if (/online o por whatsapp/i.test(item.textContent)) item.textContent = 'por WhatsApp';
  });

  document.querySelectorAll('.check-list span').forEach((item) => {
    if (/reserva online/i.test(item.textContent)) item.textContent = 'Reserva por WhatsApp';
  });
};

const createAvailabilityBlock = () => {
  if (document.querySelector('.quick-contact')) return;

  const section = document.createElement('section');
  section.className = 'quick-contact';
  section.innerHTML = `
    <div class="shell quick-contact__inner">
      <div class="quick-contact__copy">
        <p class="eyebrow">CONSULTA RÁPIDA</p>
        <h2>¿Qué fechas necesitás?</h2>
        <p>Elegí la zona y tus fechas. Te llevamos directo a WhatsApp con la consulta preparada.</p>
      </div>
      <form class="quick-contact__form" id="availability-form">
        <label>
          <span>Zona</span>
          <select name="zone" aria-label="Elegir zona">
            <option value="general">Todavía no sé</option>
            <option value="centro">Centro</option>
            <option value="nueva-cordoba">Nueva Córdoba</option>
            <option value="guemes">Güemes</option>
          </select>
        </label>
        <label>
          <span>Entrada</span>
          <input type="date" name="checkin" aria-label="Fecha de entrada" />
        </label>
        <label>
          <span>Salida</span>
          <input type="date" name="checkout" aria-label="Fecha de salida" />
        </label>
        <button class="btn quick-contact__submit" type="submit">Consultar por WhatsApp</button>
      </form>
    </div>`;

  const anchor = document.querySelector('.trust-strip') || document.querySelector('.location-hero') || document.querySelector('.guide-hero') || document.querySelector('main > section');
  if (anchor) anchor.insertAdjacentElement('afterend', section);

  const form = section.querySelector('#availability-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const source = data.get('zone') === 'general' ? pageSource() : String(data.get('zone'));
    const checkin = String(data.get('checkin') || '');
    const checkout = String(data.get('checkout') || '');
    window.location.href = whatsappUrl({ source, placement: 'availability_form', checkin, checkout });
  });
};

const createMobileStickyBar = () => {
  if (document.querySelector('.mobile-whatsapp-bar')) return;
  const bar = document.createElement('div');
  bar.className = 'mobile-whatsapp-bar';
  bar.innerHTML = `
    <div class="mobile-whatsapp-bar__text">
      <strong>¿Buscás alojamiento?</strong>
      <span>Consultá disponibilidad ahora</span>
    </div>
    <a class="mobile-whatsapp-bar__button" href="${whatsappUrl({ placement: 'mobile_sticky_bar' })}" rel="nofollow">WhatsApp</a>`;
  document.body.appendChild(bar);
};

routeCommercialTrafficToWhatsApp();
createAvailabilityBlock();
createMobileStickyBar();

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

window.hostelWhatsappFallback = WHATSAPP_FALLBACK;
