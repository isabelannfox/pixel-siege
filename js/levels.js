// Per-level difficulty configuration.

const LEVELS = [
  { enemyCount: 6, spawnInterval: 1.1, enemySpeed: 70 },
  { enemyCount: 9, spawnInterval: 0.95, enemySpeed: 85 },
  { enemyCount: 12, spawnInterval: 0.85, enemySpeed: 100 },
  { enemyCount: 16, spawnInterval: 0.7, enemySpeed: 115 },
  { enemyCount: 20, spawnInterval: 0.6, enemySpeed: 130 },
];

const TOTAL_LEVELS = LEVELS.length;

function getLevelConfig(levelNumber) {
  return LEVELS[levelNumber - 1];
}
