/* ============================================================
   historial.js — histórico de tareas / cortes realizados
   ============================================================ */

const Historial = {

  render() {
    const titulo = document.getElementById('historial-titulo');
    const clienteFiltro = STATE.selectedClienteId
      ? STATE.clientes.find(c => c.id === STATE.selectedClienteId)
      : null;

    titulo.innerHTML = clienteFiltro
      ? `<button class="btn-icon" style="margin-right:8px; vertical-align:middle;" id="hist-volver"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>Historial de ${clienteFiltro.nombre}`
      : 'Historial general';

    let items = STATE.citas.filter(c => c.estado === 'completada');
    if (clienteFiltro) items = items.filter(c => c.clienteId === clienteFiltro.id);
    items = items.sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));

    const total = items.reduce((s, c) => s + (Number(c.coste) || 0), 0);
    const statsBox = document.getElementById('historial-stats');
    statsBox.innerHTML = `
      <div class="stat-box"><div class="num">${items.length}</div><div class="lbl">${clienteFiltro ? 'Visitas' : 'Servicios'}</div></div>
      <div class="stat-box"><div class="num">${UI.euros(total)}</div><div class="lbl">Ingresos</div></div>
    `;

    const list = document.getElementById('historial-list');
    if (items.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <p>Todavía no hay servicios registrados como completados.</p>
        </div>`;
    } else if (UI.isDesktop()) {
      list.innerHTML = `
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                ${!clienteFiltro ? '<th>Cliente</th>' : ''}
                <th>Servicio</th>
                <th>Notas</th>
                <th class="num">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(c => `
                <tr>
                  <td class="muted">${UI.fechaCorta(c.fecha)}</td>
                  <td class="muted">${c.hora}</td>
                  ${!clienteFiltro ? `<td>${c.clienteNombre}</td>` : ''}
                  <td>${c.servicioNombre}</td>
                  <td class="notas">${c.notas || '—'}</td>
                  <td class="num gold">${UI.euros(c.coste)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`;
    } else {
      list.innerHTML = items.map(c => `
        <div class="hist-item">
          <div>
            <div class="hist-fecha">${UI.fechaCorta(c.fecha)} · ${c.hora}${!clienteFiltro ? ' · ' + c.clienteNombre : ''}</div>
            <div class="hist-servicio">${c.servicioNombre}</div>
            ${c.notas ? `<div class="hist-notas">${c.notas}</div>` : ''}
          </div>
          <div class="hist-coste">${UI.euros(c.coste)}</div>
        </div>
      `).join('');
    }

    if (clienteFiltro) {
      document.getElementById('hist-volver').addEventListener('click', () => {
        STATE.selectedClienteId = null;
        UI.showView('clientes');
      });
    }
  }
};
