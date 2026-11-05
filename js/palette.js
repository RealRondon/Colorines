let selectedColorNumber = 1;

export function getSelectedColorNumber() {
  return selectedColorNumber;
}

// Texto negro sobre colores claros, blanco sobre oscuros
function textColorFor(hex) {
  let s = hex.replace('#', '');
  if (s.length === 3) s = s.replace(/./g, (c) => c + c);
  const n = parseInt(s, 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? '#111' : '#fff';
}

// Retira un color ya terminado y, si era el activo, selecciona el siguiente disponible
export function completeColor(colorNum) {
  const container = document.querySelector('.color-palette');
  const btn = container?.querySelector(`.color-btn[data-number="${colorNum}"]`);
  if (!btn || btn.classList.contains('done')) return;

  const wasActive = btn.classList.contains('active');
  const free = (el) => { while (el && el.classList.contains('done')) el = el.nextElementSibling; return el; };
  const freePrev = (el) => { while (el && el.classList.contains('done')) el = el.previousElementSibling; return el; };
  const next = free(btn.nextElementSibling) || freePrev(btn.previousElementSibling);

  btn.classList.remove('active');
  btn.classList.add('done'); // la animación de salida está en el CSS
  setTimeout(() => btn.remove(), 300);

  if (wasActive && next) {
    next.classList.add('active');
    selectedColorNumber = Number(next.dataset.number);
    next.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

export function renderDynamicPalette(paletteArray = []) {
  const container = document.querySelector('.color-palette');
  if (!container) {
    console.error("❌ No se encontró el contenedor '.color-palette' en el HTML.");
    return;
  }

  container.innerHTML = '';
  selectedColorNumber = 1;
  if (!paletteArray.length) return;

  // Un único listener (delegación) en lugar de uno por botón
  if (!container.dataset.bound) {
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.color-btn');
      if (!btn) return;
      selectedColorNumber = Number(btn.dataset.number);
      container.querySelectorAll('.color-btn.active').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
    container.dataset.bound = '1';
  }

  const frag = document.createDocumentFragment();
  paletteArray.forEach((hex, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = i === 0 ? 'color-btn active' : 'color-btn';
    btn.dataset.number = i + 1;
    btn.style.backgroundColor = hex;
    btn.style.color = textColorFor(hex);
    btn.textContent = i + 1;
    frag.appendChild(btn);
  });
  container.appendChild(frag);
}
