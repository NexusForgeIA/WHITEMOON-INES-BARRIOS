# Inés Barrios · Reformas e Interiorismo — demo

Demo comercial creada por WhiteMoon para Inés Barrios Reformas e Interiorismo,
Villaviciosa de Odón (Madrid). No es la web definitiva de la empresa.

- Contacto que muestra la demo: 647 41 04 45 (llamada y WhatsApp).
- La demo está marcada `noindex, nofollow` y `robots.txt` bloquea todo el sitio.
- Publicada con GitHub Pages desde `main`: https://nexusforgeia.github.io/WHITEMOON-INES-BARRIOS/

## Estructura

```
index.html        Landing de scroll único: inicio, servicios, cómo trabajamos,
                  ambientes y contacto (secciones ancladas)
servicios.html    Los cuatro servicios en detalle
contacto.html     Llamar / WhatsApp (sin formulario)
robots.txt        Disallow: /
assets/
  css/styles.css        Estilos y tokens de color (:root)
  js/main.js            Menú móvil y aparición al hacer scroll
  js/ana.js             Chat de Ana (flujo de botones, sin dependencias)
  fonts/                Cormorant Garamond y Sora en woff2, autoalojadas
  img/                  Fotos en WebP (tamaño completo y -sm)
  og-image.jpg          Imagen para redes, 1200x630
  logo-original.jpg     Logo tal como se recibió
  logo.webp / logo.png  Logo completo (pie de página)
  logo-monograma.webp / .png  Emblema «IB» (navegación fija)
  favicon.png           32x32, derivado del logo
  apple-touch-icon.png  180x180, derivado del logo
  CREDITOS.md           Autor e ID de cada foto y licencias de las fuentes
supabase/functions/ines-lead/index.ts
                        Edge Function que recibe los contactos del chat
```

HTML, CSS y JS puros. Sin frameworks, sin `package.json`, sin dependencias, sin
analítica y sin cookies. No se carga ningún recurso externo; la única petición
que sale del navegador es el envío del contacto del chat, y solo si la persona
completa el flujo y acepta la política de privacidad.

La maquetación sigue la estructura de la demo WHITEMOON-ESTETICA (hero en
tarjeta, tarjetas de servicio, pasos, galería, pie en columnas) con la paleta
clara y el logo de Inés. De ESTETICA no se ha tomado ningún texto, precio,
color ni imagen.

La navegación fija lleva el emblema del logo junto al nombre en texto, porque
el logo completo no se lee a ese tamaño; el logo completo va en el pie.

## Pendiente antes de enseñarla

### 1. Logo en mejor formato

El logo recibido (`assets/logo-original.jpg`) es un JPG de 1024x1024 con fondo
texturizado, sin transparencia. De él salen:

- `assets/logo.webp` y `assets/logo.png`: emblema y nombre recortados, con el
  fondo convertido en transparencia. Solo funcionan bien sobre el fondo claro
  de la web; sobre oscuro se ve la textura del papel.
- `assets/favicon.png` (32x32) y `assets/apple-touch-icon.png` (180x180).

Si la clienta tiene el logo en vectorial (SVG, AI, PDF) o en PNG con
transparencia, conviene sustituir estos recortes.

La paleta de `:root` en `assets/css/styles.css` sale de ese logo:

| Variable | Valor | Origen |
|---|---|---|
| `--fondo` | `#f5e7dc` | Fondo del logo |
| `--dorado` | `#caa36f` | Dorado de la «I»; solo líneas y acentos |
| `--dorado-hondo` | `#86735e` | Marrón del nombre; solo cifras grandes |
| `--dorado-claro` | `#e7d6c6` | Tono claro del fondo del logo |
| `--marron` | `#5e5141` | Marrón del nombre (`#7c6a55`) oscurecido para cumplir AA |
| `--marron-tinta` | `#3e352b` | El mismo tono, más oscuro, para el texto |

### 2. Servicios — A CONFIRMAR CON LA CLIENTA

El logo dice «Interiorismo | Reformas | Decoración» y «Asesoramiento»; la web
no menciona decoración ni asesoramiento. Hay que preguntarle si se añaden.

Los cuatro servicios y todo su texto (descripciones y listas de «qué incluye»)
son un borrador sin validar:

- Reformas integrales de vivienda — a confirmar
- Cocinas — a confirmar
- Baños — a confirmar
- Interiorismo y diseño de espacios — a confirmar

Redactado nuevo en el rediseño, también **a confirmar con la clienta**:

- «Primera visita sin compromiso» (sello del hero, franja destacada y bloque
  de contacto) — a confirmar que la ofrece así.
- Los cuatro pasos de «Cómo trabajamos»: nos cuentas tu idea, primera visita,
  propuesta y presupuesto, obra y entrega — a confirmar que es su forma de
  trabajar.
