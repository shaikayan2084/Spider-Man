const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 960; canvas.height = 540;

let gameState = 'menu';
let currentLevel = 0;
let player, camera, enemies, platforms, bgData, levelDecor;
let particles = [], shockwaves = [];
let shakeX = 0, shakeY = 0, shakeIntensity = 0;
let gameTime = 0, menuTime = 0;
let score = 0, comboCount = 0, comboTimer = 0;
let omnitrixEnergy = 100;
let hitStop = 0;
let showOmnitrixWheel = false;
let selectedAlien = 0;
let wheelTimer = 0;
let transformPhase = 0;
let transformTimer = 0;
let screenFlash = 0;
let screenFlashColor = '#00ff88';
let slowMo = 0;
let ambientTimer = 0;
let smokeParticles = [];
let birdPositions = [];

const alienForms = [
  { id: 'heatblast', name: 'Heatblast', color: '#ff4400', key: 1 },
  { id: 'fourarms', name: 'Four Arms', color: '#cc0000', key: 2 },
  { id: 'xlr8', name: 'XLR8', color: '#0066ff', key: 3 },
  { id: 'diamondhead', name: 'Diamondhead', color: '#88ccff', key: 4 },
  { id: 'cannonbolt', name: 'Cannonbolt', color: '#ff8800', key: 5 },
  { id: 'wildmutt', name: 'Wildmutt', color: '#cc6600', key: 6 },
];

// =============== PARTICLES ===============

class Particle {
  constructor(x, y, color, size, vx, vy, life, type) {
    this.x = x; this.y = y;
    this.color = color; this.size = size;
    this.vx = vx; this.vy = vy;
    this.life = life; this.maxLife = life;
    this.type = type || 'spark';
    this.gravity = 0;
    this.rotation = Math.random() * 6.28;
    this.rotSpeed = (Math.random() - 0.5) * 0.3;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= 0.96; this.life--;
    this.rotation += this.rotSpeed;
    if (this.type === 'spark') this.size *= 0.95;
  }
  draw(ctx) {
    const a = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = a;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.type === 'energy' ? 18 : this.type === 'explosion' ? 30 : 8;
    ctx.fillStyle = this.color;
    if (this.type === 'spark') {
      ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rotation);
      ctx.fillRect(-this.size/2, -this.size/6, this.size, this.size/3);
      ctx.restore();
    } else if (this.type === 'glow') {
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.5);
      g.addColorStop(0, this.color); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size * 2.5, 0, 6.28); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size * a, 0, 6.28); ctx.fill();
    }
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }
}

class Shockwave {
  constructor(x, y, radius, color) {
    this.x = x; this.y = y;
    this.radius = radius || 10;
    this.maxRadius = radius ? radius * 4 : 60;
    this.color = color || '#fff';
    this.life = 20;
  }
  update() {
    this.radius += (this.maxRadius - this.radius) * 0.15;
    this.life--;
  }
  draw(ctx) {
    const a = this.life / 20;
    ctx.globalAlpha = a * 0.5;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, 6.28); ctx.stroke();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }
}

function spawnParticles(x, y, type, count) {
  const cfgs = {
    spark:     { c: ['#ffdd44','#ffaa00','#fff'], s: [2,6], spd: [2,7], l: [8,18], g: 0, t: 'spark' },
    hit:       { c: ['#ff4444','#ff8800','#ffff00','#fff'], s: [3,9], spd: [3,9], l: [12,28], g: 0.08, t: 'spark' },
    dust:      { c: ['#8899aa','#99aabb','#fff'], s: [4,12], spd: [1,4], l: [20,45], g: 0.04, t: 'glow' },
    energy:    { c: ['#00ff88','#00ccff','#44ffaa','#fff'], s: [4,12], spd: [2,8], l: [15,35], g: -0.03, t: 'energy' },
    dash:      { c: ['#44ccff','#88ddff','#fff'], s: [3,8], spd: [1,3], l: [8,20], g: 0, t: 'spark' },
    death:     { c: ['#ff4400','#ff8800','#ffcc00','#fff'], s: [6,18], spd: [3,12], l: [25,55], g: 0.1, t: 'explosion' },
    transform: { c: ['#00ff88','#44ffaa','#88ffcc'], s: [5,16], spd: [2,10], l: [20,45], g: -0.02, t: 'energy' },
    fire:      { c: ['#ff4400','#ff6600','#ffaa00','#ffcc00'], s: [4,14], spd: [1,5], l: [15,35], g: -0.02, t: 'glow' },
    crystal:   { c: ['#88ccff','#aaddff','#fff'], s: [3,10], spd: [2,7], l: [12,30], g: 0.06, t: 'spark' },
    rock:      { c: ['#8B7355','#6B5335','#a08060'], s: [4,12], spd: [2,6], l: [20,40], g: 0.1, t: 'spark' },
  };
  const cfg = cfgs[type] || cfgs.spark;
  for (let i = 0; i < count; i++) {
    const a = Math.random() * 6.28;
    const s = cfg.spd[0] + Math.random() * (cfg.spd[1] - cfg.spd[0]);
    const p = new Particle(
      x + (Math.random() - 0.5) * 12, y + (Math.random() - 0.5) * 12,
      cfg.c[Math.floor(Math.random() * cfg.c.length)],
      cfg.s[0] + Math.random() * (cfg.s[1] - cfg.s[0]),
      Math.cos(a) * s, Math.sin(a) * s - 1,
      cfg.l[0] + Math.random() * (cfg.l[1] - cfg.l[0]), cfg.t
    );
    p.gravity = cfg.g;
    particles.push(p);
  }
}

