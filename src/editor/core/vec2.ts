// Minimal 2D vector math for the editor's physics core.
// Phase 1 is 2D; the renderer/engine boundary is designed so a 3D
// Vec3 variant can be introduced later without touching the UI layer.

export interface Vec2 {
  x: number;
  y: number;
}

export const v = (x: number, y: number): Vec2 => ({ x, y });
export const zero = (): Vec2 => ({ x: 0, y: 0 });
export const clone = (a: Vec2): Vec2 => ({ x: a.x, y: a.y });

export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s });

export const dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;
export const len = (a: Vec2): number => Math.hypot(a.x, a.y);
export const dist = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);

export function norm(a: Vec2): Vec2 {
  const l = len(a);
  return l > 1e-12 ? { x: a.x / l, y: a.y / l } : { x: 0, y: 0 };
}

// In-place accumulation helpers — used in the hot integration loop to
// avoid allocating a new object per force contribution.
export function addMut(target: Vec2, b: Vec2): void {
  target.x += b.x;
  target.y += b.y;
}

export function addScaledMut(target: Vec2, b: Vec2, s: number): void {
  target.x += b.x * s;
  target.y += b.y * s;
}
