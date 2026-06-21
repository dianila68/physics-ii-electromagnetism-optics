import type { Vec2 } from './vec2.js';

// An Entity is a single simulated body. It carries fields for several
// physical scales (mass for mechanics, charge for EM); a given scale's
// engine reads only the fields it cares about. This keeps one model
// usable from macro mechanics (Phase 1) up through EM and atomic scales.
export interface Entity {
  id: string;
  kind: EntityKind;
  pos: Vec2;
  vel: Vec2;
  mass: number;
  radius: number; // visual + simple collision radius, in world units
  fixed: boolean; // pinned: integrator never moves it (anchors)
  charge: number; // reserved for the EM scale (Phase 2)
  color: string;
  label?: string;
}

export type EntityKind = 'mass' | 'anchor' | 'atom';

// A two-body link. Currently a damped Hooke spring; the type tag leaves
// room for rods / rigid constraints later.
export interface Link {
  id: string;
  kind: LinkKind;
  a: string; // entity id
  b: string; // entity id
  rest: number; // natural length, world units
  stiffness: number; // N/m (k)
  damping: number; // N·s/m along the link axis
}

export type LinkKind = 'spring';

// Global simulation parameters that apply to the whole world.
export interface WorldParams {
  gravity: Vec2; // world units / s^2
  linearDamping: number; // per-second velocity damping (drag)
  restitution: number; // wall bounce factor [0..1]
  bounds: { w: number; h: number }; // world extent

  // --- EM scale (Phase 2) ---
  // Sandbox Coulomb constant (not SI): F = coulombK * q1*q2 / r^2.
  coulombK: number;
  efield: Vec2; // uniform external electric field
  bfield: number; // uniform external magnetic field, out-of-plane (+z)

  // --- Atomic / molecular scale (Phase 3) ---
  // Lennard-Jones interaction between 'atom' entities:
  //   V(r) = 4ε[(σ/r)^12 - (σ/r)^6].
  ljEpsilon: number; // well depth ε (interaction strength)
  ljSigma: number; // distance σ at which V = 0
}

// A scene as persisted to / loaded from JSON.
export interface SceneData {
  version: number;
  params: WorldParams;
  entities: Entity[];
  links: Link[];
}