function triggerShake(intensity) { shakeIntensity = Math.max(shakeIntensity, intensity); }
function flashScreen(c, dur) { screenFlash = dur || 15; screenFlashColor = c || '#fff'; }

// =============== LEVEL INIT ===============

function initLevel(index) {
  const lvl = levels[index];
  player = new Player(lvl.playerStart.x, lvl.playerStart.y);
  camera = new Camera(canvas.width, canvas.height);
  platforms = lvl.platforms;
  bgData = lvl.background;
  levelDecor = lvl.decorations || [];
  enemies = lvl.enemies.map(e => new Enemy(e.x, e.y, e.patrolMin, e.patrolMax, e.type || 'robot'));
  particles = []; shockwaves = []; smokeParticles = [];
  shakeIntensity = 0; score = 0; comboCount = 0; comboTimer = 0;
  omnitrixEnergy = 100; hitStop = 0; showOmnitrixWheel = false;
  selectedAlien = 0; wheelTimer = 0; transformPhase = 0; transformTimer = 0;
  screenFlash = 0; slowMo = 0; gameTime = 0;

  // Generate birds
  birdPositions = [];
  for (let i = 0; i < 4; i++) {
    birdPositions.push({ x: Math.random() * canvas.width, y: 60 + Math.random() * 80, speed: 0.5 + Math.random() * 1, phase: Math.random() * 6.28 });
  }
}

function rectCollision(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

// =============== COMBAT ===============

function checkCombat() {
  if (player.isAttacking) {
    const atkBox = {
      x: player.facingRight ? player.x + player.width : player.x - player.attackRange,
      y: player.y + 6, width: player.attackRange, height: 28,
    };
    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;
      if (rectCollision(atkBox, enemy)) {
        const dmg = player.isHeavyAttacking ? player.attackDamage * 2 : player.attackDamage;
        enemy.takeDamage(dmg);
        enemy.knockbackX = player.facingRight ? 10 : -10;
        enemy.knockbackY = player.isHeavyAttacking ? -6 : -3;
        enemy.stunTimer = player.isHeavyAttacking ? 25 : 15;
        enemy.hurtFlash = 12;
        player.isAttacking = false;
        hitStop = player.isHeavyAttacking ? 8 : 5;
        triggerShake(player.isHeavyAttacking ? 10 : 5);
        flashScreen(player.isHeavyAttacking ? '#ffee00' : '#ffee44', player.isHeavyAttacking ? 8 : 4);
        const ptype = player.isHeavyAttacking ? 'death' : 'hit';
        spawnParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, ptype, player.isHeavyAttacking ? 30 : 18);

        if (player.isHeavyAttacking) {
          shockwaves.push(new Shockwave(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 15, '#ffcc00'));
        }

        comboCount++;
        comboTimer = 90;
        score += 50 * Math.min(comboCount, 10) * (player.isHeavyAttacking ? 2 : 1);

        if (!enemy.isAlive()) {
          spawnParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 'death', 40);
          triggerShake(12);
          flashScreen('#ff4400', 10);
          shockwaves.push(new Shockwave(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 20, '#ff4400'));
          slowMo = 8;
          score += 300;
        }
      }
    }
  }

  for (const enemy of enemies) {
    if (!enemy.isAlive()) continue;
    if (enemy.attackCooldown > 20 && rectCollision(player, enemy)) {
      player.takeDamage(enemy.attackDamage);
      hitStop = 3;
      triggerShake(8);
      flashScreen('#ff0000', 6);
      spawnParticles(player.x + player.width/2, player.y + player.height/2, 'spark', 14);
    }
  }
}

