/* login-app.js */

// Si ya hay sesión activa, ir directo al portal
(function () {
  if (localStorage.getItem('user')) {
    window.location.replace('./pages/main.html');
  }
})();

const FLOWS = {
  buscarColaborador:    'https://default1cf912e46be04485ada7ae59cd0c96.ee.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/09237870375841bf8de7e7fc257227aa/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=RjzdNhH6QV9epKmaWGCK-JfHxkief3lP_6bYuKbDHpg',
  };

async function callFlow(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error('Error ' + res.status + ': ' + res.statusText);
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function buscarColaborador() {
  const ced = document.getElementById('username').value.trim();
  if (!ced) { showAlert('alertGlobal', 'error', 'Ingrese un número de cédula.'); return; }
  setLoading(true); hideAlert('alertGlobal');
  try {
    const data = await callFlow(FLOWS.buscarColaborador, { cedula: ced, operacion: 'GetUser', datos: {} });
    if (!data.items || data.items.length === 0) {
      showAlert('alertGlobal', 'error', 'No se encontró ningún colaborador con esa cédula.');
      return;
    }
    if (data.items[0]['contrasena'] != document.getElementById('password').value.trim()) {
      showAlert('alertGlobal', 'error', 'Contraseña incorrecta. Por favor, inténtelo de nuevo.');
      return;
    }
    const userData = await callFlow(FLOWS.buscarColaborador, { cedula: ced, operacion: 'GetEmployee', datos: {} });
    localStorage.setItem('user', JSON.stringify(userData.items[0]));
    // replace() para que "atrás" desde el portal no regrese al login
    window.location.replace('./pages/main.html');
  } catch(e) {
    showAlert('alertGlobal', 'error', 'Error: ' + e.message);
  } finally {
    setLoading(false);
  }
}

function setLoading(show) {
  document.getElementById('loadingState').style.display = show ? 'block' : 'none';
}
function showAlert(id, type, msg) {
  const el = document.getElementById(id);
  el.className = 'alert ' + type + ' show';
  el.textContent = msg;
  setTimeout(() => el.classList.remove('show'), 6000);
}
function hideAlert(id) {
  document.getElementById(id).classList.remove('show');
}

document.getElementById('password').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    buscarColaborador();
  }
});