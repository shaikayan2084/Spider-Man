class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.width = 40; this.height = 58;
    this.vx = 0; this.vy = 0;
    this.speed = 4; this.jumpPower = -10; this.gravity = 0.5;
    this.onGround = false; this.facingRight = true;
    this.health = 100; this.maxHealth = 100;
    this.alienHealth = 100; this.maxAlienHealth = 100;
    this.attackTimer = 0; this.attackCooldown = 20;
    this.attackRange = 46; this.attackDamage = 15;
    this.isAttacking = false; this.isHeavyAttacking = false;
    this.heavyTimer = 0;
    this.dashTimer = 0; this.dashCooldown = 0;
    this.dashSpeed = 12; this.dashDuration = 8;
    this.isDashing = false; this.invincibleTimer = 0;
    this.airTime = 0;
    this.lastOnGround = true;
    this.landTimer = 0;

    this.currentForm = 'ben';
    this.transformTimer = 0;
    this.isTransforming = false;

    this.anims = {
      state: 'idle', frame: 0, timer: 0,
      blinkTimer: 0, isBlinking: false,
      attackCombo: 0,
    };

    this.walkFrame = 0; this.walkTimer = 0;
    this.idleTimer = 0;
    this.attackComboStep = 0;
    this.comboWindow = 0;
  }

  update(platforms) {
    if (this.dashCooldown > 0) this.dashCooldown--;
    if (this.invincibleTimer > 0) this.invincibleTimer--;
    this.idleTimer++;
    this.anims.timer++;
    this.anims.blinkTimer++;

    if (this.landTimer > 0) this.landTimer--;

    if (this.anims.blinkTimer > 180) {
      this.anims.isBlinking = true;
      if (this.anims.blinkTimer > 186) {
        this.anims.isBlinking = false;
        this.anims.blinkTimer = 0;
      }
    }

    if (this.transformTimer > 0) {
      this.transformTimer--;
      this.vx = 0; this.vy = 0;
      if (this.onGround) this.vy = 0;
      if (this.transformTimer === 0) this.isTransforming = false;
      this.applyGravityAndCollision(platforms);
      return;
    }

    if (this.attackTimer > 0) {
      this.attackTimer--;
      if (this.attackTimer === 12) this.isAttacking = true;
      if (this.attackTimer === 0) { this.isAttacking = false; this.isHeavyAttacking = false; }
    }
    if (this.heavyTimer > 0) {
      this.heavyTimer--;
      if (this.heavyTimer === 0) {
        this.isHeavyAttacking = true;
        this.attackTimer = this.attackCooldown;
      }
    }

    if (!this.onGround) { this.airTime++; this.anims.state = 'fall'; }
    else {
      if (!this.lastOnGround && this.airTime > 6) {
        this.landTimer = 8;
      }
      this.airTime = 0;
    }
    this.lastOnGround = this.onGround;

    if (this.landTimer > 0) { this.anims.state = 'land'; }
    else if (this.isAttacking) { this.anims.state = 'attack'; }
    else if (this.isDashing) { this.anims.state = 'dash'; }
    else if (Math.abs(this.vx) > 0.5 && this.onGround) { this.anims.state = 'walk'; }
    else if (this.onGround) { this.anims.state = 'idle'; }

    if (this.isDashing) {
      this.dashTimer--;
      this.vx = this.facingRight ? this.dashSpeed : -this.dashSpeed;
      if (this.dashTimer <= 0) {
        this.isDashing = false; this.dashCooldown = 30; this.vx = 0;
      }
    } else if (this.attackTimer === 0 && this.heavyTimer === 0) {
      if (isKeyDown('a') || isKeyDown('arrowleft')) {
        this.vx = -this.speed; this.facingRight = false;
      } else if (isKeyDown('d') || isKeyDown('arrowright')) {
        this.vx = this.speed; this.facingRight = true;
      } else { this.vx *= 0.7; if (Math.abs(this.vx) < 0.1) this.vx = 0; }
    }

    if ((isKeyDown(' ') || isKeyDown('arrowup')) && this.onGround) {
      this.vy = this.jumpPower; this.onGround = false; this.anims.state = 'jump';
    }

    if (isKeyDown('shift') && !this.isDashing && this.dashCooldown <= 0) {
      this.isDashing = true; this.dashTimer = this.dashDuration; this.vy = 0;
    }

    if (isKeyDown('j') && this.attackTimer === 0 && this.heavyTimer === 0 && !this.isDashing) {
      this.attackComboStep = (this.attackComboStep + 1) % 3;
      this.attackTimer = this.attackCooldown;
      this.isHeavyAttacking = false;
    }

    if (isKeyDown('k') && this.attackTimer === 0 && this.heavyTimer === 0 && !this.isDashing) {
      this.heavyTimer = 15;
      this.attackComboStep = 0;
    }

    if (Math.abs(this.vx) > 0.5 && this.onGround) {
      this.walkTimer++;
      if (this.walkTimer > 5) { this.walkTimer = 0; this.walkFrame = (this.walkFrame + 1) % 4; }
    } else { this.walkFrame = 0; this.walkTimer = 0; }

    this.comboWindow = Math.max(0, this.comboWindow - 1);

    this.applyGravityAndCollision(platforms);
  }

  applyGravityAndCollision(platforms) {
    this.vy += this.gravity;
    this.x += this.vx; this.y += this.vy;
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
        else if (min === ol && this.vx >= 0) { this.x = plat.x - this.width; }
        else if (min === or && this.vx <= 0) { this.x = plat.x + plat.width; }
      }
    }
  }

  startTransform(formId) {
    this.isTransforming = true;
    this.transformTimer = 45;
    this.currentForm = formId;
    this.vx = 0;
  }

  collidesWith(r) { return this.x < r.x+r.width && this.x+this.width > r.x && this.y < r.y+r.height && this.y+this.height > r.y; }

  takeDamage(amount) {
    if (this.invincibleTimer > 0) return;
    this.health = Math.max(0, this.health - amount);
    this.invincibleTimer = 30;
  }

  isAlive() { return this.health > 0; }

  // --- DRAWING ---

  draw(ctx) {
    ctx.save();
    const cx = Math.round(this.x); const cy = Math.round(this.y);
    const f = this.facingRight ? 1 : -1;
    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 3) % 2 === 0) ctx.globalAlpha = 0.4;
    ctx.translate(cx + this.width / 2, cy + this.height);
    ctx.scale(f, 1);

    const state = this.anims.state;
    const b = this.onGround ? 0 : -2;
    const breathe = Math.sin(this.idleTimer * 0.05) * 0.4;

    if (this.isTransforming && this.transformTimer > 20) {
      this.drawBenPose(ctx, b, breathe, 'transform');
    } else if (this.currentForm === 'ben') {
      this.drawBenPose(ctx, b, breathe, state);
    } else if (this.currentForm === 'heatblast') this.drawHeatblast(ctx, b, state);
    else if (this.currentForm === 'fourarms') this.drawFourArms(ctx, b, state);
    else if (this.currentForm === 'xlr8') this.drawXLR8(ctx, b, state);
    else if (this.currentForm === 'diamondhead') this.drawDiamondhead(ctx, b, state);
    else if (this.currentForm === 'cannonbolt') this.drawCannonbolt(ctx, b, state);
    else if (this.currentForm === 'wildmutt') this.drawWildmutt(ctx, b, state);
    else this.drawBenPose(ctx, b, breathe, state);

    ctx.restore();
  }

  // ==================== BEN SPRITE ====================

  drawBenPose(ctx, b, br, state) {
    const isBlink = this.anims.isBlinking;
    const legOff = this.getLegOffset();
    const atkSwing = this.isAttacking ? -8 : 0;

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0)';

    // Legs
    ctx.fillStyle = '#1a2a4a';
    ctx.fillRect(-11, -16 + legOff.left, 9, 16);
    ctx.fillRect(2, -16 + legOff.right, 9, 16);

    // Sneakers
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(-12, -4 + legOff.left, 11, 4);
    ctx.fillRect(1, -4 + legOff.right, 11, 4);
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(-12, -4 + legOff.left, 3, 4);
    ctx.fillRect(1, -4 + legOff.right, 3, 4);

    // Shorts
    ctx.fillStyle = '#1a2a4a';
    ctx.fillRect(-14, -27 + b + br, 28, 13);
    ctx.fillStyle = '#0d1a33';
    ctx.fillRect(-14, -15 + b + br, 3, 15);
    ctx.fillRect(11, -15 + b + br, 3, 15);

    // Belt
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-14, -17 + b + br, 28, 3);
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(-2, -17 + b + br, 4, 3);

    // Torso
    const torsoGrad = ctx.createLinearGradient(0, -44 + b + br, 0, -17 + b + br);
    torsoGrad.addColorStop(0, '#ffffff');
    torsoGrad.addColorStop(1, '#e8e8e8');
    ctx.fillStyle = torsoGrad;
    ctx.fillRect(-15, -44 + b + br, 30, 28);

    // Green stripes
    ctx.fillStyle = '#00bb44';
    ctx.fillRect(-13, -42 + b + br, 26, 4);
    ctx.fillRect(-13, -25 + b + br, 26, 3);

    // Jacket outline
    ctx.strokeStyle = '#00aa44';
    ctx.lineWidth = 2;
    ctx.strokeRect(-15, -44 + b + br, 30, 28);

    // Arms
    const armBob = Math.sin(this.idleTimer * 0.05) * 1;
    ctx.fillStyle = '#e8b878';

    // Left arm (omnitrix)
    ctx.fillRect(-19, -42 + b + br + armBob, 5, 15 + atkSwing);
    ctx.fillStyle = '#111';
    ctx.fillRect(-20, -27 + b + br + atkSwing + armBob, 7, 6);
    ctx.fillStyle = '#00ff44';
    ctx.fillRect(-19, -26 + b + br + atkSwing + armBob, 5, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-18, -25.5 + b + br + atkSwing + armBob, 3, 3);

    // Right arm
    ctx.fillStyle = '#e8b878';
    ctx.fillRect(14, -42 + b + br + armBob, 5, 15 + atkSwing);

    // Head
    const headY = -58 + b + br;
    ctx.fillStyle = '#e8b878';
    this.roundRect(ctx, -14, headY, 28, 18, 4);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-15, headY - 2, 30, 6);
    ctx.beginPath();
    ctx.moveTo(-16, headY - 2); ctx.lineTo(-12, headY - 11); ctx.lineTo(-7, headY - 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-4, headY - 2); ctx.lineTo(2, headY - 13); ctx.lineTo(8, headY - 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(9, headY - 2); ctx.lineTo(14, headY - 9); ctx.lineTo(17, headY - 2); ctx.fill();

    // Eyes
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    this.roundRect(ctx, -10, headY + 5, 8, 7, 2); ctx.fill();
    this.roundRect(ctx, 2, headY + 5, 8, 7, 2); ctx.fill();
    ctx.fillStyle = isBlink ? '#e8b878' : '#33aa33';
    if (!isBlink) {
      this.roundRect(ctx, -8, headY + 7, 4, 4, 1); ctx.fill();
      this.roundRect(ctx, 4, headY + 7, 4, 4, 1); ctx.fill();
      ctx.fillStyle = '#111';
      this.roundRect(ctx, -7, headY + 8, 2, 3, 1); ctx.fill();
      this.roundRect(ctx, 5, headY + 8, 2, 3, 1); ctx.fill();
    }

    // Mouth
    ctx.fillStyle = '#c47848';
    ctx.fillRect(-4, headY + 13, 8, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-3, headY + 12, 6, 1);

    // Attack effect
    if (this.isAttacking) {
      const atkType = this.attackComboStep;
      ctx.shadowColor = '#ffee44';
      ctx.shadowBlur = 25;
      const r = atkType === 0 ? 14 : atkType === 1 ? 18 : 22;
      ctx.fillStyle = 'rgba(255, 238, 68, 0.7)';
      ctx.beginPath(); ctx.arc(22, -36 + b + br, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255, 200, 50, 0.3)';
      ctx.beginPath(); ctx.arc(22, -36 + b + br, r + 8, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5 + this.attackTimer * 0.3;
        ctx.fillStyle = 'rgba(255,255,200,0.7)';
        ctx.fillRect(20 + Math.cos(a) * (r + 6), -40 + b + br + Math.sin(a) * 10, 8, 3);
      }
    }

    // Dash trail
    if (this.isDashing) {
      ctx.shadowBlur = 0;
      for (let i = 1; i <= 5; i++) {
        ctx.globalAlpha = 0.12 - i * 0.02;
        ctx.fillStyle = '#44ccff';
        ctx.fillRect(-15 - i * 8, -44 + b + br, 30, 58);
      }
      ctx.globalAlpha = 1;
    }
  }

  // ==================== HEATBLAST ====================

  drawHeatblast(ctx, b, state) {
    // Fire body
    const grad = ctx.createRadialGradient(0, -28, 5, 0, -28, 25);
    grad.addColorStop(0, '#ff8800');
    grad.addColorStop(0.5, '#ff4400');
    grad.addColorStop(1, '#cc2200');
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 30;
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0, -26, 22, 0, Math.PI * 2); ctx.fill();

    // Rocky head
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#8B7355';
    this.roundRect(ctx, -12, -54, 24, 18, 3); ctx.fill();
    ctx.fillStyle = '#6B5335';
    ctx.fillRect(-14, -56, 28, 4);
    ctx.fillRect(-13, -52, 6, 8);
    ctx.fillRect(7, -52, 6, 8);

    // Fire eyes
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 10;
    ctx.fillRect(-8, -48, 6, 4);
    ctx.fillRect(2, -48, 6, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-6, -47, 2, 2);
    ctx.fillRect(4, -47, 2, 2);

    // Legs (fire)
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(-10, -10 + b, 8, 10);
    ctx.fillRect(2, -10 + b, 8, 10);
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(-11, -3 + b, 10, 3);
    ctx.fillRect(1, -3 + b, 10, 3);

    // Arms
    ctx.fillStyle = '#ff5500';
    ctx.fillRect(-18, -36, 5, 14);
    ctx.fillRect(13, -36, 5, 14);

    // Fire aura
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 40;
    ctx.fillStyle = 'rgba(255, 68, 0, 0.15)';
    ctx.beginPath(); ctx.arc(0, -26, 30, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ==================== FOUR ARMS ====================

  drawFourArms(ctx, b, state) {
    ctx.shadowColor = '#cc0000';
    ctx.shadowBlur = 20;

    // Legs
    ctx.fillStyle = '#4a0000';
    ctx.fillRect(-13, -14 + b, 10, 14);
    ctx.fillRect(3, -14 + b, 10, 14);
    ctx.fillStyle = '#333';
    ctx.fillRect(-14, -3 + b, 12, 4);
    ctx.fillRect(2, -3 + b, 12, 4);

    // Pants
    ctx.fillStyle = '#660000';
    ctx.fillRect(-16, -30 + b, 32, 17);

    // Belt
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(-16, -19 + b, 32, 3);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-3, -19 + b, 6, 3);

    // Large torso
    const tGrad = ctx.createRadialGradient(0, -34, 5, 0, -34, 24);
    tGrad.addColorStop(0, '#ff2222');
    tGrad.addColorStop(0.6, '#cc0000');
    tGrad.addColorStop(1, '#880000');
    ctx.fillStyle = tGrad;
    ctx.fillRect(-20, -48 + b, 40, 20);
    ctx.fillStyle = '#aa0000';
    ctx.fillRect(-18, -46 + b, 36, 4);

    // Arms (Four Arms has 4 arms)
    ctx.fillStyle = '#dd1111';
    // Upper arms
    ctx.fillRect(-26, -44 + b, 7, 18);
    ctx.fillRect(19, -44 + b, 7, 18);
    // Lower arms
    ctx.fillRect(-22, -38 + b, 5, 16);
    ctx.fillRect(17, -38 + b, 5, 16);

    // Head
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#dd1111';
    this.roundRect(ctx, -14, -60 + b, 28, 16, 4); ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(-10, -55 + b, 7, 5);
    ctx.fillRect(3, -55 + b, 7, 5);
    ctx.fillStyle = '#000';
    ctx.fillRect(-8, -54 + b, 4, 3);
    ctx.fillRect(5, -54 + b, 4, 3);

    // Mouth / teeth
    ctx.fillStyle = '#333';
    ctx.fillRect(-6, -48 + b, 12, 4);
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(-5 + i * 3, -48 + b, 2, 3);
    }

    ctx.shadowBlur = 0;
  }

  // ==================== XLR8 ====================

  drawXLR8(ctx, b, state) {
    ctx.shadowColor = '#0066ff';
    ctx.shadowBlur = 25;

    // Tail
    ctx.fillStyle = '#0044aa';
    ctx.fillRect(-20, -10 + b, 8, 10);
    ctx.fillRect(-28, -6 + b, 10, 6);
    ctx.fillRect(-34, -4 + b, 8, 4);

    // Legs
    ctx.fillStyle = '#0044bb';
    ctx.fillRect(-8, -16 + b, 6, 16);
    ctx.fillRect(2, -16 + b, 6, 16);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-9, -3 + b, 8, 3);
    ctx.fillRect(1, -3 + b, 8, 3);

    // Sleek body
    const bGrad = ctx.createLinearGradient(0, -40 + b, 0, -14 + b);
    bGrad.addColorStop(0, '#3388ff');
    bGrad.addColorStop(0.5, '#0066ff');
    bGrad.addColorStop(1, '#0044cc');
    ctx.fillStyle = bGrad;
    ctx.fillRect(-12, -40 + b, 24, 24);

    // White chest
    ctx.fillStyle = '#e0f0ff';
    ctx.fillRect(-8, -38 + b, 16, 8);

    // Arms
    ctx.fillStyle = '#0066ff';
    ctx.fillRect(-16, -36 + b, 5, 14);
    ctx.fillRect(11, -36 + b, 5, 14);

    // Head
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-14, -48 + b); ctx.lineTo(14, -48 + b);
    ctx.lineTo(12, -56 + b); ctx.lineTo(-12, -56 + b);
    ctx.closePath(); ctx.fill();

    // Visor
    ctx.fillStyle = '#66bbff';
    ctx.fillRect(-10, -53 + b, 20, 4);
    ctx.fillStyle = '#000';
    ctx.fillRect(-8, -52 + b, 4, 2);
    ctx.fillRect(4, -52 + b, 4, 2);

    // Speed lines (if moving or dashing)
    if (Math.abs(this.vx) > 2) {
      ctx.strokeStyle = 'rgba(100, 180, 255, 0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const ly = -20 + b + i * 8;
        ctx.beginPath();
        ctx.moveTo(-24, ly);
        ctx.lineTo(-24 - 8 - i * 4, ly);
        ctx.stroke();
      }
    }

    ctx.shadowBlur = 0;
  }

  // ==================== DIAMONDHEAD ====================

  drawDiamondhead(ctx, b, state) {
    ctx.shadowColor = '#88ccff';
    ctx.shadowBlur = 20;

    // Legs
    ctx.fillStyle = '#6699cc';
    ctx.fillRect(-10, -14 + b, 8, 14);
    ctx.fillRect(2, -14 + b, 8, 14);
    ctx.fillStyle = '#5588bb';
    ctx.fillRect(-11, -3 + b, 10, 4);
    ctx.fillRect(1, -3 + b, 10, 4);

    // Body
    const dGrad = ctx.createLinearGradient(0, -42 + b, 0, -14 + b);
    dGrad.addColorStop(0, '#aaeeff');
    dGrad.addColorStop(0.5, '#88ccff');
    dGrad.addColorStop(1, '#6699cc');
    ctx.fillStyle = dGrad;
    ctx.fillRect(-14, -42 + b, 28, 28);

    // Diamond facets
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(-12, -40 + b, 24, 3);
    ctx.fillRect(-10, -34 + b, 20, 2);
    ctx.fillRect(-12, -28 + b, 24, 2);

    // Arms (crystalline)
    ctx.fillStyle = '#77bbdd';
    ctx.fillRect(-18, -38 + b, 5, 14);
    ctx.fillRect(13, -38 + b, 5, 14);
    // Crystal spikes on arms
    ctx.fillStyle = '#aaeeff';
    ctx.beginPath();
    ctx.moveTo(-18, -38 + b); ctx.lineTo(-22, -42 + b); ctx.lineTo(-17, -36 + b); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(13, -38 + b); ctx.lineTo(17, -42 + b); ctx.lineTo(12, -36 + b); ctx.fill();

    // Head (crystal shape)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#88ccff';
    ctx.beginPath();
    ctx.moveTo(-14, -48 + b);
    ctx.lineTo(-10, -60 + b);
    ctx.lineTo(0, -63 + b);
    ctx.lineTo(10, -60 + b);
    ctx.lineTo(14, -48 + b);
    ctx.closePath(); ctx.fill();

    // Diamond on forehead
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, -62 + b);
    ctx.lineTo(4, -58 + b);
    ctx.lineTo(0, -54 + b);
    ctx.lineTo(-4, -58 + b);
    ctx.closePath(); ctx.fill();

    // Eyes
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 6;
    ctx.fillRect(-8, -53 + b, 5, 3);
    ctx.fillRect(3, -53 + b, 5, 3);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-6, -52 + b, 2, 2);
    ctx.fillRect(5, -52 + b, 2, 2);

    ctx.shadowBlur = 0;
  }

  // ==================== CANNONBOLT ====================

  drawCannonbolt(ctx, b, state) {
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 20;

    // Large round body
    const cGrad = ctx.createRadialGradient(0, -22 + b, 5, 0, -22 + b, 28);
    cGrad.addColorStop(0, '#ffaa33');
    cGrad.addColorStop(0.4, '#ff8800');
    cGrad.addColorStop(0.8, '#cc6600');
    cGrad.addColorStop(1, '#994400');
    ctx.fillStyle = cGrad;
    ctx.beginPath(); ctx.arc(0, -22 + b, 26, 0, Math.PI * 2); ctx.fill();

    // Shell pattern
    ctx.strokeStyle = 'rgba(255,200,100,0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      ctx.beginPath();
      ctx.moveTo(0, -22 + b);
      ctx.lineTo(Math.cos(a) * 24, -22 + b + Math.sin(a) * 24);
      ctx.stroke();
    }

    // Small legs
    ctx.fillStyle = '#aa5500';
    ctx.fillRect(-10, -4 + b, 7, 4);
    ctx.fillRect(3, -4 + b, 7, 4);
    ctx.fillRect(-12, -2 + b, 5, 2);
    ctx.fillRect(7, -2 + b, 5, 2);

    // Head (small, sticking out)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#cc7700';
    this.roundRect(ctx, -8, -46 + b, 16, 14, 4); ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(-6, -42 + b, 5, 4);
    ctx.fillRect(1, -42 + b, 5, 4);
    ctx.fillStyle = '#000';
    ctx.fillRect(-4, -41 + b, 3, 2);
    ctx.fillRect(3, -41 + b, 3, 2);

    // Mouth
    ctx.fillStyle = '#553300';
    ctx.fillRect(-3, -36 + b, 6, 2);

    ctx.shadowBlur = 0;
  }

  // ==================== WILDMUTT ====================

  drawWildmutt(ctx, b, state) {
    ctx.shadowColor = '#cc6600';
    ctx.shadowBlur = 20;

    // Body (quadrupedal stance)
    const wGrad = ctx.createRadialGradient(0, -20 + b, 5, 0, -20 + b, 24);
    wGrad.addColorStop(0, '#ee8833');
    wGrad.addColorStop(0.5, '#cc6600');
    wGrad.addColorStop(1, '#994400');
    ctx.fillStyle = wGrad;
    ctx.beginPath(); ctx.arc(0, -20 + b, 22, 0, Math.PI * 2); ctx.fill();

    // Spikes on back
    ctx.fillStyle = '#884422';
    for (let i = -2; i <= 2; i++) {
      const sx = i * 8;
      ctx.beginPath();
      ctx.moveTo(sx - 3, -36 + b);
      ctx.lineTo(sx, -44 + b);
      ctx.lineTo(sx + 3, -36 + b);
      ctx.fill();
    }

    // Legs
    ctx.fillStyle = '#bb5500';
    ctx.fillRect(-16, -8 + b, 6, 8);
    ctx.fillRect(10, -8 + b, 6, 8);
    ctx.fillRect(-18, -6 + b, 4, 4);
    ctx.fillRect(14, -6 + b, 4, 4);

    // Tail
    ctx.fillStyle = '#cc6600';
    ctx.fillRect(-24, -14 + b, 8, 6);
    ctx.fillRect(-28, -16 + b, 6, 4);
    ctx.fillStyle = '#884422';
    ctx.beginPath();
    ctx.moveTo(-28, -16 + b); ctx.lineTo(-32, -20 + b); ctx.lineTo(-26, -14 + b); ctx.fill();

    // Head (no eyes - Wildmutt is blind)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#dd7700';
    this.roundRect(ctx, -10, -46 + b, 20, 16, 5); ctx.fill();

    // Mouth
    ctx.fillStyle = '#442200';
    ctx.fillRect(-8, -36 + b, 16, 5);
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(-7 + i * 3, -36 + b, 2, 4);
    }
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(-9, -32 + b, 18, 2);

    // Nose/snout
    ctx.fillStyle = '#553300';
    ctx.fillRect(-4, -42 + b, 8, 4);
    ctx.fillStyle = '#222';
    ctx.fillRect(-2, -41 + b, 2, 2);
    ctx.fillRect(1, -41 + b, 2, 2);

    ctx.shadowBlur = 0;
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
    if (!this.onGround || (Math.abs(this.vx) < 0.5 && !this.isDashing)) return { left: 0, right: 0 };
    switch (this.walkFrame) {
      case 0: return { left: 0, right: 0 };
      case 1: return { left: 5, right: -3 };
      case 2: return { left: 0, right: 0 };
      case 3: return { left: -3, right: 5 };
      default: return { left: 0, right: 0 };
    }
  }
}
