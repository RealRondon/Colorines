import { initUI } from './ui.js';
import { renderSearchGrid } from './drawings.js';
import { completeColor } from './palette.js';
import {
  loadColorByNumberDrawing, restartCurrentDrawing, getResultImage,
  initEngineEvents, setEngineCallbacks,
} from './engine.js';

const WIN_DELAY_MS = 700; // deja ver el último relleno antes de mostrar la pantalla final
let winTimer = 0;

function init() {
  const searchGrid = document.getElementById('search-grid');
  if (searchGrid) renderSearchGrid(searchGrid);

  const winOverlay = document.getElementById('win-overlay');
  const winPreview = document.getElementById('win-preview');

  const hideWin = () => {
    clearTimeout(winTimer);
    if (winOverlay) winOverlay.hidden = true;
  };
  const showWin = () => {
    if (!winOverlay) return;
    if (winPreview) {
      const url = getResultImage();
      winPreview.src = url;
      winPreview.hidden = !url;
    }
    winOverlay.hidden = false;
  };

  initUI((drawingId) => loadColorByNumberDrawing(drawingId));
  initEngineEvents();

  setEngineCallbacks({
    onColorComplete: completeColor,
    onComplete: () => { winTimer = setTimeout(showWin, WIN_DELAY_MS); },
    onWrongColor: () => navigator.vibrate?.(20),
  });

  // ui.js cambia de pantalla con #btn-back y #btn-win-menu; aquí solo cerramos el overlay
  document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-back, #btn-win-menu')) {
      hideWin();
    } else if (e.target.closest('#btn-restart')) {
      hideWin();
      restartCurrentDrawing();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
