import { renderDynamicPalette, getSelectedColorNumber } from './palette.js';

let paintCanvas, paintCtx;
let mapCanvas, mapCtx;
let currentPalette = [];

export function loadColorByNumberDrawing(id = 1) {
  console.log(`🔄 Cargando datos del dibujo ID: ${id}...`);

  paintCanvas = document.getElementById('paint-canvas');
  mapCanvas = document.getElementById('map-canvas');
  const overlay = document.getElementById('lineart-overlay');

  if (!paintCanvas || !mapCanvas || !overlay) {
    console.error("❌ ERROR: Elementos Canvas o Overlay no encontrados.");
    return;
  }

  const drawingData = DRAWINGS_CATALOG.find(d => d.id === id) || DRAWINGS_CATALOG[0];
  console.log("📌 Objeto de dibujo cargado:", drawingData);

  currentPalette = drawingData.palette || [];
  renderDynamicPalette(currentPalette);

  paintCtx = paintCanvas.getContext('2d');
  mapCtx = mapCanvas.getContext('2d');

  const linesImg = new Image();
  const mapImg = new Image();

  linesImg.src = drawingData.lines;
  linesImg.onload = () => {
    const w = linesImg.naturalWidth || 1080;
    const h = linesImg.naturalHeight || 1080;

    paintCanvas.width = w;
    paintCanvas.height = h;
    mapCanvas.width = w;
    mapCanvas.height = h;

    paintCtx.fillStyle = '#ffffff';
    paintCtx.fillRect(0, 0, w, h);

    overlay.src = drawingData.lines;

    mapImg.src = drawingData.map;
    mapImg.onload = () => {
      console.log("MAPA: Imagen de mapa enmascarado cargada correctamente.");
      mapCtx.drawImage(mapImg, 0, 0, w, h);
    };
  };
}

export function initEngineEvents() {
  document.addEventListener('pointerdown', (e) => {
    // Ignorar interacciones que ocurran sobre la paleta
    if (e.target.closest('.color-palette') || e.target.closest('.color-btn')) return;

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

    const pixel = mapCtx.getImageData(x, y, 1, 1).data;
    const targetID = pixel[0]; // Lectura directa del ID por canal Rojo (R)
    const activeColorNum = getSelectedColorNumber();

    console.log(`👆 Toque en (${x}, ${y}) | ID de Región en mapa (Canal R): ${targetID} | Color activo: ${activeColorNum}`);

    if (targetID === activeColorNum) {
      const finalHexColor = currentPalette[targetID - 1];
      console.log(`✅ Coincidencia correcta. Rellenando región ${targetID} con ${finalHexColor}`);
      floodFillRegionDirect(x, y, finalHexColor, targetID);
    } else if (targetID > 0) {
      console.log(`❌ No coincide. Región ${targetID} no corresponde con el color seleccionado ${activeColorNum}`);
    }
  });
}

function floodFillRegionDirect(startX, startY, fillHex, targetID) {
  const width = paintCanvas.width;
  const height = paintCanvas.height;

  const mapData = mapCtx.getImageData(0, 0, width, height).data;
  const paintImageData = paintCtx.getImageData(0, 0, width, height);
  const paintData = paintImageData.data;

  const fillRGB = hexToRgb(fillHex);

  const queue = [startX, startY];
  const visited = new Uint8Array(width * height);
  const filledPixels = [];

  while (queue.length > 0) {
    const cy = queue.pop();
    const cx = queue.pop();
    const idx = cy * width + cx;

    if (visited[idx]) continue;
    visited[idx] = 1;

    const pixelOffset = idx * 4;

    if (mapData[pixelOffset] === targetID) {
      filledPixels.push(cx, cy);

      paintData[pixelOffset] = fillRGB.r;
      paintData[pixelOffset + 1] = fillRGB.g;
      paintData[pixelOffset + 2] = fillRGB.b;
      paintData[pixelOffset + 3] = 255;

      if (cx + 1 < width) queue.push(cx + 1, cy);
      if (cx - 1 >= 0) queue.push(cx - 1, cy);
      if (cy + 1 < height) queue.push(cx, cy + 1);
      if (cy - 1 >= 0) queue.push(cx, cy - 1);
    }
  }

  // Sangrado de 1px hacia afuera para evitar bordes blancos
  for (let i = 0; i < filledPixels.length; i += 2) {
    const px = filledPixels[i];
    const py = filledPixels[i + 1];

    const neighbors = [
      [px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = (ny * width + nx) * 4;
        paintData[nIdx] = fillRGB.r;
        paintData[nIdx + 1] = fillRGB.g;
        paintData[nIdx + 2] = fillRGB.b;
        paintData[nIdx + 3] = 255;
      }
    }
  }

  paintCtx.putImageData(paintImageData, 0, 0);
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

