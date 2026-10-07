// Inés Barrios · demo WhiteMoon — movimiento sutil, sin dependencias
(function () {
  'use strict';

  var sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (sinMovimiento) return;

  // Aparición al hacer scroll. El contenido es visible por defecto:
  // solo se oculta si este script llega a ejecutarse.
  var bloques = document.querySelectorAll('.revela');
  if (bloques.length && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-anim');
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('is-visible');
        observador.unobserve(entrada.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    bloques.forEach(function (bloque) { observador.observe(bloque); });
  }

  // Palabra rotatoria de la portada
  var rota = document.querySelector('[data-rota]');
  if (!rota) return;
  var palabras = rota.getAttribute('data-rota').split('|');
  var indice = 0;
  setInterval(function () {
    rota.classList.add('is-saliendo');
    setTimeout(function () {
      indice = (indice + 1) % palabras.length;
      rota.textContent = palabras[indice];
      rota.classList.remove('is-saliendo');
    }, 300);
  }, 2800);
})();
