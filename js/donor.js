/**
 * donor.js - Lógica del Portal del Donante
 */
(function () {
  const STORAGE_KEY_CONFIG = 'fundraiser_config_state';
  const STORAGE_KEY_RECORDS = 'fundraiser_donor_records';

  const heroSection = document.getElementById('hero-section');
  const formSection = document.getElementById('form-section');
  const expiredView = document.getElementById('expired-view');
  const sessionBadge = document.getElementById('session-badge');
  const sessionDot = document.getElementById('session-dot');

  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  const form = document.getElementById('fundraiser-form');
  const successBox = document.getElementById('success-box');
  const receiptCodeEl = document.getElementById('receipt-code');

  function checkLinkStatus() {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    let config = raw ? JSON.parse(raw) : null;

    if (!config) {
      const now = Date.now();
      config = { isActive: true, expiresAt: now + (3 * 60 * 60 * 1000) };
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    }

    const remaining = config.expiresAt - Date.now();

    if (!config.isActive || remaining <= 0) {
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      sessionBadge.textContent = 'Convocatoria Cerrada';
      sessionBadge.style.color = '#ef4444';
      sessionBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
      if (sessionDot) sessionDot.style.backgroundColor = '#ef4444';

      heroSection.classList.add('hidden');
      formSection.classList.add('hidden');
      expiredView.classList.remove('hidden');
    } else {
      heroSection.classList.remove('hidden');
      formSection.classList.remove('hidden');
      expiredView.classList.add('hidden');
      sessionBadge.textContent = 'Convocatoria Activa';
      sessionBadge.style.color = '#248a3d';
      sessionBadge.style.backgroundColor = 'rgba(52, 199, 89, 0.12)';
      if (sessionDot) sessionDot.style.backgroundColor = '#34c759';

      const sec = Math.floor(remaining / 1000);
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;

      hoursEl.textContent = String(h).padStart(2, '0');
      minutesEl.textContent = String(m).padStart(2, '0');
      secondsEl.textContent = String(s).padStart(2, '0');
    }
  }

  setInterval(checkLinkStatus, 1000);
  checkLinkStatus();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
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
      document.getElementById('studentId-error').textContent = 'El carnet o ID de estudiante es obligatorio.';
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
    if (!amount) {
      document.getElementById('amount-error').textContent = 'Ingresa el monto estimado de tu aporte.';
      hasError = true;
    }
    if (!commitmentCheck) {
      document.getElementById('commitmentCheck-error').textContent = 'Debes marcar el check de compromiso de aporte.';
      hasError = true;
    }
    if (!termsCheck) {
      document.getElementById('termsCheck-error').textContent = 'Debes aceptar las condiciones para continuar.';
      hasError = true;
    }

    if (hasError) return;

    const rawRecords = localStorage.getItem(STORAGE_KEY_RECORDS);
    const records = rawRecords ? JSON.parse(rawRecords) : [];
    const exists = records.find((r) => r.studentId.toUpperCase() === studentId.toUpperCase());
    if (exists) {
      document.getElementById('studentId-error').textContent = 'Este número de carnet ya tiene una inscripción confirmada.';
      return;
    }

    const code = 'REC-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const timestamp = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord = {
      code: code,
      timestamp: timestamp,
      studentId: studentId,
      fullName: fullName,
      phone: phone,
      group: group,
      amount: amount,
      status: 'Pendiente',
      deliveredAmount: '',
      notes: ''
    };

    records.push(newRecord);
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));

    const webhookUrl = localStorage.getItem('fundraiser_sheets_webhook');
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      }).catch((err) => console.log('Apps Script:', err));
    }

    form.classList.add('hidden');
    receiptCodeEl.textContent = code;
    successBox.classList.remove('hidden');
  });
})();