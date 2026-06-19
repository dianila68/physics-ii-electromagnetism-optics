export function initDoubleSlitWave(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  let W = canvas.width;
  let H = canvas.height;

  let slitSep = 100;    // pixels
  let wavelength = 60;  // pixels
  let animating = true;
  let t = 0;
  let animId: number;

  function resize() {
    const rect = canvas.parentElement!.getBoundingClientRect();
    W = canvas.width = rect.width || 600;
    H = canvas.height = 420;
    draw();
  }

  function intensity(x: number, y: number, t: number): number {
    const slit1 = { x: W * 0.2, y: H / 2 - slitSep / 2 };
    const slit2 = { x: W * 0.2, y: H / 2 + slitSep / 2 };
    const k = (2 * Math.PI) / wavelength;
    const omega = k * 1.5;

    const r1 = Math.hypot(x - slit1.x, y - slit1.y);
    const r2 = Math.hypot(x - slit2.x, y - slit2.y);

    const amp1 = Math.cos(k * r1 - omega * t) / Math.max(1, Math.sqrt(r1) * 0.12);
    const amp2 = Math.cos(k * r2 - omega * t) / Math.max(1, Math.sqrt(r2) * 0.12);
    return amp1 + amp2;
  }

  function draw() {
    const isDark = document.documentElement.dataset.theme === 'dark';
    const imageData = ctx.createImageData(W, H);
    const data = imageData.data;
    const startX = W * 0.25;

    for (let y = 0; y < H; y++) {
      for (let x = Math.floor(startX); x < W; x++) {
        const v = intensity(x, y, t);
        const norm = Math.max(-1, Math.min(1, v));
        const bright = ((norm + 1) / 2);
        const idx = (y * W + x) * 4;

        if (isDark) {
          data[idx] = Math.round(bright * 137);
          data[idx + 1] = Math.round(bright * 180);
          data[idx + 2] = Math.round(bright * 250);
        } else {
          data[idx] = Math.round(bright * 231 + (1 - bright) * 0);
          data[idx + 1] = Math.round(bright * 168 + (1 - bright) * 50);
          data[idx + 2] = Math.round(bright * 0 + (1 - bright) * 200);
        }
        data[idx + 3] = 220;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Barrier
    ctx.fillStyle = isDark ? '#45475a' : '#555';
    ctx.fillRect(W * 0.2 - 5, 0, 10, H / 2 - slitSep / 2 - 8);
    ctx.fillRect(W * 0.2 - 5, H / 2 - slitSep / 2 + 8, 10, slitSep - 16);
    ctx.fillRect(W * 0.2 - 5, H / 2 + slitSep / 2 + 8, 10, H);

    // Slit labels
    ctx.fillStyle = isDark ? '#cdd6f4' : '#222';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('S₁', W * 0.2 - 10, H / 2 - slitSep / 2);
    ctx.fillText('S₂', W * 0.2 - 10, H / 2 + slitSep / 2 + 4);

    // Intensity pattern on right edge
    const edgeX = W - 40;
    const SAMPLES = H;
    ctx.strokeStyle = isDark ? '#f9e2af' : '#e67e22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let sy = 0; sy < SAMPLES; sy++) {
      const slit1y = H / 2 - slitSep / 2;
      const slit2y = H / 2 + slitSep / 2;
      const r1 = Math.hypot(edgeX - W * 0.2, sy - slit1y);
      const r2 = Math.hypot(edgeX - W * 0.2, sy - slit2y);
      const path_diff = Math.abs(r1 - r2);
      const I = Math.cos(Math.PI * path_diff / wavelength) ** 2;
      const px2 = edgeX + I * 25;
      sy === 0 ? ctx.moveTo(px2, sy) : ctx.lineTo(px2, sy);
    }
    ctx.stroke();

    // Labels
    ctx.fillStyle = isDark ? '#9399b2' : '#888';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`d = ${(slitSep / 10).toFixed(0)} units`, W * 0.2, 16);
    ctx.fillText(`λ = ${wavelength} units`, W * 0.5, 16);
    ctx.textAlign = 'right';
    ctx.fillText('I(y)', W - 4, 16);
  }

  function tick() {
    animId = requestAnimationFrame(tick);
    if (animating) t += 0.04;
    draw();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement!);
  resize();
  tick();

  return {
    setSlitSep(v: number) { slitSep = v; },
    setWavelength(v: number) { wavelength = v; },
    setAnimating(v: boolean) { animating = v; },
    destroy() { cancelAnimationFrame(animId); },
  };
}
