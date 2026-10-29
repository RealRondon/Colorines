/**
 * Renderiza el grid de 30 tarjetas con la imagen estática imgs/cuadrado.png
 */
function renderSearchGrid(container, total = 30) {
  if (!container) return;

  container.innerHTML = '';

  for (let i = 1; i <= total; i++) {
    const card = document.createElement('div');
    card.className = 'grid-card play-trigger';
    card.dataset.id = i;

    card.innerHTML = `
      <div class="grid-square">
        <img src="imgs/cuadrado.png" alt="Dibujo ${i}" class="grid-thumb">
      </div>
    `;

    container.appendChild(card);
  }
}