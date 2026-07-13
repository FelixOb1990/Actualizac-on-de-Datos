/**
 * medismart-app.js
 * Gestiona el beneficiario del plan médico Medismart.
 * Depende de js/shared.js (getUser, callFlow, g, setLoading, showAlert)
 * y js/geo-data.js (PROVINCIAS/CANTONES/DISTRITOS, initProvincias,
 * cargarCantones, cargarDistritos, setGeo) — ver router.js.
 *
 * NOTA DE UNIFICACIÓN: este archivo tenía su propia copia de
 * PROVINCIAS/CANTONES/DISTRITOS y sus propias funciones
 * msCargarCantones/msCargarDistritos/setGeo (con el prefijo 'b' fijo),
 * duplicando +200 líneas que ya existían en geo-data.js. Ahora usa
 * directamente cargarCantones('b')/cargarDistritos('b')/setGeo('b', ...)
 * de geo-data.js, igual que perfil.html y colaboradores-admin.html.
 * Por eso los onchange de medismart.html cambiaron de
 * msCargarCantones()/msCargarDistritos() a cargarCantones('b')/cargarDistritos('b').
 *
 * Operaciones del flow para beneficiarios: GetBeneficiario,
 * NewBeneficiario, UpdateBeneficiario, DeleteBeneficiario.
 *
 * Se ejecuta como IIFE — se reinicia limpio en cada navegación del router.
 */
(function () {

const user = getUser();
let benefItemId = null;
let tieneBenef  = false;

// ── Cargar beneficiario ───────────────────────────────────────

function llenarForm(f) {
  g('b_tipocedula').value = f['TipoCedula']?.Value || '';
  g('b_cedula').value     = f['Cedula']             || '';
  g('b_nombre').value     = f['Nombre']             || '';
  const fn = f['Fechadenacimiento'] || '';
  g('b_fechanac').value   = fn ? fn.split('T')[0] : '';
  g('b_genero').value     = f['Genero']?.Value      || '';
  const ecMap = { 'Union Libre': 'Unión Libre' };
  const ecRaw = f['Estadocivil']?.Value || '';
  g('b_estadocivil').value = ecMap[ecRaw] || ecRaw;
  g('b_parentesco').value = f['Parentesco']?.Value  || '';
  g('b_correo').value     = f['Correoelectronico']  || '';
  setGeo('b', f['Provincia'] || '', f['Cant_x00f3_n'] || '', f['Distrito'] || '');
}

async function cargarBeneficiario() {
  if (!user['Cedulaa']) { showAlert('alertGlobal', 'error', 'No se encontró la cédula del usuario.'); return; }
  setLoading(true);
  try {
    const data = await callFlow('GetBeneficiario', { CedulaID: user['Cedulaa'] });
    if (data.items && data.items.length > 0) {
      benefItemId = data.items[0].ID;
      tieneBenef  = true;
      llenarForm(data.items[0]);
      g('benefEmpty').classList.add('hidden');
      g('benefForm').classList.remove('hidden');
      g('benefActions').style.display = 'flex';
      g('btnEliminarBenef').style.display = 'inline-block';
    } else {
      tieneBenef = false; benefItemId = null;
      g('benefEmpty').classList.remove('hidden');
      g('benefForm').classList.add('hidden');
      g('benefActions').style.display = 'none';
    }
  } catch (e) {
    showAlert('alertGlobal', 'error', 'Error al cargar beneficiario: ' + e.message);
  } finally {
    setLoading(false);
  }
}

// ── Acciones del formulario ───────────────────────────────────

function mostrarFormBenef() {
  g('benefEmpty').classList.add('hidden');
  g('benefForm').classList.remove('hidden');
  g('benefActions').style.display = 'flex';
  g('btnEliminarBenef').style.display = 'none';
}

function msCancelar() {
  if (!tieneBenef) {
    g('benefEmpty').classList.remove('hidden');
    g('benefForm').classList.add('hidden');
    g('benefActions').style.display = 'none';
  }
}

async function msGuardarBenef() {
  const btn = g('btnGuardarBenef');
  btn.disabled = true; btn.textContent = 'Guardando...';

  const ced = user['Cedulaa'] || '';
  const pe = g('b_provincia');
  const ce = g('b_canton');
  const ecValMap = { 'Unión Libre': 'Union Libre' };
  const ecVal = ecValMap[g('b_estadocivil').value] || g('b_estadocivil').value;

  try {
    const operacion = tieneBenef ? 'UpdateBeneficiario' : 'NewBeneficiario';
    const res = await callFlow(operacion, {
      CedulaID:    ced,
      titular:     ced,
      itemId:      benefItemId || 0,
      TipoCedula:  g('b_tipocedula').value,
      Cedula:      g('b_cedula').value,
      Nombre:      g('b_nombre').value,
      FechaNac:    g('b_fechanac').value,
      Genero:      g('b_genero').value,
      EstadoCivil: ecVal,
      Parentesco:  g('b_parentesco').value,
      Correo:      g('b_correo').value,
      Provincia:   pe.options[pe.selectedIndex]?.text || '',
      Canton:      ce.options[ce.selectedIndex]?.text || '',
      Distrito:    g('b_distrito').value
    });
    if (!tieneBenef && res?.id) { benefItemId = res.id; tieneBenef = true; }
    g('btnEliminarBenef').style.display = 'inline-block';
    showAlert('alertBenef', 'success', '✓ Beneficiario guardado correctamente.');
  } catch (e) {
    showAlert('alertBenef', 'error', 'Error: ' + e.message);
  } finally {
    btn.disabled = false; btn.textContent = 'Guardar Beneficiario';
  }
}

function msConfirmarEliminar() { g('modalEliminar').classList.add('show'); }
function msCerrarModal()       { g('modalEliminar').classList.remove('show'); }

async function msEliminarBenef() {
  msCerrarModal();
  try {
    await callFlow('DeleteBeneficiario', { CedulaID: user['Cedulaa'], itemId: benefItemId });
    tieneBenef = false; benefItemId = null;
    ['b_tipocedula','b_cedula','b_nombre','b_fechanac','b_genero','b_estadocivil','b_parentesco','b_correo']
      .forEach(id => { const el = g(id); if (el) el.value = ''; });
    g('b_canton').innerHTML   = '<option value="">Seleccione provincia primero</option>';
    g('b_canton').disabled    = true;
    g('b_distrito').innerHTML = '<option value="">Seleccione cantón primero</option>';
    g('b_distrito').disabled  = true;
    g('b_provincia').value    = '';
    g('benefEmpty').classList.remove('hidden');
    g('benefForm').classList.add('hidden');
    g('benefActions').style.display = 'none';
    showAlert('alertGlobal', 'success', '✓ Beneficiario eliminado correctamente.');
  } catch (e) {
    showAlert('alertBenef', 'error', 'Error: ' + e.message);
  }
}

// ── Exponer funciones para onclick del HTML ───────────────────
window.mostrarFormBenef    = mostrarFormBenef;
window.msCancelar          = msCancelar;
window.msGuardarBenef      = msGuardarBenef;
window.msConfirmarEliminar = msConfirmarEliminar;
window.msCerrarModal       = msCerrarModal;
window.msEliminarBenef     = msEliminarBenef;

// ── Inicio ────────────────────────────────────────────────────
initProvincias('b');
cargarBeneficiario();

})();
