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

  // --- Layered emergence (Phase 6) ---
  // Which ordered scale this body lives at. Determines which inter-layer
  // force coupling can apply to it (see WorldParams.activeBoundary) and
  // which composites it can be aggregated into. Optional for backward
  // compatibility: a body without an explicit layer is placed at the
  // layer implied by its kind (see layerForKind in world.ts).
  layer?: ScaleLayer;

  // When set, this body is a COMPOSITE produced by emergence: a rigid
  // aggregate standing in for a bound cluster of constituents one layer
  // below. `composedOf` lists the constituent ids it absorbed. Composites
  // participate at their own `layer` as a single body.
  composite?: boolean;
  composedOf?: string[];
}

export type EntityKind = 'mass' | 'anchor' | 'atom' | 'quark';

// The ordered matter scales. Emergence may only couple ADJACENT layers
// (subatomic↔atomic OR atomic↔molecular), never skip one. The numeric
// order is used to enforce that "one level at a time" rule.
export type ScaleLayer = 'subatomic' | 'atomic' | 'molecular';

// Ordered list, low → high. Index gives each layer a rank for the
// adjacency check.
export const SCALE_LAYERS: ScaleLayer[] = ['subatomic', 'atomic', 'molecular'];

// The two (and only two) adjacent layer pairs across which emergence may
// propagate. Selecting one of these is the editor's "emergence boundary"
// decision; the engine couples exactly that pair and nothing else.
export type EmergenceBoundary = 'subatomic-atomic' | 'atomic-molecular';

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

  // --- Subatomic scale (Phase 4, illustrative only) ---
  // Strong force between 'quark' entities, modelled on the phenomenological
  // Cornell potential used for heavy-quark bound states:
  //   V(r) = − strongCore / r        (short-range, ~Coulombic one-gluon term)
  //          + strongTension · r      (long-range linear confinement)
  // The radial force is F(r) = −dV/dr = − strongCore / r^2 − strongTension,
  // i.e. always attractive — which would collapse the cluster. To keep a
  // finite, stable bound state we add a short-range hard core that turns
  // the Coulombic well into net repulsion below a core radius (see
  // applyStrongForce). It is illustrative, not a QCD solver.
  strongTension: number; // confinement string tension b (constant pull)
  strongCore: number;    // Coulombic / core strength a

  // --- Layered emergence (Phase 6) ---
  // The single active emergence boundary: the ONE adjacent layer pair
  // across which bound clusters are promoted into composite bodies. Only
  // this pair is coupled; the rule "one level at a time" is enforced by
  // this being a single value (never a set). `null` disables emergence.
  activeBoundary: EmergenceBoundary | null;

  // A constituent cluster counts as "bound" (ready to aggregate) when all
  // its members sit within this radius of their centroid, in world units.
  emergenceBindRadius: number;

  // Minimum number of constituents required to form a composite (e.g. 3
  // quarks → 1 nucleon). Clusters smaller than this are left alone.
  emergenceMinCluster: number;
}

// A scene as persisted to / loaded from JSON.
export interface SceneData {
  version: number;
  params: WorldParams;
  entities: Entity[];
  links: Link[];
}