// =============== OMNITRIX ===============

function openOmnitrix() {
  if (showOmnitrixWheel || player.isTransforming || player.transformTimer > 0) return;
  if (omnitrixEnergy < 20) return;
  showOmnitrixWheel = true; wheelTimer = 0;
}

function confirmTransform(idx) {
  showOmnitrixWheel = false;
  const form = alienForms[idx];
  transformPhase = 1;
  transformTimer = 60;
  omnitrixEnergy = Math.max(0, omnitrixEnergy - 20);
  triggerShake(12);
  flashScreen('#00ff88', 25);
  spawnParticles(player.x + player.width/2, player.y + player.height/2, 'transform', 60);
}

function updateOmnitrixWheel() {
  if (!showOmnitrixWheel) return;
  wheelTimer++;

  if (isKeyDown('t') && wheelTimer > 5) { showOmnitrixWheel = false; return; }

  for (let i = 0; i < alienForms.length; i++) {
    if (isKeyDown(String(alienForms[i].key)) && wheelTimer > 5) {
      selectedAlien = i;
      confirmTransform(i);
      return;
    }
  }

  if (isKeyDown('arrowright') && wheelTimer % 10 === 0) selectedAlien = (selectedAlien + 1) % alienForms.length;
  if (isKeyDown('arrowleft') && wheelTimer % 10 === 0) selectedAlien = (selectedAlien - 1 + alienForms.length) % alienForms.length;

  if (isKeyDown('enter') && wheelTimer > 10) { confirmTransform(selectedAlien); }
}

function updateTransformation() {
  if (transformPhase === 0) return;
  transformTimer--;
  const p = player;

  if (transformTimer > 45) {
    spawnParticles(p.x + p.width/2, p.y + p.height/2, 'transform', 3);
    triggerShake(2);
  } else if (transformTimer > 25) {
    if (gameTime % 3 === 0) { triggerShake(5); flashScreen('#00ff88', 4); }
    spawnParticles(p.x + p.width/2, p.y + p.height/2, 'energy', 6);
  } else if (transformTimer > 8) {
    spawnParticles(p.x + p.width/2, p.y + p.height/2, 'transform', 4);
  } else if (transformTimer === 8) {
    const formId = alienForms[selectedAlien].id;
    flashScreen('#fff', 18);
    triggerShake(15);
    spawnParticles(p.x + p.width/2, p.y + p.height/2, 'death', 50);
    player.startTransform(formId);
  }

  if (transformTimer <= 0) { transformPhase = 0; }
}

// =============== ENEMY AI ===============

function updateEnemyAI() {
  for (const enemy of enemies) {
    if (enemy.isAlive()) enemy.update(platforms, player);
  }
}

// =============== ATMOSPHERE ===============

function spawnSmoke() {
  if (gameTime % 8 === 0 && Math.random() < 0.3) {
    const sx = (gameTime * 3 % 2000) - 200;
    smokeParticles.push(new Particle(sx, 510, 'rgba(100,110,120,0.15)', 15 + Math.random() * 20, 0.2, -0.3, 60 + Math.random() * 40, 'glow'));
  }
  smokeParticles = smokeParticles.filter(p => p.life > 0);
  for (const p of smokeParticles) p.update();
}

// =============== BACKGROUND ===============

