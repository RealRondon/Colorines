const TAB_WIDTH = 100 / 3; // el slider tiene 3 pestañas

export function initUI(onPlayCallback) {
  const mainMenu = document.getElementById('main-menu');
  const gameScreen = document.getElementById('game-screen');
  const tabSlider = document.getElementById('tab-slider');
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const headerTitle = document.getElementById('header-title');

  let currentTabIndex = 1;
  if (tabSlider) tabSlider.style.transform = `translateX(${-TAB_WIDTH}%)`;

  // Navegación del carrusel inferior
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const tabIndex = Number(item.dataset.tab);
      if (!tabSlider || Number.isNaN(tabIndex) || tabIndex === currentTabIndex) return;

      navItems.forEach((nav) => nav.classList.remove('active'));
      item.classList.add('active');
      tabSlider.style.transform = `translateX(${-tabIndex * TAB_WIDTH}%)`;
      currentTabIndex = tabIndex;
      if (headerTitle && item.dataset.title) headerTitle.textContent = item.dataset.title;
    });
  });

  // Delegación de clics: abrir dibujo / volver al menú
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.play-trigger');
    if (trigger) {
      const drawingId = Number(trigger.dataset.id);
      mainMenu?.classList.remove('active');
      gameScreen?.classList.add('active'); // primero visible, luego carga
      if (!Number.isNaN(drawingId)) onPlayCallback?.(drawingId);
      return;
    }

    if (e.target.closest('#btn-back')) {
      gameScreen?.classList.remove('active');
      mainMenu?.classList.add('active');
    }
  });
}
