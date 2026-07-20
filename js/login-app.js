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

// Si veníamos de un cierre de sesión automático por inactividad (ver
// js/session.js), mostrar el aviso una sola vez.
(function () {
  const msg = sessionStorage.getItem('sessionExpiredMsg');
  if (msg) {
    sessionStorage.removeItem('sessionExpiredMsg');
    showAlert('alertGlobal', 'error', msg);
  }
})();

async function BuscarData(operacion, datos) {
  return callFlow(operacion, datos);
}

async function buscarColaborador() {
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
    const userRol = data.items[0]['rol'].Value;
    localStorage.setItem('UserRol', userRol);
    const userData = await BuscarData('GetEmployee', { CedulaID: ced });
    localStorage.setItem('user', JSON.stringify(userData.items[0]));

    // Token de sesión única: se genera acá, se guarda en el servidor
    // (columna 'SessionToken' en la lista de usuarios) y localmente.
    // session.js compara periódicamente ambos para cerrar esta sesión
    // si se inicia otra desde un dispositivo distinto.
    const token = generarTokenSesion();
    await callFlow('SetSessionToken', { CedulaID: ced, SessionToken: token });
    localStorage.setItem('sessionToken', token);

    // replace() para que "atrás" desde el portal no regrese al login
    window.location.replace('./pages/main.html');
  } catch (e) {
    showAlert('alertGlobal', 'error', 'Error: ' + e.message);
  } finally {
    setLoading(false);
  }
}

g('password').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') buscarColaborador();
});