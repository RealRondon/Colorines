import { DRAWINGS_CATALOG } from './drawings.js';
import { renderDynamicPalette, getSelectedColorNumber } from './palette.js';

const TAP_RADIUS = 4;        // px de tolerancia al tocar sobre una línea
const MIN_REGION_SIZE = 20;  // componentes más pequeños se descartan como ruido

const hooks = { onProgress: null, onComplete: null, onWrongColor: null };
const state = {
  token: 0, w: 0, h: 0,
  canvas: null, ctx: null, image: null,
  labels: null,   // Int32Array: >0 = región, 0 = borde, -1 = ruido
  regions: [],    // regions[label] = { colorNum, minX, minY, maxX, maxY, painted }
  rgb: [], painted: 0,
};

export function setEngineCallbacks(cb = {}) {
  Object.assign(hooks, cb);
}

/* ---------- Carga ---------- */

export async function loadColorByNumberDrawing(id = 1) {
  const token = ++state.token;
  state.labels = null; // ignora toques mientras se carga

  const canvas = document.getElementById('paint-canvas');
  const overlay = document.getElementById('lineart-overlay');
  if (!canvas || !overlay) {
    console.error('❌ Faltan #paint-canvas o #lineart-overlay en el HTML.');
    return;
  }

  const drawing = DRAWINGS_CATALOG.find((d) => d.id === id) || DRAWINGS_CATALOG[0];
  const palette = drawing.palette || [];
  renderDynamicPalette(palette);

  try {
    const [linesImg, mapImg] = await Promise.all([loadImage(drawing.lines), loadImage(drawing.map)]);
    if (token !== state.token) return; // se pidió otro dibujo mientras cargaba

    const w = linesImg.naturalWidth;
    const h = linesImg.naturalHeight;
    if (mapImg.naturalWidth !== w || mapImg.naturalHeight !== h) {
      console.warn(`⚠️ map (${mapImg.naturalWidth}x${mapImg.naturalHeight}) y lines (${w}x${h}) no miden lo mismo.`);
    }

    const { labels, regions } = buildRegions(readRegionIds(mapImg, w, h), w, h);
    const maxId = regions.reduce((m, r) => (r && r.colorNum > m ? r.colorNum : m), 0);
    if (maxId > palette.length) {
      console.warn(`⚠️ El mapa usa el ID ${maxId} pero la paleta solo tiene ${palette.length} colores.`);
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const image = new ImageData(w, h);
    image.data.fill(255); // lienzo blanco opaco
    ctx.putImageData(image, 0, 0);

    Object.assign(state, { w, h, canvas, ctx, image, labels, regions, painted: 0, rgb: palette.map(hexToRgb) });
    overlay.src = drawing.lines;
    hooks.onProgress?.(0, regions.length - 1);
  } catch (err) {
    console.error('❌ Error cargando el dibujo:', err);
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    img.src = src;
  });
}

// Lee el canal R del mapa UNA sola vez (sin suavizado para no corromper los IDs).
function readRegionIds(img, w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, w, h);
  const rgba = ctx.getImageData(0, 0, w, h).data;
  const ids = new Uint8Array(w * h);
  for (let p = 0, i = 0; p < ids.length; p++, i += 4) ids[p] = rgba[i];
  return ids;
}