function drawBackground() {
  const camX = camera.x;
  const bg = bgData || { skyTop: '#07071e', skyBot: '#1a1a45', stars: [], farBuildings: [], midBuildings: [] };

  // Sky
  const grad = ctx.createLinearGradient(0, 0, 0, 540);
  grad.addColorStop(0, bg.skyTop || '#07071e');
  grad.addColorStop(0.4, bg.skyMid || '#0f0f30');
  grad.addColorStop(1, bg.skyBot || '#1a1a45');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 960, 540);

  // Stars
  if (bg.stars) {
    for (const star of bg.stars) {
      const sx = ((star.x - camX * star.parallax) % 3000 + 3000) % 3000 - 200;
      const sy = star.y;
      if (sy > -10 && sy < 540) {
        const tw = 0.3 + 0.7 * Math.sin(gameTime * star.speed + star.phase);
        ctx.globalAlpha = tw * 0.9; ctx.fillStyle = '#fff';
        ctx.fillRect(sx, sy, star.size, star.size);
      }
    }
    ctx.globalAlpha = 1;
  }

  // Moon
  if (bg.moon) {
    const mx = bg.moon.x - camX * 0.03;
    ctx.shadowColor = '#aaccff'; ctx.shadowBlur = 60;
    ctx.fillStyle = '#ddeeff'; ctx.beginPath(); ctx.arc(mx, bg.moon.y, bg.moon.size || 35, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#b8d0e8'; ctx.beginPath(); ctx.arc(mx - 8, bg.moon.y - 5, (bg.moon.size || 35) * 0.8, 0, 6.28); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Birds
  for (const b of birdPositions) {
    const bx = ((b.x - camX * 0.05) % 1200 + 1200) % 1200 - 200;
    const by = b.y + Math.sin(gameTime * b.speed + b.phase) * 8;
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(bx, by, 4, 0, 6.28); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx - 8, by - 2); ctx.lineTo(bx - 14, by - 6); ctx.lineTo(bx - 4, by); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx + 8, by - 2); ctx.lineTo(bx + 14, by - 6); ctx.lineTo(bx + 4, by); ctx.fill();
  }

  // Far buildings
  if (bg.farBuildings) {
    for (const b of bg.farBuildings) {
      const bx = b.x - camX * (b.parallax || 0.08);
      const by = 540 - b.h - 40;
      ctx.fillStyle = b.color; ctx.fillRect(bx, by, b.w, b.h);
      if (b.windows) {
        for (let wy = by + 15; wy < by + b.h - 15; wy += 25) {
          for (let wx = bx + 8; wx < bx + b.w - 8; wx += 22) {
            if ((Math.floor(wx * 7 + wy * 13 + b.x) % 10) > 3) {
              ctx.fillStyle = `rgba(255,200,80,${0.2 + 0.15 * Math.sin(gameTime * 0.02 + wx)})`;
              ctx.fillRect(wx, wy, 8, 12);
            }
          }
        }
      }
    }
  }

  // Mid buildings
  if (bg.midBuildings) {
    for (const b of bg.midBuildings) {
      const bx = b.x - camX * (b.parallax || 0.25);
      const by = 540 - b.h - 40;
      ctx.fillStyle = b.color; ctx.fillRect(bx, by, b.w, b.h);
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(bx, by, b.w, 2);
      if (b.windows) {
        for (let wy = by + 12; wy < by + b.h - 12; wy += 28) {
          for (let wx = bx + 10; wx < bx + b.w - 10; wx += 24) {
            if ((Math.floor(wx * 7 + wy * 17 + b.x) % 10) > 2) {
              ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 10;
              ctx.fillStyle = `rgba(255,220,100,${0.4 + 0.2 * Math.sin(gameTime * 0.03 + wx * 0.1)})`;
              ctx.fillRect(wx, wy, 10, 14);
              ctx.shadowBlur = 0;
            }
          }
        }
      }
    }
  }

  // Street lights
  const lightPositions = [150, 450, 780, 1100, 1450, 1800, 2150, 2500, 2850];
  for (const lx of lightPositions) {
    const sx = lx - camX;
    if (sx > -80 && sx < 1040) {
      ctx.fillStyle = '#555'; ctx.fillRect(sx - 1, 488, 3, 30);
      ctx.fillStyle = '#777'; ctx.fillRect(sx - 5, 486, 11, 4);
      const g = ctx.createRadialGradient(sx, 516, 0, sx, 516, 100);
      g.addColorStop(0, 'rgba(255,230,150,0.12)');
      g.addColorStop(0.5, 'rgba(255,230,150,0.04)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, 516, 100, 0, 6.28); ctx.fill();
      ctx.shadowColor = '#ffdd88'; ctx.shadowBlur = 20;
      ctx.fillStyle = 'rgba(255,230,150,0.7)'; ctx.fillRect(sx - 2, 484, 5, 5);
      ctx.shadowBlur = 0;
    }
  }

  // Smoke
  for (const p of smokeParticles) { p.draw(ctx); }

  // Platforms
  for (const plat of platforms) {
    const px = plat.x - camX;
    const py = plat.y;
    const pg = ctx.createLinearGradient(0, py, 0, py + plat.height);
    pg.addColorStop(0, plat.colorTop || '#3a3a5a');
    pg.addColorStop(0.3, plat.colorMid || '#2a2a4a');
    pg.addColorStop(1, plat.colorBot || '#1a1a3a');
    ctx.fillStyle = pg; ctx.fillRect(px, py, plat.width, plat.height);
    ctx.fillStyle = 'rgba(0,255,136,0.1)'; ctx.fillRect(px, py, plat.width, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(px, py + 3, plat.width, 1);
    if (plat.edge) {
      ctx.fillStyle = 'rgba(0,255,136,0.15)'; ctx.fillRect(px, py, 3, plat.height);
      ctx.fillRect(px + plat.width - 3, py, 3, plat.height);
    }
  }
}

// =============== HUD ===============

function drawHUD() {
  const p = player;

  // Health bar with Omnitrix styling
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  roundRect(ctx, 12, 10, 230, 36, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(0,255,136,0.25)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 12, 10, 230, 36, 8); ctx.stroke();

  const hpPct = p.health / p.maxHealth;
  const hpGrad = ctx.createLinearGradient(14, 0, 238, 0);
  if (hpPct > 0.6) { hpGrad.addColorStop(0, '#2ecc71'); hpGrad.addColorStop(1, '#27ae60'); }
  else if (hpPct > 0.3) { hpGrad.addColorStop(0, '#f39c12'); hpGrad.addColorStop(1, '#e67e22'); }
  else { hpGrad.addColorStop(0, '#e74c3c'); hpGrad.addColorStop(1, '#c0392b'); }
  ctx.fillStyle = hpGrad;
  ctx.shadowColor = hpPct > 0.6 ? 'rgba(46,204,113,0.4)' : 'rgba(231,76,60,0.4)';
  ctx.shadowBlur = 12;
  roundRect(ctx, 14, 12, Math.max(2, hpPct * 226), 32, 6); ctx.fill();
  ctx.shadowBlur = 0;

  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  roundRect(ctx, 14, 12, Math.max(2, hpPct * 226), 12, 6); ctx.fill();

  // HP Icon and text
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 11px "Segoe UI", sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('BEN', 20, 28);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '10px "Segoe UI", sans-serif';
  ctx.fillText(Math.ceil(p.health) + '/' + p.maxHealth, 52, 28);

  // Alien name
  const formName = p.currentForm && p.currentForm !== 'ben' ?
    alienForms.find(f => f.id === p.currentForm)?.name || 'BEN' : 'BEN';
  ctx.shadowColor = 'rgba(0,255,136,0.5)';
  ctx.shadowBlur = 25;
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 24px Oswald, Bangers, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText(formName.toUpperCase(), 480, 12);
  ctx.shadowBlur = 0;

  // Level name
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = '10px "Segoe UI", sans-serif';
  ctx.fillText(levels[currentLevel].name.toUpperCase(), 480, 40);

  // Combo
  if (comboCount > 1 && comboTimer > 0) {
    ctx.save();
    const scale = 1 + Math.sin(gameTime * 0.25) * 0.05;
    ctx.translate(480, 90); ctx.scale(scale, scale);
    ctx.shadowColor = 'rgba(255,200,50,0.7)'; ctx.shadowBlur = 30;
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 32px Bangers, Oswald, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('COMBO x' + comboCount, 0, 0);
    ctx.restore();
  }

  // Score
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '14px "Segoe UI", sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'top';
  ctx.fillText('SCORE  ' + score.toLocaleString(), 940, 14);

  // Omnitrix bar (bottom center)
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  roundRect(ctx, 340, 54, 280, 20, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(0,255,136,0.15)';
  ctx.lineWidth = 1;
  roundRect(ctx, 340, 54, 280, 20, 6); ctx.stroke();

  const oe = omnitrixEnergy;
  ctx.fillStyle = 'rgba(0,255,136,0.15)';
  roundRect(ctx, 342, 56, 276, 16, 4); ctx.fill();
  const oGrad = ctx.createLinearGradient(342, 0, 618, 0);
  oGrad.addColorStop(0, '#00ff88'); oGrad.addColorStop(1, '#00ccff');
  ctx.fillStyle = oGrad;
  ctx.shadowColor = 'rgba(0,255,136,0.3)'; ctx.shadowBlur = 10;
  roundRect(ctx, 342, 56, (oe / 100) * 276, 16, 4); ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '9px "Segoe UI", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('OMNITRIX ENERGY', 480, 64);

  // Enemy health
  const aliveEnemy = enemies.find(e => e.isAlive() && Math.abs(e.x - player.x) < 600);
  if (aliveEnemy) {
    const eh = aliveEnemy.health / aliveEnemy.maxHealth;
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    roundRect(ctx, 340, 80, 280, 18, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(255,68,68,0.25)';
    ctx.lineWidth = 1;
    roundRect(ctx, 340, 80, 280, 18, 5); ctx.stroke();
    ctx.fillStyle = '#e74c3c';
    ctx.shadowColor = 'rgba(231,76,60,0.4)'; ctx.shadowBlur = 8;
    roundRect(ctx, 342, 82, Math.max(2, eh * 276), 14, 4); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px "Segoe UI", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('ENEMY', 480, 89);
  }

  // Transform hint
  if (omnitrixEnergy >= 20 && p.currentForm === 'ben' && !p.isTransforming && !showOmnitrixWheel) {
    const pulse = 0.4 + 0.6 * Math.sin(gameTime * 0.04);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#00ff88';
    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('Press [T] to Transform', 480, 530);
    ctx.globalAlpha = 1;
  }

  // Controls
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.font = '10px "Segoe UI", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('A/D Walk | Space Jump | J Attack | K Heavy | Shift Dash | T Transform', 480, 540);
}

// =============== OMNITRIX WHEEL ===============

function drawOmnitrixWheel() {
  if (!showOmnitrixWheel) return;

  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, 960, 540);

  const cx = 480, cy = 270;
  const radius = 130 + Math.sin(wheelTimer * 0.08) * 4;
  const aStep = 6.28 / alienForms.length;
  const startAngle = -1.57;

  // Glow
  ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 60;
  ctx.fillStyle = 'rgba(0,255,136,0.04)';
  ctx.beginPath(); ctx.arc(cx, cy, radius + 35, 0, 6.28); ctx.fill();

  // Outer ring
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(0,255,136,0.15)';
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, 6.28); ctx.stroke();

  ctx.strokeStyle = 'rgba(0,255,136,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, 6.28); ctx.stroke();

  // Inner ring
  ctx.strokeStyle = 'rgba(0,255,136,0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, radius * 0.45, 0, 6.28); ctx.stroke();

  // Connecting lines
  ctx.strokeStyle = 'rgba(0,255,136,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i < alienForms.length; i++) {
    const a = startAngle + i * aStep;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
    ctx.stroke();
  }

  // Alien slots
  for (let i = 0; i < alienForms.length; i++) {
    const a = startAngle + i * aStep;
    const ax = cx + Math.cos(a) * radius * 0.74;
    const ay = cy + Math.sin(a) * radius * 0.74;
    const sel = i === selectedAlien;
    const slotR = sel ? 32 : 24;

    // Slot bg
    ctx.shadowColor = sel ? alienForms[i].color : 'transparent';
    ctx.shadowBlur = sel ? 30 : 0;
    ctx.fillStyle = sel ? alienForms[i].color : 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.arc(ax, ay, slotR, 0, 6.28); ctx.fill();

    if (sel) {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(ax, ay, slotR + 4, 0, 6.28); ctx.stroke();

      // Pulsing glow
      ctx.shadowColor = alienForms[i].color;
      ctx.shadowBlur = 50;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath(); ctx.arc(ax, ay, slotR + 12 + Math.sin(wheelTimer * 0.15) * 5, 0, 6.28); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Icon
    ctx.fillStyle = '#fff';
    ctx.font = sel ? 'bold 18px "Segoe UI", sans-serif' : '14px "Segoe UI", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(alienForms[i].name.charAt(0), ax, ay);

    // Name
    ctx.fillStyle = sel ? '#fff' : 'rgba(255,255,255,0.4)';
    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.fillText(alienForms[i].name, ax, ay + slotR + 18);

    // Key number
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '9px "Segoe UI", sans-serif';
    ctx.fillText(String(alienForms[i].key), ax, ay - slotR - 14);
  }

  // Center
  ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 35;
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 18px Oswald, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('SELECT FORM', cx, cy);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = '10px "Segoe UI", sans-serif';
  ctx.fillText('T Cancel | 1-6 Select | Enter Confirm', cx, cy + 180);

  // Selected preview
  const preview = alienForms[selectedAlien];
  ctx.shadowColor = preview.color; ctx.shadowBlur = 20;
  ctx.fillStyle = preview.color;
  roundRect(ctx, cx - 60, cy + 200, 120, 22, 6); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px "Segoe UI", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(preview.name.toUpperCase(), cx, cy + 211);
}

// =============== MENU ===============

function drawMenu() {
  menuTime += 0.016;

  const grad = ctx.createRadialGradient(480, 270, 50, 480, 270, 600);
  grad.addColorStop(0, '#0a1a2e'); grad.addColorStop(0.5, '#050d1a'); grad.addColorStop(1, '#000005');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 960, 540);

  // Particles
  for (let i = 0; i < 50; i++) {
    const px = ((i * 137 + menuTime * 25 * (1 + i % 3)) % 1060) - 50;
    const py = ((i * 251 + menuTime * 10 * (1 + i % 2)) % 600) - 50;
    const ps = 1 + (i % 3);
    ctx.globalAlpha = 0.1 + 0.2 * Math.sin(menuTime * (0.4 + i * 0.08) + i);
    ctx.fillStyle = '#00ff88';
    ctx.beginPath(); ctx.arc(px, py, ps, 0, 6.28); ctx.fill();
  }
  ctx.globalAlpha = 1;

  const glow = 0.4 + 0.6 * Math.sin(menuTime * 1.8);
  const cx = 480, cy = 140;

  // Omnitrix rings
  ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 120 * glow;
  ctx.fillStyle = 'rgba(0,255,136,0.06)';
  ctx.beginPath(); ctx.arc(cx, cy, 130, 0, 6.28); ctx.fill();
  ctx.shadowBlur = 60 * glow;
  ctx.fillStyle = 'rgba(0,255,136,0.1)';
  ctx.beginPath(); ctx.arc(cx, cy, 85, 0, 6.28); ctx.fill();

  // Outer ring
  ctx.shadowBlur = 40;
  ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, 48, 0, 6.28); ctx.stroke();

  // Rotating dots
  for (let i = 0; i < 8; i++) {
    const a = i * 0.785 + menuTime * 0.4;
    ctx.fillStyle = '#00ff88'; ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 56, cy + Math.sin(a) * 56, 3 + Math.sin(menuTime * 2 + i) * 1, 0, 6.28); ctx.fill();
  }

  // Center
  ctx.shadowBlur = 25;
  ctx.fillStyle = '#00ff88';
  ctx.beginPath(); ctx.arc(cx, cy, 28, 0, 6.28); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#0a1a2e';
  ctx.beginPath(); ctx.arc(cx, cy, 19, 0, 6.28); ctx.fill();

  // Hourglass
  ctx.fillStyle = '#00ff88';
  ctx.beginPath();
  ctx.moveTo(cx - 9, cy - 8); ctx.lineTo(cx + 9, cy - 8);
  ctx.lineTo(cx + 5, cy); ctx.lineTo(cx + 9, cy + 8);
  ctx.lineTo(cx - 9, cy + 8); ctx.lineTo(cx - 5, cy);
  ctx.closePath(); ctx.fill();

  // Title
  ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 50 * glow;
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 86px Bangers, Oswald, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('BEN 10', cx, 260);

  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '20px "Segoe UI", sans-serif';
  ctx.fillText('FAN GAME', cx, 310);

  // Press enter
  const pulse = 0.4 + 0.6 * Math.sin(menuTime * 2.2);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#fff';
  ctx.font = '22px "Segoe UI", sans-serif';
  ctx.fillText('Press ENTER to Start', cx, 410);
  ctx.globalAlpha = 1;

  // Controls
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.font = '12px "Segoe UI", sans-serif';
  ctx.fillText('A/D Move | Space Jump | J Attack | K Heavy | Shift Dash | T Transform | 1-6 Aliens', cx, 490);

  // Bottom glow
  ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 40;
  ctx.fillStyle = 'rgba(0,255,136,0.03)';
  ctx.fillRect(0, 520, 960, 20);
  ctx.shadowBlur = 0;
}

