// =====================================================================
//  SK — this piece's helpers on the sketchbook kit: Maya in pencil, the doodled foods and icons, the cup and its layers,
//  and the voice's word-lit caption rail in hand lettering. Deterministic: structure keyed, tremor on B.
// =====================================================================
const ACC = SK.terra;                                             // the one accent: what's in the cup

// ---- Maya, drawn: long hair (graphite hatch), face, a mood, shoulders. mood: smile | happy | rough | puzzled
function maya(x, y, s, o = {}) {
  const k = o.key ?? 'maya', mood = o.mood ?? 'smile', part = o.part ?? 1;
  const hair = [[x - 92 * s, y - 40 * s], [x - 104 * s, y - 170 * s], [x - 70 * s, y - 250 * s], [x, y - 274 * s], [x + 70 * s, y - 250 * s], [x + 104 * s, y - 170 * s], [x + 92 * s, y - 40 * s]];
  gfill(hair, SK.lead, { a: 0.85, off: [3, 3], key: k + 'hf' });
  gline(hair, { w: 4 * s, key: k + 'h', part });
  const sh = [[x - 150 * s, y + 90 * s], [x - 120 * s, y - 10 * s], [x - 40 * s, y - 34 * s], [x + 40 * s, y - 34 * s], [x + 120 * s, y - 10 * s], [x + 150 * s, y + 90 * s]];
  gfill([...sh, [x + 150 * s, y + 120 * s], [x - 150 * s, y + 120 * s]], SK.cream, { a: 1, off: [0, 0], key: k + 'sf' });
  gline(sh, { w: 4.5 * s, key: k + 's', part });
  ghatch(x - 140 * s, y - 20 * s, x + 140 * s, y + 110 * s, { ang: 0.9, gap: 13 * s, col: SK.graphL, w: 2, a: 0.5, key: k + 'sh' });
  gline([[x - 26 * s, y - 50 * s], [x - 24 * s, y - 20 * s]], { w: 4 * s, key: k + 'n1', second: false }); gline([[x + 26 * s, y - 50 * s], [x + 24 * s, y - 20 * s]], { w: 4 * s, key: k + 'n2', second: false });
  const head = loopPts(x, y - 140 * s, 72 * s, 86 * s, 0.05);
  gfill(head, SK.sheet, { a: 1, off: [0, 0], key: k + 'ff' });
  gline(head, { w: 4.5 * s, key: k + 'f', part });
  gline([[x - 72 * s, y - 170 * s], [x - 30 * s, y - 214 * s], [x + 20 * s, y - 222 * s], [x + 72 * s, y - 180 * s]], { w: 4 * s, key: k + 'fr', second: false });
  const blink = (B + k.length * 3) % 41 < 2;
  const ey = y - 140 * s;
  if (mood === 'happy' || blink) { gline(arcPts(x - 26 * s, ey + 4 * s, 10 * s, Math.PI * 1.15, Math.PI * 1.85, 6), { w: 4 * s, key: k + 'e1', second: false }); gline(arcPts(x + 26 * s, ey + 4 * s, 10 * s, Math.PI * 1.15, Math.PI * 1.85, 6), { w: 4 * s, key: k + 'e2', second: false }); }
  else { ctx.fillStyle = SK.ink; ctx.beginPath(); ctx.arc(x - 26 * s, ey, 6 * s, 0, TAU); ctx.arc(x + 26 * s, ey, 6 * s, 0, TAU); ctx.fill(); }
  if (mood === 'rough') { gline([[x - 40 * s, ey - 26 * s], [x - 14 * s, ey - 18 * s]], { w: 3.5 * s, key: k + 'b1', second: false }); gline([[x + 40 * s, ey - 26 * s], [x + 14 * s, ey - 18 * s]], { w: 3.5 * s, key: k + 'b2', second: false }); gline(arcPts(x, ey + 52 * s, 16 * s, Math.PI * 1.2, Math.PI * 1.8, 8), { w: 4 * s, key: k + 'm', second: false }); }
  else if (mood === 'puzzled') gline([[x - 14 * s, ey + 40 * s], [x + 16 * s, ey + 34 * s]], { w: 4 * s, key: k + 'm', second: false });
  else gline(arcPts(x, ey + 24 * s, 18 * s, Math.PI * 0.2, Math.PI * 0.8, 8), { w: 4 * s, key: k + 'm', second: false });
  ctx.fillStyle = 'rgba(217,119,87,0.25)'; ctx.beginPath(); ctx.ellipse(x - 46 * s, ey + 22 * s, 11 * s, 7 * s, 0, 0, TAU); ctx.ellipse(x + 46 * s, ey + 22 * s, 11 * s, 7 * s, 0, 0, TAU); ctx.fill();
}
// ---- doodles: sandwich, apple, coffee, toast, moon, stress zigzag, cycle ring, plate, storm
function doodle(kind, x, y, s = 1, o = {}) {
  const k = (o.key ?? 'd') + kind, part = o.part ?? 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (kind === 'sandwich') { const P = [[-60, 40], [60, 40], [-60, -50]]; gfill(P, SK.wood, { key: k + 'f' }); gline(closeP(P), { w: 5, key: k, part }); gline([[-56, 30], [-30, 24], [-6, 32], [20, 24], [46, 32]], { w: 4, col: SK.green, key: k + 'l', second: false, part }); }
  if (kind === 'apple') { const P = loopPts(0, 4, 40, 38, 0.04); gfill(P, SK.pink, { key: k + 'f' }); gline(P, { w: 5, key: k, part }); gline([[0, -34], [6, -54]], { w: 4, key: k + 's', second: false, part }); }
  if (kind === 'coffee') { const P = [[-34, -36], [34, -36], [26, 40], [-26, 40]]; gfill(P, SK.sheet, { key: k + 'f' }); gline(closeP(P), { w: 5, key: k, part }); gline(arcPts(40, 0, 18, -1.4, 1.4, 8), { w: 4, key: k + 'h', second: false, part }); for (let i = 0; i < 2; i++) gpencil([[-10 + i * 20, -50], [-4 + i * 20, -70], [-12 + i * 20, -90]], { w: 2.5, key: k + 'st' + i, a: 0.6 }); }
  if (kind === 'toast') { const P = [[-44, 40], [-46, -10], [-30, -40], [0, -46], [30, -40], [46, -10], [44, 40]]; gfill(P, SK.wood, { key: k + 'f' }); gline(closeP(P), { w: 5, key: k, part }); }
  if (kind === 'moon') { const P = arcPts(0, 0, 46, 0.6, TAU - 0.6, 20).concat(arcPts(22, -12, 36, TAU - 1.2, 1.2, 12).reverse()); gline(P, { w: 5, key: k, part, closed: true }); ghatch(-46, -46, 20, 46, { ang: 0.8, gap: 9, col: SK.graph, w: 2, a: 0.5, key: k + 'h' }); }
  if (kind === 'stress') gline([[-60, 10], [-36, -30], [-12, 30], [12, -30], [36, 30], [60, -10]], { w: 7, key: k, part, amp: 1.2 });
  if (kind === 'cycle') { for (let i = 0; i < 28; i++) { const a = i / 28 * TAU - Math.PI / 2; ctx.fillStyle = i < 5 ? SK.pink : SK.graph; ctx.beginPath(); ctx.arc(Math.cos(a) * 44, Math.sin(a) * 44, i < 5 ? 7 : 4.5, 0, TAU); ctx.fill(); } }
  if (kind === 'roll') { const P = sketchBox(-40, -36, 80, 76, 10, 0.02); gfill(P, SK.sheet, { key: k + 'f' }); gline(P, { w: 5, key: k, closed: true, part }); gline(loopPts(0, -36, 40, 12, 0.04), { w: 4, key: k + 't', part }); gline(loopPts(0, -36, 12, 5, 0.04), { w: 3, key: k + 'c', part }); gline([[40, -10], [62, -10], [62, 44], [40, 40]], { w: 4, key: k + 's', second: false, part }); }
  if (kind === 'mood') { const P = loopPts(0, 0, 46, 46, 0.05); gfill(P, SK.sheet, { key: k + 'f' }); gline(P, { w: 5, key: k, part }); ctx.fillStyle = SK.ink; ctx.beginPath(); ctx.arc(-15, -8, 5, 0, TAU); ctx.arc(15, -8, 5, 0, TAU); ctx.fill(); gline(arcPts(0, 4, 18, Math.PI * 0.2, Math.PI * 0.8, 8), { w: 4, key: k + 'm', second: false, part }); }
  if (kind === 'plate') { const P = loopPts(0, 0, 50, 50, 0.04); gfill(P, SK.sheet, { key: k + 'f' }); gline(P, { w: 5, key: k, part }); gpencil(loopPts(0, 0, 34, 34, 0.04), { w: 2.5, key: k + 'i', a: 0.6 }); }
  if (kind === 'storm') { const P = [[-80, 20], [-90, -14], [-56, -40], [-20, -62], [24, -56], [60, -36], [84, -6], [70, 22]]; gpencil(closeP(P), { w: 3, key: k, a: 0.8 }); ghatch(-86, -60, 86, 20, { ang: -0.7, gap: 10, col: SK.graph, w: 2, a: 0.55, key: k + 'h' }); gline([[-6, 22], [-22, 60], [4, 56], [-12, 96]], { w: 5, key: k + 'z', second: false, part }); }
  ctx.restore();
}

