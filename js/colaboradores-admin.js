/**
 * colaboradores-admin.js
 * Búsqueda y edición de cualquier colaborador por cédula.
 * Ruta protegida: solo accesible para el departamento "Gerencia" (ver router.js).
 * Depende de js/geo-data.js (cargado antes por router.js) para
 * PROVINCIAS/CANTONES/DISTRITOS y las funciones cargarCantones/cargarDistritos/setGeo.
 * Se ejecuta como IIFE — se reinicia limpio en cada navegación del router.
 */
(function () {

  // Mismo flow que colaborador-app.js. Confirmar que el nombre de la
  // operación de búsqueda ('BuscarColaborador' abajo) coincide con la
  // que ya usa el login — ajustar si el nombre real es distinto.
  const FLOW_URL = 'https://default1cf912e46be04485ada7ae59cd0c96.ee.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/09237870375841bf8de7e7fc257227aa/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=RjzdNhH6QV9epKmaWGCK-JfHxkief3lP_6bYuKbDHpg';

  let itemIdActual = null;
  let cedulaActual = null;

  function g(id) { return document.getElementById(id); }

  // A diferencia de colaborador-app.js (que siempre opera sobre la cédula
  // del usuario logueado), acá la cédula es la que se busca cada vez —
  // por eso se pasa explícitamente en cada llamada.
  async function callFlow(cedula, operacion, datos) {
    const res = await fetch(FLOW_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cedula, operacion, datos })
    });
    if (!res.ok) throw new Error('Error ' + res.status + ': ' + res.statusText);
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  }

  function setLoading(show) {
    const el = g('loadingState');
    if (el) el.style.display = show ? 'block' : 'none';
  }

  function showAlert(id, type, msg) {
    const el = g(id);
    if (!el) return;
    el.className = 'alert ' + type + ' show';
    el.textContent = msg;
    setTimeout(() => el.classList.remove('show'), 6000);
  }

  function hideAlert(id) {
    const el = g(id);
    if (el) el.classList.remove('show');
  }

  // ── Búsqueda ──────────────────────────────────────────────────

  async function buscarColaboradorAdmin() {
    const cedula = g('buscar_cedula').value.trim();
    hideAlert('alertBusqueda');
    g('sectionColaborador').classList.add('hidden');

    if (!cedula) {
      showAlert('alertBusqueda', 'error', 'Ingresá una cédula para buscar.');
      return;
    }

    setLoading(true);
    try {
      // TODO: confirmar el nombre real de esta operación (la que usa el login)
      const res = await callFlow(cedula, 'GetEmployee', {});
      const f = Array.isArray(res) ? res : (res.items ? res.items[0] : res);

      if (!f || !f['ID']) {
        throw new Error('No se encontró ningún colaborador con esa cédula.');
      }

      itemIdActual = f['ID'];
      cedulaActual = cedula;
      llenarColaborador(f);
      g('sectionColaborador').classList.remove('hidden');
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
    g('a_email').value           = f['ContactpPersonal'] || '';
    g('a_diasley').value         = f['D_x00ed_asdeLey']          || 0;
    g('a_diasantiguedad').value  = f['Antig_x00fc_edad']   || 0;
    g('a_diascumpleanos').value  = f['Cumplea_x00f1_os']   || 0;
    g('a_profesion').value       = f['Profesion']        || '';
    g('a_estudioscomplementarios').value = f['EstudiosComplementarios'] || '';

    const ecMap = { 'Union Libre': 'Unión Libre' };
    const ecRaw = f['EstadoCivil']?.Value || '';
    g('a_estadocivil').value = ecMap[ecRaw] || ecRaw;

    g('a_direccion').value = f['Direccion'] || '';
    setGeo('a', f['Provincia'] || '', f['Cant_x00f3_n'] || '', f['Distrito'] || '');
  }

  function nuevaBusqueda() {
    itemIdActual = null;
    cedulaActual = null;
    g('sectionColaborador').classList.add('hidden');
    g('buscar_cedula').value = '';
    hideAlert('alertBusqueda');
    g('buscar_cedula').focus();
  }

  // ── Guardado ──────────────────────────────────────────────────

  async function guardarColaboradorAdmin() {
    if (!itemIdActual || !cedulaActual) return;

    const btn = g('btnGuardarColaborador');
    const textoOriginal = btn.textContent;
    btn.disabled = true; btn.textContent = 'Guardando...'; hideAlert('alertColaborador');

    try {
      const pe = g('a_provincia');
      const ce = g('a_canton');
      const ecMap = { 'Unión Libre': 'Union Libre' };
      const ecVal = ecMap[g('a_estadocivil').value] || g('a_estadocivil').value;

      await callFlow(cedulaActual, 'UpdateEmployee', {
        itemID: itemIdActual,
        Cedulaa:     g('a_cedula').value,
        Apellido1:   g('a_apellido1').value,
        Apellido2:   g('a_apellido2').value,
        Nombre1:     g('a_nombre1').value,
        Nombre2:     g('a_nombre2').value,
        Contacto:    g('a_contacto').value,
        Genero:      g('a_genero').value,
        Tel1:        g('a_tel1').value,
        Tel2:        g('a_tel2').value,
        EstadoCivil: ecVal,
        Provincia:   pe.options[pe.selectedIndex]?.text || '',
        Canton:      ce.options[ce.selectedIndex]?.text || '',
        Distrito:    g('a_distrito').value,
        Direccion:   g('a_direccion').value,
        FechaNacimiento: g('a_fechanacimiento').value,
        PaisNacimiento:  g('a_paisnacimiento').value,
        Departamento:    g('a_departamento').value,
        Puesto:          g('a_puesto').value,
        FechaIngreso:    g('a_fechaingreso').value,
        ContactoPersonal: g('a_email').value,
        Profesion:               g('a_profesion').value,
        EstudiosComplementarios: g('a_estudioscomplementarios').value
      });
      showAlert('alertColaborador', 'success', '✓ Datos actualizados correctamente.');
    } catch (e) {
      showAlert('alertColaborador', 'error', 'Error: ' + e.message);
    } finally {
      btn.disabled = false; btn.textContent = textoOriginal;
    }
  }

  // ── Exponer funciones para onclick del HTML ───────────────────
  window.buscarColaboradorAdmin = buscarColaboradorAdmin;
  window.guardarColaboradorAdmin = guardarColaboradorAdmin;
  window.nuevaBusqueda = nuevaBusqueda;

  // ── Inicio ──────────────────────────────────────────────────────
  initProvincias('a');

})();
