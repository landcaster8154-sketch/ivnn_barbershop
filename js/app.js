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

  // Suscripciones en tiempo real activas (Renderizan siempre al recibir datos)
  DB.listen('clientes', (data) => {
    STATE.clientes = data;
    Clientes.render();
    if (typeof Historial !== 'undefined' && Historial.render) Historial.render();
  });

  DB.listen('citas', (data) => {
    STATE.citas = data;
    Citas.render();
    if (typeof Historial !== 'undefined' && Historial.render) Historial.render();
    Clientes.render();
  });

  DB.listen('servicios', (data) => {
    STATE.servicios = data;
    if (typeof Servicios !== 'undefined' && Servicios.render) Servicios.render();
  }, 'nombre');

  // Asegurar que al cambiar de pestaña en el menú se vuelva a renderizar la vista seleccionada
  document.querySelectorAll('.tabbar button').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(() => {
        const activeView = btn.getAttribute('data-view');
        if (activeView === 'clientes') Clientes.render();
        if (activeView === 'agenda') Citas.render();
        if (activeView === 'historial' && typeof Historial !== 'undefined' && Historial.render) Historial.render();
        if (activeView === 'ajustes' && typeof Servicios !== 'undefined' && Servicios.render) Servicios.render();
      }, 50);
    });
  });

  // Transición de interfaz: Ocultar pantalla de carga
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('app').classList.add('visible');
}

// Inicialización de la SPA
bootstrap();
