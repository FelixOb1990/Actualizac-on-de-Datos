/**
 * noticias-admin.js
 * CRUD de noticias para el panel de colaboradores.
 * Ruta protegida: solo accesible para el departamento "Gerencia" (ver router.js).
 * Se ejecuta como IIFE — se reinicia limpio en cada navegación del router.
 */
(function () {

  // ⚠️ Reemplazar con la URL real del flow de Power Automate para Noticias
  const FLOW_URL = 'https://REEMPLAZAR-CON-URL-DEL-FLOW-DE-NOTICIAS';

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  let noticias = [];
  let editandoId = null;

  function g(id) { return document.getElementById(id); }

  async function callFlow(operacion, datos) {
    const res = await fetch(FLOW_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operacion, datos })
    });
    if (!res.ok) throw new Error('Error ' + res.status + ': ' + res.statusText);
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  }

  function showAlert(type, msg) {
    const el = g('alertNoticias');
    el.className = 'na-alert ' + type + ' show';
    el.textContent = msg;
    setTimeout(() => el.classList.remove('show'), 5000);
  }

  function escHtml(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function formatFecha(f) {
    if (!f) return '';
    const d = new Date(f);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ── Cargar y renderizar ──────────────────────────────────────

  async function cargarNoticias() {
    const list = g('noticiasList');
    list.innerHTML = '<div class="na-empty">Cargando noticias...</div>';
    try {
      const res = await callFlow('GetNoticias', {});
      noticias = Array.isArray(res) ? res : (res.value || []);
      renderLista();
    } catch (e) {
      list.innerHTML = `<div class="na-empty">Error cargando noticias: ${escHtml(e.message)}</div>`;
    }
  }

  function renderLista() {
    const list = g('noticiasList');
    if (!noticias.length) {
      list.innerHTML = '<div class="na-empty">Todavía no hay noticias publicadas.</div>';
      return;
    }
    const ordenadas = [...noticias].sort((a, b) => new Date(b.FechaPublicacion) - new Date(a.FechaPublicacion));
    list.innerHTML = ordenadas.map(n => `
      <div class="na-item">
        <div class="na-item-info">
          <div class="na-item-title">${escHtml(n.Title)}</div>
          <div class="na-item-meta">${escHtml(formatFecha(n.FechaPublicacion))}${n.Autor ? ' · ' + escHtml(n.Autor) : ''}</div>
          <div class="na-item-body">${escHtml(n.Contenido)}</div>
        </div>
        <div class="na-item-actions">
          <button class="na-btn na-btn-ghost na-btn-sm" data-id="${escHtml(n.ID)}" data-action="editar">Editar</button>
          <button class="na-btn na-btn-danger na-btn-sm" data-id="${escHtml(n.ID)}" data-action="eliminar">Eliminar</button>
        </div>
      </div>
    `).join('');
  }

  // ── Delegación de eventos para editar/eliminar ────────────────

  g('noticiasList').addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'editar')   iniciarEdicion(id);
    if (btn.dataset.action === 'eliminar') eliminarNoticia(id);
  });

  // ── Formulario ────────────────────────────────────────────────

  function iniciarEdicion(id) {
    const n = noticias.find(x => String(x.ID) === String(id));
    if (!n) return;
    editandoId = id;
    g('n_itemid').value    = id;
    g('n_titulo').value    = n.Title || '';
    g('n_contenido').value = n.Contenido || '';
    g('formTitle').textContent = 'Editar noticia';
    g('btnGuardarNoticia').textContent = 'Guardar cambios';
    g('btnCancelarEdicion').style.display = 'inline-flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicion() {
    editandoId = null;
    g('n_itemid').value    = '';
    g('n_titulo').value    = '';
    g('n_contenido').value = '';
    g('formTitle').textContent = 'Nueva noticia';
    g('btnGuardarNoticia').textContent = 'Publicar noticia';
    g('btnCancelarEdicion').style.display = 'none';
  }

  async function guardarNoticia() {
    const titulo    = g('n_titulo').value.trim();
    const contenido = g('n_contenido').value.trim();

    if (!titulo || !contenido) {
      showAlert('error', 'Completá el título y el contenido de la noticia.');
      return;
    }

    const btn = g('btnGuardarNoticia');
    const textoOriginal = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      if (editandoId) {
        await callFlow('EditarNoticia', {
          itemID: editandoId,
          Title: titulo,
          Contenido: contenido
        });
        showAlert('success', '✓ Noticia actualizada correctamente.');
      } else {
        await callFlow('CrearNoticia', {
          Title: titulo,
          Contenido: contenido,
          Autor: user['Title'] || ''
        });
        showAlert('success', '✓ Noticia publicada correctamente.');
      }
      cancelarEdicion();
      await cargarNoticias();
    } catch (e) {
      showAlert('error', 'Error: ' + e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = textoOriginal;
    }
  }

  async function eliminarNoticia(id) {
    const n = noticias.find(x => String(x.ID) === String(id));
    if (!confirm(`¿Eliminar la noticia "${n ? n.Title : id}"?`)) return;

    try {
      await callFlow('EliminarNoticia', { itemID: id });
      showAlert('success', 'Noticia eliminada.');
      if (String(editandoId) === String(id)) cancelarEdicion();
      await cargarNoticias();
    } catch (e) {
      showAlert('error', 'Error: ' + e.message);
    }
  }

  // ── Exponer funciones para onclick del HTML ────────────────────
  window.guardarNoticia   = guardarNoticia;
  window.cancelarEdicion  = cancelarEdicion;

  // ── Inicio ──────────────────────────────────────────────────────
  cargarNoticias();

})();