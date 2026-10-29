export function initNavigation() {
  const mainMenu = document.getElementById('main-menu');
  const gameScreen = document.getElementById('game-screen');
  const btnBack = document.getElementById('btn-back');
  const tabSlider = document.getElementById('tab-slider');
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const headerTitle = document.getElementById('header-title');

  let currentTabIndex = 1; // "Buscar" es el índice 1
  if (tabSlider) {
    tabSlider.style.transform = `translateX(-33.33333%)`;
  }

  // Desplazamiento por pestañas
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const tabIndex = parseInt(item.getAttribute('data-tab'));
      if (tabIndex === currentTabIndex) return;

      navItems.forEach((nav) => nav.classList.remove('active'));
      item.classList.add('active');

      const offsetPercentage = tabIndex * -33.33333;
      tabSlider.style.transform = `translateX(${offsetPercentage}%)`;

      currentTabIndex = tabIndex;
      if (headerTitle) {
        headerTitle.textContent = item.getAttribute('data-title');
      }
    });
  });

  // Cambiar entre Menú y Lienzo de Juego
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.play-trigger');
    if (trigger) {
      mainMenu.classList.remove('active');
      gameScreen.classList.add('active');
    }
  });

  if (btnBack) {
    btnBack.addEventListener('click', () => {
      gameScreen.classList.remove('active');
      mainMenu.classList.add('active');
    });
  }
}