interface Charge {
  x: number;
  y: number;
  q: number; // sign: +1 or -1
  dragging: boolean;
}

export function initCoulombField(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  let W = canvas.width;
  let H = canvas.height;

  const charges: Charge[] = [
    { x: W * 0.35, y: H * 0.5, q: +1, dragging: false },
    { x: W * 0.65, y: H * 0.5, q: -1, dragging: false },
  ];

  const k = 8.99e9;
  const SCALE = 1e-9;

  function resize() {
    const rect = canvas.parentElement!.getBoundingClientRect();
    W = canvas.width = rect.width || 600;
    H = canvas.height = 380;
    charges[0].x = W * 0.35;
    charges[0].y = H * 0.5;
    charges[1].x = W * 0.65;
    charges[1].y = H * 0.5;
    draw();
  }

  function fieldAt(x: number, y: number): { fx: number; fy: number } {
    let fx = 0, fy = 0;
    charges.forEach(c => {
      const dx = x - c.x;
      const dy = y - c.y;
      const r2 = dx * dx + dy * dy;
      const r = Math.sqrt(r2);
      if (r < 8) return;
      const F = k * SCALE * c.q / r2;
      fx += F * dx / r;
      fy += F * dy / r;
    });
    return { fx, fy };
  }

  function drawFieldLines() {
    const STEPS = 80;
    const DT = 6;
    const N_LINES = 16;

    charges.filter(c => c.q > 0).forEach(c => {
      for (let i = 0; i < N_LINES; i++) {
        const angle = (i / N_LINES) * Math.PI * 2;
        let x = c.x + Math.cos(angle) * 14;
        let y = c.y + Math.sin(angle) * 14;

        ctx.beginPath();
        ctx.moveTo(x, y);

        for (let s = 0; s < STEPS; s++) {
          const { fx, fy } = fieldAt(x, y);
          const mag = Math.sqrt(fx * fx + fy * fy);
          if (mag < 1e-10) break;
          x += (fx / mag) * DT;
          y += (fy / mag) * DT;
          if (x < 0 || x > W || y < 0 || y > H) break;
          ctx.lineTo(x, y);

          let hit = false;
          charges.filter(c2 => c2.q < 0).forEach(c2 => {
            if (Math.hypot(x - c2.x, y - c2.y) < 14) hit = true;
          });
          if (hit) break;
        }
        ctx.strokeStyle = 'rgba(231,76,60,0.7)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    });
  }

  function drawForceVectors() {
    if (charges.length < 2) return;
    const c1 = charges[0], c2 = charges[1];
    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;
    const r = Math.hypot(dx, dy);
    const F = k * SCALE / (r * r);
    const fscale = Math.min(80, F * 1e9);
    const nx = dx / r, ny = dy / r;

    const sign = c1.q * c2.q;

    drawArrow(ctx, c1.x, c1.y, c1.x + (sign < 0 ? nx : -nx) * fscale, c1.y + (sign < 0 ? ny : -ny) * fscale, '#e74c3c');
    drawArrow(ctx, c2.x, c2.y, c2.x + (sign < 0 ? -nx : nx) * fscale, c2.y + (sign < 0 ? -ny : ny) * fscale, '#e74c3c');

    const mid = { x: (c1.x + c2.x) / 2, y: (c1.y + c2.y) / 2 };
    const dist_m = r * 1e-9;
    const F_val = (k / (dist_m * dist_m)).toExponential(2);
    ctx.fillStyle = 'var(--text2, #555)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`F = ${F_val} N`, mid.x, mid.y - 14);
    const dist_nm = (r / 50).toFixed(1);
    ctx.fillText(`r = ${dist_nm} nm`, mid.x, mid.y + 4);
  }

  function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 10 * Math.cos(angle - 0.4), y2 - 10 * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - 10 * Math.cos(angle + 0.4), y2 - 10 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawCharges() {
    charges.forEach(c => {
      const color = c.q > 0 ? '#e74c3c' : '#89b4fa';
      const label = c.q > 0 ? '+q' : '−q';

      ctx.beginPath();
      ctx.arc(c.x, c.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'white';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, c.x, c.y);
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawFieldLines();
    drawForceVectors();
    drawCharges();
  }

  function getCharge(x: number, y: number): Charge | null {
    return charges.find(c => Math.hypot(x - c.x, y - c.y) < 22) ?? null;
  }

  let dragging: Charge | null = null;

  function toCanvas(e: MouseEvent | TouchEvent) {
    const rect = canvas.getBoundingClientRect();
    const src = 'touches' in e ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }

  canvas.addEventListener('mousedown', e => {
    const { x, y } = toCanvas(e);
    dragging = getCharge(x, y);
  });
  canvas.addEventListener('mousemove', e => {
    if (!dragging) return;
    const { x, y } = toCanvas(e);
    dragging.x = x; dragging.y = y;
    draw();
  });
  window.addEventListener('mouseup', () => { dragging = null; });

  canvas.addEventListener('touchstart', e => {
    const { x, y } = toCanvas(e);
    dragging = getCharge(x, y);
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('touchmove', e => {
    if (!dragging) return;
    const { x, y } = toCanvas(e);
    dragging.x = x; dragging.y = y;
    draw();
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchend', () => { dragging = null; });

  canvas.addEventListener('dblclick', e => {
    const { x, y } = toCanvas(e);
    const existing = getCharge(x, y);
    if (existing) {
      const idx = charges.indexOf(existing);
      charges.splice(idx, 1);
    } else {
      charges.push({ x, y, q: charges.length % 2 === 0 ? 1 : -1, dragging: false });
    }
    draw();
  });

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement!);
  resize();
}
