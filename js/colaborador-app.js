/**
 * colaborador-app.js
 * Carga y edita los datos del titular.
 * Depende de js/shared.js (getUser, callFlow, g, setLoading, showAlert,
 * hideAlert) y js/geo-data.js (PROVINCIAS/CANTONES/DISTRITOS,
 * initProvincias, cargarCantones, cargarDistritos, setGeo) — ambos
 * cargados una sola vez desde main.html, antes de router.js.
 * Se ejecuta como IIFE — se reinicia limpio en cada navegación del router.
 */
(function () {

const user = getUser();
let titularItemId = null;

function habilitarCampos() {
  ['t_apellido1','t_apellido2','t_nombre1','t_nombre2','t_contacto','t_tel1','t_tel2',
   't_direccion','t_genero','t_estadocivil','t_provincia','t_canton','t_distrito',
   't_fechanacimiento','t_paisnacimiento','t_departamento','t_fechaingreso','t_email',
   't_profesion','t_estudioscomplementarios'].forEach(id => {
    const el = g(id); if (el) el.disabled = false;
  });
}

function llenarTitular(f) {
  g('t_cedula').value    = f['Cedulaa']             || '';
  g('t_apellido1').value = f['Apellido1']            || '';
  g('t_apellido2').value = f['Apellido2']            || '';
  g('t_nombre1').value   = f['Title']                || '';
  g('t_nombre2').value   = f['Nombre2']              || '';
  g('t_contacto').value  = f['Email']                || '';
  g('t_tel1').value      = f['Telefonoprimario']     || '';
  g('t_tel2').value      = f['Telefonosecundario']   || '';
  g('t_fechanacimiento').value = (f['Fechadenacimiento'] || '').slice(0, 10);
  g('t_genero').value    = f['Genero']?.Value        || '';
  g('t_paisnacimiento').value = f['PaisNacimiento']  || '';
  g('t_departamento').value   = f['Departamento']?.Value || '';
  g('t_puesto').value    = f['Puesto']               || '';
  g('t_fechaingreso').value   = (f['FechadeIngreso'] || '').slice(0, 10);
  g('t_email').value     = f['ContactpPersonal']     || '';
  g('t_profesion').value = f['Profesion']            || '';
  g('t_estudioscomplementarios').value = f['EstudiosComplementarios'] || '';
  const ecMap = { 'Union Libre':'Unión Libre' };
  const ecRaw = f['EstadoCivil']?.Value || '';
  g('t_estadocivil').value = ecMap[ecRaw] || ecRaw;
  g('t_direccion').value = f['Direccion'] || '';
  setGeo('t', f['Provincia'] || '', f['Cant_x00f3_n'] || '', f['Distrito'] || '');
}

async function CargaColaborador() {
  if (!user['Cedulaa']) { showAlert('alertGlobal', 'error', 'No se encontró la cédula del usuario.'); return; }
  setLoading(true); hideAlert('alertGlobal');
  const section = g('sectionTitular');
  if (section) section.classList.add('hidden');
  try {
    titularItemId = user['ID'];
    llenarTitular(user);
    if (section) section.classList.remove('hidden');
    habilitarCampos();
  } catch (e) {
    showAlert('alertGlobal', 'error', 'Error: ' + e.message);
  } finally {
    setLoading(false);
  }
}

async function guardarTitular() {
  const btn = g('btnGuardarTitular');
  btn.disabled = true; btn.textContent = 'Guardando...'; hideAlert('alertTitular');
  try {
    const pe = g('t_provincia');
    const ce = g('t_canton');
    const ecMap = { 'Unión Libre': 'Union Libre' };
    const ecVal = ecMap[g('t_estadocivil').value] || g('t_estadocivil').value;

    await callFlow('UpdateEmployee', {
      itemID: titularItemId,
      CedulaID: user['Cedulaa'],
      Apellido1: g('t_apellido1').value,
      Apellido2: g('t_apellido2').value,
      Nombre1:   g('t_nombre1').value,
      Nombre2:   g('t_nombre2').value,
      Contacto:  g('t_contacto').value,
      Genero:    g('t_genero').value,
      Tel1:      g('t_tel1').value,
      Tel2:      g('t_tel2').value,
      EstadoCivil: ecVal,
      Provincia: pe.options[pe.selectedIndex]?.text || '',
      Canton:    ce.options[ce.selectedIndex]?.text || '',
      Distrito:  g('t_distrito').value,
      Direccion: g('t_direccion').value,
      FechaNacimiento: g('t_fechanacimiento').value,
      PaisNacimiento:  g('t_paisnacimiento').value,
      Departamento:    g('t_departamento').value,
      FechaIngreso:    g('t_fechaingreso').value,
      ContactoPersonal: g('t_email').value,
      Profesion: g('t_profesion').value,
      EstudiosC: g('t_estudioscomplementarios').value
    });
    showAlert('alertTitular', 'success', '✓ Datos actualizados correctamente.');
    BuscarDataColaborador(user['Cedulaa']);  // Re-guardar el usuario en localStorage para mantenerlo actualizado
    CargaColaborador();  // Recargar los datos en pantalla para reflejar cambios
  } catch (e) {
    showAlert('alertTitular', 'error', 'Error: ' + e.message);
  } finally {
    btn.disabled = false; btn.textContent = 'Guardar Cambios';
  }
}

// ── Exponer funciones para onclick del HTML ───────────────────
// (cargarCantones/cargarDistritos ya son globales vía geo-data.js,
// no hace falta re-exponerlas)
window.guardarTitular = guardarTitular;

// ── Inicio ────────────────────────────────────────────────────
initProvincias('t');  // Re-guardar el usuario en localStorage para mantenerlo actualizado
CargaColaborador();
})();
