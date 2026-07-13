/**
 * inicio.js — Feed de noticias del home.
 * Depende de js/shared.js (getUser, callFlow, g, escHtml, formatFecha).
 * IIFE — se reinicia limpio en cada navegación del router.
 */
(function () {

  g('greetName').textContent = DevuelveNombeCompleto() || 'colaborador';

  function DevuelveNombeCompleto() {
    const u = getUser();
    if (u['Nombre2'] !== '') {
      return u['Title'] + ' ' + u['Nombre2'] + ' ' + u['Apellido1'] + ' ' + u['Apellido2'];
    } else {
      return u['Title'] + ' ' + u['Apellido1'] + ' ' + u['Apellido2'];
    }
  }

  async function cargarNoticias() {
    const cont = g('noticiasFeed');
    try {
      // NOTA: cédula hardcodeada preexistente ('207420711') — se mantiene
      // igual a propósito, sin modificar comportamiento en esta pasada.
      const data = await callFlow('GetNoticia', { CedulaID: '207420711' });
      const noticias = Array.isArray(data) ? data : (data.items || data.value || []);

      if (!noticias.length) {
        cont.innerHTML = '<div class="frag-noticias-empty">No hay noticias por el momento.</div>';
        return;
      }

      const ordenadas = [...noticias].sort((a, b) => new Date(b.FechaPublicacion) - new Date(a.FechaPublicacion));

      cont.innerHTML = ordenadas.map(n => `
        <div class="frag-noticia-card">
          <div class="frag-noticia-fecha">${escHtml(formatFecha(n.FechaPublicacion))}</div>
          <h3 class="frag-noticia-titulo">${escHtml(n.Title)}</h3>
          ${n.ImagenURL ? `<img class="frag-noticia-img" src="${escHtml(n.ImagenURL)}" alt="">` : ''}
          <p class="frag-noticia-cuerpo">${escHtml(n.Contenido)}</p>
          ${n.Autor ? `<div class="frag-noticia-autor">— ${escHtml(n.Autor)}</div>` : ''}
        </div>
      `).join('');
    } catch (e) {
      cont.innerHTML = '<div class="frag-noticias-empty">No se pudieron cargar las noticias.</div>';
    }
  }

  cargarNoticias();
})();
