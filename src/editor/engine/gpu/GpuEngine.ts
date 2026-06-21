import type { PhysicsEngine } from '../PhysicsEngine.js';
import type { World } from '../../core/world.js';

// Placeholder for the future GPU-accelerated backend (Phase 5).
//
// It implements the PhysicsEngine interface so the editor can already
// reference it, but the actual WebGPU compute pipeline is not built yet.
// `isSupported()` lets the UI detect availability and fall back to the
// CpuEngine; constructing/using it before then throws clearly rather
// than silently doing nothing.
//
// Intended design when implemented:
//   - Upload entity state (pos, vel, mass, charge) into GPUBuffers.
//   - Run force accumulation + integration as WGSL compute shaders, with
//     one workgroup invocation per body and spatial hashing for N-body
//     interactions (Coulomb / Lennard-Jones at the smaller scales).
//   - Read back only what the renderer needs, or render directly from the
//     same buffers to avoid CPU round-trips.
export class GpuEngine implements PhysicsEngine {
  readonly name = 'GPU (WebGPU) — not yet implemented';
  readonly accelerated = true;

  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'gpu' in navigator;
  }

  init(_world: World): void {
    throw new Error('GpuEngine is not implemented yet (planned for Phase 5). Use CpuEngine.');
  }

  step(_dt: number): void {
    throw new Error('GpuEngine is not implemented yet.');
  }

  sync(): void {}
  reset(): void {}
  dispose(): void {}
}
