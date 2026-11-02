let selectedColorNumber = 1;

export function getSelectedColorNumber() {
  return selectedColorNumber;
}

export function renderDynamicPalette(paletteArray) {
  const paletteContainer = document.querySelector('.color-palette');
  if (!paletteContainer) {
    console.error("❌ ERROR: No se encontró el contenedor '.color-palette' en el HTML.");
    return;
  }

  console.log("🧹 Limpiando paleta anterior...");
  paletteContainer.innerHTML = '';

  if (!paletteArray || paletteArray.length === 0) {
    console.warn("⚠️ La paleta recibida está vacía.");
    return;
  }

  // Reiniciar selección al primer color por defecto
  selectedColorNumber = 1;

  paletteArray.forEach((colorHex, index) => {
    const colorNumber = index + 1;

    const btn = document.createElement('button');
    btn.className = `color-btn ${index === 0 ? 'active' : ''}`;
    btn.setAttribute('data-number', colorNumber);
    btn.style.backgroundColor = colorHex;
    btn.textContent = colorNumber;

    // Listener con logs de diagnóstico para depurar la paleta
    btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      console.log(`👇 [POINTERDOWN] Pulsado botón de color Nº ${colorNumber} (${colorHex})`);
    });

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log(`🎯 [CLICK] Seleccionando color Nº ${colorNumber} (${colorHex})`);

      const allBtns = document.querySelectorAll('.color-palette .color-btn');
      allBtns.forEach(b => b.classList.remove('active'));

      btn.classList.add('active');
      selectedColorNumber = colorNumber;

      console.log(`✅ Estado actualizado: selectedColorNumber es ahora = ${selectedColorNumber}`);
    });

    paletteContainer.appendChild(btn);
  });

  console.log(`✨ Se han renderizado ${paletteArray.length} botones en la paleta.`);
}