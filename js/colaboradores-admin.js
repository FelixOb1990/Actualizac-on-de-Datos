/**
 * colaboradores-admin.js
 * Lista, edición, creación y borrado de colaboradores.
 * Ruta protegida: solo accesible para el departamento "Gerencia" (ver router.js).
 * Depende de js/shared.js (callFlow, g, escHtml, setLoading, showAlert, hideAlert)
 * y js/geo-data.js (PROVINCIAS/CANTONES/DISTRITOS, initProvincias,
 * cargarCantones, cargarDistritos, setGeo) — ambos cargados una sola vez
 * desde main.html, antes de router.js.
 * Se ejecuta como IIFE — se reinicia limpio en cada navegación del router.
 *
 * TODO: 'GetEmployees' (listar todos) y 'NewEmployee' (crear) son nombres
 * de operación SUPUESTOS, siguiendo el patrón de GetEmployee/UpdateEmployee
 * y NewBeneficiario respectivamente. Confirmar los nombres reales en el
 * flow y ajustar acá si son distintos. Lo mismo aplica a 'DeleteEmployee'.
 */
(function () {

  let colaboradores = [];
  let itemIdActual = null;
  let cedulaActual = null;
  let modoCrear = false;

  // A diferencia de colaborador-app.js (que siempre opera sobre la cédula
  // del usuario logueado), acá la cédula es la que se busca/edita cada
  // vez — por eso se incluye explícitamente como 'CedulaID' dentro de
  // `datos` en cada llamada a callFlow(), en vez de depender del usuario
  // en sesión.

  function nombreColaborador(f) {
    return [f['Title'], f['Nombre2'], f['Apellido1'], f['Apellido2']].filter(Boolean).join(' ');
  }

  // ── Lista de colaboradores ──────────────────────────────────────

  async function cargarListaColaboradores() {
    const list  = g('colaboradoresList');
    const empty = g('colaboradoresListEmpty');
    empty.classList.add('hidden');
    list.innerHTML = '<div class="empty-state"><p>Cargando colaboradores...</p></div>';
    try {
      const res = await callFlow('GetEmployee2', {});
      colaboradores = res.items || res.value || (Array.isArray(res) ? res : []);
      renderListaColaboradores();
    } catch (e) {
      list.innerHTML = '';
      showAlert('alertBusqueda', 'error', 'Error al cargar colaboradores: ' + e.message);
    }
  }

  function renderListaColaboradores() {
    const list  = g('colaboradoresList');
    const empty = g('colaboradoresListEmpty');
    if (!colaboradores.length) {
      list.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    const ordenados = [...colaboradores].sort((a, b) => nombreColaborador(a).localeCompare(nombreColaborador(b)));
    list.innerHTML = ordenados.map(f => `
      <div class="colab-list-item" data-cedula="${escHtml(f['Cedulaa'])}">
        <div class="colab-list-name">${escHtml(nombreColaborador(f))}</div>
        <div class="colab-list-meta">${escHtml(f['Cedulaa'] || '')}${f['Puesto'] ? ' · ' + escHtml(f['Puesto']) : ''}</div>
      </div>
    `).join('');
  }

  g('colaboradoresList').addEventListener('click', e => {
    const item = e.target.closest('.colab-list-item');
    if (!item) return;
    seleccionarColaborador(item.dataset.cedula);
  });

  async function seleccionarColaborador(cedula) {
    if (!cedula) return;
    hideAlert('alertBusqueda');
    g('sectionColaborador').classList.add('hidden');
    setLoading(true);
    try {
      const res = await callFlow('GetEmployee', { CedulaID: cedula });
      const f = res.items && res.items[0];

      if (!f || !f['ID']) {
        throw new Error('No se encontró ese colaborador.');
      }

      modoCrear = false;
      itemIdActual = f['ID'];
      cedulaActual = cedula;
      llenarColaborador(f);
      g('btnEliminarColaborador').style.display = '';
      g('btnGuardarColaborador').textContent = 'Guardar Cambios';
      g('formColaboradorTitle').textContent = 'Editar Colaborador';
      g('sectionColaborador').classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      showAlert('alertBusqueda', 'error', e.message);
    } finally {
      setLoading(false);
    }
  }

  function llenarColaborador(f) {
    g('a_cedula').value    = f['Cedulaa']             || '';
    g('a_apellido1').value = f['Apellido1']            || '';
    g('a_apellido2').value = f['Apellido2']            || '';
    g('a_nombre1').value   = f['Title']                || '';
    g('a_nombre2').value   = f['Nombre2']              || '';
    g('a_contacto').value  = f['Email']                || '';
    g('a_tel1').value      = f['Telefonoprimario']     || '';
    g('a_tel2').value      = f['Telefonosecundario']   || '';
    g('a_fechanacimiento').value = (f['Fechadenacimiento'] || '').slice(0, 10);
    g('a_genero').value    = f['Genero']?.Value        || '';
    g('a_paisnacimiento').value  = f['PaisNacimiento']  || '';
    g('a_departamento').value    = f['Departamento']?.Value || '';
    g('a_puesto').value          = f['Puesto']          || '';
    g('a_fechaingreso').value    = (f['FechadeIngreso'] || '').slice(0, 10);
    g('a_email').value           = f['ContactoPersonal'] || '';
    g('a_profesion').value       = f['Profesion']        || '';
    g('a_estudioscomplementarios').value = f['EstudiosComplementarios'] || '';

    const ecMap = { 'Union Libre': 'Unión Libre' };
    const ecRaw = f['EstadoCivil']?.Value || '';
    g('a_estadocivil').value = ecMap[ecRaw] || ecRaw;

    g('a_direccion').value = f['Direccion'] || '';
    setGeo('a', f['Provincia'] || '', f['Cant_x00f3_n'] || '', f['Distrito'] || '');
  }

  function limpiarFormColaborador() {
    ['a_cedula','a_apellido1','a_apellido2','a_nombre1','a_nombre2','a_contacto','a_tel1','a_tel2',
     'a_fechanacimiento','a_paisnacimiento','a_departamento','a_puesto','a_fechaingreso','a_email',
     'a_profesion','a_estudioscomplementarios','a_direccion'].forEach(id => {
      const el = g(id); if (el) el.value = '';
    });
    g('a_genero').value = '';
    g('a_estadocivil').value = '';
    g('a_provincia').value = '';
    g('a_canton').innerHTML = '<option value="">Seleccione provincia primero</option>';
    g('a_canton').disabled = true;
    g('a_distrito').innerHTML = '<option value="">Seleccione cantón primero</option>';
    g('a_distrito').disabled = true;
  }

  // ── Nuevo colaborador ────────────────────────────────────────────

  function mostrarFormNuevoColaborador() {
    modoCrear = true;
    itemIdActual = null;
    cedulaActual = null;
    hideAlert('alertColaborador');
    limpiarFormColaborador();
    g('btnEliminarColaborador').style.display = 'none';
    g('btnGuardarColaborador').textContent = 'Crear Colaborador';
    g('formColaboradorTitle').textContent = 'Nuevo Colaborador';
    g('sectionColaborador').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cerrarFormColaborador() {
    modoCrear = false;
    itemIdActual = null;
    cedulaActual = null;
    g('sectionColaborador').classList.add('hidden');
    hideAlert('alertColaborador');
  }

  // ── Guardar (crear o actualizar) ──────────────────────────────────

  async function guardarColaboradorAdmin() {
    const cedulaForm = g('a_cedula').value.trim();
    if (!cedulaForm) {
      showAlert('alertColaborador', 'error', 'La cédula es obligatoria.');
      return;
    }

    const btn = g('btnGuardarColaborador');
    const textoOriginal = btn.textContent;
    btn.disabled = true; btn.textContent = modoCrear ? 'Creando...' : 'Guardando...'; hideAlert('alertColaborador');

    try {
      const pe = g('a_provincia');
      const ce = g('a_canton');
      const ecMap = { 'Unión Libre': 'Union Libre' };
      const ecVal = ecMap[g('a_estadocivil').value] || g('a_estadocivil').value;

      const datos = {
        CedulaID:  modoCrear ? cedulaForm : cedulaActual,
        Cedulaa:   cedulaForm,
        Apellido1: g('a_apellido1').value,
        Apellido2: g('a_apellido2').value,
        Nombre1:   g('a_nombre1').value,
        Nombre2:   g('a_nombre2').value,
        Contacto:  g('a_contacto').value,
        Genero:    g('a_genero').value,
        Tel1:      g('a_tel1').value,
        Tel2:      g('a_tel2').value,
        EstadoCivil: ecVal,
        Provincia: pe.options[pe.selectedIndex]?.text || '',
        Canton:    ce.options[ce.selectedIndex]?.text || '',
        Distrito:  g('a_distrito').value,
        Direccion: g('a_direccion').value,
        FechaNacimiento: g('a_fechanacimiento').value,
        PaisNacimiento:  g('a_paisnacimiento').value,
        Departamento:    g('a_departamento').value,
        Puesto:          g('a_puesto').value,
        FechaIngreso:    g('a_fechaingreso').value,
        ContactoPersonal: g('a_email').value,
        Profesion: g('a_profesion').value,
        EstudiosComplementarios: g('a_estudioscomplementarios').value
      };

      if (modoCrear) {
        const res = await callFlow('NewEmployee', datos);
        showAlert('alertColaborador', 'success', '✓ Colaborador creado correctamente.');
        itemIdActual = res?.id || res?.ID || null;
        cedulaActual = cedulaForm;
        modoCrear = false;
        g('btnEliminarColaborador').style.display = '';
        g('formColaboradorTitle').textContent = 'Editar Colaborador';
      } else {
        datos.itemID = itemIdActual;
        await callFlow('UpdateEmployee', datos);
        showAlert('alertColaborador', 'success', '✓ Datos actualizados correctamente.');
      }
      await cargarListaColaboradores();
    } catch (e) {
      showAlert('alertColaborador', 'error', 'Error: ' + e.message);
    } finally {
      btn.disabled = false; btn.textContent = modoCrear ? 'Crear Colaborador' : 'Guardar Cambios';
    }
  }

  // ── Eliminar ──────────────────────────────────────────────────

  function confirmarEliminarColaborador() {
    if (!itemIdActual) return;
    g('modalEliminarColaborador').classList.add('show');
  }

  function cerrarModalEliminarColaborador() {
    g('modalEliminarColaborador').classList.remove('show');
  }

  async function eliminarColaboradorAdmin() {
    cerrarModalEliminarColaborador();
    if (!itemIdActual || !cedulaActual) return;

    const btn = g('btnEliminarColaborador');
    const textoOriginal = btn.textContent;
    btn.disabled = true; btn.textContent = 'Eliminando...';

    try {
      await callFlow('DeleteEmployee', { CedulaID: cedulaActual, itemID: itemIdActual });
      cerrarFormColaborador();
      await cargarListaColaboradores();
    } catch (e) {
      showAlert('alertColaborador', 'error', 'Error al eliminar: ' + e.message);
    } finally {
      btn.disabled = false; btn.textContent = textoOriginal;
    }
  }

  // ── Exponer funciones para onclick del HTML ───────────────────
  window.mostrarFormNuevoColaborador     = mostrarFormNuevoColaborador;
  window.cerrarFormColaborador           = cerrarFormColaborador;
  window.guardarColaboradorAdmin         = guardarColaboradorAdmin;
  window.confirmarEliminarColaborador    = confirmarEliminarColaborador;
  window.cerrarModalEliminarColaborador  = cerrarModalEliminarColaborador;
  window.eliminarColaboradorAdmin        = eliminarColaboradorAdmin;

  // ── Inicio ──────────────────────────────────────────────────────
  initProvincias('a');
  cargarListaColaboradores();

})();