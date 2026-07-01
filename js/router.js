/**
 * router.js — SPA router para main.html
 * Carga fragmentos HTML desde /pages/fragments/ según el hash de la URL.
 * También gestiona la carga/descarga de scripts específicos de cada sección.
 */

// ── Verificar sesión activa ───────────────────────────────────
// Si no hay usuario en localStorage, redirigir al login.
// window.location.replace() reemplaza la entrada del historial,
// por lo que el botón "atrás" desde el login no puede regresar al portal.
(function checkSession() {
  if (!localStorage.getItem('user')) {
    window.location.replace('../index.html');
  }
})();

const ROUTES = {
  inicio:     { fragment: 'fragments/inicio.html',     script: null,                       label: 'Inicio' },
  perfil:     { fragment: 'fragments/perfil.html',     script: '../js/colaborador-app.js', label: 'Mi Perfil' },
  medismart:  { fragment: 'fragments/medismart.html',  script: '../js/medismart-app.js',   label: 'Plan Médico' },
  vacaciones: { fragment: 'fragments/vacaciones.html', script: null,                       label: 'Vacaciones' },
};

const DEFAULT_ROUTE = 'inicio';

let currentScript = null;

// ── Utilidades ────────────────────────────────────────────────

function getRoute() {
  const hash = window.location.hash.replace('#', '').trim();
  return ROUTES[hash] ? hash : DEFAULT_ROUTE;
}

function setActiveLink(routeKey) {
  document.querySelectorAll('.sidebar a[data-route]').forEach(a => {
    a.classList.toggle('active', a.dataset.route === routeKey);
  });
}

function setSubtitle(label) {
  const el = document.getElementById('pageSubtitle');
  if (el) el.textContent = label;
}

function setTitle(label) {
  document.title = `${label} – DAC Colaboradores`;
}

function removeCurrentScript() {
  if (currentScript) {
    currentScript.remove();
    currentScript = null;
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src + '?t=' + Date.now();
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
    currentScript = s;
  });
}

// ── Navegación principal ──────────────────────────────────────

async function navigate() {
  const routeKey  = getRoute();
  const route     = ROUTES[routeKey];
  const container = document.getElementById('pageContent');

  container.innerHTML = `
    <div class="page-loading">
      <div class="page-spinner"></div>
    </div>`;

  removeCurrentScript();
  setActiveLink(routeKey);
  setSubtitle(route.label);
  setTitle(route.label);

  try {
    const res = await fetch(route.fragment + '?t=' + Date.now());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    container.innerHTML = await res.text();

    if (route.script) {
      await loadScript(route.script);
    }
  } catch (err) {
    container.innerHTML = `
      <div class="page-error">
        <div class="page-error-icon">⚠️</div>
        <h2>No se pudo cargar esta sección</h2>
        <p>${err.message}</p>
      </div>`;
  }
}

// ── Cerrar sesión ─────────────────────────────────────────────

document.getElementById('btnLogout').addEventListener('click', e => {
  e.preventDefault();
  localStorage.removeItem('user');
  // replace() elimina main.html del historial → "atrás" desde login
  // no puede regresar al portal
  window.location.replace('../index.html');
});

// ── Escuchar cambios de hash ──────────────────────────────────

window.addEventListener('hashchange', navigate);
navigate();