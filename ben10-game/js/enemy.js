class Enemy {
  constructor(x, y, patrolMin, patrolMax, type) {
    this.x = x; this.y = y;
    this.type = type || 'robot';
    this.setStats();
    this.vx = 0; this.vy = 0;
    this.speed = 1.2; this.gravity = 0.5;
    this.onGround = false; this.facingRight = true;
    this.patrolMin = patrolMin; this.patrolMax = patrolMax;
    this.aggressive = false;
    this.walkFrame = 0; this.walkTimer = 0;
    this.hurtFlash = 0;
    this.knockbackX = 0; this.knockbackY = 0;
    this.stunTimer = 0;
    this.retreatTimer = 0;
    this.specialCooldown = 0;
    this.alertTimer = 0;
  }

  setStats() {
    switch (this.type) {
      case 'robot':
        this.width = 34; this.height = 50;
        this.health = 60; this.maxHealth = 60;
        this.speed = 1.3; this.detectionRange = 180;
        this.attackRange = 40; this.attackDamage = 8;
        this.attackCooldownMax = 40;
        break;
      case 'drone':
        this.width = 28; this.height = 36;
        this.health = 35; this.maxHealth = 35;
        this.speed = 2.0; this.detectionRange = 250;
        this.attackRange = 30; this.attackDamage = 6;
        this.attackCooldownMax = 25;
        break;
      case 'knight':
        this.width = 38; this.height = 54;
        this.health = 80; this.maxHealth = 80;
        this.speed = 0.9; this.detectionRange = 200;
        this.attackRange = 42; this.attackDamage = 10;
        this.attackCooldownMax = 50;
        break;
      case 'mutant':
        this.width = 40; this.height = 48;
        this.health = 70; this.maxHealth = 70;
        this.speed = 1.0; this.detectionRange = 220;
        this.attackRange = 44; this.attackDamage = 9;
        this.attackCooldownMax = 45;
        break;
      default:
        this.width = 34; this.height = 50;
        this.health = 60; this.maxHealth = 60;
        this.speed = 1.2; this.detectionRange = 180;
        this.attackRange = 40; this.attackDamage = 8;
        this.attackCooldownMax = 40;
    }
    this.attackCooldown = 0;
  }

  update(platforms, player) {
    if (this.hurtFlash > 0) this.hurtFlash--;
    if (this.specialCooldown > 0) this.specialCooldown--;

    if (this.stunTimer > 0) {
      this.stunTimer--;
      this.knockbackX *= 0.85;
      this.knockbackY += this.gravity;
      this.x += this.knockbackX;
      this.y += this.knockbackY;
      this.resolveCollision(platforms);
      return;
    }

    const dx = player.x - this.x;
    const dist = Math.abs(dx);
    const dy = player.y - this.y;

    // Aggression
    if (dist < this.detectionRange && player.isAlive()) {
      if (!this.aggressive) this.alertTimer = 30;
      this.aggressive = true;
    } else {
      this.aggressive = false;
    }

    if (this.alertTimer > 0) this.alertTimer--;

    if (this.attackCooldown > 0) this.attackCooldown--;

    // Retreat when low health
    if (this.aggressive && this.health < this.maxHealth * 0.3 && this.retreatTimer <= 0) {
      this.retreatTimer = 60;
    }
    if (this.retreatTimer > 0) {
      this.retreatTimer--;
      const dir = dx > 0 ? -1 : 1;
      this.vx = dir * this.speed * 1.5;
      this.facingRight = dir > 0;
      if (this.retreatTimer < 30 && dist < this.attackRange && this.attackCooldown <= 0) {
        this.vx = 0;
        this.attackCooldown = this.attackCooldownMax;
      }
    } else if (this.aggressive) {
      const dir = dx > 0 ? 1 : -1;

      // Dodge if player is attacking
      if (player.isAttacking && dist < 60) {
        this.vx = -dir * this.speed * 2;
        this.stunTimer = 5;
      } else {
        this.vx = dir * this.speed * 1.4;
      }

      this.facingRight = dir > 0;

      // Jump to reach player if on different height
      if (this.onGround && Math.abs(dy) > 60 && Math.random() < 0.02) {
        this.vy = -8;
        this.onGround = false;
      }

      if (dist < this.attackRange && this.attackCooldown <= 0) {
        this.vx = 0;
        this.attackCooldown = this.attackCooldownMax;
      }

      // Special attack
      if (this.specialCooldown <= 0 && dist < this.attackRange * 1.5 && Math.random() < 0.005) {
        this.specialCooldown = 120;
      }
    } else {
      // Patrol
      if (this.x <= this.patrolMin) { this.vx = this.speed; this.facingRight = true; }
      else if (this.x >= this.patrolMax) { this.vx = -this.speed; this.facingRight = false; }
    }

    if (Math.abs(this.vx) > 0.3) {
      this.walkTimer++;
      if (this.walkTimer > 7) { this.walkTimer = 0; this.walkFrame = (this.walkFrame + 1) % 4; }
    }

    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.resolveCollision(platforms);
  }

  resolveCollision(platforms) {
    this.onGround = false;
    for (const plat of platforms) {
      if (this.collidesWith(plat)) {
        const ot = (this.y + this.height) - plat.y;
        const ob = (plat.y + plat.height) - this.y;
        const ol = (this.x + this.width) - plat.x;
        const or = (plat.x + plat.width) - this.x;
        const min = Math.min(ot, ob, ol, or);
        if (min === ot && this.vy >= 0) { this.y = plat.y - this.height; this.vy = 0; this.onGround = true; }
        else if (min === ob && this.vy <= 0) { this.y = plat.y + plat.height; this.vy = 0; }
        else if (min === ol && this.vx >= 0) { this.x = plat.x - this.width; this.vx *= -0.5; }
        else if (min === or && this.vx <= 0) { this.x = plat.x + plat.width; this.vx *= -0.5; }
      }
    }
  }

  collidesWith(r) { return this.x < r.x+r.width && this.x+this.width > r.x && this.y < r.y+r.height && this.y+this.height > r.y; }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    this.hurtFlash = 12;
    this.aggressive = true;
  }

  isAlive() { return this.health > 0; }

  draw(ctx) {
    ctx.save();
    const cx = Math.round(this.x); const cy = Math.round(this.y);
    const f = this.facingRight ? 1 : -1;
    ctx.translate(cx + this.width/2, cy + this.height);
    ctx.scale(f, 1);

    if (this.type === 'robot') this.drawRobot(ctx);
    else if (this.type === 'drone') this.drawDrone(ctx);
    else if (this.type === 'knight') this.drawKnight(ctx);
    else if (this.type === 'mutant') this.drawMutant(ctx);
    else this.drawRobot(ctx);

    ctx.restore();
  }

  drawRobot(ctx) {
    const leg = this.getLegOffset();
    if (this.hurtFlash > 0) { ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 20; ctx.fillStyle = '#fff'; ctx.fillRect(-17, -54, 34, 54); }
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#4a5a6a'; ctx.fillRect(-10, -14 + leg.left, 8, 14); ctx.fillRect(2, -14 + leg.right, 8, 14);
    ctx.fillStyle = '#3a4a5a'; ctx.fillRect(-11, -3 + leg.left, 10, 4); ctx.fillRect(1, -3 + leg.right, 10, 4);
    ctx.fillStyle = this.hurtFlash > 0 ? '#ff4444' : '#4a6a8a'; ctx.fillRect(-15, -38, 30, 24);
    ctx.fillStyle = this.hurtFlash > 0 ? '#ff6666' : '#5a7a9a'; ctx.fillRect(-12, -36, 24, 7);
    ctx.fillStyle = this.hurtFlash > 0 ? '#ff8888' : '#6a8aaa'; ctx.fillRect(-19, -38, 6, 9); ctx.fillRect(13, -38, 6, 9);
    ctx.fillStyle = this.hurtFlash > 0 ? '#ff4444' : '#4a6a8a';
    const atk = this.attackCooldown > this.attackCooldownMax - 5 ? -3 : 0;
    ctx.fillRect(-18, -32 + atk, 5, 16); ctx.fillRect(13, -32, 5, 16);
    if (this.attackCooldown > this.attackCooldownMax - 5) {
      ctx.shadowColor = '#ff6633'; ctx.shadowBlur = 15;
      ctx.fillStyle = 'rgba(255,100,50,0.6)'; ctx.beginPath(); ctx.arc(-20, -24, 10, 0, 6.28); ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = this.hurtFlash > 0 ? '#ff6666' : '#5a7a9a'; ctx.fillRect(-12, -52, 24, 15);
    ctx.fillStyle = '#222'; ctx.fillRect(-11, -50, 22, 3);
    ctx.fillStyle = this.aggressive ? '#ff2200' : '#ff6644';
    ctx.shadowColor = this.aggressive ? '#ff0000' : 'transparent';
    ctx.shadowBlur = this.aggressive ? 15 : 0;
    ctx.fillRect(-10, -50, 4, 2); ctx.fillRect(6, -50, 4, 2);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#888'; ctx.fillRect(-2, -57, 4, 6);
    ctx.fillStyle = this.aggressive ? '#ff0000' : '#ff4444'; ctx.fillRect(-3, -58, 6, 3);
  }

  drawDrone(ctx) {
    if (this.hurtFlash > 0) { ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 15; }
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#6688aa'; ctx.fillRect(-14, -18, 28, 12);
    ctx.fillStyle = '#88aacc'; ctx.fillRect(-12, -16, 24, 4);
    ctx.fillStyle = '#335577'; ctx.fillRect(-16, -22, 32, 4);
    ctx.fillStyle = '#557799'; ctx.fillRect(-10, -8, 8, 8); ctx.fillRect(2, -8, 8, 8);
    ctx.fillStyle = '#88bbdd'; ctx.fillRect(-12, -4, 10, 4); ctx.fillRect(2, -4, 10, 4);
    ctx.fillStyle = this.aggressive ? '#ff0000' : '#4488cc';
    ctx.shadowColor = this.aggressive ? '#ff0000' : '#4488cc';
    ctx.shadowBlur = 10;
    ctx.fillRect(-8, -14, 5, 3); ctx.fillRect(3, -14, 5, 3);
    ctx.shadowBlur = 0;
    // Wings
    ctx.fillStyle = 'rgba(100,150,200,0.3)';
    ctx.fillRect(-22, -20, 6, 14); ctx.fillRect(16, -20, 6, 14);
  }

  drawKnight(ctx) {
    const leg = this.getLegOffset();
    if (this.hurtFlash > 0) { ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 20; }
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#555555'; ctx.fillRect(-11, -14 + leg.left, 9, 14); ctx.fillRect(2, -14 + leg.right, 9, 14);
    ctx.fillStyle = '#444444'; ctx.fillRect(-12, -3 + leg.left, 11, 4); ctx.fillRect(1, -3 + leg.right, 11, 4);
    ctx.fillStyle = this.hurtFlash > 0 ? '#ff4444' : '#666666'; ctx.fillRect(-16, -40, 32, 26);
    ctx.fillStyle = '#777777'; ctx.fillRect(-14, -38, 28, 5);
    ctx.fillStyle = '#888888'; ctx.fillRect(-18, -42, 36, 4);
    ctx.fillStyle = '#555555'; ctx.fillRect(-18, -34, 5, 14); ctx.fillRect(13, -34, 5, 14);
    const atk = this.attackCooldown > this.attackCooldownMax - 5 ? -4 : 0;
    ctx.fillRect(-20, -32 + atk, 5, 18); ctx.fillRect(15, -32, 5, 18);
    if (this.attackCooldown > this.attackCooldownMax - 5) {
      ctx.fillStyle = 'rgba(200,200,200,0.5)'; ctx.fillRect(-26, -28, 8, 10);
    }
    // Helmet
    ctx.fillStyle = '#888888'; ctx.fillRect(-13, -54, 26, 16);
    ctx.fillStyle = '#999999'; ctx.fillRect(-15, -56, 30, 4);
    // Visor
    ctx.fillStyle = '#222'; ctx.fillRect(-12, -50, 24, 4);
    ctx.fillStyle = this.aggressive ? '#ff4400' : '#ffaa00';
    ctx.shadowColor = this.aggressive ? '#ff0000' : 'transparent';
    ctx.shadowBlur = this.aggressive ? 12 : 0;
    ctx.fillRect(-10, -50, 4, 3); ctx.fillRect(6, -50, 4, 3);
    ctx.shadowBlur = 0;
    // Shield
    ctx.fillStyle = '#777777'; ctx.strokeStyle = '#999999'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(22, -28, 12, 0, 6.28); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#555555'; ctx.beginPath(); ctx.arc(22, -28, 8, 0, 6.28); ctx.fill();
  }

  drawMutant(ctx) {
    const leg = this.getLegOffset();
    if (this.hurtFlash > 0) { ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 20; }
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#556633'; ctx.fillRect(-12, -14 + leg.left, 10, 14); ctx.fillRect(2, -14 + leg.right, 10, 14);
    ctx.fillStyle = '#445522'; ctx.fillRect(-13, -3 + leg.left, 12, 4); ctx.fillRect(1, -3 + leg.right, 12, 4);
    ctx.fillStyle = this.hurtFlash > 0 ? '#88ff44' : '#668844'; ctx.fillRect(-17, -36, 34, 22);
    ctx.fillStyle = '#779955'; ctx.fillRect(-15, -34, 30, 4);
    ctx.fillStyle = '#557733'; ctx.fillRect(-19, -36, 5, 10); ctx.fillRect(14, -36, 5, 10);
    ctx.fillStyle = '#668844'; ctx.fillRect(-18, -30, 5, 16); ctx.fillRect(13, -30, 5, 16);
    const atk = this.attackCooldown > this.attackCooldownMax - 5 ? -3 : 0;
    ctx.fillRect(-20, -28 + atk, 5, 18); ctx.fillRect(15, -28, 5, 18);
    if (this.attackCooldown > this.attackCooldownMax - 5) {
      ctx.fillStyle = 'rgba(100,200,50,0.4)'; ctx.fillRect(-26, -24, 8, 8);
    }
    // Head
    ctx.fillStyle = '#779944'; this.roundRect(ctx, -13, -48, 26, 15, 4); ctx.fill();
    // Eyes
    ctx.fillStyle = this.aggressive ? '#ff0000' : '#ffcc00';
    ctx.shadowColor = this.aggressive ? '#ff0000' : '#ffcc00';
    ctx.shadowBlur = this.aggressive ? 12 : 0;
    ctx.fillRect(-9, -44, 6, 4); ctx.fillRect(3, -44, 6, 4);
    ctx.shadowBlur = 0;
    // Mouth
    ctx.fillStyle = '#334411'; ctx.fillRect(-6, -38, 12, 4);
    ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) ctx.fillRect(-5 + i * 3, -38, 2, 3);
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
  }

  getLegOffset() {
    if (!this.onGround || Math.abs(this.vx) < 0.3) return { left: 0, right: 0 };
    switch (this.walkFrame) {
      case 0: return { left: 0, right: 0 };
      case 1: return { left: 4, right: -3 };
      case 2: return { left: 0, right: 0 };
      case 3: return { left: -3, right: 4 };
      default: return { left: 0, right: 0 };
    }
  }
}
