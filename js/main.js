import { initUI } from './ui.js';
import { loadColorByNumberDrawing, initEngineEvents } from './engine.js';

window.addEventListener('load', () => {
  console.log("🚀 Aplicación modular iniciada.");

  const searchGrid = document.getElementById('search-grid');

  // Renderizar grid inicial de búsqueda si la función global existe
  if (typeof renderSearchGrid === 'function' && searchGrid) {
    renderSearchGrid(searchGrid);
    console.log("✅ Grid de búsqueda renderizado.");
  }

  // Inicializar controlador de interfaz
  initUI((drawingId) => {
    loadColorByNumberDrawing(drawingId);
  });

  // Inicializar eventos del motor de dibujo
  initEngineEvents();
});