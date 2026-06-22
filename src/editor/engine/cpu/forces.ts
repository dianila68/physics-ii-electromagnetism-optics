import type { World } from '../../core/world.js';
import type { Link } from '../../core/types.js';
import type { Vec2 } from '../../core/vec2.js';
import { entityLayer } from '../../core/world.js';
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

// Pairwise Coulomb interaction among charged entities (EM scale).
//   F = k q_i q_j / r^2  along r̂  (repulsive for like signs)
// A softening term (sum of radii) keeps the force finite at contact so
// the explicit integrator stays stable. O(n^2) — fine for sandbox sizes;
// the GPU backend is where large-n spatial hashing will live.
export function applyCoulomb(world: World, forces: ForceMap): void {
  const k = world.params.coulombK;
  if (k === 0) return;
  const charged = [...world.entities.values()].filter(e => e.charge !== 0);
  for (let i = 0; i < charged.length; i++) {
    const a = charged[i];
    for (let j = i + 1; j < charged.length; j++) {
      const b = charged[j];
      const dx = b.pos.x - a.pos.x;
      const dy = b.pos.y - a.pos.y;
      const soft = a.radius + b.radius;
      const r2 = dx * dx + dy * dy + soft * soft;
      const r = Math.sqrt(r2);
      // Positive product -> repulsion (push apart along a->b on b).
      const mag = (k * a.charge * b.charge) / r2;
      const fx = (dx / r) * mag;
      const fy = (dy / r) * mag;
      const fa = forces.get(a.id);
      const fb = forces.get(b.id);
      if (fa) { fa.x -= fx; fa.y -= fy; }
      if (fb) { fb.x += fx; fb.y += fy; }
    }
  }
}

// Lennard-Jones interaction among 'atom' entities (molecular scale).
//   V(r) = 4ε[(σ/r)^12 - (σ/r)^6]
//   F(r) = 24ε/r [2(σ/r)^12 - (σ/r)^6]  along r̂  (away from neighbor)
// Truncated at r = 2.5σ. Distance is clamped at 0.8σ and the force
// magnitude is capped so the steep repulsive wall can't blow up the
// explicit integrator.
export function applyLennardJones(world: World, forces: ForceMap): void {
  const eps = world.params.ljEpsilon;
  const sigma = world.params.ljSigma;
  if (eps <= 0 || sigma <= 0) return;
  const cutoff = 2.5 * sigma;
  const cutoff2 = cutoff * cutoff;
  const minR = 0.8 * sigma;
  const maxForce = 200 * eps;

  // Only atomic-layer atoms interact via LJ. A molecular composite is a
  // single body at the layer above and must not feel its constituents'
  // LJ pull (that coupling has already "emerged" into one rigid body).
  const atoms = [...world.entities.values()].filter(e => e.kind === 'atom' && entityLayer(e) === 'atomic');
  for (let i = 0; i < atoms.length; i++) {
    const a = atoms[i];
    for (let j = i + 1; j < atoms.length; j++) {
      const b = atoms[j];
      const dx = b.pos.x - a.pos.x;
      const dy = b.pos.y - a.pos.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > cutoff2) continue;
      let r = Math.sqrt(d2);
      if (r < minR) r = minR;
      const sr = sigma / r;
      const sr6 = sr * sr * sr * sr * sr * sr;
      const sr12 = sr6 * sr6;
      let fMag = (24 * eps / r) * (2 * sr12 - sr6); // >0 repulsive, <0 attractive
      if (fMag > maxForce) fMag = maxForce;
      else if (fMag < -maxForce) fMag = -maxForce;
      // fMag along r̂ (a->b) pushes b away from a when positive.
      const inv = 1 / r;
      const fx = dx * inv * fMag;
      const fy = dy * inv * fMag;
      const fa = forces.get(a.id);
      const fb = forces.get(b.id);
      if (fa) { fa.x -= fx; fa.y -= fy; }
      if (fb) { fb.x += fx; fb.y += fy; }
    }
  }
}

// Cornell-style strong force among subatomic 'quark' entities.
//
// Physics model (illustrative, not a QCD solver):
//   The Cornell potential for a quark–antiquark pair is
//       V(r) = − a / r + b · r
//   with a the short-range one-gluon-exchange (~Coulombic) coefficient and
//   b the QCD string tension giving linear confinement. The radial force is
//       F(r) = − dV/dr = − a / r^2 − b,
//   which is attractive at every range. A purely attractive pair would
//   collapse to a point under an explicit integrator, so — exactly as a
//   real hadron has a finite size set by the quark cores — we add a
//   short-range repulsive core that dominates below r = CORE_R, turning the
//   1/r^2 term net-repulsive there. The result is a finite, stable bound
//   triangle/pair that nonetheless can never be pulled apart (the constant
//   −b confinement term), the qualitative signature of confinement.
//
// We map the params: strongCore -> a, strongTension -> b. Distances are
// softened (clamped at CORE_R) and the magnitude capped for stability.
const STRONG_CORE_R = 0.28; // hard-core radius; below it net repulsion wins
const STRONG_MAX_FORCE = 500;

export function applyStrongForce(world: World, forces: ForceMap): void {
  const b = world.params.strongTension; // string tension (linear term)
  const a = world.params.strongCore;    // Coulombic / core coefficient
  if (b <= 0 && a <= 0) return;
  // Only subatomic-layer quarks bind via the strong force. A nucleon
  // composite is a single body one layer up and must not feel this.
  const quarks = [...world.entities.values()].filter(e => e.kind === 'quark' && entityLayer(e) === 'subatomic');

  for (let i = 0; i < quarks.length; i++) {
    const qi = quarks[i];
    for (let j = i + 1; j < quarks.length; j++) {
      const qj = quarks[j];
      const dx = qj.pos.x - qi.pos.x;
      const dy = qj.pos.y - qi.pos.y;
      let r = Math.sqrt(dx * dx + dy * dy);
      if (r < 1e-4) r = 1e-4;
      // Cornell attraction: Coulombic −a/r^2 plus constant confinement −b.
      // (fMag > 0 repels along r̂, < 0 attracts.) Inside the hard core the
      // 1/r^4 repulsion overwhelms the attraction, fixing a finite size.
      const rEff = Math.max(r, STRONG_CORE_R * 0.5);
      const coreRepulsion = a * (STRONG_CORE_R * STRONG_CORE_R) / (rEff * rEff * rEff * rEff);
      let fMag = coreRepulsion - a / (rEff * rEff) - b;
      if (fMag > STRONG_MAX_FORCE) fMag = STRONG_MAX_FORCE;
      else if (fMag < -STRONG_MAX_FORCE) fMag = -STRONG_MAX_FORCE;
      const inv = 1 / r;
      const fx = dx * inv * fMag;
      const fy = dy * inv * fMag;
      const fi = forces.get(qi.id);
      const fj = forces.get(qj.id);
      if (fi) { fi.x -= fx; fi.y -= fy; }
      if (fj) { fj.x += fx; fj.y += fy; }
    }
  }
}

// Lorentz force from uniform external fields: F = q (E + v × B).
// In 2D, B is out-of-plane (+z), so v × B = (v_y B, -v_x B).
export function applyLorentz(world: World, forces: ForceMap): void {
  const { efield, bfield } = world.params;
  if (efield.x === 0 && efield.y === 0 && bfield === 0) return;
  for (const e of world.entities.values()) {
    if (e.charge === 0 || e.fixed) continue;
    const f = forces.get(e.id);
    if (!f) continue;
    f.x += e.charge * (efield.x + e.vel.y * bfield);
    f.y += e.charge * (efield.y - e.vel.x * bfield);
  }
}
