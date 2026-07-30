/* ============================================================
   citas.js — agenda / control de citas
   ============================================================ */

const Citas = {

  render() {
    const dia = STATE.selectedDate;
    const label = document.getElementById('day-label');
    const hoy = UI.hoyISO();
    let prefijo = '';
    if (dia === hoy) prefijo = 'Hoy';
    else {
      const diff = Math.round((new Date(dia) - new Date(hoy)) / 86400000);
      if (diff === 1) prefijo = 'Mañana';
      else if (diff === -1) prefijo = 'Ayer';
    }
    label.innerHTML = `${prefijo || UI.fechaLarga(dia).split(',')[0]}<small>${UI.fechaLarga(dia)}</small>`;

    const list = document.getElementById('citas-list');
    const citasDia = STATE.citas
      .filter(c => c.fecha === dia)
      .sort((a, b) => a.hora.localeCompare(b.hora));

    if (citasDia.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <p>No hay citas este día. Toca «+ Nueva cita» para añadir una.</p>
        </div>`;
      return;
    }

    list.innerHTML = citasDia.map(c => `
      <div class="cita-card ${c.estado}" data-id="${c.id}">
        <div class="cita-hora">${c.hora}</div>
        <div class="cita-info">
          <div class="nombre">${c.clienteNombre}</div>
          <div class="servicio">${c.servicioNombre}${c.coste ? ' · ' + UI.euros(c.coste) : ''}</div>
        </div>
        <div class="cita-estado-pill ${c.estado}">${this.estadoLabel(c.estado)}</div>
      </div>
    `).join('');

    list.querySelectorAll('.cita-card').forEach(el => {
      el.addEventListener('click', () => this.openDetail(el.dataset.id));
    });
  },

  estadoLabel(estado) {
    return { pendiente: 'Pendiente', completada: 'Hecha', cancelada: 'Cancelada' }[estado] || estado;
  },

  changeDay(deltaDays) {
    const d = new Date(STATE.selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + deltaDays);
    STATE.selectedDate = UI.toISO(d);
    this.render();
  },

  openForm(cita = null) {
    const isEdit = !!cita;
    const servicios = STATE.servicios;

    UI.openModal(`
      <div class="modal-header">
        <h3>${isEdit ? 'Editar cita' : 'Nueva cita'}</h3>
        <button class="modal-close" onclick="UI.closeModal()">&times;</button>
      </div>
      <form id="form-cita">
        <div class="field" style="position:relative;">
          <label>Cliente</label>
          <input type="text" id="ci-cliente-nombre" autocomplete="off" required
                 value="${cita?.clienteNombre || ''}" placeholder="Escribe para buscar o crear…" />
          <input type="hidden" id="ci-cliente-id" value="${cita?.clienteId || ''}" />
          <div class="autocomplete-list" id="ci-autocomplete" style="display:none;"></div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Fecha</label>
            <input type="date" id="ci-fecha" required value="${cita?.fecha || STATE.selectedDate}" />
          </div>
          <div class="field">
            <label>Hora</label>
            <input type="time" id="ci-hora" required value="${cita?.hora || '10:00'}" />
          </div>
        </div>
        <div class="field">
          <label>Servicio</label>
          <div class="chip-row" id="ci-servicios">
            ${servicios.map(s => `<div class="chip" data-id="${s.id}" data-nombre="${s.nombre}" data-precio="${s.precio}">${s.nombre} · ${UI.euros(s.precio)}</div>`).join('') || '<span style="color:var(--text-faint); font-size:13px;">Añade servicios en Ajustes</span>'}
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Servicio (texto libre)</label>
            <input type="text" id="ci-servicio-nombre" value="${cita?.servicioNombre || ''}" placeholder="Ej. Corte + barba" />
          </div>
          <div class="field">
            <label>Precio (€)</label>
            <input type="number" step="0.5" min="0" id="ci-coste" value="${cita?.coste ?? ''}" placeholder="0" />
          </div>
        </div>
        <div class="field">
          <label>Notas</label>
          <textarea id="ci-notas" rows="2" placeholder="Opcional">${cita?.notas || ''}</textarea>
        </div>
        ${isEdit ? `
        <div class="field">
          <label>Estado</label>
          <div class="chip-row" id="ci-estado">
            <div class="chip ${cita.estado === 'pendiente' ? 'selected' : ''}" data-estado="pendiente">Pendiente</div>
            <div class="chip ${cita.estado === 'completada' ? 'selected' : ''}" data-estado="completada">Hecha</div>
            <div class="chip ${cita.estado === 'cancelada' ? 'selected' : ''}" data-estado="cancelada">Cancelada</div>
          </div>
        </div>` : ''}
        <div class="modal-actions">
          ${isEdit ? `<button type="button" class="btn-danger" id="ci-eliminar">Eliminar</button>` : ''}
          <button type="submit" class="btn-gold">${isEdit ? 'Guardar cambios' : 'Crear cita'}</button>
        </div>
      </form>
    `);

    let estadoSeleccionado = cita?.estado || 'pendiente';

    // chips de servicio predefinido
    document.querySelectorAll('#ci-servicios .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.getElementById('ci-servicio-nombre').value = chip.dataset.nombre;
        document.getElementById('ci-coste').value = chip.dataset.precio;
        document.querySelectorAll('#ci-servicios .chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
      });
    });

    // chips de estado (solo edición)
    if (isEdit) {
      document.querySelectorAll('#ci-estado .chip').forEach(chip => {
        chip.addEventListener('click', () => {
          estadoSeleccionado = chip.dataset.estado;
          document.querySelectorAll('#ci-estado .chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
        });
      });
    }

    // autocompletar cliente
    const inputNombre = document.getElementById('ci-cliente-nombre');
    const inputId = document.getElementById('ci-cliente-id');
    const autoList = document.getElementById('ci-autocomplete');
    inputNombre.addEventListener('input', () => {
      inputId.value = '';
      const term = inputNombre.value.trim().toLowerCase();
      if (!term) { autoList.style.display = 'none'; return; }
      const matches = STATE.clientes.filter(c => c.nombre.toLowerCase().includes(term)).slice(0, 6);
      if (matches.length === 0) {
        autoList.innerHTML = `<div class="autocomplete-item" style="color:var(--text-faint);">Cliente nuevo — se creará al guardar</div>`;
        autoList.style.display = 'block';
        return;
      }
      autoList.innerHTML = matches.map(c => `<div class="autocomplete-item" data-id="${c.id}" data-nombre="${c.nombre}">${c.nombre}</div>`).join('');
      autoList.style.display = 'block';
      autoList.querySelectorAll('.autocomplete-item[data-id]').forEach(item => {
        item.addEventListener('click', () => {
          inputNombre.value = item.dataset.nombre;
          inputId.value = item.dataset.id;
          autoList.style.display = 'none';
        });
      });
    });
    
    document.addEventListener('click', (e) => {
      if (!autoList.contains(e.target) && e.target !== inputNombre) autoList.style.display = 'none';
    }, { once: true });

    document.getElementById('form-cita').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Desactivamos el botón de submit para prevenir clicks duplicados accidentales
      const submitBtn = e.target.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      let clienteId = inputId.value;
      const clienteNombre = inputNombre.value.trim();
      
      // 1. Manejo secuencial estricto si el cliente es nuevo
      if (!clienteId) {
        const existente = STATE.clientes.find(c => c.nombre.toLowerCase() === clienteNombre.toLowerCase());
        if (existente) {
          clienteId = existente.id;
        } else {
          try {
            console.log("Registrando cliente nuevo antes de la cita...");
            // Esperamos a Firebase para obtener el ID real
            clienteId = await DB.add('clientes', { nombre: clienteNombre, telefono: '', notas: '' });
            
            // Metemos el cliente en el array local inmediatamente para sincronizar flujos asíncronos
            STATE.clientes.push({ id: clienteId, nombre: clienteNombre, telefono: '', notas: '' });
          } catch (err) {
            console.error("Error al registrar el cliente nuevo:", err);
            UI.toast('Error al crear el cliente');
            if (submitBtn) submitBtn.disabled = false;
            return;
          }
        }
      }

      // 2. Construcción limpia del objeto de datos
      const data = {
        clienteId,
        clienteNombre,
        fecha: document.getElementById('ci-fecha').value,
        hora: document.getElementById('ci-hora').value,
        servicioNombre: document.getElementById('ci-servicio-nombre').value.trim() || 'Corte',
        coste: parseFloat(document.getElementById('ci-coste').value) || 0,
        notas: document.getElementById('ci-notas').value.trim(),
        estado: estadoSeleccionado
      };

      // 3. Persistencia en la base de datos Firestore
      try {
        if (isEdit) {
          await DB.update('citas', cita.id, data);
          UI.toast('Cita actualizada');
        } else {
          await DB.add('citas', data);
          UI.toast('Cita creada');
        }
        
        // 4. Cerramos el modal de la interfaz
        UI.closeModal();

        // 5. Renderizado limpio e inmediato de la vista actual
        if (typeof Citas !== 'undefined' && Citas.render) {
          Citas.render(); 
        }
      } catch (err) {
        console.error("Error al procesar la cita:", err);
        UI.toast('Error al guardar la cita');
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    if (isEdit) {
      document.getElementById('ci-eliminar').addEventListener('click', async () => {
        if (!confirm('¿Eliminar esta cita?')) return;
        await DB.remove('citas', cita.id);
        UI.toast('Cita eliminada');
        UI.closeModal();
      });
    }
  },

  openDetail(id) {
    const cita = STATE.citas.find(c => c.id === id);
    if (cita) this.openForm(cita);
  }
};

document.getElementById('btn-nueva-cita').addEventListener('click', () => Citas.openForm());
document.getElementById('prev-day').addEventListener('click', () => Citas.changeDay(-1));
document.getElementById('next-day').addEventListener('click', () => Citas.changeDay(1));

