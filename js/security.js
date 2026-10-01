/**
 * Security & Anti-Capture Layer (Blockscreen)
 * Protecciones implementadas:
 * 1. Detección de pérdida de foco / cambio de pestaña (blur/visibilitychange)
 * 2. Intercepción de teclas de captura (PrintScreen, Win+Shift+S, Cmd+Shift+3/4/5)
 * 3. Bloqueo de menú contextual (clic derecho)
 * 4. Bloqueo de inspección (F12, Ctrl+Shift+I, Cmd+Option+I)
 * 5. Prevención de arrastre de contenido
 */

(function () {
  const securityCurtain = document.getElementById('security-curtain');
  let blurTimeout = null;

  function showBlockscreen() {
    if (securityCurtain) {
      securityCurtain.classList.add('active');
    }
  }

  function hideBlockscreen() {
    if (securityCurtain) {
      securityCurtain.classList.remove('active');
    }
  }

  // 1. Detección cuando la ventana pierde el foco (típico al abrir software de captura externo)
  window.addEventListener('blur', () => {
    showBlockscreen();
  });

  window.addEventListener('focus', () => {
    // Al retomar foco, retirar la cortina tras breve retraso
    setTimeout(hideBlockscreen, 300);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      showBlockscreen();
    } else {
      setTimeout(hideBlockscreen, 300);
    }
  });

  // 2. Intercepción de teclas de captura e inspección
  window.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
      showBlockscreen();
      navigator.clipboard.writeText(''); // Limpia el portapapeles
      alert('Las capturas de pantalla están restringidas para proteger los datos de esta convocatoria.');
      setTimeout(hideBlockscreen, 1200);
    }
  });

  window.addEventListener('keydown', (e) => {
    // PrintScreen
    if (e.key === 'PrintScreen') {
      showBlockscreen();
      return false;
    }

    // Mac Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
    if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
      e.preventDefault();
      showBlockscreen();
      setTimeout(hideBlockscreen, 1500);
      return false;
    }

    // Windows Snipping Tool: Win + Shift + S
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
      showBlockscreen();
    }

    // Bloqueo de Developer Tools (F12, Ctrl+Shift+I, Ctrl+Shift+J, Cmd+Option+I)
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
      (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))
    ) {
      e.preventDefault();
      return false;
    }
  });

  // 3. Bloquear clic derecho para evitar guardar imagen / inspeccionar
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // 4. Prevenir arrastre de elementos
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
  });
})();
