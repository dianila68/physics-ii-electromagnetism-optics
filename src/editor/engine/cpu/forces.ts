import type { World } from '../../core/world.js';
import type { Link } from '../../core/types.js';
import type { Vec2 } from '../../core/vec2.js';
import { addScaledMut, sub, len } from '../../core/vec2.js';

// Force models for the CPU engine, written as pure-ish accumulators that
// add into a per-entity force map. New scales (Coulomb/Lorentz for EM,
// Lennard-Jones for molecular) plug in here as additional functions
// without changing the integrator.

export type ForceMap = Map<string, Vec2>;

// Uniform gravity field: F = m * g.
export function applyGravity(world: World, forces: ForceMap): void {
  const g = world.params.gravity;
  for (const e of world.entities.values()) {
    if (e.fixed) continue;
    addScaledMut(forces.get(e.id)!, g, e.mass);
  }
}

// Damped Hooke spring between two entities.
//   F_spring = -k (|d| - rest) d̂
//   F_damp   = -c (v_rel · d̂) d̂
export function applySpring(world: World, link: Link, forces: ForceMap): void {
  if (link.kind !== 'spring') return;
  const a = world.entities.get(link.a);
  const b = world.entities.get(link.b);
  if (!a || !b) return;

  const d = sub(b.pos, a.pos);
  const dist = len(d);
  if (dist < 1e-9) return;
  const ux = d.x / dist;
  const uy = d.y / dist;

  const stretch = dist - link.rest;
  const springMag = link.stiffness * stretch;

  // Relative velocity projected onto the link axis -> axial damping.
  const relVx = b.vel.x - a.vel.x;
  const relVy = b.vel.y - a.vel.y;
  const dampMag = link.damping * (relVx * ux + relVy * uy);

  const fMag = springMag + dampMag;
  const fx = ux * fMag;
  const fy = uy * fMag;

  // Equal and opposite: pull a toward b, push b away accordingly.
  const fa = forces.get(a.id);
  const fb = forces.get(b.id);
  if (fa) { fa.x += fx; fa.y += fy; }
  if (fb) { fb.x -= fx; fb.y -= fy; }
}
