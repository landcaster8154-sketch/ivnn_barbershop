/* ============================================================
   servicios.js — catálogo de servicios y precios (Ajustes)
   ============================================================ */

const Servicios = {

  render() {
    const list = document.getElementById('servicios-list');
    if (STATE.servicios.length === 0) {
      list.innerHTML = `<div class="empty-state" style="padding:20px;"><p>Añade tus servicios habituales (corte, barba, tinte…) para elegirlos rápido al crear una cita.</p></div>`;
      return;
    }
    list.innerHTML = STATE.servicios.map(s => `
      <div class="hist-item" data-id="${s.id}">
        <div class="hist-servicio">${s.nombre}</div>
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="hist-coste">${UI.euros(s.precio)}</div>
          <button class="btn-icon serv-editar" data-id="${s.id}">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('.serv-editar').forEach(btn => {
      btn.addEventListener('click', () => this.openForm(STATE.servicios.find(s => s.id === btn.dataset.id)));
    });
  },

  openForm(servicio = null) {
    const isEdit = !!servicio;
    UI.openModal(`
      <div class="modal-header">
        <h3>${isEdit ? 'Editar servicio' : 'Nuevo servicio'}</h3>
        <button class="modal-close" onclick="UI.closeModal()">&times;</button>
      </div>
      <form id="form-servicio">
        <div class="field">
          <label>Nombre</label>
          <input type="text" id="s-nombre" required value="${servicio?.nombre || ''}" placeholder="Ej. Corte + barba" />
        </div>
        <div class="field">
          <label>Precio (€)</label>
          <input type="number" step="0.5" min="0" id="s-precio" required value="${servicio?.precio ?? ''}" placeholder="0" />
        </div>
        <div class="modal-actions">
          ${isEdit ? `<button type="button" class="btn-danger" id="s-eliminar">Eliminar</button>` : ''}
          <button type="submit" class="btn-gold">Guardar</button>
        </div>
      </form>
    `);

    document.getElementById('form-servicio').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        nombre: document.getElementById('s-nombre').value.trim(),
        precio: parseFloat(document.getElementById('s-precio').value) || 0
      };
      if (!data.nombre) return;
      if (isEdit) await DB.update('servicios', servicio.id, data);
      else await DB.add('servicios', data);
      UI.toast('Servicio guardado');
      UI.closeModal();
    });

    if (isEdit) {
      document.getElementById('s-eliminar').addEventListener('click', async () => {
        if (!confirm(`¿Eliminar «${servicio.nombre}»?`)) return;
        await DB.remove('servicios', servicio.id);
        UI.toast('Servicio eliminado');
        UI.closeModal();
      });
    }
  }
};

document.getElementById('btn-nuevo-servicio').addEventListener('click', () => Servicios.openForm());
