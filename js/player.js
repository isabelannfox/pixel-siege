class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 16;
    this.speed = 220;

    this.health = 100;
    this.maxHealth = 100;

    this.aimAngle = -Math.PI / 2;
    this.moving = false;
    this.animTimer = 0;
    this.animFrame = 0;

    this.fireCooldown = 0;
    this.fireRate = 0.15;
    this.gunLength = 22;
    this.handOffset = 10;
    this.gunRecoil = 0;

    this.invulnTimer = 0;
    this.hitFlashTimer = 0;
  }

  update(dt, keysState, mouseState, canvasWidth, canvasHeight, onFire) {
    let dx = 0;
    let dy = 0;
    if (keysState['ArrowUp']) dy -= 1;
    if (keysState['ArrowDown']) dy += 1;
    if (keysState['ArrowLeft']) dx -= 1;
    if (keysState['ArrowRight']) dx += 1;

    this.moving = dx !== 0 || dy !== 0;
    if (this.moving) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
      this.x += dx * this.speed * dt;
      this.y += dy * this.speed * dt;
      this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x));
      this.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.y));

      this.animTimer += dt;
      if (this.animTimer > 0.15) {
        this.animTimer = 0;
        this.animFrame = this.animFrame === 0 ? 1 : 0;
      }
    } else {
      this.animTimer = 0;
    }

    this.aimAngle = Math.atan2(mouseState.y - this.y, mouseState.x - this.x);

    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    this.gunRecoil = Math.max(0, this.gunRecoil - 80 * dt);
    if (this.invulnTimer > 0) this.invulnTimer -= dt;
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;

    if (mouseState.down && this.fireCooldown <= 0) {
      this.fireCooldown = this.fireRate;
      this.gunRecoil = 8;
      const mx = this.x + Math.cos(this.aimAngle) * this.gunLength;
      const my = this.y + Math.sin(this.aimAngle) * this.gunLength;
      onFire(mx, my, this.aimAngle);
    }
  }

  takeDamage(amount) {
    if (this.invulnTimer > 0) return false;
    this.health = Math.max(0, this.health - amount);
    this.invulnTimer = 0.6;
    this.hitFlashTimer = 0.15;
    return true;
  }

  draw(ctx) {
    const frames = this.moving
      ? (this.animFrame === 0 ? PLAYER_FRAMES.walk1 : PLAYER_FRAMES.walk2)
      : PLAYER_FRAMES.idle;
    const tint = this.hitFlashTimer > 0 ? '#ffffff' : null;
    drawSprite(ctx, frames, PLAYER_PALETTE, this.x, this.y, SPRITE_SCALE, this.aimAngle, tint);

    const gunLen = this.gunLength - this.gunRecoil;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.aimAngle);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(this.handOffset, -3, Math.max(2, gunLen - this.handOffset), 6);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(gunLen - 4, -4, 6, 8);
    ctx.restore();
  }
}
