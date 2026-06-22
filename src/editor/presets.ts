import type { Entity, Link, SceneData } from './core/types.js';

// Ready-made demo scenes so the Lab opens with something alive and the
// physics is immediately visible. Each returns a fresh SceneData.

const baseParams = () => ({
  gravity: { x: 0, y: 9.81 },
  linearDamping: 0.02,
  restitution: 0.6,
  bounds: { w: 12, h: 8 },
  coulombK: 5,
  efield: { x: 0, y: 0 },
  bfield: 0,
  ljEpsilon: 0,
  ljSigma: 0.8,
  strongTension: 0,
  strongCore: 0.5,
  activeBoundary: null,
  emergenceBindRadius: 0.9,
  emergenceMinCluster: 3,
});

export interface Preset {
  id: string;
  nameEn: string;
  nameIt: string;
  build: () => SceneData;
}

const springPendulum = (): SceneData => ({
  version: 1,
  params: baseParams(),
  entities: [
    { id: 'e1', kind: 'anchor', pos: { x: 6, y: 1 }, vel: { x: 0, y: 0 }, mass: 1, radius: 0.22, fixed: true, charge: 0, color: '#94a3b8', label: 'A' },
    { id: 'e2', kind: 'mass', pos: { x: 9, y: 1 }, vel: { x: 0, y: 0 }, mass: 1.5, radius: 0.35, fixed: false, charge: 0, color: '#e74c3c', label: 'm' },
  ],
  links: [
    { id: 'l1', kind: 'spring', a: 'e1', b: 'e2', rest: 2, stiffness: 90, damping: 0.4 },
  ],
});

const springChain = (): SceneData => {
  const entities: Entity[] = [
    { id: 'e1', kind: 'anchor', pos: { x: 2, y: 2 }, vel: { x: 0, y: 0 }, mass: 1, radius: 0.22, fixed: true, charge: 0, color: '#94a3b8', label: 'A' },
  ];
  const links: Link[] = [];
  let prev = 'e1';
  for (let i = 1; i <= 5; i++) {
    const id = `e${i + 1}`;
    entities.push({ id, kind: 'mass' as const, pos: { x: 2 + i, y: 2 }, vel: { x: 0, y: 0 }, mass: 1, radius: 0.3, fixed: false, charge: 0, color: '#e74c3c', label: String(i) });
    links.push({ id: `l${i}`, kind: 'spring' as const, a: prev, b: id, rest: 1, stiffness: 70, damping: 0.5 });
    prev = id;
  }
  return { version: 1, params: baseParams(), entities, links };
};

const bouncingMasses = (): SceneData => ({
  version: 1,
  params: { ...baseParams(), restitution: 0.8, linearDamping: 0.005 },
  entities: [
    { id: 'e1', kind: 'mass', pos: { x: 3, y: 1 }, vel: { x: 2, y: 0 }, mass: 1, radius: 0.4, fixed: false, charge: 0, color: '#e74c3c' },
    { id: 'e2', kind: 'mass', pos: { x: 6, y: 1.5 }, vel: { x: -1, y: 0 }, mass: 2, radius: 0.5, fixed: false, charge: 0, color: '#f59e0b' },
    { id: 'e3', kind: 'mass', pos: { x: 9, y: 1 }, vel: { x: 0, y: 0 }, mass: 0.5, radius: 0.3, fixed: false, charge: 0, color: '#3b82f6' },
  ],
  links: [],
});

// --- EM scale (Phase 2) ---

// A light negative charge orbiting a fixed positive charge (Coulomb "orbit").
const coulombOrbit = (): SceneData => ({
  version: 1,
  params: { ...baseParams(), gravity: { x: 0, y: 0 }, linearDamping: 0, coulombK: 12 },
  entities: [
    { id: 'e1', kind: 'anchor', pos: { x: 6, y: 4 }, vel: { x: 0, y: 0 }, mass: 1, radius: 0.3, fixed: true, charge: 3, color: '#e74c3c', label: '+' },
    { id: 'e2', kind: 'mass', pos: { x: 9, y: 4 }, vel: { x: 0, y: -2.0 }, mass: 0.3, radius: 0.18, fixed: false, charge: -1, color: '#2980b9', label: '−' },
  ],
  links: [],
});

// Two like charges repelling — they fly apart and bounce off the walls.
const likeCharges = (): SceneData => ({
  version: 1,
  params: { ...baseParams(), gravity: { x: 0, y: 0 }, linearDamping: 0.01, coulombK: 8 },
  entities: [
    { id: 'e1', kind: 'mass', pos: { x: 5.2, y: 4 }, vel: { x: 0, y: 0 }, mass: 1, radius: 0.3, fixed: false, charge: 2, color: '#e74c3c', label: '+' },
    { id: 'e2', kind: 'mass', pos: { x: 6.8, y: 4 }, vel: { x: 0, y: 0 }, mass: 1, radius: 0.3, fixed: false, charge: 2, color: '#e74c3c', label: '+' },
  ],
  links: [],
});

