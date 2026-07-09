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

// ── Control de acceso por departamento ─────────────────────────
// Por el momento, solo el departamento "Gerencia" puede administrar noticias.
function esUsuarioGerencia() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user['Cedulaa']=== '207420711';
}

// Mostrar/ocultar los ítems del sidebar restringidos según el departamento del usuario
(function setupRestrictedNav() {
  const esGerencia = esUsuarioGerencia();
  const navNoticias = document.getElementById('navNoticiasAdmin');
  if (navNoticias) navNoticias.style.display = esGerencia ? '' : 'none';
  const navColaboradores = document.getElementById('navColaboradoresAdmin');
  if (navColaboradores) navColaboradores.style.display = esGerencia ? '' : 'none';
})();

const ROUTES = {
  inicio:     { fragment: 'fragments/inicio.html',     script: null,                       label: 'Inicio' },
  perfil:     { fragment: 'fragments/perfil.html',     script: ['../js/geo-data.js', '../js/colaborador-app.js'], label: 'Mi Perfil' },
  medismart:  { fragment: 'fragments/medismart.html',  script: '../js/medismart-app.js',   label: 'Plan Médico' },
  vacaciones: { fragment: 'fragments/vacaciones.html', script: '../js/vacaciones.js',       label: 'Vacaciones'},
  'noticias-admin': { fragment: 'fragments/noticias-admin.html', script: '../js/noticias-admin.js', label: 'Noticias (Admin)', restricted: true },
  'colaboradores-admin': { fragment: 'fragments/colaboradores-admin.html', script: ['../js/geo-data.js', '../js/colaboradores-admin.js'], label: 'Administrar Colaboradores', restricted: true },
};

const DEFAULT_ROUTE = 'inicio';

let currentScripts = [];

// ── Utilidades ────────────────────────────────────────────────

function getRoute() {
  const hash = window.location.hash.replace('#', '').trim();
  const routeKey = ROUTES[hash] ? hash : DEFAULT_ROUTE;
  // Si la ruta es restringida y el usuario no tiene permiso, cae a la ruta por defecto
  if (ROUTES[routeKey].restricted && !esUsuarioGerencia()) {
    return DEFAULT_ROUTE;
  }
  return routeKey;
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

function removeCurrentScripts() {
  currentScripts.forEach(s => s.remove());
  currentScripts = [];
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src + '?t=' + Date.now();
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
    currentScripts.push(s);
  });
}

// Carga uno o varios scripts, en orden, esperando cada uno antes del siguiente
// (para que los scripts compartidos como geo-data.js estén listos antes que
// el script que depende de ellos).
async function loadScripts(scriptOrScripts) {
  const list = Array.isArray(scriptOrScripts) ? scriptOrScripts : [scriptOrScripts];
  for (const src of list) {
    await loadScript(src);
  }
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

  removeCurrentScripts();
  setActiveLink(routeKey);
  setSubtitle(route.label);
  setTitle(route.label);

  try {
    const res = await fetch(route.fragment + '?t=' + Date.now());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    container.innerHTML = await res.text();

    if (route.script) {
      await loadScripts(route.script);
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