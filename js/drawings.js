// js/drawings.js

function renderSearchGrid(container, total = 30) {
  if (!container) return;

  container.innerHTML = ''; // Limpiar el contenido previo

  for (let i = 1; i <= total; i++) {
    const card = document.createElement('div');
    card.className = 'grid-card play-trigger';
    card.dataset.id = i; // Mantenemos el ID para saber qué dibujo abrir al tocar

    // Todas las tarjetas cargan exactamente la misma imagen: imgs/cuadrado.png
    card.innerHTML = `
      <div class="grid-square">
        <img src="imgs/cuadrado.png" alt="Dibujo ${i}" class="grid-thumb">
      </div>
    `;

    container.appendChild(card);
  }
}