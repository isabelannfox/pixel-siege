const ENEMY_CONTACT_DAMAGE = 12;
const ENEMY_CONTACT_COOLDOWN = 0.6;

class Enemy {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.radius = 15;
    this.health = 2;
    this.facingAngle = 0;
    this.animTimer = 0;
    this.animFrame = 0;
    this.contactCooldown = 0;
  }

  update(dt, player) {
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    this.facingAngle = angle;
    this.x += Math.cos(angle) * this.speed * dt;
    this.y += Math.sin(angle) * this.speed * dt;

    this.animTimer += dt;
    if (this.animTimer > 0.18) {
      this.animTimer = 0;
      this.animFrame = this.animFrame === 0 ? 1 : 0;
    }

    if (this.contactCooldown > 0) this.contactCooldown -= dt;

    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    if (dist < this.radius + player.radius && this.contactCooldown <= 0) {
      if (player.takeDamage(ENEMY_CONTACT_DAMAGE)) {
        this.contactCooldown = ENEMY_CONTACT_COOLDOWN;
      }
    }
  }

  takeHit() {
    this.health -= 1;
    return this.health <= 0;
  }

  draw(ctx) {
    const frame = this.animFrame === 0 ? ENEMY_FRAMES.walk1 : ENEMY_FRAMES.walk2;
    drawSprite(ctx, frame, ENEMY_PALETTE, this.x, this.y, SPRITE_SCALE, this.facingAngle, null);
  }
}
