const FALLBACK_URL = 'https://wa.link/97pbtb';

const SOURCE_NAMES = {
  'centro': '531 Hostel – Centro de Córdoba',
  'nueva-cordoba': 'Hostel Why Not – Nueva Córdoba',
  'guemes': 'Hostel Why Not – Güemes',
  'home': 'alojamiento en Córdoba Capital',
  'guia-hostel-barato': 'alojamiento económico en Córdoba',
  'guia-estudiantes': 'alojamiento para estudiantes en Córdoba',
  'guia-mochileros': 'hostel para mochileros en Córdoba',
  'guia-donde-alojarse': 'alojamiento en Córdoba Capital',
  'general': 'alojamiento en Córdoba Capital',
};

const safeValue = (value, max = 80) => String(value || '').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\-_/ .]/g, '').slice(0, max);

const buildMessage = ({ source, checkin, checkout }) => {
  const name = SOURCE_NAMES[source] || SOURCE_NAMES.general;
  const isSpecificHostel = ['centro', 'nueva-cordoba', 'guemes'].includes(source);
  const intro = isSpecificHostel
    ? `Hola, estoy viendo ${name} en hostelencordoba.lat.`
    : `Hola, estoy buscando ${name} y llegué desde hostelencordoba.lat.`;

  const dates = checkin && checkout
    ? ` Mis fechas son del ${checkin} al ${checkout}.`
    : checkin
      ? ` Mi fecha de entrada sería ${checkin}.`
      : '';

  return `${intro}${dates} ¿Me pasás disponibilidad y tarifa?`;
};

const extractPhone = async () => {
  try {
    const response = await fetch(FALLBACK_URL, {
      redirect: 'follow',
      headers: { 'user-agent': 'Mozilla/5.0' },
    });

    const finalUrl = response.url || '';
    const parsed = new URL(finalUrl);

    const phoneFromQuery = parsed.searchParams.get('phone');
    if (phoneFromQuery && /^\d{8,16}$/.test(phoneFromQuery)) return phoneFromQuery;

    if (parsed.hostname === 'wa.me') {
      const phoneFromPath = parsed.pathname.replace(/\D/g, '');
      if (/^\d{8,16}$/.test(phoneFromPath)) return phoneFromPath;
    }
  } catch (_) {
    return null;
  }
  return null;
};

export default async function handler(req, res) {
  const source = safeValue(req.query?.source || 'general', 40);
  const placement = safeValue(req.query?.placement || 'cta', 40);
  const page = safeValue(req.query?.page || '/', 100);
  const checkin = safeValue(req.query?.checkin || '', 20);
  const checkout = safeValue(req.query?.checkout || '', 20);

  console.log(JSON.stringify({
    event: 'whatsapp_click',
    source,
    placement,
    page,
    checkin: checkin || null,
    checkout: checkout || null,
    timestamp: new Date().toISOString(),
  }));

  const message = buildMessage({ source, checkin, checkout });
  const phone = await extractPhone();

  res.setHeader('Cache-Control', 'no-store');

  if (phone) {
    return res.redirect(302, `https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
  }

  return res.redirect(302, FALLBACK_URL);
}
