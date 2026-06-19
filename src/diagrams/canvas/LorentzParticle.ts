export function initLorentzParticle(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  let W = canvas.width;
  let H = canvas.height;

  let vx = 3, vy = 0;
  let B = 1.5;
  let q = 1;
  let px: number, py: number;
  let trail: { x: number; y: number }[] = [];
  let animId: number;

  function reset() {
    px = W * 0.2;
    py = H * 0.5;
    vx = 3;
    vy = 0;
    trail = [];
  }

  function resize() {
    const rect = canvas.parentElement!.getBoundingClientRect();
    W = canvas.width = rect.width || 600;
    H = canvas.height = 380;
    reset();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const isDark = document.documentElement.dataset.theme === 'dark';

    ctx.fillStyle = isDark ? '#181825' : '#faf8f4';
    ctx.fillRect(0, 0, W, H);

    // B field dots (into/out-of screen)
    const spacing = 40;
    const bColor = B >= 0 ? '#89b4fa' : '#f38ba8';
    for (let gx = spacing / 2; gx < W; gx += spacing) {
      for (let gy = spacing / 2; gy < H; gy += spacing) {
        ctx.beginPath();
        ctx.arc(gx, gy, 3, 0, Math.PI * 2);
        ctx.fillStyle = bColor;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
        // × or •
        ctx.fillStyle = bColor;
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(B >= 0 ? '×' : '•', gx, gy);
      }
    }
    ctx.textBaseline = 'alphabetic';

    // Trail
    if (trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      trail.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = isDark ? 'rgba(249,226,175,0.5)' : 'rgba(200,150,0,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Particle
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fillStyle = q > 0 ? '#e74c3c' : '#89b4fa';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Velocity arrow
    const speed = Math.hypot(vx, vy);
    if (speed > 0.1) {
      const scale = 15;
      drawArrow(ctx, px, py, px + (vx / speed) * scale * 2, py + (vy / speed) * scale * 2, '#f9e2af');
    }

    // Info
    ctx.fillStyle = isDark ? '#9399b2' : '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`B = ${B.toFixed(1)} T (${B >= 0 ? 'into' : 'out of'} screen)`, 10, 20);
    ctx.fillText(`q = ${q > 0 ? '+' : '−'}e  |v| = ${speed.toFixed(1)}`, 10, 38);
    ctx.fillText(`r = ${(speed / (Math.abs(q * B) || 0.001) * 10).toFixed(0)} px`, 10, 56);
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
    ctx.lineTo(x2 - 8 * Math.cos(angle - 0.4), y2 - 8 * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - 8 * Math.cos(angle + 0.4), y2 - 8 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function update() {
    // Lorentz: F = q * v × B (B in z-direction)
    // ax = q * vy * B / m, ay = -q * vx * B / m (m=1)
    const dt = 0.5;
    const ax = q * vy * B * 0.05;
    const ay = -q * vx * B * 0.05;
    vx += ax * dt;
    vy += ay * dt;
    px += vx * dt;
    py += vy * dt;

    // Wrap/bounce at edges
    if (px < 0) { px = W; trail = []; }
    if (px > W) { px = 0; trail = []; }
    if (py < 0) { py = H; trail = []; }
    if (py > H) { py = 0; trail = []; }

    trail.push({ x: px, y: py });
    if (trail.length > 300) trail.shift();
  }

  function tick() {
    animId = requestAnimationFrame(tick);
    update();
    draw();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement!);
  resize();
  tick();

  return {
    setB(v: number) { B = v; reset(); },
    setQ(v: number) { q = v; reset(); },
    setSpeed(v: number) { vx = v; vy = 0; reset(); },
    destroy() { cancelAnimationFrame(animId); },
  };
}
