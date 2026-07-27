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
    // Inicializa la conexión real con tu Firebase base de datos
    await DB.init();
    console.log("🔥 Conexión exitosa con Cloud Firestore.");
  } catch (e) {
    console.error("Fallo crítico en la inicialización:", e.message);
    return; 
  }

  // Suscripciones en tiempo real activas
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
    if (typeof Servicios !== 'undefined' && Servicios.render) Servicios.render();
  }, 'nombre');

  // Transición de interfaz: Ocultar pantalla de carga
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('app').classList.add('visible');
}

// Inicialización de la SPA
bootstrap();
