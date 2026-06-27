/**
 * sidebar.js — Controla el colapso/expansión del sidebar.
 * Funciona tanto en el shell (main.html) como en páginas standalone.
 */
(function () {
  const sidebar   = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');

  if (!sidebar || !toggleBtn) return;

  // Restaurar estado guardado
  if (localStorage.getItem('sidebarCollapsed') === 'true') {
    sidebar.classList.add('collapsed');
  }

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
  });
})();
