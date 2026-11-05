import { initUI } from './ui.js';
import { renderSearchGrid } from './drawings.js';
import { loadColorByNumberDrawing, initEngineEvents, setEngineCallbacks } from './engine.js';

function init() {
  const searchGrid = document.getElementById('search-grid');
  if (searchGrid) renderSearchGrid(searchGrid);

  initUI((drawingId) => loadColorByNumberDrawing(drawingId));
  initEngineEvents();

  // Ganchos opcionales: conéctalos a tu UI (barra de progreso, pantalla final...)
  setEngineCallbacks({
    onProgress: (done, total) => console.log(`🎨 ${done}/${total} regiones`),
    onComplete: () => console.log('🎉 ¡Dibujo completado!'),
    onWrongColor: () => navigator.vibrate?.(20),
  });
}

// Los módulos son diferidos: normalmente el DOM ya está listo, pero por si acaso
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
