import * as THREE from 'three';
import type { Renderer } from './Renderer.js';
import type { World } from '../core/world.js';
import type { Vec2 } from '../core/vec2.js';

// 3D viewport built on Three.js, implementing the same Renderer interface
// as Canvas2DRenderer so the editor can switch between them at runtime.
//
// World (x, y) maps to 3D (x, -y, 0): the simulation lives on the z=0
// plane and world-y points downward on screen, matching the 2D view and
// gravity. Picking is exact regardless of camera pose because
// screenToWorld raycasts against that plane; worldToScreen projects
// through the camera. The camera is given a slight tilt so spheres read
// as 3D, while interaction stays plane-accurate.
export class ThreeRenderer implements Renderer {
  readonly name = '3D (Three.js)';
  readonly canvas: HTMLCanvasElement;

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private raycaster = new THREE.Raycaster();
  private plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  private sphereGeo = new THREE.SphereGeometry(1, 20, 16);
  private boxGeo = new THREE.BoxGeometry(1, 1, 1);
  private meshes = new Map<string, THREE.Mesh>();
  private lines = new Map<string, THREE.Line>();
  private grid?: THREE.GridHelper;

  private cssW = 640;
  private cssH = 480;
  private worldW = 12;
  private worldH = 8;
  private builtRevision = -1;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'editor-canvas';
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);

    this.camera = new THREE.PerspectiveCamera(50, this.cssW / this.cssH, 0.1, 1000);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(0, -5, 12);
    this.scene.add(dir);
  }

  mount(container: HTMLElement): void {
    container.appendChild(this.canvas);
    this.resize();
  }

  resize(): void {
    const rect = this.canvas.parentElement!.getBoundingClientRect();
    this.cssW = Math.max(320, rect.width);
    this.cssH = Math.max(320, rect.height || 480);
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.setSize(this.cssW, this.cssH, false);
    this.canvas.style.width = `${this.cssW}px`;
    this.canvas.style.height = `${this.cssH}px`;
    this.camera.aspect = this.cssW / this.cssH;
    this.positionCamera();
  }

  private positionCamera(): void {
    const cx = this.worldW / 2;
    const cy = -this.worldH / 2;
    const span = Math.max(this.worldW, this.worldH);
    const dist = (span / 2) / Math.tan((this.camera.fov * Math.PI) / 180 / 2) * 1.25;
    // Slight downward tilt (offset in -y, lifted in z) for a 3D feel.
    this.camera.position.set(cx, cy - this.worldH * 0.18, dist);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(cx, cy, 0);
    this.camera.updateProjectionMatrix();
  }

  private rebuildGrid(): void {
    if (this.grid) { this.scene.remove(this.grid); this.grid.geometry.dispose(); }
    const span = Math.max(this.worldW, this.worldH);
    const grid = new THREE.GridHelper(span, span, 0x94a3b8, 0x94a3b8);
    (grid.material as THREE.Material).opacity = 0.18;
    (grid.material as THREE.Material).transparent = true;
    grid.rotation.x = Math.PI / 2; // bring grid into the z=0 (XY) plane
    grid.position.set(this.worldW / 2, -this.worldH / 2, 0);
    this.scene.add(grid);
    this.grid = grid;
  }

  // The field overlay is a 2D-only aid; 3D ignores it (interface no-op).
  setFieldOverlay(_visible: boolean): void {}

  worldToScreen(p: Vec2): { x: number; y: number } {
    const v = new THREE.Vector3(p.x, -p.y, 0).project(this.camera);
    return {
      x: (v.x * 0.5 + 0.5) * this.cssW,
      y: (-v.y * 0.5 + 0.5) * this.cssH,
    };
  }

  screenToWorld(px: number, py: number): Vec2 {
    const ndc = new THREE.Vector2((px / this.cssW) * 2 - 1, -((py / this.cssH) * 2 - 1));
    this.raycaster.setFromCamera(ndc, this.camera);
    const hit = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.plane, hit);
    return { x: hit.x, y: -hit.y };
  }

  render(world: World): void {
    if (world.params.bounds.w !== this.worldW || world.params.bounds.h !== this.worldH) {
      this.worldW = world.params.bounds.w;
      this.worldH = world.params.bounds.h;
      this.positionCamera();
      this.builtRevision = -1; // force grid + mesh rebuild
    }
    if (this.builtRevision !== world.structureRevision) {
      this.rebuildGrid();
      this.syncMeshes(world);
      this.builtRevision = world.structureRevision;
    }
    this.updateTransforms(world);
    this.renderer.render(this.scene, this.camera);
  }

  // Create/remove meshes and lines to match world membership.
  private syncMeshes(world: World): void {
    for (const [id, mesh] of this.meshes) {
      if (!world.entities.has(id)) {
        this.scene.remove(mesh);
        (mesh.material as THREE.Material).dispose();
        this.meshes.delete(id);
      }
    }
    for (const e of world.entities.values()) {
      if (this.meshes.has(e.id)) continue;
      const isCloud = e.render === 'cloud';
      // Anchors are boxes; everything else (including clouds) is a sphere.
      const geo = (!isCloud && e.kind === 'anchor') ? this.boxGeo : this.sphereGeo;
      const mat = isCloud
        // Probability cloud: translucent, self-lit, no depth write so it
        // reads as a diffuse glow rather than a glassy ball.
        ? new THREE.MeshStandardMaterial({
            color: new THREE.Color(e.color),
            emissive: new THREE.Color(e.color),
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.22,
            depthWrite: false,
            roughness: 1,
            metalness: 0,
          })
        : new THREE.MeshStandardMaterial({ color: new THREE.Color(e.color), roughness: 0.45, metalness: 0.1 });
      const mesh = new THREE.Mesh(geo, mat);
      if (isCloud) mesh.renderOrder = 2; // blend over solids
      this.scene.add(mesh);
      this.meshes.set(e.id, mesh);
    }

    for (const [id, line] of this.lines) {
      if (!world.links.has(id)) {
        this.scene.remove(line);
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
        this.lines.delete(id);
      }
    }
    for (const l of world.links.values()) {
      if (this.lines.has(l.id)) continue;
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const mat = new THREE.LineBasicMaterial({ color: 0x64748b });
      const line = new THREE.Line(geo, mat);
      this.scene.add(line);
      this.lines.set(l.id, line);
    }
  }

  private updateTransforms(world: World): void {
    for (const e of world.entities.values()) {
      const mesh = this.meshes.get(e.id);
      if (!mesh) continue;
      mesh.position.set(e.pos.x, -e.pos.y, 0);
      const s = e.render === 'cloud'
        ? e.radius * 1.7              // clouds extend beyond their nominal radius
        : e.kind === 'anchor'
          ? e.radius * 2             // box anchors
          : e.radius;                // solid spheres
      mesh.scale.set(s, s, s);
      (mesh.material as THREE.MeshStandardMaterial).color.set(e.color);
    }
    for (const l of world.links.values()) {
      const line = this.lines.get(l.id);
      const a = world.entities.get(l.a);
      const b = world.entities.get(l.b);
      if (!line || !a || !b) continue;
      const pos = line.geometry.getAttribute('position') as THREE.BufferAttribute;
      pos.setXYZ(0, a.pos.x, -a.pos.y, 0);
      pos.setXYZ(1, b.pos.x, -b.pos.y, 0);
      pos.needsUpdate = true;
    }
  }

  dispose(): void {
    for (const m of this.meshes.values()) { this.scene.remove(m); (m.material as THREE.Material).dispose(); }
    for (const l of this.lines.values()) { this.scene.remove(l); l.geometry.dispose(); (l.material as THREE.Material).dispose(); }
    this.meshes.clear();
    this.lines.clear();
    this.sphereGeo.dispose();
    this.boxGeo.dispose();
    this.grid?.geometry.dispose();
    this.renderer.dispose();
    this.canvas.remove();
  }
}
