// Menú de puntos verticales: abrir/cerrar
(function () {
  const toggle = document.getElementById("menu-toggle");
  const lista = document.getElementById("menu-lista");
  if (!toggle || !lista) return;

  function abrir(abierto) {
    lista.hidden = !abierto;
    toggle.setAttribute("aria-expanded", String(abierto));
  }

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    abrir(lista.hidden);
  });

  // Cerrar al hacer clic fuera o con Escape
  document.addEventListener("click", function (e) {
    if (!lista.contains(e.target)) abrir(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      abrir(false);
      toggle.focus();
    }
  });
})();
