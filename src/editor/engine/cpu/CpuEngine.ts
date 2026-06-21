import type { PhysicsEngine } from '../PhysicsEngine.js';
import type { World } from '../../core/world.js';
import type { Vec2 } from '../../core/vec2.js';
import { applyGravity, applySpring, applyCoulomb, applyLorentz, applyLennardJones, applyStrongForce, type ForceMap } from './forces.js';

// Default backend: a semi-implicit (symplectic) Euler integrator running
// on the main thread. Symplectic Euler is chosen over explicit Euler
// because it is stable for the stiff spring forces in Phase 1.
//
// A fixed internal timestep with an accumulator keeps the simulation
// deterministic and stable regardless of frame rate; `step(dt)` consumes
// the elapsed wall-clock time in fixed sub-steps.
export class CpuEngine implements PhysicsEngine {
  readonly name = 'CPU (semi-implicit Euler)';
  readonly accelerated = false;

  private world!: World;
  private forces: ForceMap = new Map();

  // Fixed sub-step. 240 Hz gives headroom for stiff springs while large
  // frame gaps are split into multiple sub-steps (capped to avoid spirals).
  private readonly fixedDt = 1 / 240;
  private readonly maxSubSteps = 8;
  private accumulator = 0;

  init(world: World): void {
    this.world = world;
    this.sync();
  }

  // Rebuild the per-entity force map to match current world membership.
  sync(): void {
    this.forces.clear();
    for (const id of this.world.entities.keys()) {
      this.forces.set(id, { x: 0, y: 0 });
    }
  }

  step(dt: number): void {
    // Defensive: if the world gained/lost entities since last sync, refresh.
    if (this.forces.size !== this.world.entities.size) this.sync();

    this.accumulator += Math.min(dt, this.fixedDt * this.maxSubSteps);
    let n = 0;
    while (this.accumulator >= this.fixedDt && n < this.maxSubSteps) {
      this.substep(this.fixedDt);
      this.accumulator -= this.fixedDt;
      n++;
    }
  }

  private substep(h: number): void {
    const { entities, params } = this.world;

    // 1. Zero the force accumulators.
    for (const f of this.forces.values()) { f.x = 0; f.y = 0; }

    // 2. Accumulate forces from every active model.
    applyGravity(this.world, this.forces);
    applyCoulomb(this.world, this.forces);
    applyLorentz(this.world, this.forces);
    applyLennardJones(this.world, this.forces);
    applyStrongForce(this.world, this.forces);
    for (const link of this.world.links.values()) applySpring(this.world, link, this.forces);

    // 3. Integrate (semi-implicit: update velocity, then position).
    const dampFactor = Math.max(0, 1 - params.linearDamping * h);
    for (const e of entities.values()) {
      if (e.fixed) { e.vel.x = 0; e.vel.y = 0; continue; }
      const f = this.forces.get(e.id) as Vec2;
      const invMass = 1 / e.mass;

      e.vel.x = (e.vel.x + f.x * invMass * h) * dampFactor;
      e.vel.y = (e.vel.y + f.y * invMass * h) * dampFactor;

      e.pos.x += e.vel.x * h;
      e.pos.y += e.vel.y * h;
    }

    // 4. Resolve world boundary collisions.
    this.resolveBounds();
  }

  private resolveBounds(): void {
    const { bounds, restitution } = this.world.params;
    for (const e of this.world.entities.values()) {
      if (e.fixed) continue;
      const r = e.radius;
      if (e.pos.x - r < 0) { e.pos.x = r; e.vel.x = -e.vel.x * restitution; }
      else if (e.pos.x + r > bounds.w) { e.pos.x = bounds.w - r; e.vel.x = -e.vel.x * restitution; }
      if (e.pos.y - r < 0) { e.pos.y = r; e.vel.y = -e.vel.y * restitution; }
      else if (e.pos.y + r > bounds.h) { e.pos.y = bounds.h - r; e.vel.y = -e.vel.y * restitution; }
    }
  }

  reset(): void {
    this.accumulator = 0;
    this.sync();
  }

  dispose(): void {
    this.forces.clear();
  }
}
