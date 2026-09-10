# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Pixel Siege — a retro top-down shooter that runs entirely in the browser. Plain HTML/CSS/JS, no build tools, no package manager, no dependencies, no test suite.

## Running it

There is no build or dev-server step. Open `index.html` directly in a browser (double-click, or `start index.html` on Windows), or serve the folder with any static file server if you need it under `http://` instead of `file://`. There is no lint or test command — verification is manual in-browser play.

## Architecture

Classic scripts (no ES modules, no bundler) loaded in a fixed order from `index.html`, sharing state through the global scope. Because there are no modules, **load order in `index.html` matters** — a file that references a global defined later will fail at runtime, not at parse time:

```
sprites.js -> particles.js -> levels.js -> input.js -> bullet.js -> enemy.js -> player.js -> main.js
```

- **`js/sprites.js`** — Pixel-art is authored as grids of characters (strings), one row per string, mapped to hex colors through a palette object (`PLAYER_PALETTE`, `ENEMY_PALETTE`). `drawSprite(ctx, rows, palette, cx, cy, scale, facingAngle, tint)` is the shared renderer: it draws each non-`.` cell as a scaled `fillRect`, rotated so the sprite (authored facing "up") faces `facingAngle`. Both the player and enemies rotate their *entire* sprite to face their aim/movement direction — there's no separate directional frame set. Add new characters/enemy types here as new frame sets in the same shape.
- **`js/particles.js`** — A single global `particles` array plus `spawnMuzzleFlash`, `spawnDeathBurst`, `updateParticles`, `drawParticles`. Purely additive visual effects; nothing else reads this array.
- **`js/levels.js`** — `LEVELS` is the difficulty curve: one `{ enemyCount, spawnInterval, enemySpeed }` object per level. `getLevelConfig(n)` and `TOTAL_LEVELS` are the only entry points `main.js` uses. Tune difficulty here.
- **`js/input.js`** — Global `keys` (keydown/keyup map) and `mouse` (`{x, y, down}` in canvas coordinates, already corrected for CSS scaling via `getBoundingClientRect`). `setupInput(canvas)` wires the listeners once.
- **`js/bullet.js`, `js/enemy.js`, `js/player.js`** — Plain classes with `update(dt, ...)` / `draw(ctx)`. `Player.update` takes an `onFire` callback (invoked as `onFire(muzzleX, muzzleY, angle)`) rather than pushing bullets itself — `main.js` supplies `fireBullet` as that callback so bullet/particle spawning stays centralized. `Enemy.update` calls `player.takeDamage(...)` directly on contact (it owns its own per-enemy contact cooldown); `Player.takeDamage` owns the invulnerability window and returns `false` if the hit should be ignored.
- **`js/main.js`** — Owns all mutable game state (`state`, `player`, `bullets`, `enemies`, `level`, `score`, `killedThisLevel`, `enemiesSpawned`, `spawnTimer`, `levelConfig`) and the `requestAnimationFrame` loop with delta-time (clamped to 0.05s). Explicit state machine: `MENU -> PLAYING -> (LEVEL_COMPLETE -> PLAYING)* -> GAME_OVER | WIN`, driven by `setOverlay(name)` toggling the `hidden` attribute on the HTML overlay `<div>`s (menu/level-complete/game-over/win) — the canvas itself is only ever used for live gameplay + background grid, never for menu/score-screen text. Level transitions use `setTimeout` (not frame-counted) to hold on the "Level Complete" overlay before advancing.

## Known CSS gotcha

`.overlay { display: flex; ... }` in `style.css` is an author-stylesheet rule, so it beats the browser's built-in `[hidden] { display: none }` UA rule on specificity/origin — an overlay `div` with `class="overlay"` needs the explicit `.overlay[hidden] { display: none; }` rule (already present in `style.css`) to actually hide. If you add a new overlay screen, make sure it's covered by that same selector rather than relying on the bare `hidden` attribute.

## Conventions

- Off-screen enemy spawn positions must clear the canvas's half-*diagonal* (`Math.hypot(width, height) / 2`), not just half-width/half-height — a smaller radius leaves diagonal angles spawning visibly on-screen.
- Sprite grids are authored facing "up" (row 0 = front); `drawSprite`'s rotation offset (`facingAngle + Math.PI / 2`) depends on that convention. Keep new frames consistent with it.
- No CSS/JS framework, no TypeScript, no transpilation — write directly runnable browser JS (ES2017-ish class syntax is fine; avoid anything requiring a bundler).
