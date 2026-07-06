(function () {
  const FLOW_URL_NOTICIAS = 'https://default1cf912e46be04485ada7ae59cd0c96.ee.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/09237870375841bf8de7e7fc257227aa/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=RjzdNhH6QV9epKmaWGCK-JfHxkief3lP_6bYuKbDHpg';

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log('User data:', user);
  document.getElementById('greetName').textContent = DevuelveNombeCompleto() || 'colaborador';

  function escHtml(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function DevuelveNombeCompleto() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user['Nombre2'] !== '') {
      return user['Title'] + ' ' + user['Nombre2'] + ' ' + user['Apellido1']+ ' ' + user['Apellido2'];
    }else {
        return user['Title'] + ' ' + user['Apellido1']+ ' ' + user['Apellido2'];
    };
  }

  function formatFecha(f) {
    if (!f) return '';
    const d = new Date(f);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  async function cargarNoticias() {
    const cont = document.getElementById('noticiasFeed');
    try {
      const res = await fetch(FLOW_URL_NOTICIAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({cedula: '207420711', operacion: 'GetNoticia', datos: {} })
      });
      
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
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