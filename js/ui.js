/* ============================================================
   ui.js — utilidades de interfaz reutilizables
   ============================================================ */

const UI = {
  // ---------- navegación entre pestañas ----------
  showView(name) {
    const viewEl = document.getElementById(`view-${name}`);
    if (!viewEl) return; // Protección por si no existe la vista

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    viewEl.classList.add('active');
    
    document.querySelectorAll('.tabbar button').forEach(b => {
      b.classList.toggle('active', b.dataset.view === name);
    });
    window.scrollTo(0, 0);

    // Repintar la vista al entrar en ella con seguridad
    if (typeof STATE !== 'undefined') {
      if (name === 'agenda' && typeof Citas !== 'undefined') Citas.render();
      if (name === 'clientes' && typeof Clientes !== 'undefined') Clientes.render();
      if (name === 'historial' && typeof Historial !== 'undefined') Historial.render();
      if (name === 'ajustes' && typeof Servicios !== 'undefined') Servicios.render();
    }
  },

  // ---------- toast ----------
  toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  },

  // ---------- modal ----------
  openModal(html) {
    const content = document.getElementById('modal-content');
    const overlay = document.getElementById('modal-overlay');
    if (content && overlay) {
      content.innerHTML = html;
      overlay.classList.add('open');
    }
  },
  closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('open');
  },

  // ---------- helpers de formato ----------
  euros(n) {
    return (Number(n) || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
  },
  fechaLarga(fechaISO) {
    const d = new Date(fechaISO + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  },
  fechaCorta(fechaISO) {
    const d = new Date(fechaISO + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },
  hoyISO() {
    return this.toISO(new Date());
  },
  toISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },
  isDesktop() {
    return window.matchMedia('(min-width: 860px)').matches;
  },
  iniciales(nombre) {
    return (nombre || '?').trim().split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('');
  }
};

// Inicialización segura cuando el HTML esté completamente listo
document.addEventListener('DOMContentLoaded', () => {
  // Cerrar modal al pulsar fuera de él
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') UI.closeModal();
    });
  }

  // Activar la navegación de pestañas en los botones reales
  document.querySelectorAll('.tabbar button, nav.tabbar button').forEach(btn => {
    btn.addEventListener('click', () => {
      const viewName = btn.dataset.view || btn.getAttribute('data-view');
      if (viewName) UI.showView(viewName);
    });
  });
});

// Al cruzar el punto de ruptura PC/móvil, redibujar Clientes e Historial
let _lastIsDesktop = UI.isDesktop();
window.addEventListener('resize', () => {
  const nowDesktop = UI.isDesktop();
  if (nowDesktop !== _lastIsDesktop) {
    _lastIsDesktop = nowDesktop;
    if (typeof Clientes !== 'undefined') Clientes.render();
    if (typeof Historial !== 'undefined') Historial.render();
  }
});
