import type { Entity, Link, WorldParams, SceneData } from './types.js';
import { zero, clone } from './vec2.js';

let _nextId = 1;
const uid = (prefix: string): string => `${prefix}${_nextId++}`;

export const DEFAULT_PARAMS: WorldParams = {
  gravity: { x: 0, y: 9.81 },
  linearDamping: 0.02,
  restitution: 0.6,
  bounds: { w: 12, h: 8 },
};

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
    this.params = { ...params, gravity: clone(params.gravity), bounds: { ...params.bounds } };
  }

  addEntity(partial: Partial<Entity> & { kind: Entity['kind'] }): Entity {
    const e: Entity = {
      id: partial.id ?? uid('e'),
      kind: partial.kind,
      pos: partial.pos ? clone(partial.pos) : zero(),
      vel: partial.vel ? clone(partial.vel) : zero(),
      mass: partial.mass ?? 1,
      radius: partial.radius ?? 0.25,
      fixed: partial.fixed ?? partial.kind === 'anchor',
      charge: partial.charge ?? 0,
      color: partial.color ?? (partial.kind === 'anchor' ? '#94a3b8' : '#e74c3c'),
      label: partial.label,
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
      params: { ...this.params, gravity: clone(this.params.gravity), bounds: { ...this.params.bounds } },
      entities: [...this.entities.values()].map(e => ({ ...e, pos: clone(e.pos), vel: clone(e.vel) })),
      links: [...this.links.values()].map(l => ({ ...l })),
    };
  }

  loadScene(scene: SceneData): void {
    this.clear();
    this.params = {
      ...scene.params,
      gravity: clone(scene.params.gravity),
      bounds: { ...scene.params.bounds },
    };
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
