/**
 * security.js - Bloqueo de Capturas y Grabadores de Pantalla
 */
(function () {
  const securityCurtain = document.getElementById('security-curtain');

  function showBlockscreen() {
    if (securityCurtain) securityCurtain.classList.add('active');
  }

  function hideBlockscreen() {
    if (securityCurtain) securityCurtain.classList.remove('active');
  }

  window.addEventListener('blur', showBlockscreen);
  window.addEventListener('focus', () => setTimeout(hideBlockscreen, 300));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) showBlockscreen();
    else setTimeout(hideBlockscreen, 300);
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
      showBlockscreen();
      if (navigator.clipboard) navigator.clipboard.writeText('');
      alert('La captura de pantalla está restringida para proteger los datos de este registro.');
      setTimeout(hideBlockscreen, 1200);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'PrintScreen') {
      showBlockscreen();
      return false;
    }
    if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
      e.preventDefault();
      showBlockscreen();
      setTimeout(hideBlockscreen, 1500);
      return false;
    }
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
      showBlockscreen();
    }
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
      (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))
    ) {
      e.preventDefault();
      return false;
    }
  });

  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('dragstart', (e) => e.preventDefault());
})();