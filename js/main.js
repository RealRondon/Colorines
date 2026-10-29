window.addEventListener('load', () => {
  const mainMenu = document.getElementById('main-menu');
  const gameScreen = document.getElementById('game-screen');
  const tabSlider = document.getElementById('tab-slider');
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const headerTitle = document.getElementById('header-title');
  const searchGrid = document.getElementById('search-grid');

  let paintCanvas, paintCtx;
  let mapCanvas, mapCtx;

  // COLOR SELECCIONADO EN LA PALETA (Número activo)
  let selectedColorNumber = 1;

  // 1. CONFIGURACIÓN DE LA PALETA REAL DEL DIBUJO
  const COLOR_PALETTE = {
    1: '#ffdd59', // Número 1: Amarillo
    2: '#3867d6', // Número 2: Azul
    3: '#4b6584', // Número 3: Gris/Negro
    4: '#eb3b5a'  // Número 4: Rojo
  };

  // 2. MAPA DE COLORES VISIBLES USADOS EN Dibujo-1-map.png
  const MASK_COLOR_MAP = {
    'ff0000': 1, // Rojo en map.png -> Zona Número 1
    '00ff00': 2, // Verde en map.png -> Zona Número 2
    '0000ff': 3, // Azul en map.png -> Zona Número 3
    'ffff00': 4  // Amarillo en map.png -> Zona Número 4
  };

  // GENERAR TARJETAS
  if (typeof renderSearchGrid === 'function' && searchGrid) {
    renderSearchGrid(searchGrid, 30);
  }

  // CARRUSEL
  let currentTabIndex = 1;
  if (tabSlider) {
    tabSlider.style.transform = 'translateX(-33.33333%)';
  }

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

  // SELECCIÓN DE BOTELLAS DE COLOR NUMERADAS
  const colorButtons = document.querySelectorAll('.color-btn');
  colorButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      colorButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColorNumber = parseInt(btn.getAttribute('data-number'));
    });
  });

  // NAVEGACIÓN Y CAMBIO DE PANTALLA
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.play-trigger');
    if (trigger) {
      loadColorByNumberDrawing(1);

      if (mainMenu) mainMenu.classList.remove('active');
      if (gameScreen) gameScreen.classList.add('active');
      return;
    }

    const backBtn = e.target.closest('#btn-back');
    if (backBtn) {
      if (gameScreen) gameScreen.classList.remove('active');
      if (mainMenu) mainMenu.classList.add('active');
    }
  });

  // CARGAR DIBUJO DUAL (CANVAS VISIBLE + MÁSCARA OCULTA)
  function loadColorByNumberDrawing(id = 1) {
    paintCanvas = document.getElementById('paint-canvas');
    mapCanvas = document.getElementById('map-canvas');
    const overlay = document.getElementById('lineart-overlay');

    if (!paintCanvas || !mapCanvas || !overlay) return;

    paintCtx = paintCanvas.getContext('2d');
    mapCtx = mapCanvas.getContext('2d');

    const linesPath = `imgs/Dibujo-${id}-lines.png`;
    const mapPath = `imgs/Dibujo-${id}-map.png`;

    const linesImg = new Image();
    const mapImg = new Image();

    linesImg.src = linesPath;
    linesImg.onload = () => {
      const w = linesImg.naturalWidth || 1080;
      const h = linesImg.naturalHeight || 1080;

      paintCanvas.width = w;
      paintCanvas.height = h;
      mapCanvas.width = w;
      mapCanvas.height = h;

      // Fondo blanco en el lienzo visible
      paintCtx.fillStyle = '#ffffff';
      paintCtx.fillRect(0, 0, w, h);

      overlay.src = linesPath;

      // Cargar la máscara en el lienzo oculto
      mapImg.src = mapPath;
      mapImg.onload = () => {
        mapCtx.drawImage(mapImg, 0, 0, w, h);
      };
    };
  }

  // DETECCIÓN DE INTERACCIÓN Y VALIDACIÓN
  // DETECCIÓN DE INTERACCIÓN Y RELLENO POR BOTE DE PINTURA (FLOOD FILL)
