// Inés Barrios · demo WhiteMoon — menú móvil y aparición al hacer scroll
(function () {
  'use strict';

  // Menú móvil (<= 900 px)
  var boton = document.getElementById('navBoton');
  var panel = document.getElementById('navMovil');
  if (boton && panel) {
    var cerrar = function (devolverFoco) {
      panel.classList.remove('is-abierto');
      boton.setAttribute('aria-expanded', 'false');
      boton.setAttribute('aria-label', 'Abrir menú');
      if (devolverFoco) boton.focus();
    };
    boton.addEventListener('click', function () {
      var abierto = panel.classList.toggle('is-abierto');
      boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
      if (abierto) panel.querySelector('a').focus();
    });
    panel.querySelectorAll('a').forEach(function (enlace) {
      enlace.addEventListener('click', function () { cerrar(false); });
    });
    document.addEventListener('click', function (e) {
      if (panel.classList.contains('is-abierto') && !panel.contains(e.target) && !boton.contains(e.target)) cerrar(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-abierto')) cerrar(true);
    });
  }

  // Aparición al hacer scroll. Sin IntersectionObserver o con movimiento
  // reducido, todo queda visible desde el principio.
  var bloques = document.querySelectorAll('.revela');
  var sinMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || sinMovimiento) {
    bloques.forEach(function (bloque) { bloque.classList.add('is-visible'); });
    return;
  }
  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('is-visible');
      observador.unobserve(entrada.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
  bloques.forEach(function (bloque) { observador.observe(bloque); });
})();
