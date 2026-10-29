let selectedColor = '#ff4757';

// Gestor de selección de color en la paleta
const colorButtons = document.querySelectorAll('.color-btn');
colorButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    colorButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectedColor = btn.getAttribute('data-color');
  });
});

// Evento para pintar las zonas SVG
const paintablePaths = document.querySelectorAll('.paintable');
paintablePaths.forEach((path) => {
  path.addEventListener('pointerdown', (e) => {
    e.target.setAttribute('fill', selectedColor);
  });
});