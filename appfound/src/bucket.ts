// "Leaky funnel" canvas, Patch's bucket metaphor adapted to app growth.
// State 0: holes in the floor, users leak out. 1: holes patched, more installs, some convert.
// 2: the engine runs hot and paying users overflow. Coordinates are normalized (0–1) so resizing is free.

type P = { x: number; y: number; vx: number; vy: number; inside: boolean; leak: boolean; pay: boolean };

const INK = '#0E0C2B', BLUE = '#2412FF', LIME = '#D6FF3D', CORAL = '#FF5B2E';
const R = 0.016, G = 0.0006, MAX = 300;
const TOP = 0.4, BOT = 0.88, TL = 0.2, TR = 0.8, BL = 0.3, BR = 0.7;
const HOLES: [number, number][] = [[BL + 0.01, BL + 0.07], [0.47, 0.53], [BR - 0.07, BR - 0.01]];
const SPAWN_EVERY = [6, 3, 1.4];
const PAY_RATE = [0.06, 0.28, 0.5];

export function initBucket(canvas: HTMLCanvasElement, reduced: boolean) {
  const ctx = canvas.getContext('2d')!;
  let S = 0, dpr = 1;
  let ps: P[] = [];
  let state = 0, spawnAcc = 0, visible = false, raf = 0;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    S = canvas.clientWidth * dpr;
    canvas.width = canvas.height = Math.max(1, Math.round(S));
    if (reduced) draw();
  };
  new ResizeObserver(resize).observe(canvas);

  const wallX = (y: number) => {
    const t = Math.min(1, Math.max(0, (y - TOP) / (BOT - TOP)));
    return [TL + (BL - TL) * t, TR + (BR - TR) * t];
  };

  function spawn() {
    ps.push({ x: 0.4 + Math.random() * 0.2, y: 0.13, vx: (Math.random() - 0.5) * 0.004, vy: 0, inside: true, leak: false, pay: Math.random() < PAY_RATE[state] });
  }

  function step() {
    spawnAcc += 1;
    while (spawnAcc >= SPAWN_EVERY[state]) {
      spawnAcc -= SPAWN_EVERY[state];
      if (ps.length < MAX) spawn();
    }
    for (const p of ps) {
      p.vy += G;
      p.vx *= 0.995;
      p.x += p.vx;
      p.y += p.vy;
    }
    // particle–particle separation
    const d2 = (2 * R) ** 2;
    for (let i = 0; i < ps.length; i++) {
      const a = ps[i];
      for (let j = i + 1; j < ps.length; j++) {
        const b = ps[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dd = dx * dx + dy * dy;
        if (dd > 0 && dd < d2) {
          const d = Math.sqrt(dd), push = (2 * R - d) / 2, nx = dx / d, ny = dy / d;
          a.x -= nx * push; a.y -= ny * push; b.x += nx * push; b.y += ny * push;
          const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rv < 0) { const imp = rv * 0.5; a.vx += imp * nx; a.vy += imp * ny; b.vx -= imp * nx; b.vy -= imp * ny; }
        }
      }
    }
    // walls, floor, leaks, spills
    for (const p of ps) {
      if (!p.inside) continue;
      if (p.y < TOP && (p.x < TL || p.x > TR)) { p.inside = false; continue; }
      if (p.y >= TOP - R) {
        const [l, r] = wallX(p.y);
        if (p.x < l + R) { p.x = l + R; p.vx = Math.abs(p.vx) * 0.3; }
        if (p.x > r - R) { p.x = r - R; p.vx = -Math.abs(p.vx) * 0.3; }
      }
      if (p.y > BOT - R) {
        const hole = state === 0 && HOLES.some(([a, b]) => p.x > a && p.x < b);
        if (hole) { p.inside = false; p.leak = true; p.pay = false; }
        else { p.y = BOT - R; p.vy *= -0.15; p.vx *= 0.8; }
      }
    }
    ps = ps.filter((p) => p.y < 1 + R);
  }

  function draw() {
    const s = S;
    ctx.clearRect(0, 0, s, s);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // emitter: "ad spend"
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5 * dpr;
    ctx.fillStyle = '#fff';
    roundRect(0.36 * s, 0.03 * s, 0.28 * s, 0.08 * s, 6 * dpr);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = `600 ${0.03 * s}px "IBM Plex Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AD SPEND', 0.5 * s, 0.071 * s);

    // bucket body label
    ctx.fillStyle = 'rgba(14,12,43,.18)';
    ctx.font = `800 ${0.045 * s}px "Archivo Variable", sans-serif`;
    ctx.fillText('YOUR FUNNEL', 0.5 * s, 0.7 * s);

    // outer hatch on walls (line-art)
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.2 * dpr;
    for (let t = 0.04; t < 1; t += 0.07) {
      const y = TOP + (BOT - TOP) * t;
      const [l, r] = wallX(y);
      line(l * s, y * s, (l - 0.025) * s, (y + 0.02) * s);
      line(r * s, y * s, (r + 0.025) * s, (y + 0.02) * s);
    }

    // walls + floor (with holes in state 0)
    ctx.lineWidth = 3.5 * dpr;
    ctx.beginPath();
    ctx.moveTo((TL - 0.02) * s, TOP * s);
    ctx.lineTo(TL * s, TOP * s);
    ctx.lineTo(BL * s, BOT * s);
    if (state === 0) {
      let x = BL;
      for (const [a, b] of HOLES) { ctx.lineTo(a * s, BOT * s); x = b; ctx.moveTo(x * s, BOT * s); }
      ctx.lineTo(BR * s, BOT * s);
    } else ctx.lineTo(BR * s, BOT * s);
    ctx.lineTo(TR * s, TOP * s);
    ctx.lineTo((TR + 0.02) * s, TOP * s);
    ctx.stroke();

    if (state === 0) {
      ctx.strokeStyle = CORAL;
      ctx.lineWidth = 2 * dpr;
      ctx.setLineDash([3 * dpr, 6 * dpr]);
      for (const [a, b] of HOLES) line(((a + b) / 2) * s, (BOT + 0.02) * s, ((a + b) / 2) * s, (BOT + 0.09) * s);
      ctx.setLineDash([]);
    } else {
      // patches over the old holes
      for (const [a, b] of HOLES) {
        const cx = ((a + b) / 2) * s, cy = BOT * s, w = (b - a + 0.03) * s, h = 0.035 * s;
        ctx.fillStyle = LIME;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2 * dpr;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.08);
        ctx.fillRect(-w / 2, -h / 2, w, h); ctx.strokeRect(-w / 2, -h / 2, w, h);
        line(-w / 2 + 4 * dpr, -h / 2 + 3 * dpr, w / 2 - 4 * dpr, h / 2 - 3 * dpr);
        ctx.restore();
      }
    }

    // particles
    let paying = 0;
    for (const p of ps) {
      const settled = p.inside && p.y > TOP + 0.03;
      const isPay = p.pay && settled;
      if (isPay) paying++;
      ctx.beginPath();
      ctx.arc(p.x * s, p.y * s, R * s * 0.92, 0, Math.PI * 2);
      ctx.fillStyle = p.leak ? CORAL : isPay ? LIME : BLUE;
      ctx.fill();
      if (isPay) { ctx.strokeStyle = INK; ctx.lineWidth = 1.5 * dpr; ctx.stroke(); }
    }

    // live counter
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = INK;
    ctx.font = `600 ${0.026 * s}px "IBM Plex Mono", monospace`;
    ctx.fillText('PAYING USERS', 0.96 * s, 0.2 * s);
    ctx.fillStyle = BLUE;
    ctx.font = `800 ${0.09 * s}px "Archivo Variable", sans-serif`;
    ctx.fillText(String(paying), 0.96 * s, 0.29 * s);
  }

  function line(x1: number, y1: number, x2: number, y2: number) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  function roundRect(x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  const loop = () => {
    step(); step();
    draw();
    raf = visible ? requestAnimationFrame(loop) : 0;
  };

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !reduced && !raf) raf = requestAnimationFrame(loop);
  }).observe(canvas);

  const settle = () => {
    // Reduced motion: jump straight to a settled frame for the state
    ps = [];
    for (let i = 0; i < 900; i++) step();
    draw();
  };

  resize();
  if (reduced) settle();

  return {
    setState(n: number) {
      if (n === state) return;
      state = n;
      if (reduced) settle();
    },
  };
}
