/* ============================================================
   app.js — arranque de la aplicación
   ============================================================ */

const STATE = {
  clientes: [],
  citas: [],
  servicios: [],
  selectedDate: null,
  selectedClienteId: null
};

async function bootstrap() {
  STATE.selectedDate = UI.hoyISO();

  try {
    await DB.init();
  } catch (e) {
    console.warn(e.message);
    return; // el aviso de configuración ya se muestra desde db.js
  }

  // Suscripciones en tiempo real: cualquier cambio (desde el PC o el
  // móvil) se refleja al instante en todos los dispositivos abiertos.
  DB.listen('clientes', (data) => {
    STATE.clientes = data;
    if (document.getElementById('view-clientes').classList.contains('active')) Clientes.render();
    if (document.getElementById('view-historial').classList.contains('active')) Historial.render();
  });

  DB.listen('citas', (data) => {
    STATE.citas = data;
    Citas.render();
    if (document.getElementById('view-historial').classList.contains('active')) Historial.render();
    if (document.getElementById('view-clientes').classList.contains('active')) Clientes.render();
  });

  DB.listen('servicios', (data) => {
    STATE.servicios = data;
    Servicios.render();
  }, 'nombre');

  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('app').classList.add('visible');
}

bootstrap();
