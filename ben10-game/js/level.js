const levels = [
  // ========== LEVEL 1: BELLWOOD STREETS ==========
  {
    name: 'Bellwood Streets',
    width: 3600,
    height: 600,
    playerStart: { x: 80, y: 512 },
    platforms: (() => {
      const plats = [{ x: 0, y: 560, width: 3600, height: 40, colorTop: '#3a3a5a', colorMid: '#2a2a4a', colorBot: '#1a1a3a', edge: true }];
      const heights = [440, 380, 460, 400, 340, 440, 380, 330, 410, 370, 450, 390, 350, 420, 350, 480, 300, 430];
      const xPositions = [280, 500, 650, 880, 1050, 1200, 1450, 1650, 1850, 2050, 2250, 2450, 2650, 2900, 3050, 3200, 3400, 3500];
      for (let i = 0; i < xPositions.length; i++) {
        plats.push({ x: xPositions[i], y: heights[i], width: 100 + (i % 3) * 20, height: 16, colorTop: '#3a4a5a', colorMid: '#2a3a4a', colorBot: '#1a2a3a' });
      }
      return plats;
    })(),
    enemies: [
      { x: 350, y: 516, patrolMin: 200, patrolMax: 550, type: 'robot' },
      { x: 900, y: 516, patrolMin: 750, patrolMax: 1100, type: 'robot' },
      { x: 1500, y: 516, patrolMin: 1300, patrolMax: 1700, type: 'drone' },
      { x: 2000, y: 516, patrolMin: 1800, patrolMax: 2200, type: 'robot' },
      { x: 2600, y: 516, patrolMin: 2400, patrolMax: 2800, type: 'drone' },
      { x: 3050, y: 516, patrolMin: 2900, patrolMax: 3200, type: 'robot' },
      { x: 3400, y: 516, patrolMin: 3250, patrolMax: 3550, type: 'robot' },
    ],
    background: {
      skyTop: '#050515', skyMid: '#0d0d28', skyBot: '#18183e',
      stars: (() => { const a=[]; for(let i=0;i<100;i++) a.push({x:Math.random()*4000,y:10+Math.random()*180,size:0.5+Math.random()*1.5,speed:0.3+Math.random()*0.7,phase:Math.random()*6.28,parallax:0.02+Math.random()*0.03}); return a; })(),
      moon: { x: 2800, y: 70, size: 38 },
      farBuildings: (() => { const a=[]; for(let i=0;i<22;i++) a.push({x:i*200+Math.random()*80-100,w:80+Math.random()*120,h:120+Math.random()*200,color:'hsl(230,20%,'+(10+Math.random()*6)+'%)',windows:true,parallax:0.08}); return a; })(),
      midBuildings: (() => { const a=[]; for(let i=0;i<18;i++) a.push({x:i*280+Math.random()*100-100,w:100+Math.random()*140,h:160+Math.random()*220,color:'hsl(230,15%,'+(14+Math.random()*8)+'%)',windows:true,parallax:0.25}); return a; })(),
    },
  },

  // ========== LEVEL 2: FOREVER KNIGHT CASTLE ==========
  {
    name: 'Forever Knight Castle',
    width: 3200,
    height: 700,
    playerStart: { x: 80, y: 612 },
    platforms: (() => {
      const plats = [{ x: 0, y: 660, width: 3200, height: 40, colorTop: '#4a3a3a', colorMid: '#3a2a2a', colorBot: '#2a1a1a', edge: true }];
      const ys = [540, 480, 560, 500, 440, 520, 460, 400, 540, 480, 420, 500, 440, 530, 470, 410, 500, 440, 370, 510, 450];
      const xs = [200, 380, 550, 750, 900, 1100, 1300, 1500, 1700, 1900, 2100, 2250, 2450, 2600, 2750, 2900, 3050, 3150, 3250, 3350, 3450];
      for (let i = 0; i < xs.length; i++) {
        plats.push({ x: xs[i], y: ys[i], width: 90 + (i % 3) * 25, height: 16, colorTop: '#5a3a3a', colorMid: '#4a2a2a', colorBot: '#3a1a1a' });
      }
      return plats;
    })(),
    enemies: [
      { x: 300, y: 616, patrolMin: 150, patrolMax: 500, type: 'knight' },
      { x: 700, y: 616, patrolMin: 550, patrolMax: 900, type: 'knight' },
      { x: 1100, y: 616, patrolMin: 950, patrolMax: 1300, type: 'knight' },
      { x: 1600, y: 616, patrolMin: 1450, patrolMax: 1800, type: 'knight' },
      { x: 2100, y: 616, patrolMin: 1950, patrolMax: 2300, type: 'knight' },
      { x: 2700, y: 616, patrolMin: 2550, patrolMax: 2900, type: 'knight' },
      { x: 3100, y: 616, patrolMin: 2950, patrolMax: 3200, type: 'knight' },
    ],
    background: {
      skyTop: '#1a0a0a', skyMid: '#2a1510', skyBot: '#3a2015',
      stars: (() => { const a=[]; for(let i=0;i<60;i++) a.push({x:Math.random()*3500,y:10+Math.random()*150,size:0.5+Math.random()*1.2,speed:0.2+Math.random()*0.5,phase:Math.random()*6.28,parallax:0.02+Math.random()*0.02}); return a; })(),
      moon: { x: 2000, y: 60, size: 30 },
      farBuildings: (() => { const a=[]; for(let i=0;i<18;i++) a.push({x:i*250+Math.random()*60-100,w:120+Math.random()*100,h:200+Math.random()*150,color:'hsl(0,10%,'+(8+Math.random()*5)+'%)',windows:true,parallax:0.07}); return a; })(),
      midBuildings: (() => { const a=[]; for(let i=0;i<14;i++) a.push({x:i*350+Math.random()*80-100,w:140+Math.random()*120,h:250+Math.random()*180,color:'hsl(0,8%,'+(12+Math.random()*6)+'%)',windows:true,parallax:0.2}); return a; })(),
    },
  },

  // ========== LEVEL 3: ALIEN FOREST ==========
  {
    name: 'Alien Forest',
    width: 3000,
    height: 650,
    playerStart: { x: 80, y: 562 },
    platforms: (() => {
      const plats = [{ x: 0, y: 610, width: 3000, height: 40, colorTop: '#2a4a3a', colorMid: '#1a3a2a', colorBot: '#0a2a1a', edge: true }];
      const ys = [490, 430, 510, 450, 390, 470, 410, 350, 490, 430, 370, 510, 450, 390, 470, 410, 490, 430, 360, 480];
      const xs = [180, 350, 520, 700, 880, 1050, 1200, 1400, 1580, 1750, 1920, 2100, 2280, 2450, 2600, 2780, 2920, 3050, 3150, 3300];
      for (let i = 0; i < xs.length; i++) {
        plats.push({ x: xs[i], y: ys[i], width: 100 + (i % 4) * 15, height: 16, colorTop: '#2a5a3a', colorMid: '#1a4a2a', colorBot: '#0a3a1a' });
      }
      return plats;
    })(),
    enemies: [
      { x: 400, y: 566, patrolMin: 200, patrolMax: 600, type: 'mutant' },
      { x: 850, y: 566, patrolMin: 650, patrolMax: 1050, type: 'mutant' },
      { x: 1300, y: 566, patrolMin: 1100, patrolMax: 1500, type: 'drone' },
      { x: 1800, y: 566, patrolMin: 1600, patrolMax: 2000, type: 'mutant' },
      { x: 2300, y: 566, patrolMin: 2100, patrolMax: 2500, type: 'mutant' },
      { x: 2750, y: 566, patrolMin: 2600, patrolMax: 2950, type: 'drone' },
    ],
    background: {
      skyTop: '#0a1a15', skyMid: '#0f2a1e', skyBot: '#1a3a28',
      stars: (() => { const a=[]; for(let i=0;i<40;i++) a.push({x:Math.random()*3500,y:10+Math.random()*120,size:0.5+Math.random()*1,speed:0.2+Math.random()*0.4,phase:Math.random()*6.28,parallax:0.02+Math.random()*0.02}); return a; })(),
      moon: null,
      farBuildings: (() => { const a=[]; for(let i=0;i<20;i++) a.push({x:i*200+Math.random()*60-100,w:80+Math.random()*100,h:280+Math.random()*120,color:'hsl(140,15%,'+(8+Math.random()*5)+'%)',windows:false,parallax:0.06}); return a; })(),
      midBuildings: (() => { const a=[]; for(let i=0;i<16;i++) a.push({x:i*280+Math.random()*80-100,w:120+Math.random()*100,h:320+Math.random()*150,color:'hsl(120,12%,'+(12+Math.random()*6)+'%)',windows:false,parallax:0.2}); return a; })(),
    },
  },

  // ========== LEVEL 4: VILGAX WARSHIP ==========
  {
    name: "Vilgax's Warship",
    width: 2800,
    height: 600,
    playerStart: { x: 80, y: 512 },
    platforms: (() => {
      const plats = [{ x: 0, y: 560, width: 2800, height: 40, colorTop: '#4a4a5a', colorMid: '#3a3a4a', colorBot: '#2a2a3a', edge: true }];
      const ys = [440, 380, 460, 400, 340, 440, 380, 320, 460, 400, 340, 440, 380, 450, 390, 330, 420, 360, 440];
      const xs = [150, 320, 500, 680, 880, 1050, 1250, 1450, 1620, 1800, 1980, 2150, 2320, 2480, 2620, 2750, 2850, 2950, 3050];
      for (let i = 0; i < xs.length; i++) {
        plats.push({ x: xs[i], y: ys[i], width: 90 + (i % 3) * 20, height: 16, colorTop: '#5a5a6a', colorMid: '#4a4a5a', colorBot: '#3a3a4a' });
      }
      return plats;
    })(),
    enemies: [
      { x: 400, y: 516, patrolMin: 200, patrolMax: 600, type: 'robot' },
      { x: 800, y: 516, patrolMin: 600, patrolMax: 1000, type: 'drone' },
      { x: 1200, y: 516, patrolMin: 1000, patrolMax: 1400, type: 'robot' },
      { x: 1600, y: 516, patrolMin: 1400, patrolMax: 1800, type: 'drone' },
      { x: 2000, y: 516, patrolMin: 1800, patrolMax: 2200, type: 'robot' },
      { x: 2400, y: 516, patrolMin: 2200, patrolMax: 2600, type: 'robot' },
      { x: 2600, y: 516, patrolMin: 2500, patrolMax: 2780, type: 'drone' },
    ],
    background: {
      skyTop: '#050508', skyMid: '#0a0a18', skyBot: '#101028',
      stars: (() => { const a=[]; for(let i=0;i<120;i++) a.push({x:Math.random()*3200,y:5+Math.random()*200,size:0.5+Math.random()*2,speed:0.3+Math.random()*0.8,phase:Math.random()*6.28,parallax:0.01+Math.random()*0.02}); return a; })(),
      moon: { x: 2400, y: 50, size: 40 },
      farBuildings: (() => { const a=[]; for(let i=0;i<15;i++) a.push({x:i*300+Math.random()*50-100,w:150+Math.random()*120,h:300+Math.random()*150,color:'hsl(240,10%,'+(6+Math.random()*4)+'%)',windows:true,parallax:0.06}); return a; })(),
      midBuildings: (() => { const a=[]; for(let i=0;i<12;i++) a.push({x:i*400+Math.random()*80-100,w:180+Math.random()*160,h:350+Math.random()*180,color:'hsl(240,8%,'+(10+Math.random()*5)+'%)',windows:true,parallax:0.2}); return a; })(),
    },
  },
];
