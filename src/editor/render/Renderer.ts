import type { World } from '../core/world.js';
import type { Vec2 } from '../core/vec2.js';

// Rendering backend abstraction.
//
// Phase 1 ships Canvas2DRenderer. The interface is deliberately viewport-
// agnostic (coordinate conversion is part of the contract) so a Three.js
// 3D renderer can be added later and selected at runtime, mirroring the
// PhysicsEngine seam.
export interface Renderer {
  readonly name: string;
  readonly canvas: HTMLCanvasElement;

  mount(container: HTMLElement): void;
  resize(): void;
  render(world: World): void;

  // Coordinate conversion between screen pixels and world units, needed by
  // the editor for picking, placing, and dragging entities.
  screenToWorld(px: number, py: number): Vec2;
  worldToScreen(p: Vec2): { x: number; y: number };

  dispose(): void;
}
