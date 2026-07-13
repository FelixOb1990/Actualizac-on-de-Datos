/**
 * colaboradores-admin.js
 * Búsqueda y edición de cualquier colaborador por cédula.
 * Ruta protegida: solo accesible para el departamento "Gerencia" (ver router.js).
 * Depende de js/shared.js (callFlow, g, setLoading, showAlert, hideAlert)
 * y js/geo-data.js (PROVINCIAS/CANTONES/DISTRITOS, initProvincias,
 * cargarCantones, cargarDistritos, setGeo) — ambos cargados una sola vez
 * desde main.html, antes de router.js.
 * Se ejecuta como IIFE — se reinicia limpio en cada navegación del router.
 */
(function () {

  let itemIdActual = null;
  let cedulaActual = null;

  // A diferencia de colaborador-app.js (que siempre opera sobre la cédula
  // del usuario logueado), acá la cédula es la que se busca cada vez —
  // por eso se incluye explícitamente como 'CedulaID' dentro de `datos`
  // en cada llamada a callFlow(), en vez de depender del usuario en sesión.

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
      const res = await callFlow('GetEmployee', { CedulaID: cedula });
      const f = res.items && res.items[0];

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
    g('a_email').value           = f['ContactoPersonal'] || '';
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

      await callFlow('UpdateEmployee', {
        itemID: itemIdActual,
        CedulaID:  cedulaActual,
        Cedulaa:   g('a_cedula').value,
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
