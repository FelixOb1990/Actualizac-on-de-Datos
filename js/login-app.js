/**
 * login-app.js
 * Lógica de la página de login (index.html).
 * Depende de js/shared.js (callFlow, g, setLoading, showAlert, hideAlert),
 * cargado antes en index.html.
 *
 * NOTA DE UNIFICACIÓN: este archivo reemplaza tanto al login-app.js
 * como al script.js originales, que eran casi duplicados entre sí
 * (mismo comentario de cabecera, misma lógica de "si ya hay sesión
 * redirigir", dos objetos FLOWS/FLOWS2 con la misma URL) y cuya
 * interacción causaba un error real: script.js se cargaba después y
 * sobrescribía la función global callFlow con una versión que
 * dependía de una variable FLOW_URL nunca definida en ese archivo.
 * script.js debe eliminarse del proyecto y quitarse de index.html.
 */

// Si ya hay sesión activa, ir directo al portal
(function () {
  if (localStorage.getItem('user')) {
    window.location.replace('./pages/main.html');
  }
})();

async function BuscarData(operacion, datos) {
  return callFlow(operacion, datos);
}

async function BuscarUsuario() {
  const ced = g('username').value.trim();
  if (!ced) { showAlert('alertGlobal', 'error', 'Ingrese un número de cédula.'); return; }
  setLoading(true); hideAlert('alertGlobal');
  try {
    const data = await BuscarData('GetUser', { CedulaID: ced });
    if (!data.items || data.items.length === 0) {
      showAlert('alertGlobal', 'error', 'No se encontró ningún colaborador con esa cédula.');
      return;
    }
    if (data.items[0]['contrasena'] != g('password').value.trim()) {
      showAlert('alertGlobal', 'error', 'Contraseña incorrecta. Por favor, inténtelo de nuevo.');
      return;
    }

    localStorage.setItem('UserRol', JSON.stringify(data.items[0]));

    await BuscarDataColaborador(ced);
    // replace() para que "atrás" desde el portal no regrese al login
    window.location.replace('./pages/main.html');
  } catch (e) {
    showAlert('alertGlobal', 'error', 'Error: ' + e.message);
  } finally {
    setLoading(false);
  }
}

g('password').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') BuscarUsuario();
});