// DETECCIÓN DE INTERACCIÓN Y RELLENO POR BOTE DE PINTURA (FLOOD FILL)
document.addEventListener('pointerdown', (e) => {
  if (!paintCanvas || !mapCanvas) return;

  const rect = paintCanvas.getBoundingClientRect();
  if (
    e.clientX < rect.left || e.clientX > rect.right ||
    e.clientY < rect.top || e.clientY > rect.bottom
  ) return;

  const scaleX = paintCanvas.width / rect.width;
  const scaleY = paintCanvas.height / rect.height;

  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top) * scaleY);

  // 1. Leer el color de la máscara en la capa oculta
  const pixel = mapCtx.getImageData(x, y, 1, 1).data;
  const hexMask = rgbToHex(pixel[0], pixel[1], pixel[2]);

  const touchedRegionID = MASK_COLOR_MAP[hexMask];

  // 2. Comprobar si la región tocada coincide con el número activo de la paleta
  if (touchedRegionID && touchedRegionID === selectedColorNumber) {
    const finalHexColor = COLOR_PALETTE[touchedRegionID];
    
    // ACIERTO: Rellenar la región completa con Bote de Pintura (Flood Fill)
    floodFillRegion(x, y, finalHexColor, hexMask);
  } else {
    console.warn(`Número incorrecto. Seleccionado: ${selectedColorNumber}`);
  }
});

// ALGORITMO BOTE DE PINTURA (FLOOD FILL) BASADO EN LA MÁSCARA OCULTA
// ALGORITMO FLOOD FILL CON DILATACIÓN DE 1PX (ELIMINA BORDES ASERRADOS)
function floodFillRegion(startX, startY, fillHex, targetHexMask) {
  const width = paintCanvas.width;
  const height = paintCanvas.height;

  const mapImageData = mapCtx.getImageData(0, 0, width, height);
  const paintImageData = paintCtx.getImageData(0, 0, width, height);

  const mapData = mapImageData.data;
  const paintData = paintImageData.data;

  const fillRGB = hexToRgb(fillHex);

  const queue = [[startX, startY]];
  const visited = new Uint8Array(width * height);
  const filledPixels = []; // Guardamos los píxeles rellenos para expandir el borde

  while (queue.length > 0) {
    const [cx, cy] = queue.pop();
    const idx = cy * width + cx;

    if (visited[idx]) continue;
    visited[idx] = 1;

    const pixelOffset = idx * 4;

    const currentPixelHex = rgbToHex(
      mapData[pixelOffset],
      mapData[pixelOffset + 1],
      mapData[pixelOffset + 2]
    );

    // Si coincide con la máscara de la región
    if (currentPixelHex === targetHexMask) {
      filledPixels.push(cx, cy); // Almacenar coordenada

      paintData[pixelOffset] = fillRGB.r;
      paintData[pixelOffset + 1] = fillRGB.g;
      paintData[pixelOffset + 2] = fillRGB.b;
      paintData[pixelOffset + 3] = 255;

      if (cx + 1 < width) queue.push([cx + 1, cy]);
      if (cx - 1 >= 0) queue.push([cx - 1, cy]);
      if (cy + 1 < height) queue.push([cx, cy + 1]);
      if (cy - 1 >= 0) queue.push([cx, cy - 1]);
    }
  }

  // PASADA DE SANGRADO: Expande el color 1 píxel hacia afuera
  for (let i = 0; i < filledPixels.length; i += 2) {
    const px = filledPixels[i];
    const py = filledPixels[i + 1];

    const neighbors = [
      [px + 1, py],
      [px - 1, py],
      [px, py + 1],
      [px, py - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = (ny * width + nx) * 4;
        // Solo pintamos si ese píxel vecino no era ya del color pleno
        paintData[nIdx] = fillRGB.r;
        paintData[nIdx + 1] = fillRGB.g;
        paintData[nIdx + 2] = fillRGB.b;
        paintData[nIdx + 3] = 255;
      }
    }
  }

  // Volcar los cambios en el Canvas visible
  paintCtx.putImageData(paintImageData, 0, 0);
}

// --- FUNCIONES AUXILIARES DE CONVERSIÓN DE COLOR ---

// Convierte valores R, G, B individuales (0-255) a string hexadecimal (ej: "ff0000")
function rgbToHex(r, g, b) {
  return [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Convierte un string hexadecimal ("#ff0000") a un objeto RGB {r, g, b}
function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}
});