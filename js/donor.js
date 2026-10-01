/**
 * donor.js - Participante con conexión centralizada
 */
(function () {
  const STORAGE_KEY_CONFIG = 'fundraiser_config_state';
  const STORAGE_KEY_RECORDS = 'fundraiser_donor_records';

  // 👉 PEGA AQUÍ TU URL DE GOOGLE APPS SCRIPT (Terminada en /exec):
  const FIXED_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzw5kHWwnNmvW9AnmDfV0jGgs3Zz0QvI70Q5Y4cAVJZ2s-gQxm0udUEij-XTwcHk6US/exec'; 

  
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

  function checkStatus() {
    const rawConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    let config = rawConfig ? JSON.parse(rawConfig) : null;

    if (!config) {
      config = { masterActive: true, expiresAt: Date.now() + (3 * 3600 * 1000) };
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    }

    const rem = config.expiresAt - Date.now();

    if (config.masterActive === false || rem <= 0) {
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

      const sec = Math.floor(rem / 1000);
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;

      hoursEl.textContent = String(h).padStart(2, '0');
      minutesEl.textContent = String(m).padStart(2, '0');
      secondsEl.textContent = String(s).padStart(2, '0');
    }
  }

  setInterval(checkStatus, 1000);
  checkStatus();

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
    if (!studentId) { document.getElementById('studentId-error').textContent = 'Carnet obligatorio.'; hasError = true; }
    if (!fullName || fullName.length < 3) { document.getElementById('fullName-error').textContent = 'Nombre completo requerido.'; hasError = true; }
    if (!phone || phone.length < 8) { document.getElementById('phone-error').textContent = 'Teléfono válido requerido.'; hasError = true; }
    if (!group) { document.getElementById('group-error').textContent = 'Grupo requerido.'; hasError = true; }
    if (!amount) { document.getElementById('amount-error').textContent = 'Monto estimado requerido.'; hasError = true; }
    if (!commitmentCheck) { document.getElementById('commitmentCheck-error').textContent = 'Debes confirmar tu compromiso.'; hasError = true; }
    if (!termsCheck) { document.getElementById('termsCheck-error').textContent = 'Debes aceptar las condiciones.'; hasError = true; }

    if (hasError) return;

    const rawRecs = localStorage.getItem(STORAGE_KEY_RECORDS);
    const records = rawRecs ? JSON.parse(rawRecs) : [];
    if (records.find((r) => r.studentId.toUpperCase() === studentId.toUpperCase())) {
      document.getElementById('studentId-error').textContent = 'Este carnet ya tiene un registro confirmado.';
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

    const webhookUrl = FIXED_WEBHOOK_URL || localStorage.getItem('fundraiser_sheets_webhook');
    if (webhookUrl && webhookUrl.startsWith('http')) {
      fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      }).catch((err) => console.log('Apps Script Webhook Error:', err));
    }

    form.classList.add('hidden');
    receiptCodeEl.textContent = code;
    successBox.classList.remove('hidden');
  });
})();