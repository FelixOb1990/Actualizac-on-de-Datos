/* login-app.js */

// Si ya hay sesión activa, ir directo al portal
(function () {
  if (localStorage.getItem('user')) {
    window.location.replace('./pages/main.html');
  }
})();

const FLOWS = {
  buscarColaborador:    'https://default1cf912e46be04485ada7ae59cd0c96.ee.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/09237870375841bf8de7e7fc257227aa/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=RjzdNhH6QV9epKmaWGCK-JfHxkief3lP_6bYuKbDHpg',
  };

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

async function BuscarData(CedulaID, Operacion) {
  try {
    const data = await callFlow( Operacion,{CedulaID: CedulaID} );
    if (data && data.items && data.items.length > 0) {
            return data;
    }
        return data;
  } catch(e) {
    showAlert('alertGlobal', 'error', 'Error: ' + e.message);
  } finally {
    setLoading(false);
  }
}

/*async function CargarDataUsuario(CedulaID, Operacion) {
    try {
    
        const userData = await callFlow({ operacion: Operacion, datos: {CedulaID: CedulaID} });
        localStorage.setItem('user', JSON.stringify(userData.items[0]));
        window.location.replace('./pages/main.html');
  } catch(e) {
        showAlert('alertGlobal', 'error', 'Error: ' + e.message);
  } finally {
        setLoading(false);
  }
}
function setLoading(show) {
  document.getElementById('loadingState').style.display = show ? 'block' : 'none';
}
function showAlert(id, type, msg) {
  const el = document.getElementById(id);
  el.className = 'alert ' + type + ' show';
  el.textContent = msg;
  setTimeout(() => el.classList.remove('show'), 6000);
}
function hideAlert(id) {
  document.getElementById(id).classList.remove('show');
}
document.getElementById('password').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    buscarColaborador();
  }
});/*/