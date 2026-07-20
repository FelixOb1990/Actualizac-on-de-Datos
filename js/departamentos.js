/**
 * departamentos.js — Carga (con caché) los departamentos desde la lista
 * "Departamentos DAC" (columnas: Título = nombre del departamento,
 * Contacto, Nombre del Jefe) y puebla <select id="{px}_departamento">.
 *
 * Depende de js/shared.js (callFlow, escHtml). Se carga una sola vez en
 * main.html, junto con shared.js y geo-data.js, para no repetir la
 * llamada al flow cada vez que se navega a perfil o colaboradores-admin.
 */

let _departamentosCache = null; // Promise<Array<{Title, Contacto, ...}>>

function obtenerDepartamentos() {
  if (!_departamentosCache) {
    _departamentosCache = callFlow('GetDepartamentos', {})
      .then(res => res.items || res.value || (Array.isArray(res) ? res : []))
      .catch(e => { _departamentosCache = null; throw e; });
  }
  return _departamentosCache;
}

// Puebla el <select id="{px}_departamento"> con los departamentos.
// Si el select ya tenía un valor seleccionado, intenta conservarlo.
async function cargarDepartamentos(px) {
  const sel = document.getElementById(px + '_departamento');
  if (!sel) return;
  const actual = sel.value;
  try {
    const departamentos = await obtenerDepartamentos();
    sel.innerHTML = '<option value="">Seleccione...</option>' +
      departamentos.map(d => `<option value="${escHtml(d.Title)}">${escHtml(d.Title)}</option>`).join('');
    if (actual) sel.value = actual;
  } catch (e) {
    sel.innerHTML = '<option value="">Error al cargar departamentos</option>';
  }
}