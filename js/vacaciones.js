/**
 * vacaciones-app.js
 * Módulo de solicitud y consulta de vacaciones.
 * IIFE — se reinicia limpio en cada navegación del router.
 */

(function () {

const FLOW_URL = 'https://default1cf912e46be04485ada7ae59cd0c96.ee.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/09237870375841bf8de7e7fc257227aa/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=RjzdNhH6QV9epKmaWGCK-JfHxkief3lP_6bYuKbDHpg';

const user = JSON.parse(localStorage.getItem('user') || '{}');

let solicitudACancelarId = null;

// ── Feriados de Costa Rica (se actualiza anualmente) ──────────
// Feriados de ley y trasladables más comunes
function getFeriados(anio) {
  return [
    `${anio}-01-01`, // Año Nuevo
    `${anio}-04-11`, // Batalla de Rivas
    `${anio}-05-01`, // Día del Trabajo
    `${anio}-07-25`, // Anexión de Guanacaste
    `${anio}-08-02`, // Virgen de los Ángeles
    `${anio}-08-15`, // Madre
    `${anio}-09-15`, // Independencia
    `${anio}-12-25`, // Navidad
    // Semana Santa (variables — actualizar cada año)
    `${anio}-04-02`, // Jueves Santo 2026
    `${anio}-04-03`, // Viernes Santo 2026
  ];
}

// ── Helper base ───────────────────────────────────────────────

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

// ── Cálculo de días hábiles ───────────────────────────────────

function calcularDias(inicioStr, finStr, esMedioDia) {
  if (!inicioStr || !finStr) return 0;

  const inicio = new Date(inicioStr + 'T12:00:00');
  const fin    = new Date(finStr    + 'T12:00:00');
  if (fin < inicio) return 0;

  // Obtener feriados de todos los años en el rango
  const anios = new Set();
  for (let y = inicio.getFullYear(); y <= fin.getFullYear(); y++) anios.add(y);
  const feriados = new Set([...anios].flatMap(a => getFeriados(a)));

  let dias = 0;
  const d = new Date(inicio);
  while (d <= fin) {
    const dow  = d.getDay();                             // 0=dom, 6=sab
    const iso  = d.toISOString().split('T')[0];
    const habil = dow !== 0 && dow !== 6 && !feriados.has(iso);
    if (habil) dias += esMedioDia ? 0.5 : 1;
    d.setDate(d.getDate() + 1);
  }
  return dias;
}

function esTipoMedioDia(tipo) {
  return tipo.toLowerCase().startsWith('medio día');
}

// ── Utilidades de fecha ───────────────────────────────────────

function formatFecha(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr + 'T12:00:00');
  return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Cargar resumen de días ────────────────────────────────────

async function cargarResumen() {
  try {
    g('diasLey').textContent       = user['D_x00ed_asdeLey']        ?? '--';
    g('diasAntiguedad').textContent = user['Antig_x00fc_edad'] ?? '--';
    g('diasCumple').textContent    = user['Cumplea_x00f1_os']  ?? '--';
  } catch(e) {
    ['diasLey','diasAntiguedad','diasCumple'].forEach(id => g(id).textContent = '--');
  }
}

// ── Cargar historial ──────────────────────────────────────────

async function cargarHistorial() {
  try {
    const data      = await callFlow('GetVacations', {});
    const container = g('vacHistorial');
    const empty     = g('vacHistorialEmpty');

    if (!data.items || data.items.length === 0) {
      empty.style.display = 'block';
      container.innerHTML = '';
      return;
    }

    empty.style.display = 'none';
    container.innerHTML = data.items.map(s => {
      const estadoRaw  = s['Estado0']?.Value || s['Estado0'] || 'Pendiente';
      const estadoCls  = estadoRaw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      const esPendiente = estadoCls === 'pendiente';
      const dias       = s['Cantidad'] ?? '';

      return `
        <div class="vac-item" id="sol-${s['ID']}">
          <div class="vac-item-info">
            <strong>${formatFecha(s['FechaSolicitud'])} → ${formatFecha(s['Fin'])}</strong>
            <span>${s['Comentarios'] || ''}</span>
          </div>
          <div class="vac-item-tipo">${s['Tipodepermiso']?.Value || s['Tipodepermiso'] || ''}</div>
          <div class="vac-item-dias">${dias}<small>días</small></div>
          <span class="vac-badge ${estadoCls}">${estadoRaw}</span>
          ${esPendiente
            ? `<button class="vac-item-cancel" onclick="vacPedirCancelar(${s['ID']})">Cancelar</button>`
            : '<div style="width:60px"></div>'}
        </div>`;
    }).join('');
  } catch(e) {
    showAlert('alertGlobal', 'error', 'Error al cargar historial: ' + e.message);
  }
}

// ── Recalcular días al cambiar fechas o tipo ──────────────────

function actualizarCalculo() {
  const inicio = g('vac_inicio').value;
  const fin    = g('vac_fin').value;
  const tipo   = g('vac_tipo').value;
  const calc   = g('vacDiasCalc');

  if (!inicio || !fin || !tipo) { calc.style.display = 'none'; return; }
  if (fin < inicio)             { calc.style.display = 'none'; return; }

  const medioDia = esTipoMedioDia(tipo);
  const dias     = calcularDias(inicio, fin, medioDia);

  g('vacDiasNum').textContent = dias;
  g('vacDiasDetalle').textContent = medioDia
    ? '(medio día por cada día hábil)'
    : '(excluye sábados, domingos y feriados)';
  calc.style.display = 'flex';
}

// ── Enviar solicitud ──────────────────────────────────────────

async function vacEnviarSolicitud() {
  const tipo       = g('vac_tipo').value;
  const inicio     = g('vac_inicio').value;
  const fin        = g('vac_fin').value;
  const comentario = g('vac_comentario').value.trim();

  if (!tipo)        { showAlert('alertSolicitud','error','Seleccioná el tipo de permiso.');       return; }
  if (!inicio||!fin){ showAlert('alertSolicitud','error','Seleccioná las fechas de inicio y fin.'); return; }
  if (fin < inicio) { showAlert('alertSolicitud','error','La fecha de fin no puede ser anterior al inicio.'); return; }

  const medioDia = esTipoMedioDia(tipo);
  const dias     = calcularDias(inicio, fin, medioDia);

  if (dias === 0) {
    showAlert('alertSolicitud','error','El rango seleccionado no contiene días hábiles.');
    return;
  }

  const btn = g('btnEnviarSolicitud');
  btn.disabled = true; btn.textContent = 'Enviando...';

  try {
    await callFlow('NewRegistro', {
      cedula:     user['Cedulaa'],
      Nombre:     user['Apellido1'] + ' ' + user['Apellido2']+ ' ' + user['Title']+ ' ' + user['Nombre2'],
      TipoPermiso:  tipo,
      Inicio:  inicio,
      Fin:     fin,
      Dias:         dias,
      Comentarios:  comentario,
      TipoUsuario: 1
    });

    // Limpiar formulario
    g('vac_tipo').value        = '';
    g('vac_inicio').value      = '';
    g('vac_fin').value         = '';
    g('vac_comentario').value  = '';
    g('vacDiasCalc').style.display = 'none';

    showAlert('alertSolicitud','success','✓ Solicitud enviada. Quedará pendiente de aprobación.');
    await Promise.all([cargarResumen(), cargarHistorial()]);

  } catch(e) {
    showAlert('alertSolicitud','error','Error al enviar la solicitud: ' + e.message);
  } finally {
    btn.disabled = false; btn.textContent = 'Enviar Solicitud';
  }
}

// ── Cancelar solicitud ────────────────────────────────────────

function vacPedirCancelar(id) {
  solicitudACancelarId = id;
  g('modalCancelar').classList.add('show');
}

function vacCerrarModal() {
  solicitudACancelarId = null;
  g('modalCancelar').classList.remove('show');
}

async function vacConfirmarCancelar() {
  vacCerrarModal();
  try {
    await callFlow(4, { itemId: solicitudACancelarId });
    showAlert('alertGlobal','success','✓ Solicitud cancelada.');
    await Promise.all([cargarResumen(), cargarHistorial()]);
  } catch(e) {
    showAlert('alertGlobal','error','Error al cancelar: ' + e.message);
  }
}

// ── Exponer para onclick ──────────────────────────────────────
window.vacEnviarSolicitud   = vacEnviarSolicitud;
window.vacPedirCancelar     = vacPedirCancelar;
window.vacCerrarModal       = vacCerrarModal;
window.vacConfirmarCancelar = vacConfirmarCancelar;

// ── Listeners ─────────────────────────────────────────────────
setTimeout(() => {
  const hoy = new Date().toISOString().split('T')[0];
  ['vac_inicio','vac_fin'].forEach(id => {
    const el = g(id);
    if (el) { el.min = hoy; el.addEventListener('change', actualizarCalculo); }
  });
  const tipo = g('vac_tipo');
  if (tipo) tipo.addEventListener('change', actualizarCalculo);
}, 0);

// ── Inicio ────────────────────────────────────────────────────
(async function init() {
  if (!user['Cedulaa']) { showAlert('alertGlobal','error','No se encontró la cédula del usuario.'); return; }
  setLoading(true);
  try {
    await Promise.all([cargarResumen(), cargarHistorial()]);
  } finally {
    setLoading(false);
  }
})();

})();