export function initGameLogic() {
  let selectedColor = '#ff4757';
  const colorButtons = document.querySelectorAll('.color-btn');

  colorButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      colorButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.getAttribute('data-color');
    });
  });

  // Escuchar toques en el dibujo SVG actual
  document.addEventListener('pointerdown', (e) => {
    if (e.target.classList.contains('paintable')) {
      e.target.setAttribute('fill', selectedColor);
    }
  });
}