// Inés Barrios · demo WhiteMoon — chat de Ana
// Flujo guiado por botones. No hay modelo de lenguaje detrás: todas las
// respuestas están escritas aquí. No da precios, plazos ni horarios.
(function () {
  'use strict';

  // La Edge Function inserta el contacto y avisa. Aquí no vive ninguna clave.
  var LEAD_URL = 'https://mlaqtniujnvfxcvcourm.supabase.co/functions/v1/ines-lead';
  var TEL = 'tel:+34647410445';
  var WA = 'https://wa.me/34647410445';

  // Una frase por servicio, tomada de lo que ya dice servicios.html
  var INTERESES = [
    ['Cocina', 'En cocinas se piensa el recorrido, el almacenaje y la luz antes de elegir un solo frente.'],
    ['Baño', 'En baños se eligen revestimientos, grifería y luz para que sea cómodo cada mañana y fácil de mantener.'],
    ['Reforma integral', 'En una reforma integral, distribución, instalaciones, acabados y luz se deciden juntos, como un solo proyecto.'],
    ['Interiorismo', 'En interiorismo se trabaja la distribución, la paleta y las piezas hasta que la casa se lee como un conjunto.']
  ];
  var CUANDO = ['Lo antes posible', 'En 1-3 meses', 'Más adelante', 'Solo me estoy informando'];
  var FRANJAS = ['Mañana', 'Tarde', 'Me da igual'];

  var sinMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PAUSA = sinMovimiento ? 0 : 550;

  var lead, iniciado = false, secuencia = 0, turno = 0;

  function el(tag, cls, texto) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (texto) n.textContent = texto;
    return n;
  }

  // ---------- Estructura: botón flotante y panel ----------
  var fab = el('button', 'ana-fab');
  fab.type = 'button';
  fab.setAttribute('aria-haspopup', 'dialog');
  fab.setAttribute('aria-controls', 'anaPanel');
  fab.setAttribute('aria-expanded', 'false');
  fab.setAttribute('aria-label', 'Abrir el chat con Ana');
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.3-.6L3 21l1.8-5a8.3 8.3 0 0 1-.8-3.5 8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 8 7.4Z"/></svg>';

  var panel = el('div', 'ana-panel');
  panel.id = 'anaPanel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'anaTitulo');
  panel.innerHTML =
    '<div class="ana-cabecera">' +
      '<span class="ana-avatar" aria-hidden="true">A</span>' +
      '<p class="ana-quien"><b id="anaTitulo">Ana</b><small>Asistente virtual · Inés Barrios</small></p>' +
      '<button class="ana-cerrar" type="button" aria-label="Cerrar el chat">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="ana-cuerpo" id="anaCuerpo">' +
      '<div class="ana-mensajes" role="log" aria-live="polite" aria-label="Conversación con Ana"></div>' +
      '<div class="ana-zona"></div>' +
    '</div>' +
    '<p class="ana-pie">Ana no da presupuestos · Inés valora cada vivienda en la primera visita</p>';

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  var cuerpo = panel.querySelector('.ana-cuerpo');
  var mensajes = panel.querySelector('.ana-mensajes');
  var zona = panel.querySelector('.ana-zona');
  var btnCerrar = panel.querySelector('.ana-cerrar');

  function bajar() { cuerpo.scrollTop = cuerpo.scrollHeight; }

  // ---------- Mensajes ----------
  // Los mensajes van al registro (aria-live); los controles, a la zona de
  // respuesta, que se vacía en cada paso.
  function limpiarZona() { zona.textContent = ''; }

  function ana(texto, despues) {
    var miTurno = turno;
    limpiarZona();
    var puntos = el('div', 'ana-escribe');
    puntos.setAttribute('aria-hidden', 'true');
    puntos.innerHTML = '<span></span><span></span><span></span>';
    zona.appendChild(puntos);
    bajar();
    setTimeout(function () {
      if (miTurno !== turno) return;
      limpiarZona();
      mensajes.appendChild(el('p', 'ana-msg ana-msg--ana', texto));
      bajar();
      if (despues) despues();
    }, PAUSA);
  }

  function tu(texto) {
    mensajes.appendChild(el('p', 'ana-msg ana-msg--tu', texto));
    bajar();
  }

  function opciones(lista, alElegir, etiquetaGrupo) {
    limpiarZona();
    var grupo = el('div', 'ana-opciones');
    grupo.setAttribute('role', 'group');
    grupo.setAttribute('aria-label', etiquetaGrupo);
    lista.forEach(function (texto) {
      var b = el('button', 'ana-opcion', texto);
      b.type = 'button';
      b.addEventListener('click', function () { tu(texto); alElegir(texto); });
      grupo.appendChild(b);
    });
    zona.appendChild(grupo);
    bajar();
    grupo.querySelector('button').focus();
  }

  function campo(cfg) {
    limpiarZona();
    var id = 'anaCampo' + (++secuencia);
    var form = el('form', 'ana-campo');
    form.noValidate = true;
    var etiqueta = el('label', 'ana-oculto', cfg.etiqueta);
    etiqueta.htmlFor = id;
    var input = el('input');
    input.id = id;
    input.type = cfg.tipo || 'text';
    input.placeholder = cfg.ejemplo;
    input.maxLength = cfg.max;
    input.autocomplete = cfg.autocompletar || 'off';
    if (cfg.modo) input.inputMode = cfg.modo;
    input.setAttribute('aria-describedby', id + 'e');
    var enviar = el('button', 'ana-enviar');
    enviar.type = 'submit';
    enviar.setAttribute('aria-label', 'Enviar');
    enviar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    var error = el('p', 'ana-error');
    error.id = id + 'e';
    error.setAttribute('role', 'alert');
    form.appendChild(etiqueta);
    form.appendChild(input);
    form.appendChild(enviar);
    form.appendChild(error);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valor = cfg.validar(input.value);
      if (valor === null) {
        error.textContent = cfg.error;
        bajar();
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      tu(input.value.trim());
      cfg.alEnviar(valor);
    });
    zona.appendChild(form);
    bajar();
    input.focus();
  }

  function enlaces(conReinicio) {
    limpiarZona();
    var grupo = el('div', 'ana-opciones');
    var llamar = el('a', 'ana-opcion ana-opcion--llena', 'Llamar');
    llamar.href = TEL;
    var wa = el('a', 'ana-opcion', 'WhatsApp');
    wa.href = WA;
    wa.rel = 'noopener';
    grupo.appendChild(llamar);
    grupo.appendChild(wa);
    if (conReinicio) {
      var volver = el('button', 'ana-opcion', 'Volver al principio');
      volver.type = 'button';
      volver.addEventListener('click', empezar);
      grupo.appendChild(volver);
    }
    zona.appendChild(grupo);
    bajar();
    llamar.focus();
  }

  // ---------- Flujo ----------
  function empezar() {
    turno++;
    lead = { nombre: '', telefono: '', interes: '', localidad: '', cuando: '', preferencia: '' };
    mensajes.textContent = '';
    ana('Hola, soy Ana, la asistente virtual de Inés Barrios. ¿Qué te gustaría hacer en casa?', function () {
      var lista = INTERESES.map(function (i) { return i[0]; }).concat(['Otra consulta']);
      opciones(lista, elegirInteres, 'Qué quieres hacer');
    });
  }

  function elegirInteres(texto) {
    if (texto === 'Otra consulta') {
      ana('Para cualquier otra consulta, lo mejor es hablar directamente con Inés.', function () { enlaces(true); });
      return;
    }
    lead.interes = texto;
    var info = INTERESES.filter(function (i) { return i[0] === texto; })[0][1];
    ana(info, function () {
      ana('¿En qué localidad está la vivienda?', function () {
        campo({
          etiqueta: 'Localidad de la vivienda', ejemplo: 'Ej. Villaviciosa de Odón', max: 80,
          autocompletar: 'address-level2',
          error: 'Escribe la localidad, por favor.',
          validar: function (v) { v = v.trim(); return v.length >= 2 ? v.slice(0, 80) : null; },
          alEnviar: function (v) { lead.localidad = v; preguntarCuando(); }
        });
      });
    });
  }

  function preguntarCuando() {
    ana('¿Cuándo te gustaría empezar?', function () {
      opciones(CUANDO, function (v) { lead.cuando = v; preguntarFranja(); }, 'Cuándo te gustaría empezar');
    });
  }

  function preguntarFranja() {
    ana('¿Cuándo prefieres que te llame Inés? Es solo una preferencia: no es una cita ni una hora confirmada.', function () {
      opciones(FRANJAS, function (v) { lead.preferencia = v; preguntarNombre(); }, 'Preferencia de contacto');
    });
  }

  function preguntarNombre() {
    ana('¿A nombre de quién?', function () {
      campo({
        etiqueta: 'Tu nombre', ejemplo: 'Tu nombre', max: 80, autocompletar: 'name',
        error: 'Escribe tu nombre, por favor.',
        validar: function (v) { v = v.trim(); return v.length >= 2 ? v.slice(0, 80) : null; },
        alEnviar: function (v) { lead.nombre = v; preguntarTelefono(); }
      });
    });
  }

  // Teléfono español: 9 dígitos que empiezan por 6, 7, 8 o 9 (con o sin +34)
  function telefonoValido(v) {
    var n = v.replace(/\D/g, '');
    if (n.length === 11 && n.indexOf('34') === 0) n = n.slice(2);
    if (n.length === 13 && n.indexOf('0034') === 0) n = n.slice(4);
    return /^[6789]\d{8}$/.test(n) ? n : null;
  }

  function preguntarTelefono() {
    ana('Gracias, ' + lead.nombre.split(' ')[0] + '. ¿En qué teléfono te puede llamar Inés?', function () {
      campo({
        etiqueta: 'Tu teléfono', ejemplo: 'Ej. 612 345 678', max: 20, tipo: 'tel', modo: 'tel', autocompletar: 'tel',
        error: 'Revisa el teléfono: deben ser 9 dígitos.',
        validar: telefonoValido,
        alEnviar: function (v) { lead.telefono = v; pedirPermiso(); }
      });
    });
  }

  function pedirPermiso() {
    ana('Solo falta tu permiso para enviar estos datos.', function () {
      limpiarZona();
      var form = el('form', 'ana-permiso');
      form.noValidate = true;
      form.appendChild(el('p', 'ana-aviso', 'Usaremos tu nombre y tu teléfono solo para devolverte el contacto sobre esta demo.'));
      var fila = el('label', 'ana-casilla');
      var casilla = el('input');
      casilla.type = 'checkbox';
      casilla.id = 'anaAcepto';
      casilla.setAttribute('aria-describedby', 'anaAceptoError');
      var texto = el('span', null, 'He leído y acepto la ');
      var enlace = el('a', null, 'política de privacidad');
      enlace.href = '#privacidad';
      enlace.target = '_blank';
      enlace.rel = 'noopener';
      texto.appendChild(enlace);
      texto.appendChild(document.createTextNode(' (se abre en otra pestaña).'));
      fila.appendChild(casilla);
      fila.appendChild(texto);
      var error = el('p', 'ana-error');
      error.id = 'anaAceptoError';
      error.setAttribute('role', 'alert');
      var enviar = el('button', 'ana-opcion ana-opcion--llena', 'Enviar mis datos');
      enviar.type = 'submit';
      form.appendChild(fila);
      form.appendChild(error);
      form.appendChild(enviar);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!casilla.checked) {
          error.textContent = 'Marca la casilla para poder enviar.';
          bajar();
          casilla.focus();
          return;
        }
        enviarLead();
      });
      zona.appendChild(form);
      bajar();
      casilla.focus();
    });
  }

  // ---------- Envío ----------
  function cuerpoLead() {
    return JSON.stringify({
      nombre: lead.nombre,
      telefono: lead.telefono,
      interes: lead.interes,
      mensaje: 'Localidad: ' + lead.localidad + ' · Empezar: ' + lead.cuando,
      preferencia: lead.preferencia,
      origen: 'demo-ines-barrios',
      sector: 'reformas'
    });
  }

  // Blob text/plain → petición simple, sin preflight. La función parsea el
  // JSON igual. Si el beacon no sale, se reintenta con fetch keepalive.
  function mandar(datos) {
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(LEAD_URL, new Blob([datos], { type: 'text/plain;charset=UTF-8' }))) {
        return Promise.resolve(true);
      }
    } catch (e) { /* se intenta con fetch */ }
    return fetch(LEAD_URL, {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: datos
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }

  function enviarLead() {
    turno++;
    limpiarZona();
    mandar(cuerpoLead()).then(function (ok) {
      if (ok) {
        ana('Gracias, ' + lead.nombre.split(' ')[0] + '. Inés te llamará en cuanto pueda. Si prefieres no esperar: 647 41 04 45 o WhatsApp.', function () { enlaces(false); });
      } else {
        ana('No he podido enviar tus datos ahora mismo. Puedes llamar o escribir directamente a Inés.', function () { enlaces(true); });
      }
    });
  }

  // ---------- Abrir y cerrar ----------
  function abrir() {
    panel.hidden = false;
    fab.hidden = true;
    fab.setAttribute('aria-expanded', 'true');
    if (!iniciado) { iniciado = true; empezar(); }
    var foco = zona.querySelector('button, input, a');
    (foco || btnCerrar).focus();
  }

  function cerrar() {
    panel.hidden = true;
    fab.hidden = false;
    fab.setAttribute('aria-expanded', 'false');
    fab.focus();
  }

  fab.addEventListener('click', abrir);
  btnCerrar.addEventListener('click', cerrar);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) cerrar();
  });

  // La política de privacidad está en un <details> del pie: se abre sola
  // cuando se llega a ella por su ancla.
  function abrirPrivacidad() {
    if (window.location.hash !== '#privacidad') return;
    var d = document.getElementById('privacidad');
    if (d && d.tagName === 'DETAILS') { d.open = true; d.scrollIntoView(); }
  }
  window.addEventListener('hashchange', abrirPrivacidad);
  abrirPrivacidad();
})();
