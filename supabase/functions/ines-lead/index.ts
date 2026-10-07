import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ines-lead — captacion de contactos de la demo WhiteMoon · Ines Barrios
// Reformas e Interiorismo (chat "Ana": tipo de obra → localidad → cuando →
// preferencia de contacto → nombre y telefono → consentimiento).
//
// Inserta el contacto en leads_web (sector='reformas',
// origen='demo-ines-barrios') con la service role y avisa por TELEGRAM.
// En el cliente no vive ninguna apikey ni clave de Supabase.
//
// Secrets usados (nunca en cliente), los mismos que estetica-lead:
//   - TELEGRAM_BOT_TOKEN        : token del bot de Telegram (obligatorio para avisar)
//   - TELEGRAM_CHAT_ID          : chat destino; si falta se usa CHAT_ID_FALLBACK
//   - SUPABASE_URL              : inyectado por la plataforma
//   - SUPABASE_SERVICE_ROLE_KEY : inyectado por la plataforma
//
// El cliente llama con navigator.sendBeacon → Blob 'text/plain' (peticion
// simple, sin preflight) y, si no sale, con fetch(keepalive) tambien en
// text/plain. Por eso el body se lee como texto y se parsea a mano.
//
// Regla del proyecto: si el aviso falla → console.warn, nunca rompe la captura.
//
// Desplegar con:
//   supabase functions deploy ines-lead --no-verify-jwt --project-ref mlaqtniujnvfxcvcourm

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// El chat_id no es un secreto (solo identifica el destino); el token si lo es.
// Mismo destino por defecto que estetica-lead.
const CHAT_ID_FALLBACK = '861432965';

// Fijados en el servidor: lo que mande el cliente en estos campos se ignora.
const SECTOR = 'reformas';
const ORIGEN = 'demo-ines-barrios';

const MAX_BODY = 4000; // caracteres; el cuerpo legitimo no pasa de unos cientos

const REST_HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
};

// Devuelve true solo si Telegram acepto el mensaje, para poder verificar el
// aviso de punta a punta desde la respuesta de la funcion.
async function notificar(text: string): Promise<boolean> {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID') || CHAT_ID_FALLBACK;
  if (!token) {
    console.warn('[ines-lead] sin TELEGRAM_BOT_TOKEN, mensaje:', text);
    return false;
  }
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!r.ok) {
      console.warn('[ines-lead] Telegram fallo:', r.status, await r.text());
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[ines-lead] error enviando Telegram:', e);
    return false;
  }
}

// Solo texto plano: sin saltos de linea ni caracteres de control, recortado.
const clean = (v: unknown, max: number) =>
  (typeof v === 'string' || typeof v === 'number' ? String(v) : '')
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .trim()
    .slice(0, max)
    .trim();

// Telefono español: 9 digitos que empiezan por 6, 7, 8 o 9 (admite +34 / 0034).
function telefonoEs(v: unknown): string | null {
  let n = clean(v, 20).replace(/\D/g, '');
  if (n.length === 11 && n.startsWith('34')) n = n.slice(2);
  if (n.length === 13 && n.startsWith('0034')) n = n.slice(4);
  return /^[6789]\d{8}$/.test(n) ? n : null;
}

Deno.serve(async (req: Request) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const json = (obj: unknown, status = 200) =>
    new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY) return json({ error: 'body demasiado grande' }, 413);

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return json({ error: 'body no valido' }, 400);
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return json({ error: 'body no valido' }, 400);
    }
    const body = payload as Record<string, unknown>;

    // Solo se leen estos cinco campos; cualquier otro se ignora.
    const nombre = clean(body.nombre, 80);
    const telefono = telefonoEs(body.telefono);
    const interes = clean(body.interes, 60) || 'Sin especificar';
    const detalle = clean(body.mensaje, 300);
    const preferencia = clean(body.preferencia, 40);

    if (!nombre) return json({ error: 'el nombre es obligatorio' }, 400);
    if (!telefono) return json({ error: 'el telefono debe tener 9 digitos' }, 400);

    // Se usan solo las columnas de leads_web que ya usa estetica-lead, asi
    // que la preferencia de contacto va dentro del mensaje.
    const mensaje = [detalle, preferencia ? `Preferencia de contacto: ${preferencia}` : '']
      .filter(Boolean)
      .join(' · ');

    const ins = await fetch(`${SUPABASE_URL}/rest/v1/leads_web`, {
      method: 'POST',
      headers: { ...REST_HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        nombre,
        telefono,
        sector: SECTOR,
        interes,
        mensaje,
        origen: ORIGEN,
      }),
    });
    const rows = await ins.json();
    const lead = Array.isArray(rows) ? rows[0] : null;
    if (!lead) {
      console.warn('[ines-lead] insert fallo:', ins.status, JSON.stringify(rows));
      return json({ error: 'no se pudo registrar el contacto' }, 500);
    }

    const msg =
      `DEMO Inés Barrios · nuevo contacto\n` +
      `Nombre: ${nombre}\n` +
      `Teléfono: ${telefono}\n` +
      `Interés: ${interes}\n` +
      (detalle ? `Mensaje: ${detalle}\n` : '') +
      (preferencia ? `Preferencia de contacto: ${preferencia}\n` : '') +
      `Sector: ${SECTOR}\n` +
      `Origen: ${ORIGEN}`;
    const notified = await notificar(msg);

    return json({ ok: true, lead_id: lead.id, notified });
  } catch (e) {
    console.warn('[ines-lead] error inesperado:', e);
    return json({ error: 'error interno' }, 500);
  }
});
