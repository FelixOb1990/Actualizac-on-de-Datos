/**
 * colaborador-app.js
 * Carga y edita los datos del titular.
 * Se ejecuta como IIFE — se reinicia limpio en cada navegación del router.
 */

(function () {

const FLOW_URL = 'https://default1cf912e46be04485ada7ae59cd0c96.ee.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/09237870375841bf8de7e7fc257227aa/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=RjzdNhH6QV9epKmaWGCK-JfHxkief3lP_6bYuKbDHpg';

const user = JSON.parse(localStorage.getItem('user') || '{}');

let titularItemId = null;

// PROVINCIAS, CANTONES y DISTRITOS ahora viven en js/geo-data.js
// (compartido con colaboradores-admin.js). Ver router.js: la ruta
// 'perfil' carga geo-data.js antes que este archivo.
// ── Helpers ───────────────────────────────────────────────────

async function callFlow(operacion, datos) {
  const res = await fetch(FLOW_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cedula: user['Cedulaa'], operacion, datos })
  });
  if (!res.ok) throw new Error('Error ' + res.status + ': ' + res.statusText);
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

function g(id) { return document.getElementById(id); }

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

// ── Geografía ─────────────────────────────────────────────────

function initProvincias() {
  const el = g('t_provincia');
  if (!el) return;
  PROVINCIAS.forEach(p => {
    const o = document.createElement('option');
    o.value = p.c; o.textContent = p.n;
    el.appendChild(o);
  });
}

function cargarCantones(px) {
  const pv = parseInt(g(px+'_provincia').value);
  const cs = g(px+'_canton');
  const ds = g(px+'_distrito');
  cs.innerHTML = '<option value="">Seleccione cantón...</option>';
  ds.innerHTML = '<option value="">Seleccione distrito...</option>';
  cs.disabled = true; ds.disabled = true;
  if (!pv) return;
  CANTONES.filter(c => c.p === pv).forEach(c => {
    const o = document.createElement('option');
    o.value = c.c; o.textContent = c.n;
    cs.appendChild(o);
  });
  cs.disabled = false;
}

function cargarDistritos(px) {
  const cv = parseInt(g(px+'_canton').value);
  const ds = g(px+'_distrito');
  ds.innerHTML = '<option value="">Seleccione distrito...</option>';
  ds.disabled = true;
  if (!cv) return;
  DISTRITOS.filter(d => d.c === cv).forEach(d => {
    const o = document.createElement('option');
    o.value = d.n; o.textContent = d.n;
    ds.appendChild(o);
  });
  ds.disabled = false;
}

function setGeo(px, prov, cant, dist) {
  const p = PROVINCIAS.find(x => x.n === prov); if (!p) return;
  g(px+'_provincia').value = p.c; cargarCantones(px);
  const c = CANTONES.find(x => x.p === p.c && x.n === cant); if (!c) return;
  g(px+'_canton').value = c.c; cargarDistritos(px);
  if (dist) g(px+'_distrito').value = dist;
}

// ── Titular ───────────────────────────────────────────────────

function habilitarCampos() {
  ['t_apellido1','t_apellido2','t_nombre1','t_nombre2','t_contacto','t_tel1','t_tel2',
   't_direccion','t_genero','t_estadocivil','t_provincia',
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
  g('t_fechanacimiento').value      = (f['Fechadenacimiento'] || '').slice(0, 10);
  g('t_genero').value    = f['Genero']?.Value        || '';
  g('t_paisnacimiento').value      = f['PaisNacimiento']   || '';
  g('t_departamento').value      = f['Departamento']?.Value || '';
  g('t_puesto').value      = f['Puesto'] || '';
  g('t_fechaingreso').value      = (f['FechadeIngreso'] || '').slice(0, 10);
  g('t_email').value      = f['ContactoPersonal']   || '';
  g('t_profesion').value  = f['Profesion']           || '';
  g('t_estudioscomplementarios').value = f['EstudiosComplementarios'] || '';
  const ecMap = { 'Union Libre':'Unión Libre' };
  const ecRaw = f['EstadoCivil']?.Value              || '';
  g('t_estadocivil').value = ecMap[ecRaw] || ecRaw;
  g('t_direccion').value = f['Direccion']            || '';
  setGeo('t', f['Provincia'] || '', f['Cant_x00f3_n'] || '', f['Distrito'] || '');
  // ── Profesión ──────────────────────────────────────────────
  poblarSelectProfesiones();
  const profesionGuardada = f['Profesion'] || '';
  const selProfesion = g('t_profesion');
  if (selProfesion && profesionGuardada) {
    selProfesion.value = profesionGuardada;
    // Si el valor guardado no coincide con ninguna opción de la lista
    // (ej. dato histórico con otra redacción), lo agregamos igual para
    // no "perder" visualmente lo que ya tenía el colaborador guardado.
    if (selProfesion.value !== profesionGuardada) {
      const opt = document.createElement('option');
      opt.value = profesionGuardada;
      opt.textContent = profesionGuardada + ' (valor actual)';
      selProfesion.appendChild(opt);
      selProfesion.value = profesionGuardada;
    }
  }
}

async function buscarColaborador() {
  if (!user['Cedulaa']) { showAlert('alertGlobal', 'error', 'No se encontró la cédula del usuario.'); return; }
  setLoading(true); hideAlert('alertGlobal');
  const section = g('sectionTitular');
  if (section) section.classList.add('hidden');
  try {
    titularItemId = user['ID'];
    llenarTitular(user);
    if (section) section.classList.remove('hidden');
    habilitarCampos();
  } catch(e) {
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
      Apellido1:   g('t_apellido1').value,
      Apellido2:   g('t_apellido2').value,
      Nombre1:     g('t_nombre1').value,
      Nombre2:     g('t_nombre2').value,
      Contacto:    g('t_contacto').value,
      Genero:      g('t_genero').value,
      Tel1:        g('t_tel1').value,
      Tel2:        g('t_tel2').value,
      EstadoCivil: ecVal,
      Provincia:   pe.options[pe.selectedIndex]?.text || '',
      Canton:      ce.options[ce.selectedIndex]?.text || '',
      Distrito:    g('t_distrito').value,
      Direccion:   g('t_direccion').value,
      FechaNacimiento: g('t_fechanacimiento').value,
      PaisNacimiento:  g('t_paisnacimiento').value,
      Departamento:    g('t_departamento').value,
      FechaIngreso:    g('t_fechaingreso').value,
      ContactoPersonal: g('t_email').value,
      Profesion:            g('t_profesion').value,
      EstudiosComplementarios: g('t_estudioscomplementarios').value
    });
    showAlert('alertTitular', 'success', '✓ Datos actualizados correctamente.');
  } catch(e) {
    showAlert('alertTitular', 'error', 'Error: ' + e.message);
  } finally {
    btn.disabled = false; btn.textContent = 'Guardar Cambios';
  }
}

// ── Exponer funciones para onclick del HTML ───────────────────
window.cargarCantones = cargarCantones;
window.cargarDistritos = cargarDistritos;
window.guardarTitular = guardarTitular;

// ── Inicio ────────────────────────────────────────────────────
initProvincias('t');
buscarColaborador();

})();