export function initUI(onPlayCallback) {
  const mainMenu = document.getElementById('main-menu');
  const gameScreen = document.getElementById('game-screen');
  const tabSlider = document.getElementById('tab-slider');
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const headerTitle = document.getElementById('header-title');

  // Inicializar slider
  let currentTabIndex = 1;
  if (tabSlider) {
    tabSlider.style.transform = 'translateX(-33.33333%)';
  }

  // Navegación del carrusel inferior
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const tabIndex = parseInt(item.getAttribute('data-tab'));
      if (tabIndex === currentTabIndex) return;

      navItems.forEach((nav) => nav.classList.remove('active'));
      item.classList.add('active');

      const offsetPercentage = tabIndex * -33.33333;
      tabSlider.style.transform = `translateX(${offsetPercentage}%)`;

      currentTabIndex = tabIndex;
      if (headerTitle) headerTitle.textContent = item.getAttribute('data-title');
    });
  });

  // Delegación de clics para cambiar de pantalla
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.play-trigger');
    if (trigger) {
      const drawingId = parseInt(trigger.getAttribute('data-id'));
      console.log(`\n🖱️ Clic detectado en dibujo ID: ${drawingId}`);

      if (typeof onPlayCallback === 'function') {
        onPlayCallback(drawingId);
      }

      if (mainMenu) mainMenu.classList.remove('active');
      if (gameScreen) gameScreen.classList.add('active');
      return;
    }

    const backBtn = e.target.closest('#btn-back');
    if (backBtn) {
      console.log("⬅️ Volviendo al menú principal.");
      if (gameScreen) gameScreen.classList.remove('active');
      if (mainMenu) mainMenu.classList.add('active');
    }
  });
}