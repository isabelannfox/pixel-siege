// Keyboard + mouse input state, shared globally with the rest of the game.

const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

const keys = {};
const mouse = { x: 0, y: 0, down: false };

function setupInput(canvas) {
  window.addEventListener('keydown', (e) => {
    if (ARROW_KEYS.includes(e.key)) e.preventDefault();
    keys[e.key] = true;
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });

  function updateMouseFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouse.x = (e.clientX - rect.left) * scaleX;
    mouse.y = (e.clientY - rect.top) * scaleY;
  }

  canvas.addEventListener('mousemove', updateMouseFromEvent);
  canvas.addEventListener('mousedown', (e) => {
    updateMouseFromEvent(e);
    mouse.down = true;
  });
  window.addEventListener('mouseup', () => {
    mouse.down = false;
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}
