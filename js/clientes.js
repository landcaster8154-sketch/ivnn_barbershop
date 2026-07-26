/* ============================================================
   clientes.js — base de datos de clientes
   ============================================================ */

const Clientes = {

  render() {
    const list = document.getElementById('clientes-list');
    const term = (document.getElementById('buscar-cliente').value || '').trim().toLowerCase();
    let items = [...STATE.clientes].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    if (term) items = items.filter(c => c.nombre.toLowerCase().includes(term));

    if (items.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>
          <p>${term ? 'No hay clientes con ese nombre.' : 'Todavía no hay clientes. Añade el primero.'}</p>
        </div>`;
      return;
    }

    if (UI.isDesktop()) {
      list.innerHTML = `
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Notas</th>
                <th>Última visita</th>
                <th class="num">Total gastado</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(c => {
                const citasCliente = STATE.citas.filter(ci => ci.clienteId === c.id && ci.estado === 'completada');
                const total = citasCliente.reduce((s, ci) => s + (Number(ci.coste) || 0), 0);
                const ultima = citasCliente.sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora))[0];
                return `
                <tr data-id="${c.id}">
                  <td>${c.nombre}</td>
                  <td class="muted">${c.telefono || '—'}</td>
                  <td class="notas">${c.notas || '—'}</td>
                  <td class="muted">${ultima ? UI.fechaCorta(ultima.fecha) : '—'}</td>
                  <td class="num gold">${UI.euros(total)}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>`;
      list.querySelectorAll('tbody tr').forEach(row => {
        row.addEventListener('click', () => this.openDetail(row.dataset.id));
      });
      return;
    }

    list.innerHTML = items.map(c => `
      <div class="cliente-row" data-id="${c.id}">
        <div class="cliente-avatar">${UI.iniciales(c.nombre)}</div>
        <div>
          <div class="cliente-nombre">${c.nombre}</div>
          <div class="cliente-meta">${c.telefono || 'Sin teléfono'}</div>
        </div>
        <div class="cliente-arrow">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.cliente-row').forEach(row => {
      row.addEventListener('click', () => this.openDetail(row.dataset.id));
    });
  },

  openForm(cliente = null) {
    const isEdit = !!cliente;
    UI.openModal(`
      <div class="modal-header">
        <h3>${isEdit ? 'Editar cliente' : 'Nuevo cliente'}</h3>
        <button class="modal-close" onclick="UI.closeModal()">&times;</button>
      </div>
      <form id="form-cliente">
        <div class="field">
          <label>Nombre</label>
          <input type="text" id="c-nombre" required value="${cliente?.nombre || ''}" placeholder="Ej. Miguel Ángel" />
        </div>
        <div class="field">
          <label>Teléfono</label>
          <input type="tel" id="c-telefono" value="${cliente?.telefono || ''}" placeholder="Ej. 612 345 678" />
        </div>
        <div class="field">
          <label>Notas (alergias, preferencias de corte…)</label>
          <textarea id="c-notas" rows="3" placeholder="Ej. Prefiere máquina nº2 en los laterales">${cliente?.notas || ''}</textarea>
        </div>
        <div class="modal-actions">
          ${isEdit ? `<button type="button" class="btn-danger" id="c-eliminar">Eliminar</button>` : ''}
          <button type="submit" class="btn-gold">${isEdit ? 'Guardar cambios' : 'Añadir cliente'}</button>
        </div>
      </form>
    `);

    document.getElementById('form-cliente').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        nombre: document.getElementById('c-nombre').value.trim(),
        telefono: document.getElementById('c-telefono').value.trim(),
        notas: document.getElementById('c-notas').value.trim()
      };
      if (!data.nombre) return;
      if (isEdit) {
        await DB.update('clientes', cliente.id, data);
        UI.toast('Cliente actualizado');
      } else {
        await DB.add('clientes', data);
        UI.toast('Cliente añadido');
      }
      UI.closeModal();
    });

    if (isEdit) {
      document.getElementById('c-eliminar').addEventListener('click', async () => {
        if (!confirm(`¿Eliminar a ${cliente.nombre}? Esto no borra su historial de citas.`)) return;
        await DB.remove('clientes', cliente.id);
        UI.toast('Cliente eliminado');
        UI.closeModal();
      });
    }
  },

  openDetail(id) {
    const cliente = STATE.clientes.find(c => c.id === id);
    if (!cliente) return;
    const citasCliente = STATE.citas.filter(c => c.clienteId === id);
    const completadas = citasCliente.filter(c => c.estado === 'completada');
    const totalGastado = completadas.reduce((s, c) => s + (Number(c.coste) || 0), 0);
    const ultima = completadas.sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora))[0];

    UI.openModal(`
      <div class="modal-header">
        <h3>${cliente.nombre}</h3>
        <button class="modal-close" onclick="UI.closeModal()">&times;</button>
      </div>
      <div class="stat-row">
        <div class="stat-box"><div class="num">${completadas.length}</div><div class="lbl">Visitas</div></div>
        <div class="stat-box"><div class="num">${UI.euros(totalGastado)}</div><div class="lbl">Total</div></div>
      </div>
      <div class="field"><label>Teléfono</label><div class="card">${cliente.telefono || '—'}</div></div>
      ${cliente.notas ? `<div class="field"><label>Notas</label><div class="card">${cliente.notas}</div></div>` : ''}
      ${ultima ? `<div class="field"><label>Última visita</label><div class="card">${UI.fechaCorta(ultima.fecha)} · ${ultima.servicioNombre}</div></div>` : ''}
      <div class="modal-actions">
        <button class="btn-ghost" id="d-ver-historial">Ver historial</button>
        <button class="btn-gold" id="d-editar">Editar</button>
      </div>
    `);

    document.getElementById('d-editar').addEventListener('click', () => this.openForm(cliente));
    document.getElementById('d-ver-historial').addEventListener('click', () => {
      UI.closeModal();
      STATE.selectedClienteId = id;
      UI.showView('historial');
      Historial.render();
    });
  }
};

document.getElementById('btn-nuevo-cliente').addEventListener('click', () => Clientes.openForm());
document.getElementById('buscar-cliente').addEventListener('input', () => Clientes.render());
