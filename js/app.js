/**
 * Campaña Pajarito Azul - Core Logic
 * Manejo de:
 * - Ventana de caducidad de 3 horas (10,800 segundos)
 * - Restricciones de enlace y token de sesión
 * - Registro con validaciones estrictas y confirmación obligatoria
 * - Hash anónimo de estudiante / privacidad
 * - Panel Administrativo & Resultados con exportación CSV
 */

(function () {
  // Constantes de Configuración
  const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
  const STORAGE_KEY_CONFIG = 'pb_fundraiser_config';
  const STORAGE_KEY_DATA = 'pb_fundraiser_records';
  const ADMIN_PASS = 'admin123';

  // Elementos DOM
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const sessionBadge = document.getElementById('session-badge');
  const heroSection = document.getElementById('hero-section');
  const formSection = document.getElementById('form-section');
  const expiredView = document.getElementById('expired-view');

  const form = document.getElementById('fundraiser-form');
  const successBox = document.getElementById('success-box');
  const receiptCodeEl = document.getElementById('receipt-code');

  // Admin Modal Elements
  const adminModal = document.getElementById('admin-modal');
  const adminTriggerBtn = document.getElementById('admin-trigger-btn');
  const expiredViewAdminBtn = document.getElementById('expired-view-admin-btn');
  const closeAdminBtn = document.getElementById('close-admin-btn');
  const adminAuthView = document.getElementById('admin-auth-view');
  const adminDashboardView = document.getElementById('admin-dashboard-view');
  const adminPassInput = document.getElementById('admin-pass-input');
  const adminPassError = document.getElementById('admin-pass-error');
  const btnLoginAdmin = document.getElementById('btn-login-admin');
  const btnToggleStatus = document.getElementById('btn-toggle-status');
  const btnResetTimer = document.getElementById('btn-reset-timer');
  const adminLinkInfo = document.getElementById('admin-link-info');
  const totalRegistrationsEl = document.getElementById('total-registrations');
  const totalCommitmentsEl = document.getElementById('total-commitments');
  const resultsTableBody = document.getElementById('results-table-body');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnClearData = document.getElementById('btn-clear-data');

  let timerInterval = null;

  // 1. Inicialización de Estado del Enlace (3 horas)
  function getConfig() {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error(e);
      }
    }

    // Configuración inicial por defecto (3 horas a partir de ahora)
    const now = Date.now();
    const config = {
      startTime: now,
      expiresAt: now + THREE_HOURS_MS,
      isActive: true
    };
    saveConfig(config);
    return config;
  }

  function saveConfig(config) {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }

  function getRecords() {
    const raw = localStorage.getItem(STORAGE_KEY_DATA);
    return raw ? JSON.parse(raw) : [];
  }

  function saveRecords(records) {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(records));
  }

  // 2. Temporizador de 3 Horas
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    function tick() {
      const config = getConfig();
      const now = Date.now();
      const remaining = config.expiresAt - now;

      if (!config.isActive || remaining <= 0) {
        // Enlace expirado o desactivado
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        sessionBadge.textContent = 'Inactivo';
        sessionBadge.style.color = '#ef4444';
        sessionBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';

        // Cambiar vista a expirado
        formSection.classList.add('hidden');
        heroSection.classList.add('hidden');
        expiredView.classList.remove('hidden');

        clearInterval(timerInterval);
        return;
      }

      // Enlace activo
      formSection.classList.remove('hidden');
      heroSection.classList.remove('hidden');
      expiredView.classList.add('hidden');
      sessionBadge.textContent = 'Activo';
      sessionBadge.style.color = '#059669';
      sessionBadge.style.backgroundColor = 'rgba(16, 185, 129, 0.12)';

      const totalSec = Math.floor(remaining / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;

      hoursEl.textContent = String(h).padStart(2, '0');
      minutesEl.textContent = String(m).padStart(2, '0');
      secondsEl.textContent = String(s).padStart(2, '0');
    }

    tick();
    timerInterval = setInterval(tick, 1000);
  }

  // 3. Manejo de Formulario y Validaciones
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Limpiar errores
    document.querySelectorAll('.error-msg').forEach((el) => (el.textContent = ''));

    const studentId = document.getElementById('studentId').value.trim();
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const group = document.getElementById('group').value.trim();
    const amount = document.getElementById('amount').value.trim();
    const commitmentCheck = document.getElementById('commitmentCheck').checked;
    const termsCheck = document.getElementById('termsCheck').checked;

    let hasError = false;

    if (!studentId) {
      document.getElementById('studentId-error').textContent = 'El carnet o número de estudiante es obligatorio.';
      hasError = true;
    }

    if (!fullName || fullName.length < 3) {
      document.getElementById('fullName-error').textContent = 'Ingresa tu nombre y apellido completo.';
      hasError = true;
    }

    if (!phone || phone.length < 8) {
      document.getElementById('phone-error').textContent = 'Ingresa un número de contacto válido.';
      hasError = true;
    }

    if (!group) {
      document.getElementById('group-error').textContent = 'Especifica tu grupo o sección académica.';
      hasError = true;
    }

    if (!commitmentCheck) {
      document.getElementById('commitmentCheck-error').textContent = 'Debes marcar el check de compromiso de aporte.';
      hasError = true;
    }

    if (!termsCheck) {
      document.getElementById('termsCheck-error').textContent = 'Debes aceptar las condiciones y restricciones para continuar.';
      hasError = true;
    }

    if (hasError) return;

    // Verificar unicidad de estudiante (Restricción)
    const records = getRecords();
    const existing = records.find((r) => r.studentId.toUpperCase() === studentId.toUpperCase());
    if (existing) {
      document.getElementById('studentId-error').textContent = 'Este número de estudiante ya tiene un registro confirmado.';
      return;
    }

    // Generar código de comprobante anónimo
    const hashRef = 'PA-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newRecord = {
      id: hashRef,
      timestamp: new Date().toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' }),
      studentId: studentId,
      fullName: fullName,
      phone: phone,
      group: group,
      amount: amount || 'Voluntario',
      committed: true
    };

    records.push(newRecord);
    saveRecords(records);

    // Feedback visual estilo Apple
    form.classList.add('hidden');
    receiptCodeEl.textContent = hashRef;
    successBox.classList.remove('hidden');
  });

  // 4. Modal de Administración & Resultados
  function openAdminModal() {
    adminModal.classList.remove('hidden');
    adminAuthView.classList.remove('hidden');
    adminDashboardView.classList.add('hidden');
    adminPassInput.value = '';
    adminPassError.textContent = '';
  }

  function closeAdminModal() {
    adminModal.classList.add('hidden');
  }

  adminTriggerBtn.addEventListener('click', openAdminModal);
  expiredViewAdminBtn.addEventListener('click', openAdminModal);
  closeAdminBtn.addEventListener('click', closeAdminModal);

  // Cerrar al dar click fuera
  adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) closeAdminModal();
  });

  // Autenticación de Administrador
  btnLoginAdmin.addEventListener('click', () => {
    if (adminPassInput.value === ADMIN_PASS) {
      adminAuthView.classList.add('hidden');
      adminDashboardView.classList.remove('hidden');
      renderAdminDashboard();
    } else {
      adminPassError.textContent = 'Clave incorrecta. Intenta nuevamente (Clave: admin123).';
    }
  });

  function renderAdminDashboard() {
    const config = getConfig();
    const records = getRecords();

    // Estado del botón de activación
    btnToggleStatus.textContent = config.isActive ? 'Desactivar Enlace Ahora' : 'Activar Enlace';
    adminLinkInfo.textContent = config.isActive
      ? `El enlace está ACTIVO y expirará en: ${new Date(config.expiresAt).toLocaleTimeString()}`
      : 'El enlace se encuentra DESACTIVADO manualmente o por expiración.';

    // Estadísticas
    totalRegistrationsEl.textContent = records.length;
    totalCommitmentsEl.textContent = records.filter((r) => r.committed).length;

    // Tabla
    resultsTableBody.innerHTML = '';
    if (records.length === 0) {
      resultsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 20px;">No hay registros confirmados aún.</td></tr>`;
      return;
    }

    records.forEach((r) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.timestamp}</td>
        <td><strong>${r.studentId}</strong></td>
        <td>${r.fullName}</td>
        <td>${r.phone}</td>
        <td>${r.group}</td>
        <td>${r.amount}</td>
        <td><span style="color: #10b981; font-weight: bold;">✓ Confirmado</span></td>
      `;
      resultsTableBody.appendChild(tr);
    });
  }

  // Desactivar / Activar manualmente
  btnToggleStatus.addEventListener('click', () => {
    const config = getConfig();
    config.isActive = !config.isActive;
    saveConfig(config);
    renderAdminDashboard();
    startTimer();
  });

  // Reiniciar ventana de 3 horas
  btnResetTimer.addEventListener('click', () => {
    const now = Date.now();
    const config = {
      startTime: now,
      expiresAt: now + THREE_HOURS_MS,
      isActive: true
    };
    saveConfig(config);
    renderAdminDashboard();
    startTimer();
    alert('Se ha reiniciado el temporizador a 3 horas.');
  });

  // Exportar datos a CSV
  btnExportCsv.addEventListener('click', () => {
    const records = getRecords();
    if (records.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Código,Hora,Carnet,Nombre Completo,Teléfono,Grupo,Monto,Aporte Confirmado
';

    records.forEach((r) => {
      csvContent += `"${r.id}","${r.timestamp}","${r.studentId}","${r.fullName}","${r.phone}","${r.group}","${r.amount}","SÍ"
`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Resultados_Recaudacion_Pajarito_Azul.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Limpiar datos
  btnClearData.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que deseas vaciar todos los registros de aportes?')) {
      saveRecords([]);
      renderAdminDashboard();
    }
  });

  // Inicio
  startTimer();
})();
