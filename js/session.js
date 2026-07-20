/**
 * session.js — Dos mecanismos de seguridad de sesión, ambos activos solo
 * en main.html (nunca en index.html, donde todavía no hay sesión):
 *
 * 1. Cierre automático por inactividad del usuario.
 * 2. Sesión única por usuario: cada login genera un token que se guarda
 *    en el servidor (columna 'SessionToken') y en localStorage. Cada
 *    cierto tiempo se compara el token local contra el remoto (vía
 *    GetUser); si no coinciden, alguien inició sesión en otro
 *    dispositivo y esta sesión se cierra.
 */
(function () {
  const LIMITE_INACTIVIDAD_MS   = 30 * 60 * 1000; // 30 minutos — ajustar si hace falta
  const INTERVALO_CHEQUEO_MS    = 2  * 60 * 1000; // 2 minutos
  let temporizadorInactividad = null;

  function cerrarSesion(mensaje) {
    sessionStorage.setItem('sessionExpiredMsg', mensaje);
    localStorage.removeItem('user');
    localStorage.removeItem('sessionToken');
    window.location.replace('../index.html');
  }

  // ── 1. Inactividad ──────────────────────────────────────────────

  function cerrarPorInactividad() {
    cerrarSesion('Tu sesión expiró por inactividad. Volvé a iniciar sesión.');
  }

  function reiniciarTemporizadorInactividad() {
    if (temporizadorInactividad) clearTimeout(temporizadorInactividad);
    temporizadorInactividad = setTimeout(cerrarPorInactividad, LIMITE_INACTIVIDAD_MS);
  }

  ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evento => {
    document.addEventListener(evento, reiniciarTemporizadorInactividad, { passive: true });
  });

  reiniciarTemporizadorInactividad();

  // ── 2. Sesión única por usuario ──────────────────────────────────

  async function verificarSesionUnica() {
    const tokenLocal = localStorage.getItem('sessionToken');
    const user = getUser();
    if (!tokenLocal || !user['Cedulaa']) return; // no hay nada que comparar

    try {
      const res = await callFlow('GetUser', { CedulaID: user['Cedulaa'] });
      const tokenRemoto = res.items && res.items[0] && res.items[0]['SessionToken'];
      if (tokenRemoto && tokenRemoto !== tokenLocal) {
        cerrarSesion('Tu sesión se cerró porque se inició sesión desde otro dispositivo.');
      }
    } catch (e) {
      // Si la verificación falla (ej. sin conexión momentánea), no se
      // cierra la sesión — se reintenta en el próximo ciclo.
    }
  }

  setInterval(verificarSesionUnica, INTERVALO_CHEQUEO_MS);
})();