- **Horario:** no se conoce. El bloque de contacto muestra «Por confirmar»;
  hay que sustituirlo por el horario real o quitar la fila.
- Pies de foto de «Ambientes».

Decidido por Cris (ya no está a confirmar):

- Titular del hero: «Reformas e interiorismo pensando en cómo la vives.»

### 3. Chat de Ana

Las tres páginas cargan `assets/js/ana.js`: un botón flotante abajo a la
derecha que abre un chat guiado **por botones**. No hay ningún modelo de
lenguaje detrás: todas las respuestas están escritas en ese archivo. Por eso se
presenta como «Asistente virtual» y no usa el widget del CDN (`chat.js`) ni
ningún token.

Flujo: tipo de obra → localidad → cuándo empezar → preferencia de contacto
(mañana o tarde, sin cita) → nombre → teléfono (9 dígitos) → casilla de
privacidad → cierre con botones de llamar y WhatsApp. No da precios, plazos ni
horarios.

**Envío.** Al aceptar, el navegador hace un `POST` a
`https://mlaqtniujnvfxcvcourm.supabase.co/functions/v1/ines-lead` con
`navigator.sendBeacon` (cuerpo JSON en `text/plain`) y, si el beacon no sale,
con `fetch` y `keepalive`. En el cliente no hay ninguna clave.

**La función está desplegada** en el proyecto `mlaqtniujnvfxcvcourm`. Su código
es `supabase/functions/ines-lead/index.ts`. Cada envío real crea una fila en
`leads_web` y manda un aviso por Telegram, así que las pruebas del chat se
hacen interceptando la petición. Con `sendBeacon` el navegador no informa de
un fallo del servidor: si la función dejara de responder, la persona vería
igualmente el mensaje de cierre. Para volver a desplegarla tras un cambio:

```
supabase functions deploy ines-lead --no-verify-jwt --project-ref mlaqtniujnvfxcvcourm
```

Usa los mismos Secrets que `estetica-lead`: `TELEGRAM_BOT_TOKEN` y
`TELEGRAM_CHAT_ID`. Inserta en `leads_web` con `sector='reformas'` y
`origen='demo-ines-barrios'` y avisa por Telegram con un texto que empieza por
«DEMO Inés Barrios».

**Privacidad.** El pie de las tres páginas tiene un desplegable «Política de
privacidad de esta demo» (`#privacidad`) que explica qué recoge el chat, para
qué, dónde se guarda y cómo pedir el borrado (comercial@whitemoon.es).

**Ojo:** en la demo los contactos llegan a WhiteMoon, no a Inés. El mensaje de
cierre dice «Inés te llamará en cuanto pueda»; mientras sea una demo, quien
recibe el aviso es WhiteMoon.

Textos nuevos del chat, **a confirmar con la clienta**:

- Saludo: «Hola, soy Ana, la asistente virtual de Inés Barrios. ¿Qué te
  gustaría hacer en casa?»
- El nombre «Ana» para la asistente.
- Las cuatro frases informativas (cocina, baño, reforma integral,
  interiorismo), tomadas de los textos de `servicios.html`, que también están
  a confirmar.
- Opciones de «¿Cuándo te gustaría empezar?»: Lo antes posible · En 1-3 meses
  · Más adelante · Solo me estoy informando.
- «¿Cuándo prefieres que te llame Inés? Es solo una preferencia: no es una
  cita ni una hora confirmada.»
- «Para cualquier otra consulta, lo mejor es hablar directamente con Inés.»
- Cierre: «Gracias, [nombre]. Inés te llamará en cuanto pueda. Si prefieres no
  esperar: 647 41 04 45 o WhatsApp.»
- Pie del chat: «Ana no da presupuestos · Inés valora cada vivienda en la
  primera visita».
- Texto de la política de privacidad.

### 4. URL definitiva

`canonical`, `og:url` y `og:image` apuntan a
`https://nexusforgeia.github.io/WHITEMOON-INES-BARRIOS/`, la URL que tendría el
repo si se activa Pages. Si la demo se publica en otro dominio, hay que
cambiarlas en las tres páginas.

## Qué no contiene, a propósito

Testimonios, casos de éxito, cifras, años de experiencia, precios, promesas de
plazo, dirección postal ni horario. La ubicación es solo «Villaviciosa de Odón
(Madrid)». Las fotos son de Unsplash y cada página lo avisa: «Imágenes
ilustrativas; no corresponden a obras de la empresa.»

## Ver en local

Cualquier servidor estático sirve, por ejemplo:

```
npx http-server . -p 4173
```

La verificación (Playwright y Lighthouse) se ejecuta desde una carpeta fuera
del repo para no añadir dependencias al proyecto.
