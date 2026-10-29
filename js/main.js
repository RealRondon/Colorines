// js/main.js

window.addEventListener('load', () => {
  const mainMenu = document.getElementById('main-menu');
  const gameScreen = document.getElementById('game-screen');
  const tabSlider = document.getElementById('tab-slider');
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const headerTitle = document.getElementById('header-title');
  const searchGrid = document.getElementById('search-grid');

  // 1. GENERAR EL GRID DE 30 CUADRADOS (Llama a la función de drawings.js)
  if (typeof renderSearchGrid === 'function' && searchGrid) {
    renderSearchGrid(searchGrid, 30);
  }

  // 2. POSICIÓN INICIAL EN LA PESTAÑA "BUSCAR" (Índice 1)
  let currentTabIndex = 1;
  if (tabSlider) {
    tabSlider.style.transform = 'translateX(-33.33333%)';
  }

  // 3. NAVEGACIÓN Y CAMBIO DE PESTAÑAS (CARRUSEL)
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

  // 4. ABRIR EL LIENZO, CARGAR EL SVG Y GESTIONAR EL BOTÓN DE VOLVER
  document.addEventListener('click', async (e) => {
    // A) Al tocar cualquier tarjeta con la clase .play-trigger
    const trigger = e.target.closest('.play-trigger');
    if (trigger) {
      const canvasContainer = document.getElementById('canvas-container');

      try {
        const response = await fetch('imgs/dibujo1.svg');
        if (!response.ok) throw new Error('No se encontró el SVG en imgs/');

        const svgText = await response.text();
        if (canvasContainer) {
          canvasContainer.innerHTML = svgText;
        }
      } catch (error) {
        console.warn('Error al cargar el SVG:', error);
      }

      if (mainMenu) mainMenu.classList.remove('active');
      if (gameScreen) gameScreen.classList.add('active');
      return;
    }

    // B) Al tocar el botón "← Menú"
    const backBtn = e.target.closest('#btn-back');
    if (backBtn) {
      if (gameScreen) gameScreen.classList.remove('active');
      if (mainMenu) mainMenu.classList.add('active');
    }
  });

  // 5. LÓGICA DE SELECCIÓN DE COLOR Y PINTADO
  let selectedColor = '#ff4757';
  const colorButtons = document.querySelectorAll('.color-btn');

  colorButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      colorButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.getAttribute('data-color');
    });
  });

  document.addEventListener('pointerdown', (e) => {
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer && canvasContainer.contains(e.target)) {
      if (e.target.tagName !== 'svg') {
        e.target.setAttribute('fill', selectedColor);
        e.target.style.fill = selectedColor;
      }
    }
  });
});