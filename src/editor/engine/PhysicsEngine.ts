import type { World } from '../core/world.js';

// The pluggable simulation backend.
//
// This is the seam the whole editor is built around. The default
// `CpuEngine` runs the simulation in JS on the main thread. A future
// GPU/WebGPU engine (see ./gpu/GpuEngine.ts) can implement this same
// interface and be swapped in at runtime without the editor UI or the
// renderer changing — they only ever talk to a World and a PhysicsEngine.
//
// Contract:
//   - `init(world)` binds the engine to a World it will read and mutate.
//   - `step(dt)` advances the simulation by `dt` seconds, mutating entity
//     pos/vel in place on the bound World.
//   - `sync()` is called after structural edits (add/remove body or link)
//     so engines that cache state off the main world (e.g. GPU buffers)
//     can rebuild. CPU engines that read the World live may no-op.
//   - `reset()` clears any internal/cached state.
//   - `dispose()` releases any held resources (GPU contexts, workers).
export interface PhysicsEngine {
  readonly name: string;
  readonly accelerated: boolean;

  init(world: World): void;
  step(dt: number): void;
  sync(): void;
  reset(): void;
  dispose(): void;
}