// Cyclotron: a charge in a uniform out-of-plane B field circles steadily.
const cyclotron = (): SceneData => ({
  version: 1,
  params: { ...baseParams(), gravity: { x: 0, y: 0 }, linearDamping: 0, coulombK: 0, bfield: 1.5 },
  entities: [
    { id: 'e1', kind: 'mass', pos: { x: 4, y: 4 }, vel: { x: 3, y: 0 }, mass: 1, radius: 0.25, fixed: false, charge: 1, color: '#2980b9', label: 'q' },
  ],
  links: [],
});

// --- Atomic / molecular scale (Phase 3) ---

// A loose grid of atoms that condenses into a close-packed cluster under
// the Lennard-Jones attraction.
const ljCluster = (): SceneData => {
  const entities: Entity[] = [];
  const cols = 6;
  const rows = 4;
  const spacing = 1.05;
  const x0 = 6 - ((cols - 1) * spacing) / 2;
  const y0 = 4 - ((rows - 1) * spacing) / 2;
  let n = 1;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      entities.push({
        id: `e${n++}`,
        kind: 'atom',
        pos: { x: x0 + i * spacing, y: y0 + j * spacing },
        vel: { x: 0, y: 0 },
        mass: 1,
        radius: 0.28,
        fixed: false,
        charge: 0,
        color: '#27ae60',
      });
    }
  }
  return {
    version: 1,
    params: { ...baseParams(), gravity: { x: 0, y: 0 }, linearDamping: 0.05, ljEpsilon: 2, ljSigma: 0.9 },
    entities,
    links: [],
  };
};

// Two atoms placed below their equilibrium separation so the pair
// vibrates like a diatomic molecule.
const diatomic = (): SceneData => ({
  version: 1,
  params: { ...baseParams(), gravity: { x: 0, y: 0 }, linearDamping: 0, ljEpsilon: 3, ljSigma: 1 },
  entities: [
    { id: 'e1', kind: 'atom', pos: { x: 5.5, y: 4 }, vel: { x: 0, y: 0 }, mass: 1, radius: 0.3, fixed: false, charge: 0, color: '#27ae60', label: 'A' },
    { id: 'e2', kind: 'atom', pos: { x: 6.5, y: 4 }, vel: { x: 0, y: 0 }, mass: 1, radius: 0.3, fixed: false, charge: 0, color: '#16a34a', label: 'B' },
  ],
  links: [],
});

// --- Subatomic scale (Phase 4, illustrative) ---

// Three color-charged quarks bound into a baryon ("proton") by the toy
// strong force; they settle into a small bound triangle.
const proton = (): SceneData => ({
  version: 1,
  params: { ...baseParams(), gravity: { x: 0, y: 0 }, linearDamping: 0.08, strongTension: 2.5, strongCore: 0.6 },
  entities: [
    { id: 'e1', kind: 'quark', pos: { x: 5.7, y: 3.8 }, vel: { x: 0, y: 0 }, mass: 0.5, radius: 0.18, fixed: false, charge: 0, color: '#e74c3c', label: 'r' },
    { id: 'e2', kind: 'quark', pos: { x: 6.3, y: 3.8 }, vel: { x: 0, y: 0 }, mass: 0.5, radius: 0.18, fixed: false, charge: 0, color: '#27ae60', label: 'g' },
    { id: 'e3', kind: 'quark', pos: { x: 6.0, y: 4.3 }, vel: { x: 0, y: 0 }, mass: 0.5, radius: 0.18, fixed: false, charge: 0, color: '#3b82f6', label: 'b' },
  ],
  links: [],
});

// Two quarks: one is given a velocity to fly off, but the constant
// confining force pulls it back — they oscillate like a flux "string".
const confinement = (): SceneData => ({
  version: 1,
  params: { ...baseParams(), gravity: { x: 0, y: 0 }, linearDamping: 0, strongTension: 2, strongCore: 0.5 },
  entities: [
    { id: 'e1', kind: 'quark', pos: { x: 6, y: 4 }, vel: { x: 0, y: 0 }, mass: 0.5, radius: 0.18, fixed: false, charge: 0, color: '#e74c3c', label: 'r' },
    { id: 'e2', kind: 'quark', pos: { x: 6.6, y: 4 }, vel: { x: 4, y: 0 }, mass: 0.5, radius: 0.18, fixed: false, charge: 0, color: '#3b82f6', label: 'b' },
  ],
  links: [],
});

