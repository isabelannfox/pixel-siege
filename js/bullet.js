const BULLET_SPEED = 520;

class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * BULLET_SPEED;
    this.vy = Math.sin(angle) * BULLET_SPEED;
    this.radius = 3;
    this.life = 1.0;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }

  isDead(canvasWidth, canvasHeight) {
    return (
      this.life <= 0 ||
      this.x < -20 || this.x > canvasWidth + 20 ||
      this.y < -20 || this.y > canvasHeight + 20
    );
  }

  draw(ctx) {
    const angle = Math.atan2(this.vy, this.vx);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-4, -2, 8, 4);
    ctx.fillStyle = '#ffe082';
    ctx.fillRect(-2, -1, 4, 2);
    ctx.restore();
  }
}
