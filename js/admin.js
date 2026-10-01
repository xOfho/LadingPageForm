/**
 * admin.js - Panel del Administrador
 */
(function () {
  const STORAGE_KEY_CONFIG = 'fundraiser_config_state';
  const STORAGE_KEY_RECORDS = 'fundraiser_donor_records';
  const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

  const adminTimeDisplay = document.getElementById('admin-time-display');
  const btnStart3h = document.getElementById('btn-start-3h');
  const btnToggleLink = document.getElementById('btn-toggle-link');
  const btnCopyLink = document.getElementById('btn-copy-link');
  const linkStateMsg = document.getElementById('link-state-msg');

  const donorSearch = document.getElementById('donor-search');
  const filterStatus = document.getElementById('filter-status');
  const adminTableBody = document.getElementById('admin-table-body');

  const statTotal = document.getElementById('stat-total');
  const statDelivered = document.getElementById('stat-delivered');
  const statPending = document.getElementById('stat-pending');

  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnClearDb = document.getElementById('btn-clear-db');
  const btnConfigureWebhook = document.getElementById('btn-configure-webhook');

  function getConfig() {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) return JSON.parse(raw);
    const now = Date.now();
    const config = { isActive: true, expiresAt: now + THREE_HOURS_MS };
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    return config;
  }

  function getRecords() {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    return raw ? JSON.parse(raw) : [];
  }

  function saveRecords(records) {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  }

  function updateAdminTimer() {
    const config = getConfig();
    const remaining = config.expiresAt - Date.now();

    if (!config.isActive || remaining <= 0) {
      adminTimeDisplay.textContent = '00:00:00 (Inactivo)';
      btnToggleLink.textContent = '▶️ Activar Enlace';
      linkStateMsg.textContent = '❌ El enlace para los participantes se encuentra CERRADO.';
      linkStateMsg.style.color = '#ef4444';
    } else {
      const sec = Math.floor(remaining / 1000);
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      adminTimeDisplay.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      btnToggleLink.textContent = '⏸️ Pausar / Desactivar Enlace';
      linkStateMsg.textContent = `✅ El enlace está ACTIVO y expirará a las: ${new Date(config.expiresAt).toLocaleTimeString()}`;
      linkStateMsg.style.color = '#15803d';
    }
  }

  setInterval(updateAdminTimer, 1000);
  updateAdminTimer();

  btnStart3h.addEventListener('click', () => {
    const now = Date.now();
    const config = { isActive: true, expiresAt: now + THREE_HOURS_MS };
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    updateAdminTimer();
    alert('Se ha iniciado la ventana de 3 horas.');
  });

  btnToggleLink.addEventListener('click', () => {
    const config = getConfig();
    config.isActive = !config.isActive;
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    updateAdminTimer();
  });

  btnCopyLink.addEventListener('click', () => {
    const donorUrl = window.location.href.replace('admin.html', 'index.html');
    navigator.clipboard.writeText(donorUrl);
    alert('Enlace de participantes copiado:\n' + donorUrl);
  });

  function renderTable() {
    const records = getRecords();
    const query = donorSearch.value.trim().toLowerCase();
    const filter = filterStatus.value;

    let filtered = records.filter((r) => {
      const matchQuery =
        r.studentId.toLowerCase().includes(query) ||
        r.fullName.toLowerCase().includes(query) ||
        r.phone.toLowerCase().includes(query) ||
        r.code.toLowerCase().includes(query) ||
        r.group.toLowerCase().includes(query);

      const matchFilter = filter === 'ALL' || r.status === filter;
      return matchQuery && matchFilter;
    });

    statTotal.textContent = records.length;
    statDelivered.textContent = records.filter((r) => r.status === 'Entregado').length;
    statPending.textContent = records.filter((r) => r.status === 'Pendiente').length;

    adminTableBody.innerHTML = '';

    if (filtered.length === 0) {
      adminTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #94a3b8; padding: 24px;">No se encontraron registros que coincidan con la búsqueda.</td></tr>`;
      return;
    }

    filtered.forEach((r) => {
      const isDelivered = r.status === 'Entregado';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${r.code}</strong></td>
        <td>${r.studentId}</td>
        <td>${r.fullName}</td>
        <td>${r.phone}</td>
        <td>${r.group}</td>
        <td>${r.amount}</td>
        <td><span class="status-chip ${isDelivered ? 'entregado' : 'pendiente'}">${r.status}</span></td>
        <td>
          <input type="text" id="delivered-val-${r.code}" value="${r.deliveredAmount || ''}" placeholder="Ej: C$ 100" style="width: 100px; padding: 6px 10px; font-size: 13px;" />
        </td>
        <td>
          <button class="pill-btn ${isDelivered ? 'secondary-btn' : 'primary-btn'}" onclick="window.toggleDeliverStatus('${r.code}')" style="padding: 6px 14px; font-size: 12px;">
            ${isDelivered ? 'Marcar Pendiente' : '✓ Confirmar Entrega'}
          </button>
        </td>
      `;
      adminTableBody.appendChild(tr);
    });
  }

  window.toggleDeliverStatus = function (code) {
    const records = getRecords();
    const item = records.find((r) => r.code === code);
    if (!item) return;

    const inputVal = document.getElementById(`delivered-val-${code}`).value.trim();

    if (item.status === 'Pendiente') {
      item.status = 'Entregado';
      item.deliveredAmount = inputVal || item.amount;
    } else {
      item.status = 'Pendiente';
      item.deliveredAmount = '';
    }

    saveRecords(records);
    renderTable();
  };

  donorSearch.addEventListener('input', renderTable);
  filterStatus.addEventListener('change', renderTable);

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY_RECORDS || e.key === STORAGE_KEY_CONFIG) {
      renderTable();
      updateAdminTimer();
    }
  });

  btnExportCsv.addEventListener('click', () => {
    const records = getRecords();
    if (records.length === 0) return alert('No hay datos registrados aún.');

    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'Codigo,Fecha,Carnet,Nombre Completo,Telefono,Grupo,Monto Estimado,Estado,Monto Recibido Real\n';
    records.forEach((r) => {
      csv += `"${r.code}","${r.timestamp}","${r.studentId}","${r.fullName}","${r.phone}","${r.group}","${r.amount}","${r.status}","${r.deliveredAmount || ''}"\n`;
    });

    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.href = uri;
    link.download = 'Recaudacion_Solidaria_Verificacion.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  btnClearDb.addEventListener('click', () => {
    if (confirm('¿Deseas vaciar la lista de participantes guardada localmente?')) {
      saveRecords([]);
      renderTable();
    }
  });

  btnConfigureWebhook.addEventListener('click', () => {
    const current = localStorage.getItem('fundraiser_sheets_webhook') || '';
    const url = prompt('Ingresa la URL del Web App de Google Apps Script:', current);
    if (url !== null) {
      localStorage.setItem('fundraiser_sheets_webhook', url.trim());
      alert('Configuración de webhook guardada.');
    }
  });

  renderTable();
})();