// =============== GAME OVER ===============

function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(0, 0, 960, 540);

  ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 50;
  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 70px Bangers, Oswald, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('GAME OVER', 480, 240);

  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '22px "Segoe UI", sans-serif';
  ctx.fillText('Score: ' + score.toLocaleString(), 480, 290);

  const pulse = 0.4 + 0.6 * Math.sin(gameTime * 0.05);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '18px "Segoe UI", sans-serif';
  ctx.fillText('Press ENTER to Continue', 480, 350);
  ctx.globalAlpha = 1;
}

// =============== DRAWING HELPERS ===============

function roundRect(ctx, x, y, w, h, r) {
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

// =============== UPDATE ===============

function update() {
  if (gameState === 'menu') {
    if (isKeyDown('enter')) { gameState = 'playing'; initLevel(currentLevel); }
    return;
  }

  if (gameState === 'gameover') {
    gameTime++;
    if (isKeyDown('enter')) { gameState = 'menu'; }
    return;
  }

  if (gameState !== 'playing') return;

  if (slowMo > 0) {
    slowMo--;
    if (slowMo % 2 === 0) return;
  }

  gameTime++;
  ambientTimer++;

  if (hitStop > 0) { hitStop--; return; }

  if (comboTimer > 0) comboTimer--;
  else comboCount = 0;

  // Omnitrix wheel
  if (isKeyDown('t') && !showOmnitrixWheel && !player.isTransforming && player.transformTimer === 0) {
    openOmnitrix();
  }

  if (showOmnitrixWheel) { updateOmnitrixWheel(); return; }

  if (transformPhase > 0) { updateTransformation(); return; }

  player.update(platforms);

  if (player.isDashing) {
    const pType = player.currentForm === 'heatblast' ? 'fire' :
                  player.currentForm === 'diamondhead' ? 'crystal' :
                  player.currentForm === 'xlr8' ? 'dash' : 'dash';
    spawnParticles(player.x + player.width/2, player.y + player.height, pType, 2);
  }

  checkCombat();
  updateEnemyAI();
  spawnSmoke();

  particles = particles.filter(p => p.life > 0);
  for (const p of particles) p.update();

  shockwaves = shockwaves.filter(s => s.life > 0);
  for (const s of shockwaves) s.update();

  camera.follow(player, levels[currentLevel].width, levels[currentLevel].height);

  if (shakeIntensity > 0) {
    shakeX = (Math.random() - 0.5) * shakeIntensity * 2.5;
    shakeY = (Math.random() - 0.5) * shakeIntensity * 2.5;
    shakeIntensity *= 0.87;
    if (shakeIntensity < 0.3) { shakeIntensity = 0; shakeX = 0; shakeY = 0; }
  }

  if (screenFlash > 0) screenFlash--;

  if (!player.isAlive()) { gameState = 'gameover'; }
}

// =============== DRAW ===============

function draw() {
  ctx.save();
  ctx.translate(shakeX, shakeY);

  if (gameState === 'menu') { drawMenu(); ctx.restore(); return; }

  if (gameState === 'gameover') {
    ctx.save(); ctx.translate(-camera.x, -camera.y);
    drawBackground(); ctx.restore();
    drawGameOver(); ctx.restore(); return;
  }

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  drawBackground();

  // Player shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(player.x + player.width/2, player.y + player.height + 2, player.width/2 - 2, 4, 0, 0, 6.28);
  ctx.fill();

  // Enemy shadows
  for (const enemy of enemies) {
    if (enemy.isAlive()) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(enemy.x + enemy.width/2, enemy.y + enemy.height + 2, enemy.width/2 - 2, 4, 0, 0, 6.28);
      ctx.fill();
    }
  }

  // Enemies
  for (const enemy of enemies) { if (enemy.isAlive()) enemy.draw(ctx); }

  // Player
  player.draw(ctx);

  // Particles
  for (const p of particles) p.draw(ctx);

  // Shockwaves
  for (const s of shockwaves) s.draw(ctx);

  ctx.restore();

  // Screen flash
  if (screenFlash > 0) {
    ctx.globalAlpha = screenFlash / 25;
    ctx.fillStyle = screenFlashColor;
    ctx.fillRect(0, 0, 960, 540);
    ctx.globalAlpha = 1;
  }

  // HUD
  if (!showOmnitrixWheel) drawHUD();

  // Omnitrix wheel overlay
  if (showOmnitrixWheel) drawOmnitrixWheel();

  ctx.restore();
}

// =============== GAME LOOP ===============

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
