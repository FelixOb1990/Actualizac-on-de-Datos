/**
 * medismart-app.js
 * Gestiona SOLO el beneficiario del plan médico.
 * Lee la cédula del titular desde localStorage['user'].
 */

(function () {

const FLOW_BENEFICIARIO = 'https://default1cf912e46be04485ada7ae59cd0c96.ee.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/e4ecce12ae4d4d8cac69c0c830d782a2/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=GOgMRphPg3hSnSVpAI4fDIBPjvjXIUAsm-srCsWVKds';

const PROVINCIAS = [
  {c:1,n:'San José'},{c:2,n:'Alajuela'},{c:3,n:'Cartago'},
  {c:4,n:'Heredia'},{c:5,n:'Guanacaste'},{c:6,n:'Puntarenas'},{c:7,n:'Limón'}
];

const CANTONES = [
  {p:1,c:101,n:'San José'},{p:1,c:102,n:'Escazú'},{p:1,c:103,n:'Desamparados'},{p:1,c:104,n:'Puriscal'},{p:1,c:105,n:'Tarrazú'},{p:1,c:106,n:'Aserrí'},{p:1,c:107,n:'Mora'},{p:1,c:108,n:'Goicoechea'},{p:1,c:109,n:'Santa Ana'},{p:1,c:110,n:'Alajuelita'},{p:1,c:111,n:'Vásquez de Coronado'},{p:1,c:112,n:'Acosta'},{p:1,c:113,n:'Tibás'},{p:1,c:114,n:'Moravia'},{p:1,c:115,n:'Montes de Oca'},{p:1,c:116,n:'Turrubares'},{p:1,c:117,n:'Dota'},{p:1,c:118,n:'Curridabat'},{p:1,c:119,n:'Pérez Zeledón'},{p:1,c:120,n:'León Cortés Castro'},
  {p:2,c:201,n:'Alajuela'},{p:2,c:202,n:'San Ramón'},{p:2,c:203,n:'Grecia'},{p:2,c:204,n:'San Mateo'},{p:2,c:205,n:'Atenas'},{p:2,c:206,n:'Naranjo'},{p:2,c:207,n:'Palmares'},{p:2,c:208,n:'Poás'},{p:2,c:209,n:'Orotina'},{p:2,c:210,n:'San Carlos'},{p:2,c:211,n:'Zarcero'},{p:2,c:212,n:'Sarchí'},{p:2,c:213,n:'Upala'},{p:2,c:214,n:'Los Chiles'},{p:2,c:215,n:'Guatuso'},{p:2,c:216,n:'Río Cuarto'},
  {p:3,c:301,n:'Cartago'},{p:3,c:302,n:'Paraíso'},{p:3,c:303,n:'La Unión'},{p:3,c:304,n:'Jiménez'},{p:3,c:305,n:'Turrialba'},{p:3,c:306,n:'Alvarado'},{p:3,c:307,n:'Oreamuno'},{p:3,c:308,n:'El Guarco'},
  {p:4,c:401,n:'Heredia'},{p:4,c:402,n:'Barva'},{p:4,c:403,n:'Santo Domingo'},{p:4,c:404,n:'Santa Bárbara'},{p:4,c:405,n:'San Rafael'},{p:4,c:406,n:'San Isidro'},{p:4,c:407,n:'Belén'},{p:4,c:408,n:'Flores'},{p:4,c:409,n:'San Pablo'},{p:4,c:410,n:'Sarapiquí'},
  {p:5,c:501,n:'Liberia'},{p:5,c:502,n:'Nicoya'},{p:5,c:503,n:'Santa Cruz'},{p:5,c:504,n:'Bagaces'},{p:5,c:505,n:'Carrillo'},{p:5,c:506,n:'Cañas'},{p:5,c:507,n:'Abangares'},{p:5,c:508,n:'Tilarán'},{p:5,c:509,n:'Nandayure'},{p:5,c:510,n:'La Cruz'},{p:5,c:511,n:'Hojancha'},
  {p:6,c:601,n:'Puntarenas'},{p:6,c:602,n:'Esparza'},{p:6,c:603,n:'Buenos Aires'},{p:6,c:604,n:'Montes de Oro'},{p:6,c:605,n:'Osa'},{p:6,c:606,n:'Quepos'},{p:6,c:607,n:'Golfito'},{p:6,c:608,n:'Coto Brus'},{p:6,c:609,n:'Parrita'},{p:6,c:610,n:'Corredores'},{p:6,c:611,n:'Garabito'},
  {p:7,c:701,n:'Limón'},{p:7,c:702,n:'Pococí'},{p:7,c:703,n:'Siquirres'},{p:7,c:704,n:'Talamanca'},{p:7,c:705,n:'Matina'},{p:7,c:706,n:'Guácimo'}
];

const DISTRITOS = [
  // San José (101-120)
  {c:101,n:'Carmen'},{c:101,n:'Merced'},{c:101,n:'Hospital'},{c:101,n:'Catedral'},{c:101,n:'Zapote'},{c:101,n:'San Francisco de Dos Ríos'},{c:101,n:'Uruca'},{c:101,n:'Mata Redonda'},{c:101,n:'Pavas'},{c:101,n:'Hatillo'},{c:101,n:'San Sebastián'},
  {c:102,n:'Escazú'},{c:102,n:'San Antonio'},{c:102,n:'San Rafael'},
  {c:103,n:'Desamparados'},{c:103,n:'San Miguel'},{c:103,n:'San Juan de Dios'},{c:103,n:'San Rafael Arriba'},{c:103,n:'San Antonio'},{c:103,n:'Frailes'},{c:103,n:'Patarra'},{c:103,n:'San Cristóbal'},{c:103,n:'Rosario'},{c:103,n:'Damas'},{c:103,n:'San Rafael Abajo'},{c:103,n:'Gravilias'},{c:103,n:'Los Guido'},
  {c:104,n:'Santiago'},{c:104,n:'Mercedes Sur'},{c:104,n:'Barbacoas'},{c:104,n:'Grifo Alto'},{c:104,n:'San Rafael'},{c:104,n:'Candelarita'},{c:104,n:'Desamparaditos'},{c:104,n:'San Antonio'},{c:104,n:'Chires'},
  {c:105,n:'San Marcos'},{c:105,n:'San Lorenzo'},{c:105,n:'San Carlos'},
  {c:106,n:'Aserrí'},{c:106,n:'Tarbaca'},{c:106,n:'Vuelta de Jorco'},{c:106,n:'San Gabriel'},{c:106,n:'Legua'},{c:106,n:'Monterrey'},{c:106,n:'Salitrillos'},
  {c:107,n:'Colón'},{c:107,n:'Guayabo'},{c:107,n:'Tabarcia'},{c:107,n:'Piedras Negras'},{c:107,n:'Picagres'},{c:107,n:'Jaris'},{c:107,n:'Quitirrisi'},
  {c:108,n:'Guadalupe'},{c:108,n:'San Francisco'},{c:108,n:'Calle Blancos'},{c:108,n:'Mata de Plátano'},{c:108,n:'Ipis'},{c:108,n:'Rancho Redondo'},{c:108,n:'Purral'},
  {c:109,n:'Santa Ana'},{c:109,n:'Salitral'},{c:109,n:'Pozos'},{c:109,n:'Uruca'},{c:109,n:'Piedades'},{c:109,n:'Brasil'},
  {c:110,n:'Alajuelita'},{c:110,n:'San Josecito'},{c:110,n:'San Antonio'},{c:110,n:'Concepción'},{c:110,n:'San Felipe'},
  {c:111,n:'San Isidro'},{c:111,n:'San Rafael'},{c:111,n:'Dulce Nombre de Jesús'},{c:111,n:'Patalillo'},{c:111,n:'Cascajal'},
  {c:112,n:'San Ignacio'},{c:112,n:'Guaitil'},{c:112,n:'Palmichal'},{c:112,n:'Cangrejal'},{c:112,n:'Sabanillas'},
  {c:113,n:'San Juan'},{c:113,n:'Cinco Esquinas'},{c:113,n:'Anselmo Llorente'},{c:113,n:'León XIII'},{c:113,n:'Colima'},
  {c:114,n:'San Vicente'},{c:114,n:'San Jerónimo'},{c:114,n:'La Trinidad'},
  {c:115,n:'San Pedro'},{c:115,n:'Sabanilla'},{c:115,n:'Mercedes'},{c:115,n:'San Rafael'},
  {c:116,n:'San Pablo'},{c:116,n:'San Pedro'},{c:116,n:'San Juan de Mata'},{c:116,n:'San Luis'},{c:116,n:'Carara'},
  {c:117,n:'Santa María'},{c:117,n:'Jardín'},{c:117,n:'Copey'},
  {c:118,n:'Curridabat'},{c:118,n:'Granadilla'},{c:118,n:'Sánchez'},{c:118,n:'Tirrases'},
  {c:119,n:'San Isidro de El General'},{c:119,n:'El General'},{c:119,n:'Daniel Flores'},{c:119,n:'Rivas'},{c:119,n:'San Pedro'},{c:119,n:'Platanares'},{c:119,n:'Pejibaye'},{c:119,n:'Cajón'},{c:119,n:'Barú'},{c:119,n:'Río Nuevo'},{c:119,n:'Páramo'},{c:119,n:'La Amistad'},
  {c:120,n:'San Pablo'},{c:120,n:'San Andrés'},{c:120,n:'Llano Bonito'},{c:120,n:'San Isidro'},{c:120,n:'Santa Cruz'},{c:120,n:'San Antonio'},
  // Alajuela (201-216)
  {c:201,n:'Alajuela'},{c:201,n:'San José'},{c:201,n:'Carrizal'},{c:201,n:'San Antonio'},{c:201,n:'Guácima'},{c:201,n:'San Isidro'},{c:201,n:'Sabanilla'},{c:201,n:'San Rafael'},{c:201,n:'Río Segundo'},{c:201,n:'Desamparados'},{c:201,n:'Turrucares'},{c:201,n:'Tambor'},{c:201,n:'Garita'},{c:201,n:'Sarapiquí'},
  {c:202,n:'San Ramón'},{c:202,n:'Santiago'},{c:202,n:'San Juan'},{c:202,n:'Piedades Norte'},{c:202,n:'Piedades Sur'},{c:202,n:'San Rafael'},{c:202,n:'San Isidro'},{c:202,n:'Ángeles'},{c:202,n:'Alfaro'},{c:202,n:'Volio'},{c:202,n:'Concepción'},{c:202,n:'Zapotal'},{c:202,n:'Peñas Blancas'},{c:202,n:'San Lorenzo'},
  {c:203,n:'Grecia'},{c:203,n:'San Isidro'},{c:203,n:'San José'},{c:203,n:'San Roque'},{c:203,n:'Tacares'},{c:203,n:'Puente de Piedra'},{c:203,n:'Bolívar'},
  {c:204,n:'San Mateo'},{c:204,n:'Desmonte'},{c:204,n:'Jesús María'},{c:204,n:'Labrador'},
  {c:205,n:'Atenas'},{c:205,n:'Jesús'},{c:205,n:'Mercedes'},{c:205,n:'San Isidro'},{c:205,n:'Concepción'},{c:205,n:'San José'},{c:205,n:'Santa Eulalia'},{c:205,n:'Escobal'},
  {c:206,n:'Naranjo'},{c:206,n:'San Miguel'},{c:206,n:'San José'},{c:206,n:'Cirrí Sur'},{c:206,n:'San Jerónimo'},{c:206,n:'San Juan'},{c:206,n:'El Rosario'},{c:206,n:'Palmitos'},
  {c:207,n:'Palmares'},{c:207,n:'Zaragoza'},{c:207,n:'Buenos Aires'},{c:207,n:'Santiago'},{c:207,n:'Candelaria'},{c:207,n:'Esquipulas'},{c:207,n:'La Granja'},
  {c:208,n:'San Pedro'},{c:208,n:'San Juan'},{c:208,n:'San Rafael'},{c:208,n:'Carrillos'},{c:208,n:'Sabana Redonda'},
  {c:209,n:'Orotina'},{c:209,n:'El Mastate'},{c:209,n:'Hacienda Vieja'},{c:209,n:'Coyolar'},{c:209,n:'La Ceiba'},
  {c:210,n:'Quesada'},{c:210,n:'Florencia'},{c:210,n:'Buenavista'},{c:210,n:'Aguas Zarcas'},{c:210,n:'Venecia'},{c:210,n:'Pital'},{c:210,n:'La Fortuna'},{c:210,n:'La Tigra'},{c:210,n:'La Palmera'},{c:210,n:'Venado'},{c:210,n:'Cutris'},{c:210,n:'Monterrey'},{c:210,n:'Pocosol'},
  {c:211,n:'Zarcero'},{c:211,n:'Laguna'},{c:211,n:'Tapesco'},{c:211,n:'Guadalupe'},{c:211,n:'Palmira'},{c:211,n:'Zapote'},{c:211,n:'Brisas'},
  {c:212,n:'Sarchí Norte'},{c:212,n:'Sarchí Sur'},{c:212,n:'Toro Amarillo'},{c:212,n:'San Pedro'},{c:212,n:'Rodríguez'},
  {c:213,n:'Upala'},{c:213,n:'Aguas Claras'},{c:213,n:'San José o Pizote'},{c:213,n:'Bijagua'},{c:213,n:'Delicias'},{c:213,n:'Dos Ríos'},{c:213,n:'Yolillal'},{c:213,n:'Canalete'},
  {c:214,n:'Los Chiles'},{c:214,n:'Caño Negro'},{c:214,n:'El Amparo'},{c:214,n:'San Jorge'},
  {c:215,n:'San Rafael'},{c:215,n:'Buenavista'},{c:215,n:'Cote'},{c:215,n:'Katira'},
  {c:216,n:'Río Cuarto'},{c:216,n:'Santa Rita'},{c:216,n:'Santa Isabel'},
  // Cartago (301-308)
  {c:301,n:'Oriental'},{c:301,n:'Occidental'},{c:301,n:'Carmen'},{c:301,n:'San Nicolás'},{c:301,n:'Aguacaliente'},{c:301,n:'Guadalupe'},{c:301,n:'Corralillo'},{c:301,n:'Tierra Blanca'},{c:301,n:'Dulce Nombre'},{c:301,n:'Llano Grande'},{c:301,n:'Quebradilla'},
  {c:302,n:'Paraíso'},{c:302,n:'Santiago'},{c:302,n:'Orosi'},{c:302,n:'Cachí'},{c:302,n:'Llanos de Santa Lucía'},{c:302,n:'Birrisito'},
  {c:303,n:'Tres Ríos'},{c:303,n:'San Diego'},{c:303,n:'San Juan'},{c:303,n:'San Rafael'},{c:303,n:'Concepción'},{c:303,n:'Dulce Nombre'},{c:303,n:'San Ramón'},{c:303,n:'Río Azul'},
  {c:304,n:'Juan Viñas'},{c:304,n:'Tucurrique'},{c:304,n:'Pejibaye'},
  {c:305,n:'Turrialba'},{c:305,n:'La Suiza'},{c:305,n:'Peralta'},{c:305,n:'Santa Cruz'},{c:305,n:'Santa Teresita'},{c:305,n:'Pavones'},{c:305,n:'Tuis'},{c:305,n:'Tayutic'},{c:305,n:'Santa Rosa'},{c:305,n:'Tres Equis'},{c:305,n:'La Isabel'},{c:305,n:'Chirripó'},
  {c:306,n:'Pacayas'},{c:306,n:'Cervantes'},{c:306,n:'Capellades'},
  {c:307,n:'San Rafael'},{c:307,n:'Cot'},{c:307,n:'Potrero Cerrado'},{c:307,n:'Cipreses'},{c:307,n:'Santa Rosa'},
  {c:308,n:'El Tejar'},{c:308,n:'San Isidro'},{c:308,n:'Tobosi'},{c:308,n:'Patio de Agua'},
  // Heredia (401-410)
  {c:401,n:'Heredia'},{c:401,n:'Mercedes'},{c:401,n:'San Francisco'},{c:401,n:'Ulloa'},{c:401,n:'Varablanca'},
  {c:402,n:'Barva'},{c:402,n:'San Pedro'},{c:402,n:'San Pablo'},{c:402,n:'San Roque'},{c:402,n:'Santa Lucía'},{c:402,n:'San José de la Montaña'},
  {c:403,n:'Santo Domingo'},{c:403,n:'San Vicente'},{c:403,n:'San Miguel'},{c:403,n:'Paracito'},{c:403,n:'Santo Tomás'},{c:403,n:'Santa Rosa'},{c:403,n:'Tures'},{c:403,n:'Pará'},
  {c:404,n:'Santa Bárbara'},{c:404,n:'San Pedro'},{c:404,n:'San Juan'},{c:404,n:'Jesús'},{c:404,n:'Santo Domingo'},{c:404,n:'Purabá'},
  {c:405,n:'San Rafael'},{c:405,n:'San Josecito'},{c:405,n:'Santiago'},{c:405,n:'Ángeles'},{c:405,n:'Concepción'},
  {c:406,n:'San Isidro'},{c:406,n:'San José'},{c:406,n:'Concepción'},{c:406,n:'San Francisco'},
  {c:407,n:'San Antonio'},{c:407,n:'La Ribera'},{c:407,n:'La Asunción'},
  {c:408,n:'San Joaquín'},{c:408,n:'Barrantes'},{c:408,n:'Llorente'},
  {c:409,n:'San Pablo'},{c:409,n:'Rincón de Sabanilla'},
  {c:410,n:'Puerto Viejo'},{c:410,n:'La Virgen'},{c:410,n:'Las Horquetas'},{c:410,n:'Llanuras del Gaspar'},{c:410,n:'Cureña'},
  // Guanacaste (501-511)
  {c:501,n:'Liberia'},{c:501,n:'Cañas Dulces'},{c:501,n:'Mayorga'},{c:501,n:'Nacascolo'},{c:501,n:'Curubandé'},
  {c:502,n:'Nicoya'},{c:502,n:'Mansión'},{c:502,n:'San Antonio'},{c:502,n:'Quebrada Honda'},{c:502,n:'Sámara'},{c:502,n:'Nosara'},{c:502,n:'Belén de Nosarita'},
  {c:503,n:'Santa Cruz'},{c:503,n:'Bolsón'},{c:503,n:'Veintisiete de Abril'},{c:503,n:'Tempate'},{c:503,n:'Cartagena'},{c:503,n:'Cuajiniquil'},{c:503,n:'Diría'},{c:503,n:'Cabo Velas'},{c:503,n:'Tamarindo'},
  {c:504,n:'Bagaces'},{c:504,n:'La Fortuna'},{c:504,n:'Mogote'},{c:504,n:'Río Naranjo'},
  {c:505,n:'Filadelfia'},{c:505,n:'Palmira'},{c:505,n:'Sardinal'},{c:505,n:'Belén'},
  {c:506,n:'Cañas'},{c:506,n:'Palmira'},{c:506,n:'San Miguel'},{c:506,n:'Bebedero'},{c:506,n:'Porozal'},
  {c:507,n:'Las Juntas'},{c:507,n:'Sierra'},{c:507,n:'San Juan'},{c:507,n:'Colorado'},
  {c:508,n:'Tilarán'},{c:508,n:'Quebrada Grande'},{c:508,n:'Tronadora'},{c:508,n:'Santa Rosa'},{c:508,n:'Líbano'},{c:508,n:'Tierras Morenas'},{c:508,n:'Arenal'},{c:508,n:'Cabeceras'},
  {c:509,n:'Carmona'},{c:509,n:'Santa Rita'},{c:509,n:'Zapotal'},{c:509,n:'San Pablo'},{c:509,n:'Porvenir'},{c:509,n:'Bejuco'},
  {c:510,n:'La Cruz'},{c:510,n:'Santa Cecilia'},{c:510,n:'La Garita'},{c:510,n:'Santa Elena'},
  {c:511,n:'Hojancha'},{c:511,n:'Monte Romo'},{c:511,n:'Puerto Carrillo'},{c:511,n:'Huacas'},{c:511,n:'Matambú'},
  // Puntarenas (601-611)
  {c:601,n:'Puntarenas'},{c:601,n:'Pitahaya'},{c:601,n:'Chomes'},{c:601,n:'Lepanto'},{c:601,n:'Paquera'},{c:601,n:'Manzanillo'},{c:601,n:'Guacimal'},{c:601,n:'Barranca'},{c:601,n:'Isla del Coco'},{c:601,n:'Cóbano'},{c:601,n:'Chacarita'},{c:601,n:'Chira'},{c:601,n:'Acapulco'},{c:601,n:'El Roble'},{c:601,n:'Arancibia'},
  {c:602,n:'Espíritu Santo'},{c:602,n:'San Juan Grande'},{c:602,n:'Macacona'},{c:602,n:'San Rafael'},{c:602,n:'San Jerónimo'},{c:602,n:'Caldera'},
  {c:603,n:'Buenos Aires'},{c:603,n:'Volcán'},{c:603,n:'Potrero Grande'},{c:603,n:'Boruca'},{c:603,n:'Pilas'},{c:603,n:'Colinas'},{c:603,n:'Chánguena'},{c:603,n:'Biolley'},{c:603,n:'Brunka'},
  {c:604,n:'Miramar'},{c:604,n:'La Unión'},{c:604,n:'San Isidro'},
  {c:605,n:'Puerto Cortés'},{c:605,n:'Palmar'},{c:605,n:'Sierpe'},{c:605,n:'Bahía Ballena'},{c:605,n:'Piedras Blancas'},{c:605,n:'Bahía Drake'},
  {c:606,n:'Quepos'},{c:606,n:'Savegre'},{c:606,n:'Naranjito'},
  {c:607,n:'Golfito'},{c:607,n:'Puerto Jiménez'},{c:607,n:'Guaycará'},{c:607,n:'Pavón'},
  {c:608,n:'San Vito'},{c:608,n:'Sabalito'},{c:608,n:'Aguabuena'},{c:608,n:'Limoncito'},{c:608,n:'Pittier'},{c:608,n:'Gutiérrez Braun'},
  {c:609,n:'Parrita'},
  {c:610,n:'Corredor'},{c:610,n:'La Cuesta'},{c:610,n:'Canoas'},{c:610,n:'Laurel'},
  {c:611,n:'Jacó'},{c:611,n:'Tárcoles'},{c:611,n:'Lagunillas'},
  // Limón (701-706)
  {c:701,n:'Limón'},{c:701,n:'Valle La Estrella'},{c:701,n:'Río Blanco'},{c:701,n:'Matama'},
  {c:702,n:'Guápiles'},{c:702,n:'Jiménez'},{c:702,n:'Rita'},{c:702,n:'Roxana'},{c:702,n:'Cariari'},{c:702,n:'Colorado'},{c:702,n:'La Colonia'},
  {c:703,n:'Siquirres'},{c:703,n:'Pacuarito'},{c:703,n:'Florida'},{c:703,n:'Germania'},{c:703,n:'El Cairo'},{c:703,n:'Alegría'},{c:703,n:'Reventazón'},
  {c:704,n:'Bratsi'},{c:704,n:'Sixaola'},{c:704,n:'Cahuita'},{c:704,n:'Telire'},
  {c:705,n:'Matina'},{c:705,n:'Batán'},{c:705,n:'Carrandi'},
  {c:706,n:'Guácimo'},{c:706,n:'Mercedes'},{c:706,n:'Pocora'},{c:706,n:'Río Jiménez'},{c:706,n:'Duacarí'}
];

let benefItemId = null;
let tieneBenef  = false;

// ── Helpers ───────────────────────────────────────────────────

async function callFlow(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Error ' + res.status + ': ' + res.statusText);
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

function setLoading(show) {
  const el = document.getElementById('loadingState');
  if (el) el.style.display = show ? 'block' : 'none';
}

function showAlert(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'alert ' + type + ' show';
  el.textContent = msg;
  setTimeout(() => el.classList.remove('show'), 6000);
}

function g(id) { return document.getElementById(id); }

// ── Geografía ─────────────────────────────────────────────────

function initProvincias() {
  const sel = g('b_provincia');
  if (!sel) return;
  PROVINCIAS.forEach(p => {
    const o = document.createElement('option');
    o.value = p.c; o.textContent = p.n;
    sel.appendChild(o);
  });
}

function msCargarCantones() {
  const pv = parseInt(g('b_provincia').value);
  const cs = g('b_canton');
  const ds = g('b_distrito');
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

function msCargarDistritos() {
  const cv = parseInt(g('b_canton').value);
  const ds = g('b_distrito');
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

function setGeo(prov, cant, dist) {
  const p = PROVINCIAS.find(x => x.n === prov);
  if (!p) return;
  g('b_provincia').value = p.c;
  msCargarCantones();
  const c = CANTONES.find(x => x.p === p.c && x.n === cant);
  if (!c) return;
  g('b_canton').value = c.c;
  msCargarDistritos();
  if (dist) g('b_distrito').value = dist;
}

// ── Cargar beneficiario ───────────────────────────────────────

function llenarForm(f) {
  g('b_tipocedula').value  = f['TipoCedula']?.Value        || '';
  g('b_cedula').value      = f['Cedula']                   || '';
  g('b_nombre').value      = f['Nombre']                   || '';
  const fn = f['Fechadenacimiento'] || '';
  g('b_fechanac').value    = fn ? fn.split('T')[0] : '';
  g('b_genero').value      = f['Genero']?.Value            || '';
  const ecMap = { 'Union Libre': 'Unión Libre' };
  const ecRaw = f['Estadocivil']?.Value || '';
  g('b_estadocivil').value = ecMap[ecRaw] || ecRaw;
  g('b_parentesco').value  = f['Parentesco']?.Value        || '';
  g('b_correo').value      = f['Correoelectronico']        || '';
  setGeo(f['Provincia'] || '', f['Cant_x00f3_n'] || '', f['Distrito'] || '');
}

async function cargarBeneficiario() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const ced  = user['Cedula'] || user['cedula'] || '';
  if (!ced) { showAlert('alertGlobal', 'error', 'No se encontró la cédula del usuario.'); return; }

  setLoading(true);
  try {
    const data = await callFlow(FLOW_BENEFICIARIO, { accion: 'buscar', titular: ced });
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
  } catch(e) {
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

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const ced  = user['Cedula'] || user['cedula'] || '';

  const pe = g('b_provincia');
  const ce = g('b_canton');
  const ecValMap = { 'Unión Libre': 'Union Libre' };
  const ecVal = ecValMap[g('b_estadocivil').value] || g('b_estadocivil').value;

  try {
    const res = await callFlow(FLOW_BENEFICIARIO, {
      accion:      tieneBenef ? 'editar' : 'crear',
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
  } catch(e) {
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
    await callFlow(FLOW_BENEFICIARIO, { accion: 'eliminar', itemId: benefItemId });
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
  } catch(e) {
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
window.msCargarCantones    = msCargarCantones;
window.msCargarDistritos   = msCargarDistritos;

// ── Inicio ────────────────────────────────────────────────────
initProvincias();
cargarBeneficiario();

})();