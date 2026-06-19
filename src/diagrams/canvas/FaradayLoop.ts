export function initFaradayLoop(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  let W = canvas.width;
  let H = canvas.height;

  let magnetX = 80;
  let dragging = false;
  let prevMagX = magnetX;
  let emf = 0;
  const emfHistory: number[] = new Array(120).fill(0);
  let t = 0;

  function resize() {
    const rect = canvas.parentElement!.getBoundingClientRect();
    W = canvas.width = rect.width || 600;
    H = canvas.height = 380;
    magnetX = Math.min(magnetX, W - 50);
    draw();
  }

  const loopCX = () => W * 0.6;
  const loopW = 90;
  const loopH = 70;

  function flux(mx: number): number {
    const dist = loopCX() - mx;
    return 1 / (1 + (dist / 80) ** 2);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const isDark = document.documentElement.dataset.theme === 'dark';

    // Background
    ctx.fillStyle = isDark ? '#181825' : '#faf8f4';
    ctx.fillRect(0, 0, W, H);

    const lcx = loopCX();
    const lcy = H * 0.4;

    // B field lines from magnet
    const Phi = flux(magnetX);
    const lineAlpha = Math.max(0.05, Phi * 0.7);
    for (let i = -3; i <= 3; i++) {
      const y = lcy + i * 18;
      ctx.beginPath();
      ctx.moveTo(magnetX + 30, y);
      ctx.bezierCurveTo(
        magnetX + 100, y - i * 5,
        lcx - 50, y - i * 3,
        W - 20, y
      );
      ctx.strokeStyle = `rgba(137,180,250,${lineAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Loop
    ctx.strokeStyle = isDark ? '#cdd6f4' : '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.strokeRect(lcx - loopW / 2, lcy - loopH / 2, loopW, loopH);

    // Induced current arrow (if EMF non-zero)
    const v = emf;
    if (Math.abs(v) > 0.01) {
      const dir = v > 0 ? 1 : -1;
      drawLoopArrow(ctx, lcx, lcy, loopW, loopH, dir, isDark);
      ctx.fillStyle = isDark ? '#a6e3a1' : '#27ae60';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`EMF = ${(v * 5).toFixed(2)} mV`, lcx, lcy + loopH / 2 + 24);
    }

    // Flux indicator
    ctx.fillStyle = isDark ? '#89b4fa' : '#2980b9';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Φ = ${(Phi * 100).toFixed(1)} μWb`, lcx, lcy - loopH / 2 - 14);

    // Magnet
    drawMagnet(ctx, magnetX, lcy, isDark);

    // EMF graph
    drawEMFGraph(ctx, isDark);
  }

  function drawLoopArrow(ctx: CanvasRenderingContext2D, cx: number, cy: number, _w: number, h: number, dir: number, isDark: boolean) {
    const color = isDark ? '#a6e3a1' : '#27ae60';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    // Arrow on top of loop
    const ax = cx + dir * 20;
    const ay = cy - h / 2;
    ctx.beginPath();
    ctx.moveTo(ax - dir * 8, ay);
    ctx.lineTo(ax + dir * 8, ay);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ax + dir * 8, ay);
    ctx.lineTo(ax + dir * 8 - dir * 6, ay - 5);
    ctx.lineTo(ax + dir * 8 - dir * 6, ay + 5);
    ctx.closePath();
    ctx.fill();
  }

  function drawMagnet(ctx: CanvasRenderingContext2D, mx: number, my: number, isDark: boolean) {
    const mw = 50, mh = 70;
    // North (red)
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(mx - mw / 2, my - mh / 2, mw, mh / 2);
    // South (blue)
    ctx.fillStyle = '#89b4fa';
    ctx.fillRect(mx - mw / 2, my, mw, mh / 2);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', mx, my - mh / 4);
    ctx.fillText('S', mx, my + mh / 4);
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = isDark ? '#9399b2' : '#888';
    ctx.font = '11px sans-serif';
    ctx.fillText('drag', mx, my + mh / 2 + 14);
  }

  function drawEMFGraph(ctx: CanvasRenderingContext2D, isDark: boolean) {
    const gx = W * 0.6 + 80;
    const gy = H * 0.78;
    const gw = Math.min(200, W - gx - 20);
    const gh = 60;

    if (gw < 60) return;

    ctx.fillStyle = isDark ? 'rgba(24,24,37,0.8)' : 'rgba(255,255,255,0.8)';
    ctx.fillRect(gx, gy - gh / 2, gw, gh);
    ctx.strokeStyle = isDark ? '#313244' : '#ccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(gx, gy - gh / 2, gw, gh);

    ctx.beginPath();
    emfHistory.forEach((v, i) => {
      const px = gx + (i / emfHistory.length) * gw;
      const py = gy - v * (gh / 2) * 0.8;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.strokeStyle = isDark ? '#a6e3a1' : '#27ae60';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = isDark ? '#9399b2' : '#888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('EMF(t)', gx + 4, gy - gh / 2 + 12);
  }

  function toCanvas(e: MouseEvent | TouchEvent) {
    const rect = canvas.getBoundingClientRect();
    const src = 'touches' in e ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }

  function nearMagnet(x: number, y: number): boolean {
    const lcy = H * 0.4;
    return Math.abs(x - magnetX) < 35 && Math.abs(y - lcy) < 40;
  }

  canvas.addEventListener('mousedown', e => {
    const { x, y } = toCanvas(e);
    if (nearMagnet(x, y)) { dragging = true; prevMagX = magnetX; }
  });
  window.addEventListener('mouseup', () => { dragging = false; });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const { x } = toCanvas(e);
    prevMagX = magnetX;
    magnetX = Math.max(30, Math.min(W - 30, x));
    emf = (flux(magnetX) - flux(prevMagX)) * 30;
    emfHistory.shift();
    emfHistory.push(emf);
    draw();
  });

  canvas.addEventListener('touchstart', e => {
    const { x, y } = toCanvas(e);
    if (nearMagnet(x, y)) { dragging = true; e.preventDefault(); }
  }, { passive: false });
  window.addEventListener('touchend', () => { dragging = false; });
  canvas.addEventListener('touchmove', e => {
    if (!dragging) return;
    const { x } = toCanvas(e);
    prevMagX = magnetX;
    magnetX = Math.max(30, Math.min(W - 30, x));
    emf = (flux(magnetX) - flux(prevMagX)) * 30;
    emfHistory.shift();
    emfHistory.push(emf);
    draw();
    e.preventDefault();
  }, { passive: false });

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement!);
  resize();

  let animId: number;
  function tick() {
    animId = requestAnimationFrame(tick);
    t += 0.016;
    // Decay EMF when not dragging
    if (!dragging) {
      emf *= 0.92;
      emfHistory.shift();
      emfHistory.push(emf);
      draw();
    }
  }
  tick();

  return { destroy() { cancelAnimationFrame(animId); } };
}
