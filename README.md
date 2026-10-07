# Inés Barrios · Reformas e Interiorismo — demo

Demo comercial creada por WhiteMoon para Inés Barrios Reformas e Interiorismo,
Villaviciosa de Odón (Madrid). No es la web definitiva de la empresa.

- Contacto que muestra la demo: 647 41 04 45 (llamada y WhatsApp).
- La demo está marcada `noindex, nofollow` y `robots.txt` bloquea todo el sitio.
- GitHub Pages **no está activado**.

## Estructura

```
index.html        Portada
servicios.html    Los cuatro servicios
contacto.html     Llamar / WhatsApp (sin formulario)
robots.txt        Disallow: /
assets/
  css/styles.css  Estilos y tokens de color (:root)
  js/main.js      Aparición al hacer scroll y palabra rotatoria
  fonts/          Cormorant Garamond y Sora en woff2, autoalojadas
  img/            Fotos en WebP (tamaño completo y -sm)
  og-image.jpg    Imagen para redes, 1200x630
  favicon.svg     Provisional
  CREDITOS.md     Autor e ID de cada foto y licencias de las fuentes
```

HTML, CSS y JS puros. Sin frameworks, sin `package.json`, sin dependencias, sin
analítica y sin cookies. No se carga ningún recurso externo.

## Pendiente antes de enseñarla

### 1. Logo y paleta (PROVISIONAL)

El logo todavía no está en el repo. Mientras tanto:

- La cabecera muestra el nombre en texto. Cada página tiene un comentario
  `LOGO PENDIENTE` en el punto donde va el `<picture>` (`assets/logo.webp` con
  respaldo `assets/logo.png`).
- Los colores de `:root` en `assets/css/styles.css` (`--marron`,
  `--marron-tinta`, `--dorado`, `--dorado-claro`, `--dorado-hondo`, `--fondo`)
  son una **aproximación provisional**, no los colores reales de la marca. Al
  recibir el logo hay que extraer sus tonos y sustituir esas seis líneas; el
  resto de colores se derivan de ellas.
- `assets/favicon.svg` es un monograma provisional.

### 2. Servicios — A CONFIRMAR CON LA CLIENTA

Los cuatro servicios y todo su texto (descripciones y listas de «qué incluye»)
son un borrador sin validar:

- Reformas integrales de vivienda — a confirmar
- Cocinas — a confirmar
- Baños — a confirmar
- Interiorismo y diseño de espacios — a confirmar

### 3. Widget de contacto WhiteMoon

Las tres páginas llevan, **comentado** justo antes de `</body>`:

```html
<script src="https://cdn.whitemoon.es/chat.js" data-token="WM-PENDIENTE"></script>
```

Se activa cuando exista el token de prueba: sustituir `WM-PENDIENTE` por ese
token y quitar el comentario. No hay ningún token real en el repo.

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
