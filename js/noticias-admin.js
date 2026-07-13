/**
 * noticias-admin.js
 * CRUD de noticias para el panel de colaboradores.
 * Ruta protegida: solo accesible para el departamento "Gerencia" (ver router.js).
 * Depende de js/shared.js (getUser, callFlow, g, escHtml, formatFecha).
 * Se ejecuta como IIFE — se reinicia limpio en cada navegación del router.
 *
 * Campos de la lista de SharePoint: Título, Contenido, FechaPublicacion,
 * Autor, Validez (fecha de expiración, para borrado automático vía
 * flujo aparte) e ImagenBase64/ImagenNombre (la imagen se redimensiona
 * y comprime en el navegador antes de convertirla a base64 — ver
 * redimensionarYComprimir()).
 *
 * NOTA: showAlert() de este archivo es propia (usa la clase .na-alert,
 * distinta de .alert usada en el resto del proyecto), por eso NO se
 * reemplazó por la showAlert(id, type, msg) de shared.js.
 *
 * NOTA: mantiene el bug preexistente de usar user['Cedula'] en vez de
 * user['Cedulaa'] (la clave correcta en el resto del proyecto) al llamar
 * a callFlow — no se corrige en esta pasada, a pedido explícito.
 */
(function () {

  const user = getUser();
  let noticias = [];
  let editandoId = null;
  let imagenBase64Actual = '';
  let imagenNombreActual = '';

  const MAX_IMAGEN_MB = 2;   // tope duro sobre el archivo original
  const MAX_IMAGEN_DIM = 1600; // px, lado más largo tras redimensionar
  const IMAGEN_CALIDAD = 0.82; // calidad JPEG al comprimir

  function showAlert(type, msg) {
    const el = g('alertNoticias');
    el.className = 'na-alert ' + type + ' show';
    el.textContent = msg;
    setTimeout(() => el.classList.remove('show'), 5000);
  }

  // ── Cargar y renderizar ──────────────────────────────────────

  async function cargarNoticias() {
    const list = g('noticiasList');
    list.innerHTML = '<div class="na-empty">Cargando noticias...</div>';
    try {
      const res = await callFlow('GetNoticia', { CedulaID: user['Cedula'] });
      noticias = res.items || res.value || (Array.isArray(res) ? res : []);
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
        ${n.ImagenBase64 ? `<img class="na-item-img" src="data:image/jpeg;base64,${n.ImagenBase64}" alt="">` : ''}
        <div class="na-item-info">
          <div class="na-item-title">${escHtml(n.Title)}</div>
          <div class="na-item-meta">${escHtml(formatFecha(n.FechaPublicacion))}${n.Autor ? ' · ' + escHtml(n.Autor) : ''}${n.Validez ? ' · Vence ' + escHtml(formatFecha(n.Validez)) : ''}</div>
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
    g('n_validez').value   = n.Validez ? n.Validez.slice(0, 10) : '';
    imagenBase64Actual = n.ImagenBase64 || '';
    imagenNombreActual = n.ImagenNombre || '';
    mostrarPreviewImagen(imagenBase64Actual);
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
    g('n_validez').value   = '';
    quitarImagen();
    g('formTitle').textContent = 'Nueva noticia';
    g('btnGuardarNoticia').textContent = 'Publicar noticia';
    g('btnCancelarEdicion').style.display = 'none';
  }

  async function guardarNoticia() {
    const titulo    = g('n_titulo').value.trim();
    const contenido = g('n_contenido').value.trim();
    const validez   = g('n_validez').value; // 'YYYY-MM-DD' o ''

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
          CedulaID: user['Cedula'],
          itemID: editandoId,
          Title: titulo,
          Contenido: contenido,
          Validez: validez,
          ImagenBase64: imagenBase64Actual,
          ImagenNombre: imagenNombreActual
        });
        showAlert('success', '✓ Noticia actualizada correctamente.');
      } else {
        await callFlow('CrearNoticia', {
          CedulaID: user['Cedula'],
          Title: titulo,
          Contenido: contenido,
          Autor: user['Title'] || '',
          Validez: validez,
          ImagenBase64: imagenBase64Actual,
          ImagenNombre: imagenNombreActual
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
      await callFlow('EliminarNoticia', { CedulaID: user['Cedula'], itemID: id });
      showAlert('success', 'Noticia eliminada.');
      if (String(editandoId) === String(id)) cancelarEdicion();
      await cargarNoticias();
    } catch (e) {
      showAlert('error', 'Error: ' + e.message);
    }
  }

  // ── Imagen (redimensionar + comprimir a JPEG antes de convertir) ──
  // Se limita el archivo original a MAX_IMAGEN_MB y, además, se
  // redimensiona/comprime en el navegador (canvas) antes de guardar el
  // base64, para no inflar el campo de SharePoint con fotos de celular
  // de varios MB. El resultado queda siempre como JPEG.

  function mostrarPreviewImagen(base64) {
    const placeholder = g('na-img-placeholder');
    const preview      = g('na-img-preview');
    const btnQuitar     = g('btnQuitarImagen');
    if (base64) {
      preview.src = 'data:image/jpeg;base64,' + base64;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
      btnQuitar.style.display = 'inline-flex';
    } else {
      preview.src = '';
      preview.style.display = 'none';
      placeholder.style.display = 'block';
      btnQuitar.style.display = 'none';
    }
  }

  function redimensionarYComprimir(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('El archivo no es una imagen válida.'));
        img.onload = () => {
          let { width, height } = img;
          if (width > MAX_IMAGEN_DIM || height > MAX_IMAGEN_DIM) {
            const ratio = Math.min(MAX_IMAGEN_DIM / width, MAX_IMAGEN_DIM / height);
            width  = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', IMAGEN_CALIDAD);
          resolve(dataUrl.split(',')[1]); // solo el base64, sin el prefijo data:...
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function onImagenSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('error', 'El archivo seleccionado no es una imagen.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGEN_MB * 1024 * 1024) {
      showAlert('error', `La imagen no puede superar ${MAX_IMAGEN_MB}MB.`);
      event.target.value = '';
      return;
    }

    try {
      const base64 = await redimensionarYComprimir(file);
      imagenBase64Actual = base64;
      imagenNombreActual = file.name;
      mostrarPreviewImagen(base64);
    } catch (e) {
      showAlert('error', 'No se pudo procesar la imagen: ' + e.message);
    } finally {
      event.target.value = '';
    }
  }

  function quitarImagen() {
    imagenBase64Actual = '';
    imagenNombreActual = '';
    mostrarPreviewImagen('');
  }

  // ── Exponer funciones para onclick del HTML ────────────────────
  window.guardarNoticia   = guardarNoticia;
  window.cancelarEdicion  = cancelarEdicion;
  window.onImagenSelect   = onImagenSelect;
  window.quitarImagen     = quitarImagen;

  // ── Inicio ──────────────────────────────────────────────────────
  cargarNoticias();

})();