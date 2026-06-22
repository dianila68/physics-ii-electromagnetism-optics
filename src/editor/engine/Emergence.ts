import type { World } from '../core/world.js';
import { entityLayer } from '../core/world.js';
import type { Entity, EmergenceBoundary, ScaleLayer } from '../core/types.js';

// ----------------------------------------------------------------------------
// Layered emergence
//
// When the constituents of layer N settle into a bound cluster, that cluster
// is "artificially tied" — promoted into a single composite body that lives
// at layer N+1 and thereafter moves as one rigid aggregate. This is the
// editor's model of matter emerging across scales:
//
//     subatomic (quarks)  →  atomic (nucleons / atoms)  →  molecular
//
// HARD CONSTRAINT — one level at a time:
//   Emergence may only propagate across the ONE adjacent layer boundary the
//   user has selected (`World.params.activeBoundary`). We can show
//   subatomic→atomic OR atomic→molecular, but never both at once and never a
//   skip (subatomic→molecular). The enforcement is structural: the active
//   boundary is a single value, and the boundary helpers below reject any
//   non-adjacent pair, so the engine can only ever couple two neighbouring
//   layers.
// ----------------------------------------------------------------------------

// The two adjacent layers a boundary connects: [lower, upper]. Lower-layer
// constituents aggregate into an upper-layer composite.
export function boundaryLayers(b: EmergenceBoundary): [ScaleLayer, ScaleLayer] {
  return b === 'subatomic-atomic' ? ['subatomic', 'atomic'] : ['atomic', 'molecular'];
}

// Defensive adjacency guard. Both boundaries in the type are adjacent by
// construction; this exists so any future boundary value can't silently
// couple non-neighbouring layers (the one-level rule).
export function isAdjacentBoundary(b: EmergenceBoundary): boolean {
  const [lo, hi] = boundaryLayers(b);
  const order: ScaleLayer[] = ['subatomic', 'atomic', 'molecular'];
  return order.indexOf(hi) - order.indexOf(lo) === 1;
}

// A bound cluster: constituent ids plus their centroid and total mass.
interface Cluster {
  members: Entity[];
  cx: number;
  cy: number;
  mass: number;
}

// Group the lower-layer constituents into clusters by single-link
// connectivity within `bindRadius` (a simple union-find / flood fill over a
// proximity graph). Only clusters where every member is within `bindRadius`
// of the cluster centroid count as "bound" enough to aggregate.
function findBoundClusters(constituents: Entity[], bindRadius: number, minSize: number): Cluster[] {
  const r2 = bindRadius * bindRadius;
  const n = constituents.length;
  const parent = constituents.map((_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; }
    return i;
  };
  const union = (i: number, j: number): void => { parent[find(i)] = find(j); };

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = constituents[i].pos.x - constituents[j].pos.x;
      const dy = constituents[i].pos.y - constituents[j].pos.y;
      if (dx * dx + dy * dy <= r2) union(i, j);
    }
  }

  const groups = new Map<number, Entity[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    const g = groups.get(root) ?? [];
    g.push(constituents[i]);
    groups.set(root, g);
  }

  const clusters: Cluster[] = [];
  for (const members of groups.values()) {
    if (members.length < minSize) continue;
    let cx = 0, cy = 0, mass = 0;
    for (const m of members) { cx += m.pos.x; cy += m.pos.y; mass += m.mass; }
    cx /= members.length; cy /= members.length;
    // Require compactness: every member within bindRadius of the centroid.
    const compact = members.every(m => {
      const dx = m.pos.x - cx, dy = m.pos.y - cy;
      return dx * dx + dy * dy <= r2;
    });
    if (compact) clusters.push({ members, cx, cy, mass });
  }
  return clusters;
}

// Compute a composite's properties from its constituents.
function compositeFor(cluster: Cluster, upper: ScaleLayer): Partial<Entity> & { kind: Entity['kind'] } {
  const { members, cx, cy, mass } = cluster;
  // Centre-of-mass velocity so the aggregate inherits the cluster's momentum.
  let vx = 0, vy = 0, charge = 0, radius = 0;
  for (const m of members) {
    vx += m.mass * m.vel.x;
    vy += m.mass * m.vel.y;
    charge += m.charge;
    radius = Math.max(radius, Math.hypot(m.pos.x - cx, m.pos.y - cy) + m.radius);
  }
  if (mass > 0) { vx /= mass; vy /= mass; }

  // A subatomic→atomic composite is a nucleon/atom; an atomic→molecular
  // composite is a molecule unit (represented as an 'atom' body one layer
  // up, so it can in turn participate at the molecular layer if selected).
  const kind: Entity['kind'] = 'atom';
  const label = upper === 'atomic' ? 'N' : 'M';
  const color = upper === 'atomic' ? '#f59e0b' : '#8b5cf6';

  return {
    kind,
    pos: { x: cx, y: cy },
    vel: { x: vx, y: vy },
    mass,
    radius: Math.max(0.22, radius),
    charge,
    color,
    label,
    layer: upper,
    composite: true,
    composedOf: members.map(m => m.id),
  };
}

// Result of one emergence pass.
export interface EmergenceResult {
  composedCount: number;   // composites created this pass
  absorbedCount: number;   // constituents removed this pass
}

// Run one aggregation pass against the active boundary. Detects bound
// clusters of lower-layer constituents and replaces each with a single
// composite at the upper layer. Returns counts; no-op (and returns zeros)
// when no boundary is active. Safe to call repeatedly — already-aggregated
// composites live at the upper layer and are not re-scanned as constituents.
export function runEmergence(world: World): EmergenceResult {
  const boundary = world.params.activeBoundary;
  if (!boundary || !isAdjacentBoundary(boundary)) return { composedCount: 0, absorbedCount: 0 };

  const [lower, upper] = boundaryLayers(boundary);
  const constituents = [...world.entities.values()].filter(
    e => entityLayer(e) === lower && !e.fixed,
  );
  if (constituents.length === 0) return { composedCount: 0, absorbedCount: 0 };

  const clusters = findBoundClusters(
    constituents,
    world.params.emergenceBindRadius,
    Math.max(1, Math.floor(world.params.emergenceMinCluster)),
  );

  let composedCount = 0;
  let absorbedCount = 0;
  for (const cluster of clusters) {
    world.addEntity(compositeFor(cluster, upper));
    for (const m of cluster.members) world.removeEntity(m.id);
    composedCount++;
    absorbedCount += cluster.members.length;
  }
  return { composedCount, absorbedCount };
}
