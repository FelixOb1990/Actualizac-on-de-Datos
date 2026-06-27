/* flujo para obtener el usuario */
const FLOWS = {
    GetUser: 'https://default1cf912e46be04485ada7ae59cd0c96.ee.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/6136466c51e4460f9fd72bfc50ba9a1e/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=fdA52CudlD1p6m5aexjW9C81yv1pfnuoRv_swIm2kO4'
}

/* llamada al flujo */
async function callFlow(url,body){
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!res.ok) throw new Error('Error '+res.status+': '+res.statusText);
  const text=await res.text();
  return text?JSON.parse(text):{};
}

async function buscarColaborador(){
  const ced=document.getElementById('username').value.trim();
  if(!ced){showAlert('alertGlobal','error','Ingrese un n&uacute;mero de c&eacute;dula.');return;}
  setLoading(true);hideAlert('alertGlobal');
  try{
    const data=await callFlow(FLOWS.GetUser,{cedula:ced});
    if(!data.items||data.items.length===0){
        showAlert('alertGlobal','error','No se encontró ningún colaborador con esa cédula.');
        return;
    } else if(data.items[0]['contrasena'] != document.getElementById('password').value.trim()){
        showAlert('alertGlobal','error','Contraseña incorrecta. Por favor, inténtelo de nuevo.');
        return;
    } else {
        const user = data.items[0];
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = './pages/main.html';
    }
    
  }catch(e){showAlert('alertGlobal','error','Error: '+e.message);}
  finally{setLoading(false);}
}

function setLoading(show){
  document.getElementById('loadingState').style.display=show?'block':'none';
}
function showAlert(id,type,msg){
  const el=document.getElementById(id);
  el.className='alert '+type+' show';el.textContent=msg;
  setTimeout(()=>el.classList.remove('show'),6000);
}
function hideAlert(id){
    document.getElementById(id).classList.remove('show');
}