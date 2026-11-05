// CATÁLOGO DE DIBUJOS DEL JUEGO
export const DRAWINGS_CATALOG = [
  {
    id: 1,
    type: "normal",
    icon: "imgs/iconN.png",
    lines: "imgs/Dibujo-1-lines.png",
    map: "imgs/Dibujo-1-map.png",
palette: [
  '#959595', // Zona R = 1
  '#6b6b6b', // Zona R = 2
  '#444444', // Zona R = 3
  '#1b1b1b', // Zona R = 4
  '#babba2', // Zona R = 5
  '#dce05d', // Zona R = 6
  '#e8ef1c', // Zona R = 7
  '#d4d4d4', // Zona R = 8
  '#f3f3f3', // Zona R = 9
  '#373782', // Zona R = 10
]
  },
  {
    id: 2,
    type: "mystery",
    icon: "imgs/iconM.png",
    lines: "imgs/Dibujo-2-lines.png",
    map: "imgs/Dibujo-2-map.png",
    palette: [
      '#2ed573', // Zona R = 1 -> Color 1
      '#ffa502', // Zona R = 2 -> Color 2
      '#70a1ff'  // Zona R = 3 -> Color 3
    ]
  }
];

// RENDERIZADO DEL GRID EN EL MENÚ
export function renderSearchGrid(container) {
  if (!container) return;
  container.innerHTML = '';

  DRAWINGS_CATALOG.forEach((drawing) => {
    const isMystery = drawing.type === 'mystery';

    const card = document.createElement('div');
    card.className = `grid-card play-trigger ${isMystery ? 'card-mystery' : 'card-normal'}`;
    card.setAttribute('data-id', drawing.id);

    const iconSrc = drawing.icon || (isMystery ? 'imgs/iconM.png' : 'imgs/iconN.png');

    card.innerHTML = `
      <div class="grid-square">
        ${isMystery ? '<span class="badge-mystery">Misterio</span>' : ''}
        <img class="grid-thumb" src="${iconSrc}"/>
      </div>
    `;

    container.appendChild(card);
  });
}