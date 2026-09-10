const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
setupInput(canvas);

const overlays = {
  menu: document.getElementById('menu-screen'),
  levelComplete: document.getElementById('level-complete-screen'),
  gameOver: document.getElementById('game-over-screen'),
  win: document.getElementById('win-screen'),
};
const hud = document.getElementById('hud');
const healthBar = document.getElementById('health-bar');
const levelLabel = document.getElementById('level-label');
const scoreLabel = document.getElementById('score-label');
const enemiesLabel = document.getElementById('enemies-label');
const levelCompleteTitle = document.getElementById('level-complete-title');
const finalScoreLabel = document.getElementById('final-score');
const winScoreLabel = document.getElementById('win-score');

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('retry-btn').addEventListener('click', startGame);
document.getElementById('menu-btn').addEventListener('click', showMenu);
document.getElementById('menu-btn-2').addEventListener('click', showMenu);

let state = 'MENU';
let player;
let bullets = [];
let enemies = [];
let level = 1;
let score = 0;
let killedThisLevel = 0;
let enemiesSpawned = 0;
let spawnTimer = 0;
let levelConfig = getLevelConfig(1);

function setOverlay(name) {
  for (const key in overlays) {
    overlays[key].hidden = key !== name;
  }
  hud.hidden = state !== 'PLAYING';
}

function showMenu() {
  state = 'MENU';
  setOverlay('menu');
}

function resetGameState() {
  player = new Player(canvas.width / 2, canvas.height / 2);
  bullets = [];
  enemies = [];
  particles.length = 0;
  level = 1;
  score = 0;
  loadLevel(level);
}

function loadLevel(n) {
  levelConfig = getLevelConfig(n);
  enemies = [];
  enemiesSpawned = 0;
  killedThisLevel = 0;
  spawnTimer = 0;
  updateHud();
}

function startGame() {
  resetGameState();
  state = 'PLAYING';
  setOverlay('none');
}

function fireBullet(x, y, angle) {
  bullets.push(new Bullet(x, y, angle));
  spawnMuzzleFlash(x, y, angle);
}

function spawnEnemy() {
  enemiesSpawned++;
  const angle = Math.random() * Math.PI * 2;
  // Must exceed the canvas's half-diagonal so every angle spawns off-screen,
  // not just the axis-aligned ones.
  const spawnRadius = Math.hypot(canvas.width, canvas.height) / 2 + 60;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const x = cx + Math.cos(angle) * spawnRadius;
  const y = cy + Math.sin(angle) * spawnRadius;
  enemies.push(new Enemy(x, y, levelConfig.enemySpeed));
}

function updateHud() {
  const pct = Math.max(0, player.health / player.maxHealth) * 100;
  healthBar.style.width = pct + '%';
  healthBar.style.background = pct > 50 ? '#4ade80' : pct > 25 ? '#facc15' : '#f87171';
  levelLabel.textContent = `LEVEL ${level}`;
  scoreLabel.textContent = `SCORE ${score}`;
  const remaining = levelConfig.enemyCount - killedThisLevel;
  enemiesLabel.textContent = `ENEMIES ${remaining}`;
}

function levelComplete() {
  state = 'LEVEL_COMPLETE';
  score += level * 50;
  setOverlay('levelComplete');

  if (level >= TOTAL_LEVELS) {
    setTimeout(() => {
      state = 'WIN';
      winScoreLabel.textContent = `Final Score: ${score}`;
      setOverlay('win');
    }, 1200);
  } else {
    levelCompleteTitle.textContent = `LEVEL ${level} COMPLETE`;
    setTimeout(() => {
      level++;
      loadLevel(level);
      state = 'PLAYING';
      setOverlay('none');
    }, 1600);
  }
}

function gameOver() {
  state = 'GAME_OVER';
  finalScoreLabel.textContent = `Score: ${score}`;
  setOverlay('gameOver');
}

function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function updateGame(dt) {
  player.update(dt, keys, mouse, canvas.width, canvas.height, fireBullet);

  if (enemiesSpawned < levelConfig.enemyCount) {
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnEnemy();
      spawnTimer = levelConfig.spawnInterval;
    }
  }

  for (const enemy of enemies) enemy.update(dt, player);
  for (const bullet of bullets) bullet.update(dt);
  updateParticles(dt);

  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    const bullet = bullets[bi];
    let hit = false;
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const enemy = enemies[ei];
      if (distance(bullet.x, bullet.y, enemy.x, enemy.y) < bullet.radius + enemy.radius) {
        hit = true;
        if (enemy.takeHit()) {
          spawnDeathBurst(enemy.x, enemy.y, '#e0483e');
          enemies.splice(ei, 1);
          score += 100;
          killedThisLevel++;
        }
        break;
      }
    }
    if (hit || bullets[bi].isDead(canvas.width, canvas.height)) {
      bullets.splice(bi, 1);
    }
  }

  updateHud();

  if (player.health <= 0) {
    gameOver();
    return;
  }

  if (enemiesSpawned >= levelConfig.enemyCount && enemies.length === 0) {
    levelComplete();
  }
}

function drawBackground() {
  ctx.fillStyle = '#12141c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  const cell = 40;
  for (let x = 0; x <= canvas.width; x += cell) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += cell) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function render() {
  drawBackground();
  if (state === 'PLAYING' || state === 'LEVEL_COMPLETE') {
    for (const enemy of enemies) enemy.draw(ctx);
    for (const bullet of bullets) bullet.draw(ctx);
    player.draw(ctx);
    drawParticles(ctx);
  }
}

let lastTime = performance.now();
function loop(now) {
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  dt = Math.min(dt, 0.05);

  if (state === 'PLAYING') updateGame(dt);
  render();

  requestAnimationFrame(loop);
}

setOverlay('menu');
requestAnimationFrame(loop);
