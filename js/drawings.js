// CATÁLOGO DE DIBUJOS DEL JUEGO
export const DRAWINGS_CATALOG = [
  {
    id: 1,
    type: "normal",
    icon: "imgs/iconN.png",
    lines: "imgs/Dibujo-1-lines.png",
    map: "imgs/Dibujo-1-map.png",
palette: [
  '#12dfec', // Zona R = 1
  '#374215', // Zona R = 2
  '#6b4b18', // Zona R = 3
  '#ecd012', // Zona R = 4
  '#18286b', // Zona R = 5
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
  },{
id: 3,
    type: "mystery",
    icon: "imgs/iconM.png",
    lines: "imgs/Dibujo-3-lines.png",
    map: "imgs/Dibujo-3-map.png",
    palette: [
    '#7cefe0', // Zona R = 1
    '#85b941', // Zona R = 2
    '#f3cf8a', // Zona R = 3
    '#cdc8ab', // Zona R = 4
    '#ffe86c', // Zona R = 5
    '#dd7cef', // Zona R = 6
    '#c4982f', // Zona R = 7
    '#ceb580', // Zona R = 8
    '#f4cb3e', // Zona R = 9
    '#c73ef4', // Zona R = 10
    '#ff3000', // Zona R = 11
    '#8e5399', // Zona R = 12
    '#4d2da7', // Zona R = 13
    '#edff20', // Zona R = 14
    '#2da76f', // Zona R = 15
    '#ffea00', // Zona R = 16
    '#c42f2f', // Zona R = 17
    '#e45c27', // Zona R = 18
    '#503355', // Zona R = 19
    '#bd1915', // Zona R = 20
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