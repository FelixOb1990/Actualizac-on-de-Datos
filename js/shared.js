/**
 * shared.js — Constantes y helpers comunes a todos los módulos del
 * portal DAC (login, perfil, plan médico, vacaciones, noticias,
 * administración de colaboradores).
 *
 * Se carga UNA sola vez, ANTES que cualquier script de módulo/ruta:
 *  - index.html:  <script src="js/shared.js"></script> antes de login-app.js
 *  - main.html:   <script src="../js/shared.js"></script> antes de router.js
 *    (persiste entre navegaciones del router, igual que sidebar.js)
 *
 * No está envuelto en IIFE a propósito, para que sus funciones queden
 * disponibles en el scope global del documento.
 */

// Todos los módulos apuntan al mismo flow de Power Automate; el backend
// decide qué hacer según el parámetro "operacion".
const FLOW_URL = 'https://default1cf912e46be04485ada7ae59cd0c96.ee.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/09237870375841bf8de7e7fc257227aa/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=RjzdNhH6QV9epKmaWGCK-JfHxkief3lP_6bYuKbDHpg';

function getUser() {
  return JSON.parse(localStorage.getItem('user') || '{}');
}

function getUserRol() {
  return localStorage.getItem('UserRol') || '';
}
/**
 * Llama el flow compartido.
 * El flow en Power Automate recibe únicamente { operacion, datos } — la
 * cédula ya NO se envía como campo separado; si una operación necesita
 * identificar a un colaborador, quien llama a callFlow() debe incluir
 * 'CedulaID' dentro de `datos` (ver ejemplos en cada módulo, p. ej.
 * callFlow('GetBeneficiario', { CedulaID: user['Cedulaa'] })).
 */
async function callFlow(operacion, datos) {
  const ced = datos['CedulaID'] !== undefined ? datos['CedulaID'] : (getUser()['Cedulaa'] || '');
  const res = await fetch(FLOW_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operacion, datos })
  });
  if (!res.ok) throw new Error('Error ' + res.status + ': ' + res.statusText);
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

function g(id) { return document.getElementById(id); }

function setLoading(show, id = 'loadingState') {
  const el = g(id);
  if (el) el.style.display = show ? 'block' : 'none';
}

function showAlert(id, type, msg) {
  const el = g(id);
  if (!el) return;
  el.className = 'alert ' + type + ' show';
  el.textContent = msg;
  setTimeout(() => el.classList.remove('show'), 6000);
}

function hideAlert(id) {
  const el = g(id);
  if (el) el.classList.remove('show');
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Formatea fechas tipo ISO datetime (ej. "2026-03-04T00:00:00Z") a
// "04 mar 2026". Para fechas tipo "solo día" (YYYY-MM-DD) sin hora,
// preferir un parseo con hora fija (ver vacaciones.js) para evitar
// corrimientos de un día por zona horaria.
function formatFecha(f) {
  if (!f) return '';
  const d = new Date(f);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Genera un identificador único para el token de sesión (single-session
// enforcement, ver js/session.js). Usa crypto.randomUUID() si el
// navegador lo soporta (requiere contexto seguro: HTTPS o localhost),
// con un fallback simple si no está disponible.
function generarTokenSesion() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
