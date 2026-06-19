export function initSnellRefraction(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  let W = canvas.width;
  let H = canvas.height;

  let n1 = 1.0;
  let n2 = 1.5;
  let incidentAngle = 40; // degrees

  function resize() {
    const rect = canvas.parentElement!.getBoundingClientRect();
    W = canvas.width = rect.width || 600;
    H = canvas.height = 380;
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const interfaceY = H / 2;

    // Background media
    const isDark = document.documentElement.dataset.theme === 'dark';
    ctx.fillStyle = isDark ? 'rgba(30,30,60,0.4)' : 'rgba(173,216,230,0.3)';
    ctx.fillRect(0, interfaceY, W, H - interfaceY); // Medium 2 (denser, bottom)
    ctx.fillStyle = isDark ? 'rgba(20,20,20,0.1)' : 'rgba(240,240,255,0.3)';
    ctx.fillRect(0, 0, W, interfaceY); // Medium 1 (top)

    // Interface line
    ctx.beginPath();
    ctx.moveTo(0, interfaceY);
    ctx.lineTo(W, interfaceY);
    ctx.strokeStyle = isDark ? '#6c7086' : '#7f8c8d';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Normal (dashed vertical)
    ctx.beginPath();
    ctx.moveTo(cx, interfaceY - 120);
    ctx.lineTo(cx, interfaceY + 120);
    ctx.strokeStyle = isDark ? '#9399b2' : '#aaa';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Angles in radians
    const theta1 = (incidentAngle * Math.PI) / 180;
    const sinTheta2 = (n1 / n2) * Math.sin(theta1);
    const isTIR = Math.abs(sinTheta2) > 1;
    const theta2 = isTIR ? null : Math.asin(sinTheta2);

    // Incident ray (from top-left to interface)
    const rayLen = 140;
    const ix = cx - Math.sin(theta1) * rayLen;
    const iy = interfaceY - Math.cos(theta1) * rayLen;

    drawRay(ctx, ix, iy, cx, interfaceY, '#f9e2af', 'Incident');

    // Reflected ray
    const rx = cx + Math.sin(theta1) * rayLen;
    const ry = interfaceY - Math.cos(theta1) * rayLen;
    drawRay(ctx, cx, interfaceY, rx, ry, '#f9e2af', '');

    // Refracted ray or TIR indicator
    if (!isTIR && theta2 !== null) {
      const tx = cx + Math.sin(theta2) * rayLen;
      const ty = interfaceY + Math.cos(theta2) * rayLen;
      drawRay(ctx, cx, interfaceY, tx, ty, '#a6e3a1', 'Refracted');
    } else {
      // TIR: extra reflected ray
      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Total Internal Reflection!', cx, interfaceY + 50);
    }

    // Angle arcs and labels
    const arcR = 40;
    // Incident angle arc
    ctx.beginPath();
    ctx.arc(cx, interfaceY, arcR, -Math.PI / 2 - theta1, -Math.PI / 2, false);
    ctx.strokeStyle = '#f9e2af';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#f9e2af';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`θ₁ = ${incidentAngle}°`, cx - arcR * Math.sin(theta1 / 2) - 4, interfaceY - arcR * Math.cos(theta1 / 2) + 4);

    if (!isTIR && theta2 !== null) {
      ctx.beginPath();
      ctx.arc(cx, interfaceY, arcR, Math.PI / 2, Math.PI / 2 + theta2, false);
      ctx.strokeStyle = '#a6e3a1';
      ctx.stroke();
      ctx.fillStyle = '#a6e3a1';
      ctx.textAlign = 'left';
      ctx.fillText(`θ₂ = ${(theta2 * 180 / Math.PI).toFixed(1)}°`, cx + arcR * Math.sin(theta2 / 2) + 4, interfaceY + arcR * Math.cos(theta2 / 2) - 4);
    }

    // Labels
    ctx.font = '13px sans-serif';
    ctx.fillStyle = isDark ? '#9399b2' : '#666';
    ctx.textAlign = 'left';
    ctx.fillText(`n₁ = ${n1.toFixed(2)}`, 10, interfaceY - 14);
    ctx.fillText(`n₂ = ${n2.toFixed(2)}`, 10, interfaceY + 24);

    // Critical angle info
    if (n2 < n1) {
      const critAngle = (Math.asin(n2 / n1) * 180 / Math.PI).toFixed(1);
      ctx.fillStyle = '#e74c3c';
      ctx.textAlign = 'right';
      ctx.fillText(`Critical angle: ${critAngle}°`, W - 10, interfaceY - 14);
    }
  }

  function drawRay(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, label: string) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Arrowhead at end
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 10 * Math.cos(angle - 0.35), y2 - 10 * Math.sin(angle - 0.35));
    ctx.lineTo(x2 - 10 * Math.cos(angle + 0.35), y2 - 10 * Math.sin(angle + 0.35));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    if (label) {
      ctx.fillStyle = color;
      ctx.font = '11px sans-serif';
      ctx.textAlign = x2 < W / 2 ? 'right' : 'left';
      ctx.fillText(label, x2 + (x2 < W / 2 ? -6 : 6), y2 - 6);
    }
  }

  // Mouse drag on incident ray endpoint
  let dragging = false;

  function updateAngleFromMouse(e: MouseEvent | TouchEvent) {
    const rect = canvas.getBoundingClientRect();
    const src = 'touches' in e ? e.touches[0] : e;
    const mx = src.clientX - rect.left;
    const my = src.clientY - rect.top;
    const cx = W / 2;
    const interfaceY = H / 2;
    const dx = cx - mx;
    const dy = interfaceY - my;
    if (dy > 0) {
      incidentAngle = Math.max(0, Math.min(89, Math.atan2(dx, dy) * 180 / Math.PI));
      draw();
    }
  }

  canvas.addEventListener('mousedown', e => { dragging = true; updateAngleFromMouse(e); });
  window.addEventListener('mouseup', () => { dragging = false; });
  window.addEventListener('mousemove', e => { if (dragging) updateAngleFromMouse(e); });
  canvas.addEventListener('touchstart', e => { dragging = true; updateAngleFromMouse(e); e.preventDefault(); }, { passive: false });
  window.addEventListener('touchend', () => { dragging = false; });
  canvas.addEventListener('touchmove', e => { if (dragging) { updateAngleFromMouse(e); e.preventDefault(); } }, { passive: false });

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement!);
  resize();

  return {
    setN1(v: number) { n1 = v; draw(); },
    setN2(v: number) { n2 = v; draw(); },
  };
}
