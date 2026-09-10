// Pixel-grid sprite data + a helper to draw a grid rotated to face a given angle.
// Grids are authored "facing up" (row 0 = front of the character); drawSprite
// rotates them so that facing direction lines up with the angle passed in
// (angle 0 = facing +X, matching Math.atan2 convention).

const SPRITE_SCALE = 4;

const PLAYER_PALETTE = {
  k: '#10121a', // outline
  s: '#8be9fd', // visor
  b: '#3aa6ff', // suit
  d: '#1f5f9e', // suit shade
};

const PLAYER_FRAMES = {
  idle: [
    '..kkkkkk..',
    '.kssssssk.',
    '.kssssssk.',
    '.kkkkkkkk.',
    'kbbbbbbbbk',
    'kbdbbbbdbk',
    'kbbbbbbbbk',
    'kbb....bbk',
    '.kb....bk.',
    '..k....k..',
  ],
  walk1: [
    '..kkkkkk..',
    '.kssssssk.',
    '.kssssssk.',
    '.kkkkkkkk.',
    'kbbbbbbbbk',
    'kbdbbbbdbk',
    'kbbbbbbbbk',
    'kbb....bbk',
    '.kb.k..bk.',
    '..k.k...k.',
  ],
  walk2: [
    '..kkkkkk..',
    '.kssssssk.',
    '.kssssssk.',
    '.kkkkkkkk.',
    'kbbbbbbbbk',
    'kbdbbbbdbk',
    'kbbbbbbbbk',
    'kbb....bbk',
    '.kb.k..bk.',
    '..k...k.k.',
  ],
};

const ENEMY_PALETTE = {
  k: '#1a0e0e', // outline
  R: '#e0483e', // body
  h: '#8f2a22', // body shade
  e: '#ffdd57', // eyes
};

const ENEMY_FRAMES = {
  walk1: [
    '..kkkkkk..',
    '.kReRReRk.',
    '.kReRReRk.',
    '.kkkkkkkk.',
    'kRRRRRRRRk',
    'kRhRRRRhRk',
    'kRRRRRRRRk',
    'kRR....RRk',
    '.kR.k..Rk.',
    '..k.k...k.',
  ],
  walk2: [
    '..kkkkkk..',
    '.kReRReRk.',
    '.kReRReRk.',
    '.kkkkkkkk.',
    'kRRRRRRRRk',
    'kRhRRRRhRk',
    'kRRRRRRRRk',
    'kRR....RRk',
    '.kR.k..Rk.',
    '..k...k.k.',
  ],
};

function drawSprite(ctx, rows, palette, cx, cy, scale, facingAngle, tint) {
  const h = rows.length;
  const w = rows[0].length;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(facingAngle + Math.PI / 2);
  for (let r = 0; r < h; r++) {
    const row = rows[r];
    for (let c = 0; c < w; c++) {
      const ch = row[c];
      if (ch === '.') continue;
      ctx.fillStyle = tint || palette[ch] || '#ffffff';
      const px = (c - w / 2) * scale;
      const py = (r - h / 2) * scale;
      ctx.fillRect(px, py, scale, scale);
    }
  }
  ctx.restore();
}