// ---- the cup: a tapered paper cup; its contents are layers of the one accent, separated by graphite lines
const CUP = { cx: 420, top: 640, bot: 1170, wt: 420, wb: 300 };
const cupX = (y, side) => CUP.cx + side * lerp(CUP.wt, CUP.wb, (y - CUP.top) / (CUP.bot - CUP.top)) / 2;
const cupPts = () => [[cupX(CUP.top, -1), CUP.top], [cupX(CUP.bot, -1), CUP.bot], [cupX(CUP.bot, 1), CUP.bot], [cupX(CUP.top, 1), CUP.top]];
function band(y0, y1) { return [[cupX(y1, -1), y1], [cupX(y0, -1), y0], [cupX(y0, 1), y0], [cupX(y1, 1), y1]]; }

// ---- captions: the voice as hand-lettered, word-lit cards on a taped strip (one highlighted word per card at most)
const CAP = { size: 64, maxW: 800, y: H - SAFE.bottom - 60 };
const HI_WORDS = ['thursday', 'cup', 'stack', 'spills', 'everything', 'yours'];
const CARDS = (() => {
  const out = [];
  for (const L of VLINES) { let cur = []; (L.words || []).forEach((w, i, A) => { cur.push(w); const brk = /[.,;!?]$/.test(w.w) && cur.length >= 2; if (cur.length >= 6 || brk || i === A.length - 1) { out.push({ words: cur }); cur = []; } }); }
  out.forEach((c) => { c.t0 = c.words[0].t0 - 0.08; });
  out.forEach((c, i) => { const nx = out[i + 1]; c.t1 = Math.min(c.words[c.words.length - 1].t1 + 0.6, nx ? nx.t0 - 0.05 : 1e9); });
  return out;
})();
function captionRail() {
  const c = CARDS.find((k) => TT >= k.t0 && TT < k.t1); if (!c) return;
  ctx.save(); screen();
  const font = `600 ${CAP.size}px ${HAND}`, sp = fontW(' ', font), ws = c.words.map((w) => ({ ...w, wd: fontW(w.w, font) }));
  const total = ws.reduce((a, w) => a + w.wd, 0) + sp * (ws.length - 1);
  let rows = [ws];
  if (total > CAP.maxW) { let acc = 0, cutAt = 1; for (let i = 0; i < ws.length; i++) { acc += ws[i].wd + sp; if (acc > total / 2) { cutAt = Math.max(1, i); break; } } rows = [ws.slice(0, cutAt + 1), ws.slice(cutAt + 1)].filter((r) => r.length); }
  const rowW = rows.map((r) => r.reduce((a, w) => a + w.wd, 0) + sp * (r.length - 1)), bw = Math.max(...rowW) + 70, lh = CAP.size * 1.1, bh = rows.length * lh + 34;
  const y0 = CAP.y - bh / 2, key = 'cap' + c.t0.toFixed(2), box = sketchBox(CX - bw / 2, y0, bw, bh, 10, 0.02);
  gfill(box, SK.sheet, { a: 0.96, off: [5, 6], key: key + 'f' });
  gline(box, { w: 3.5, key: key + 'o', closed: true });
  tapeStrip(CX - bw / 2 + 30, y0 + 4, 90, -0.4, key + 't', 34);
  ctx.font = font; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  rows.forEach((r, ri) => {
    let x = CX - rowW[ri] / 2; const y = y0 + 17 + lh * ri + CAP.size * 0.84;
    for (const w of r) {
      if (HI_WORDS.includes(norm(w.w)) && TT >= w.t0) highlight(x, x + w.wd, y - CAP.size * 0.26, CAP.size * 0.5, ev(w.t0, 0.25), { key: key + w.w });
      ctx.fillStyle = TT >= w.t0 ? SK.ink : 'rgba(111,106,99,0.45)'; ctx.fillText(w.w, x, y); x += w.wd + sp;
    }
  });
  ctx.restore();
}
const fontW = (str, font) => { ctx.save(); ctx.font = font; const w = ctx.measureText(str).width; ctx.restore(); return w; };
{ const kitPost = STYLE.post; STYLE.post = () => { captionRail(); kitPost(); }; }