// Etiqueta componentes conexos (4-vecinos) con el mismo ID. Se ejecuta una vez al cargar.
function buildRegions(ids, w, h) {
  const labels = new Int32Array(w * h);
  const stack = new Int32Array(w * h); // cada píxel entra como máximo una vez
  const regions = [null];              // índice 0 reservado para "borde"

  for (let start = 0; start < ids.length; start++) {
    const colorNum = ids[start];
    if (!colorNum || labels[start]) continue;

    const label = regions.length;
    let minX = w, minY = h, maxX = 0, maxY = 0, size = 0, sp = 0;
    stack[sp++] = start;
    labels[start] = label;

    while (sp > 0) {
      const p = stack[--sp];
      const x = p % w;
      const y = (p / w) | 0;
      size++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      if (x > 0 && !labels[p - 1] && ids[p - 1] === colorNum) { labels[p - 1] = label; stack[sp++] = p - 1; }
      if (x < w - 1 && !labels[p + 1] && ids[p + 1] === colorNum) { labels[p + 1] = label; stack[sp++] = p + 1; }
      if (y > 0 && !labels[p - w] && ids[p - w] === colorNum) { labels[p - w] = label; stack[sp++] = p - w; }
      if (y < h - 1 && !labels[p + w] && ids[p + w] === colorNum) { labels[p + w] = label; stack[sp++] = p + w; }
    }

    if (size < MIN_REGION_SIZE) {
      // Ruido de antialiasing: se marca como -1 y no cuenta como región
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          if (labels[y * w + x] === label) labels[y * w + x] = -1;
        }
      }
      continue;
    }
    regions.push({ colorNum, minX, minY, maxX, maxY, painted: false });
  }
  return { labels, regions };
}

/* ---------- Interacción ---------- */

export function initEngineEvents() {
  document.addEventListener('pointerdown', onPointerDown);
}

function onPointerDown(e) {
  const { canvas, labels, w, h } = state;
  if (!labels || !e.isPrimary) return;
  if (e.target.closest('.color-palette') || !canvas.getClientRects().length) return; // paleta u oculto

  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const x = Math.floor(((e.clientX - rect.left) * w) / rect.width);
  const y = Math.floor(((e.clientY - rect.top) * h) / rect.height);
  if (x < 0 || y < 0 || x >= w || y >= h) return;

  const active = getSelectedColorNumber();
  const label = findRegionAt(x, y, active);
  if (!label) return;

  const region = state.regions[label];
  if (region.colorNum !== active) {
    hooks.onWrongColor?.(region.colorNum, active);
    return;
  }
  if (!region.painted) paintRegion(label);
}

// Región bajo el dedo; si cae sobre una línea, busca cerca (prefiere la del color activo).
function findRegionAt(x, y, active) {
  const { labels, regions, w, h } = state;
  const direct = labels[y * w + x];
  if (direct > 0) return direct;

  let fallback = 0;
  for (let r = 1; r <= TAP_RADIUS; r++) {
    for (let dy = -r; dy <= r; dy++) {
      const yy = y + dy;
      if (yy < 0 || yy >= h) continue;
      const step = Math.abs(dy) === r ? 1 : 2 * r; // anillo: fila completa o solo los extremos
      for (let dx = -r; dx <= r; dx += step) {
        const xx = x + dx;
        if (xx < 0 || xx >= w) continue;
        const l = labels[yy * w + xx];
        if (l <= 0) continue;
        if (regions[l].colorNum === active) return l;
        if (!fallback) fallback = l;
      }
    }
  }
  return fallback;
}

function paintRegion(label) {
  const { labels, regions, w, h, image, ctx } = state;
  const region = regions[label];
  const { r, g, b } = state.rgb[region.colorNum - 1];
  const d = image.data;

  // bounding box + 1px para el sangrado
  const x0 = Math.max(region.minX - 1, 0);
  const y0 = Math.max(region.minY - 1, 0);
  const x1 = Math.min(region.maxX + 1, w - 1);
  const y1 = Math.min(region.maxY + 1, h - 1);

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const p = y * w + x;
      const l = labels[p];
      if (l !== label) {
        if (l > 0) continue; // nunca invadir otra región
        const touches =
          (x > 0 && labels[p - 1] === label) || (x < w - 1 && labels[p + 1] === label) ||
          (y > 0 && labels[p - w] === label) || (y < h - 1 && labels[p + w] === label);
        if (!touches) continue; // solo sangra en bordes/ruido pegados a la región
      }
      const o = p * 4;
      d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1); // solo el área sucia

  region.painted = true;
  state.painted++;
  const total = regions.length - 1;
  hooks.onProgress?.(state.painted, total);
  if (state.painted === total) hooks.onComplete?.();
}

function hexToRgb(hex) {
  let s = hex.replace('#', '');
  if (s.length === 3) s = s.replace(/./g, (c) => c + c);
  const n = parseInt(s, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
