import type { Entity, EntityKind, Link, WorldParams, SceneData, ScaleLayer } from './types.js';
import { zero, clone } from './vec2.js';

let _nextId = 1;
const uid = (prefix: string): string => `${prefix}${_nextId++}`;

export function entityDefaultColor(kind: EntityKind): string {
  if (kind === 'anchor') return '#94a3b8';
  if (kind === 'atom') return '#27ae60';
  if (kind === 'quark') return '#9b59b6';
  return '#e74c3c';
}

// The default scale layer implied by a body's kind, used when an entity
// carries no explicit `layer` (older scenes / hand-placed bodies). Quarks
// are subatomic; atoms are atomic; plain masses/anchors default to the
// atomic layer (they are the generic "particle" of the mechanics scale).
export function layerForKind(kind: EntityKind): ScaleLayer {
  if (kind === 'quark') return 'subatomic';
  return 'atomic';
}

// Resolve an entity's effective layer (explicit field, else by kind).
export function entityLayer(e: Entity): ScaleLayer {
  return e.layer ?? layerForKind(e.kind);
}

export const DEFAULT_PARAMS: WorldParams = {
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
};

// Clone params with all nested vectors copied, tolerating older scenes
// that predate the EM fields by filling in defaults.
function cloneParams(p: WorldParams): WorldParams {
  return {
    gravity: clone(p.gravity),
    linearDamping: p.linearDamping,
    restitution: p.restitution,
    bounds: { ...p.bounds },
    coulombK: p.coulombK ?? DEFAULT_PARAMS.coulombK,
    efield: p.efield ? clone(p.efield) : { x: 0, y: 0 },
    bfield: p.bfield ?? 0,
    ljEpsilon: p.ljEpsilon ?? 0,
    ljSigma: p.ljSigma ?? DEFAULT_PARAMS.ljSigma,
    strongTension: p.strongTension ?? 0,
    strongCore: p.strongCore ?? DEFAULT_PARAMS.strongCore,
    activeBoundary: p.activeBoundary ?? null,
    emergenceBindRadius: p.emergenceBindRadius ?? DEFAULT_PARAMS.emergenceBindRadius,
    emergenceMinCluster: p.emergenceMinCluster ?? DEFAULT_PARAMS.emergenceMinCluster,
  };
}

export { cloneParams };

// The World is the single source of truth for scene structure and state.
// The PhysicsEngine mutates entity pos/vel in place; the Renderer reads
// the same entities. Neither knows which engine implementation is active.
export class World {
  entities = new Map<string, Entity>();
  links = new Map<string, Link>();
  params: WorldParams;

  // Bumped whenever structure (not just position) changes, so an engine
  // that caches buffers on the GPU knows it must re-sync from the world.
  structureRevision = 0;

  constructor(params: WorldParams = DEFAULT_PARAMS) {
    this.params = cloneParams(params);
  }

  addEntity(partial: Partial<Entity> & { kind: Entity['kind'] }): Entity {
    const e: Entity = {
      id: partial.id ?? uid('e'),
      kind: partial.kind,
      pos: partial.pos ? clone(partial.pos) : zero(),
      vel: partial.vel ? clone(partial.vel) : zero(),
      mass: partial.mass ?? 1,
      radius: partial.radius ?? (partial.kind === 'atom' ? 0.3 : 0.25),
      fixed: partial.fixed ?? partial.kind === 'anchor',
      charge: partial.charge ?? 0,
      color: partial.color ?? entityDefaultColor(partial.kind),
      label: partial.label,
      layer: partial.layer ?? layerForKind(partial.kind),
      composite: partial.composite,
      composedOf: partial.composedOf ? [...partial.composedOf] : undefined,
    };
    this.entities.set(e.id, e);
    this.structureRevision++;
    return e;
  }

  addLink(partial: Partial<Link> & { a: string; b: string }): Link {
    const l: Link = {
      id: partial.id ?? uid('l'),
      kind: partial.kind ?? 'spring',
      a: partial.a,
      b: partial.b,
      rest: partial.rest ?? 1,
      stiffness: partial.stiffness ?? 40,
      damping: partial.damping ?? 0.5,
    };
    this.links.set(l.id, l);
    this.structureRevision++;
    return l;
  }

  removeEntity(id: string): void {
    if (!this.entities.delete(id)) return;
    // Drop any links that referenced the removed entity.
    for (const [lid, l] of this.links) {
      if (l.a === id || l.b === id) this.links.delete(lid);
    }
    this.structureRevision++;
  }

  removeLink(id: string): void {
    if (this.links.delete(id)) this.structureRevision++;
  }

  clear(): void {
    this.entities.clear();
    this.links.clear();
    this.structureRevision++;
  }

  // ---- serialization ----

  toScene(): SceneData {
    return {
      version: 1,
      params: cloneParams(this.params),
      entities: [...this.entities.values()].map(e => ({ ...e, pos: clone(e.pos), vel: clone(e.vel) })),
      links: [...this.links.values()].map(l => ({ ...l })),
    };
  }

  loadScene(scene: SceneData): void {
    this.clear();
    this.params = cloneParams(scene.params);
    for (const e of scene.entities) {
      this.entities.set(e.id, { ...e, pos: clone(e.pos), vel: clone(e.vel) });
      // Keep the id counter ahead of any loaded ids to avoid collisions.
      const n = parseInt(e.id.replace(/\D/g, ''), 10);
      if (!Number.isNaN(n) && n >= _nextId) _nextId = n + 1;
    }
    for (const l of scene.links) this.links.set(l.id, { ...l });
    this.structureRevision++;
  }
}
