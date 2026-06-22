import type { Renderer } from './Renderer.js';
import type { World } from '../core/world.js';
import type { Vec2 } from '../core/vec2.js';

// Canvas 2D viewport. Maps world units onto the canvas with a uniform
// scale that fits the world bounds, centered with letterboxing. Matches
// the drawing idiom of the existing diagrams/canvas/* simulations.
export class Canvas2DRenderer implements Renderer {
  readonly name = '2D Canvas';
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr = Math.max(1, window.devicePixelRatio || 1);

  // View transform: screen = world * scale + offset (in CSS pixels).
  private scale = 50;
  private offsetX = 0;
  private offsetY = 0;
  private worldW = 12;
  private worldH = 8;
  private fieldOverlay = false;
  private selectedId: string | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'editor-canvas';
    this.ctx = this.canvas.getContext('2d')!;
  }

  mount(container: HTMLElement): void {
    container.appendChild(this.canvas);
    this.resize();
  }

  resize(): void {
    const rect = this.canvas.parentElement!.getBoundingClientRect();
    const cssW = Math.max(320, rect.width);
    const cssH = Math.max(320, rect.height || 480);
    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(cssW * this.dpr);
    this.canvas.height = Math.round(cssH * this.dpr);
    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;
    this.recomputeTransform(cssW, cssH);
  }

  private recomputeTransform(cssW: number, cssH: number): void {
    const margin = 0.96;
    this.scale = Math.min(cssW / this.worldW, cssH / this.worldH) * margin;
    this.offsetX = (cssW - this.worldW * this.scale) / 2;
    this.offsetY = (cssH - this.worldH * this.scale) / 2;
  }

  worldToScreen(p: Vec2): { x: number; y: number } {
    return { x: p.x * this.scale + this.offsetX, y: p.y * this.scale + this.offsetY };
  }

  screenToWorld(px: number, py: number): Vec2 {
    return { x: (px - this.offsetX) / this.scale, y: (py - this.offsetY) / this.scale };
  }

  setFieldOverlay(visible: boolean): void {
    this.fieldOverlay = visible;
  }

  setSelected(id: string | null): void {
    this.selectedId = id;
  }

  render(world: World): void {
    // Keep the transform in sync with the world's bounds.
    if (world.params.bounds.w !== this.worldW || world.params.bounds.h !== this.worldH) {
      this.worldW = world.params.bounds.w;
      this.worldH = world.params.bounds.h;
      const rect = this.canvas.getBoundingClientRect();
      this.recomputeTransform(rect.width, rect.height);
    }

    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    const rect = this.canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    this.drawWorldFrame();
    if (this.fieldOverlay) this.drawFieldOverlay(world);
    this.drawLinks(world);
    this.drawEntities(world);
    this.drawSelectionCue(world);

    ctx.restore();
  }

  private drawWorldFrame(): void {
    const ctx = this.ctx;
    const tl = this.worldToScreen({ x: 0, y: 0 });
    const w = this.worldW * this.scale;
    const h = this.worldH * this.scale;

    // Faint grid every 1 world unit.
    ctx.strokeStyle = 'rgba(148,163,184,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let gx = 0; gx <= this.worldW; gx++) {
      const sx = tl.x + gx * this.scale;
      ctx.moveTo(sx, tl.y);
      ctx.lineTo(sx, tl.y + h);
    }
    for (let gy = 0; gy <= this.worldH; gy++) {
      const sy = tl.y + gy * this.scale;
      ctx.moveTo(tl.x, sy);
      ctx.lineTo(tl.x + w, sy);
    }
    ctx.stroke();

    // World boundary.
    ctx.strokeStyle = 'rgba(148,163,184,0.6)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tl.x, tl.y, w, h);
  }

  // Net electric-field direction on a coarse grid: E = E_external + Σ k q r̂/r².
  // Arrow direction shows field direction; opacity encodes magnitude.
  private drawFieldOverlay(world: World): void {
    const ctx = this.ctx;
    const k = world.params.coulombK;
    const ext = world.params.efield;
    const cols = 16;
    const rows = Math.max(4, Math.round(cols * (this.worldH / this.worldW)));
    const charged = [...world.entities.values()].filter(e => e.charge !== 0);
    const arrowLen = (this.worldW / cols) * this.scale * 0.42;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const wx = ((i + 0.5) / cols) * this.worldW;
        const wy = ((j + 0.5) / rows) * this.worldH;
        let ex = ext.x;
        let ey = ext.y;
        for (const c of charged) {
          const dx = wx - c.pos.x;
          const dy = wy - c.pos.y;
          const r2 = dx * dx + dy * dy + c.radius * c.radius;
          const r = Math.sqrt(r2);
          const mag = (k * c.charge) / r2;
          ex += (dx / r) * mag;
          ey += (dy / r) * mag;
        }
        const m = Math.hypot(ex, ey);
        if (m < 1e-4) continue;
        const ux = ex / m;
        const uy = ey / m;
        const p = this.worldToScreen({ x: wx, y: wy });
        const alpha = Math.min(0.5, 0.08 + m * 0.04);
        const ax = p.x - ux * arrowLen * 0.5;
        const ay = p.y - uy * arrowLen * 0.5;
        const bx = p.x + ux * arrowLen * 0.5;
        const by = p.y + uy * arrowLen * 0.5;
        ctx.strokeStyle = `rgba(41,128,185,${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
        // Arrowhead.
        const ah = arrowLen * 0.3;
        const angle = Math.atan2(uy, ux);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - ah * Math.cos(angle - 0.5), by - ah * Math.sin(angle - 0.5));
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - ah * Math.cos(angle + 0.5), by - ah * Math.sin(angle + 0.5));
        ctx.stroke();
      }
    }
  }

  private drawLinks(world: World): void {
    for (const l of world.links.values()) {
      const a = world.entities.get(l.a);
      const b = world.entities.get(l.b);
      if (!a || !b) continue;
      const pa = this.worldToScreen(a.pos);
      const pb = this.worldToScreen(b.pos);
      this.drawSpring(pa, pb);
    }
  }

  // Zig-zag coil so stretch/compression is visually obvious.
  private drawSpring(pa: { x: number; y: number }, pb: { x: number; y: number }): void {
    const ctx = this.ctx;
    const dx = pb.x - pa.x;
    const dy = pb.y - pa.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const nx = -uy;
    const ny = ux;

    const coils = 12;
    const amp = 7;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    for (let i = 1; i < coils; i++) {
      const t = i / coils;
      const sign = i % 2 === 0 ? 1 : -1;
      const cx = pa.x + ux * length * t + nx * amp * sign;
      const cy = pa.y + uy * length * t + ny * amp * sign;
      ctx.lineTo(cx, cy);
    }
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private drawEntities(world: World): void {
    const ctx = this.ctx;
    for (const e of world.entities.values()) {
      const p = this.worldToScreen(e.pos);
      const r = Math.max(5, e.radius * this.scale);

      if (e.render === 'cloud') {
        // Probability cloud: a soft radial gradient with no hard edge — the
        // modern depiction of a quantum object (e.g. an electron), rather
        // than a ball on an orbit.
        this.drawCloud(p, r, e.color);
      } else if (e.kind === 'anchor') {
        // Anchors drawn as squares to read as "pinned to the world".
        ctx.fillStyle = e.color;
        ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x - r, p.y - r, r * 2, r * 2);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = e.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (e.label) {
        // Clouds get a dim, centered label so they stay diffuse.
        ctx.fillStyle = e.render === 'cloud' ? 'rgba(255,255,255,0.85)' : '#fff';
        ctx.font = `${e.render === 'cloud' ? '' : 'bold '}11px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(e.label, p.x, p.y);
      }
    }
  }

  // Selection cue: a faint velocity vector from the selected body, so its
  // motion is legible while paused or stepping. Scaled so typical speeds read
  // without dominating; hidden when essentially at rest.
  private drawSelectionCue(world: World): void {
    if (!this.selectedId) return;
    const e = world.entities.get(this.selectedId);
    if (!e) return;
    const speed = Math.hypot(e.vel.x, e.vel.y);
    if (speed < 0.05) return;

    const ctx = this.ctx;
    const p = this.worldToScreen(e.pos);
    // 0.25 s of travel, in screen pixels, capped so fast bodies stay tidy.
    const len = Math.min(120, speed * 0.25 * this.scale);
    const ux = e.vel.x / speed;
    const uy = e.vel.y / speed;
    const tipX = p.x + ux * len;
    const tipY = p.y + uy * len;

    ctx.save();
    ctx.strokeStyle = 'rgba(41,128,185,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    const ah = 7;
    const angle = Math.atan2(uy, ux);
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - ah * Math.cos(angle - 0.5), tipY - ah * Math.sin(angle - 0.5));
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - ah * Math.cos(angle + 0.5), tipY - ah * Math.sin(angle + 0.5));
    ctx.stroke();
    ctx.restore();
  }

  // A diffuse probability cloud: a dense centre fading to fully transparent,
  // with a couple of fainter shells so it reads as a distribution, not a disc.
  private drawCloud(p: { x: number; y: number }, r: number, color: string): void {
    const ctx = this.ctx;
    const R = r * 1.7; // clouds extend beyond their nominal radius
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
    grad.addColorStop(0, hexToRgba(color, 0.55));
    grad.addColorStop(0.45, hexToRgba(color, 0.28));
    grad.addColorStop(0.8, hexToRgba(color, 0.08));
    grad.addColorStop(1, hexToRgba(color, 0));
    ctx.beginPath();
    ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  dispose(): void {
    this.canvas.remove();
  }
}

// Convert a #rgb / #rrggbb hex string to an rgba() string at the given alpha.
// Falls back to the raw color (assumed already rgba/named) on a non-hex input.
function hexToRgba(hex: string, alpha: number): string {
  let h = hex.trim();
  if (h[0] !== '#') return hex;
  h = h.slice(1);
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
