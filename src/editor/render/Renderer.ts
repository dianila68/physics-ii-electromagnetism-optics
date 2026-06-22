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

  // Toggle the electric-field vector overlay (EM scale visualization).
  setFieldOverlay(visible: boolean): void;

  // Optionally tell the renderer which entity is selected, so it can add a
  // selection cue (e.g. a faint velocity vector). Renderers that don't draw
  // a cue may omit this; the editor calls it only if present.
  setSelected?(id: string | null): void;

  dispose(): void;
}