// --- Layered emergence (Phase 6) ---

// Subatomic → atomic: three triplets of confined quarks. Run the sim so each
// triplet binds, then press "Emerge" (boundary preset to subatomic→atomic) to
// promote each bound triplet into a single nucleon/atom one layer up.
const emergeNucleons = (): SceneData => {
  const entities: Entity[] = [];
  const colors = ['#e74c3c', '#27ae60', '#3b82f6'];
  const labels = ['r', 'g', 'b'];
  const centers = [{ x: 3.5, y: 4 }, { x: 6, y: 4 }, { x: 8.5, y: 4 }];
  let n = 1;
  for (const c of centers) {
    const offs = [{ x: -0.3, y: -0.2 }, { x: 0.3, y: -0.2 }, { x: 0, y: 0.3 }];
    for (let k = 0; k < 3; k++) {
      entities.push({
        id: `e${n++}`, kind: 'quark',
        pos: { x: c.x + offs[k].x, y: c.y + offs[k].y }, vel: { x: 0, y: 0 },
        mass: 0.5, radius: 0.18, fixed: false, charge: 0,
        color: colors[k], label: labels[k],
      });
    }
  }
  return {
    version: 1,
    params: {
      ...baseParams(), gravity: { x: 0, y: 0 }, linearDamping: 0.08,
      strongTension: 2.5, strongCore: 0.6,
      activeBoundary: 'subatomic-atomic', emergenceMinCluster: 3, emergenceBindRadius: 1.0,
    },
    entities,
    links: [],
  };
};

// Atomic → molecular: a small pool of atoms that condenses under Lennard-Jones.
// Once bound, "Emerge" (boundary preset to atomic→molecular) ties the cluster
// into a single molecule one layer up.
const emergeMolecule = (): SceneData => {
  const entities: Entity[] = [];
  const pts = [
    { x: 5.4, y: 3.7 }, { x: 6.0, y: 3.6 }, { x: 6.6, y: 3.8 },
    { x: 5.7, y: 4.3 }, { x: 6.3, y: 4.3 },
  ];
  pts.forEach((p, i) => entities.push({
    id: `e${i + 1}`, kind: 'atom', pos: p, vel: { x: 0, y: 0 },
    mass: 1, radius: 0.28, fixed: false, charge: 0, color: '#27ae60',
  }));
  return {
    version: 1,
    params: {
      ...baseParams(), gravity: { x: 0, y: 0 }, linearDamping: 0.06,
      ljEpsilon: 2, ljSigma: 0.9,
      activeBoundary: 'atomic-molecular', emergenceMinCluster: 3, emergenceBindRadius: 1.2,
    },
    entities,
    links: [],
  };
};

export const PRESETS: Preset[] = [
  { id: 'pendulum', nameEn: 'Spring Pendulum', nameIt: 'Pendolo a Molla', build: springPendulum },
  { id: 'chain', nameEn: 'Spring Chain', nameIt: 'Catena di Molle', build: springChain },
  { id: 'bounce', nameEn: 'Bouncing Masses', nameIt: 'Masse Rimbalzanti', build: bouncingMasses },
  { id: 'coulomb-orbit', nameEn: 'Coulomb Orbit', nameIt: 'Orbita di Coulomb', build: coulombOrbit },
  { id: 'like-charges', nameEn: 'Like Charges Repel', nameIt: 'Cariche Uguali', build: likeCharges },
  { id: 'cyclotron', nameEn: 'Cyclotron (B field)', nameIt: 'Ciclotrone (campo B)', build: cyclotron },
  { id: 'lj-cluster', nameEn: 'Atomic Cluster (LJ)', nameIt: 'Cluster Atomico (LJ)', build: ljCluster },
  { id: 'diatomic', nameEn: 'Diatomic Molecule', nameIt: 'Molecola Biatomica', build: diatomic },
  { id: 'proton', nameEn: 'Proton (3 quarks)', nameIt: 'Protone (3 quark)', build: proton },
  { id: 'confinement', nameEn: 'Quark Confinement', nameIt: 'Confinamento Quark', build: confinement },
  { id: 'emerge-nucleons', nameEn: 'Emergence: quarks → nucleons', nameIt: 'Emergenza: quark → nucleoni', build: emergeNucleons },
  { id: 'emerge-molecule', nameEn: 'Emergence: atoms → molecule', nameIt: 'Emergenza: atomi → molecola', build: emergeMolecule },
];

export const defaultScene = springPendulum;
