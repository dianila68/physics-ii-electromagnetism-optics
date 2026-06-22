import { World } from '../core/world.js';
import type { Entity, Link, SceneData } from '../core/types.js';
import type { PhysicsEngine } from '../engine/PhysicsEngine.js';
import { CpuEngine } from '../engine/cpu/CpuEngine.js';
import { GpuEngine } from '../engine/gpu/GpuEngine.js';
import type { Renderer } from '../render/Renderer.js';
import { Canvas2DRenderer } from '../render/Canvas2DRenderer.js';
import { ThreeRenderer } from '../render/ThreeRenderer.js';
import { Palette, type Tool } from './Palette.js';
import { Timeline } from './Timeline.js';
import { Inspector, type Selection } from './Inspector.js';
import { downloadScene, parseScene } from '../core/serialize.js';
import { PRESETS, defaultScene } from '../presets.js';
import { t } from '../../utils/lang.js';
import { makeTabs, makeSwitch } from '../../ui/components.js';
import type { EmergenceBoundary } from '../core/types.js';
import { runEmergence } from '../engine/Emergence.js';

// Top-level controller for the physics Lab. Owns the World, the active
// PhysicsEngine and Renderer (both swappable via their interfaces), the
// tool/selection state, the pointer interaction model, and the rAF loop.
export class EditorApp {
  private world = new World();
  private engine: PhysicsEngine = new CpuEngine();
  private renderer: Renderer = new Canvas2DRenderer();

  private palette: Palette;
  private timeline: Timeline;
  private inspector: Inspector;
  private statusBar!: HTMLElement;

  private tool: Tool = 'select';
  private selection: Selection = null;
  private running = false;
  private speed = 1;

  private rafId = 0;
  private lastTime = 0;

  // Interaction state.
  private draggingId: string | null = null;
  private springStartId: string | null = null;
  // Cycles the three QCD "color charges" so a placed triplet reads as a
  // (color-neutral) baryon — illustrative only.
  private quarkColorIndex = 0;

  // Snapshot to restore on Reset.
  private resetSnapshot: SceneData;

  // View state shared across renderer swaps.
  private viewportEl!: HTMLElement;
  private fieldOn = false;
  private engineTabsHost!: HTMLElement;
  private viewTabsHost!: HTMLElement;
  private boundaryHost!: HTMLElement;
  private emergeBtn!: HTMLButtonElement;

  // Stable pointer-handler refs so listeners can be moved when the
  // renderer (and thus its canvas) is swapped.
  private pdHandler = (e: PointerEvent) => this.onPointerDown(e);
  private pmHandler = (e: PointerEvent) => this.onPointerMove(e);
  private puHandler = () => this.onPointerUp();

  private resizeObserver?: ResizeObserver;
  private boundOnResize = () => this.renderer.resize();
  private root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.palette = new Palette(tool => this.setTool(tool), this.tool);
    this.timeline = new Timeline({
      onPlayPause: playing => this.setRunning(playing),
      onStep: () => this.singleStep(),
      onReset: () => this.reset(),
      onSpeed: m => (this.speed = m),
    });
    this.inspector = new Inspector(this.world, () => this.requestRender());

    // Open with a demo so the page is alive immediately.
    this.world.loadScene(defaultScene());
    this.resetSnapshot = this.world.toScene();

    this.engine.init(this.world);
    this.buildLayout();
    this.inspector.show(null);
    this.updateStatus();
  }

  // ---- layout ----

  private buildLayout(): void {
    this.root.innerHTML = '';
    this.root.classList.add('editor-root');

    const topbar = document.createElement('div');
    topbar.className = 'editor-topbar';
    const leftControls = document.createElement('div');
    leftControls.className = 'editor-topbar-group';
    leftControls.append(this.buildPresetSelect(), this.buildEngineSelect(), this.buildViewSelect(), this.buildEmergenceControl());
    topbar.append(leftControls, this.buildFileControls());

    const body = document.createElement('div');
    body.className = 'editor-body';

    const left = document.createElement('div');
    left.className = 'editor-sidebar editor-sidebar-left';
    left.append(this.palette.element, this.timeline.element);

    const viewport = document.createElement('div');
    viewport.className = 'editor-viewport';
    this.viewportEl = viewport;

    const right = document.createElement('div');
    right.className = 'editor-sidebar editor-sidebar-right';
    right.appendChild(this.inspector.element);

    body.append(left, viewport, right);

    this.statusBar = document.createElement('div');
    this.statusBar.className = 'editor-status';

    this.root.append(topbar, body, this.statusBar);

    this.renderer.mount(viewport);
    this.bindPointer(this.renderer.canvas);
    window.addEventListener('pointerup', this.puHandler);

    this.resizeObserver = new ResizeObserver(() => {
      this.renderer.resize();
      this.requestRender();
    });
    this.resizeObserver.observe(viewport);
    window.addEventListener('resize', this.boundOnResize);

    this.startLoop();
  }

  private buildPresetSelect(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'editor-control';
    const label = document.createElement('span');
    label.className = 'eyebrow';
    label.textContent = t('Scene', 'Scena');
    const select = document.createElement('select');
    select.className = 'editor-select';
    for (const p of PRESETS) {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = t(p.nameEn, p.nameIt);
      select.appendChild(opt);
    }
    select.addEventListener('change', () => {
      const preset = PRESETS.find(p => p.id === select.value);
      if (preset) this.loadScene(preset.build());
    });
    wrap.append(label, select);
    return wrap;
  }

  // Engine selector — the user-facing proof of the pluggable backend.
  private buildEngineSelect(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'editor-control';
    const label = document.createElement('span');
    label.className = 'eyebrow';
    label.textContent = t('Engine', 'Motore');
    this.engineTabsHost = document.createElement('div');
    wrap.append(label, this.engineTabsHost);
    this.renderEngineTabs('cpu');
    return wrap;
  }

  private renderEngineTabs(active: 'cpu' | 'gpu'): void {
    const gpuOk = GpuEngine.isSupported();
    this.engineTabsHost.innerHTML = '';
    this.engineTabsHost.appendChild(makeTabs({
      items: [
        { label: 'CPU', value: 'cpu' },
        { label: gpuOk ? 'GPU' : t('GPU (n/a)', 'GPU (n/d)'), value: 'gpu' },
      ],
      active,
      accent: 'blue',
      onChange: v => {
        if (v === 'gpu' && !gpuOk) { this.renderEngineTabs('cpu'); return; }
        void this.switchEngine(v as 'cpu' | 'gpu');
      },
    }));
  }

  private async switchEngine(kind: 'cpu' | 'gpu'): Promise<void> {
    const wasRunning = this.running;
    this.setRunning(false);
    try {
      const next = kind === 'gpu' ? await GpuEngine.create(this.world) : (() => {
        const e = new CpuEngine();
        e.init(this.world);
        return e;
      })();
      this.engine.dispose();
      this.engine = next;
      this.updateStatus();
      this.requestRender();
    } catch (err) {
      alert(t('Could not start GPU engine: ', 'Impossibile avviare il motore GPU: ') + (err as Error).message);
      this.renderEngineTabs('cpu'); // revert the tabs
    }
    if (wasRunning) this.setRunning(true);
  }

  // Viewport selector — 2D canvas or 3D Three.js, same Renderer interface.
  private buildViewSelect(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'editor-control';
    const label = document.createElement('span');
    label.className = 'eyebrow';
    label.textContent = t('View', 'Vista');
    this.viewTabsHost = document.createElement('div');
    wrap.append(label, this.viewTabsHost);
    this.renderViewTabs('2d');
    return wrap;
  }

  private renderViewTabs(active: '2d' | '3d'): void {
    this.viewTabsHost.innerHTML = '';
    this.viewTabsHost.appendChild(makeTabs({
      items: [{ label: '2D', value: '2d' }, { label: '3D', value: '3d' }],
      active,
      accent: 'blue',
      onChange: v => this.switchRenderer(v as '2d' | '3d'),
    }));
  }

  private switchRenderer(kind: '2d' | '3d'): void {
    let next: Renderer;
    try {
      next = kind === '3d' ? new ThreeRenderer() : new Canvas2DRenderer();
    } catch (err) {
      alert(t('Could not start 3D view: ', 'Impossibile avviare la vista 3D: ') + (err as Error).message);
      this.renderViewTabs('2d');
      return;
    }
    this.unbindPointer(this.renderer.canvas);
    this.renderer.dispose();
    this.renderer = next;
    this.renderer.mount(this.viewportEl);
    this.renderer.setFieldOverlay(this.fieldOn);
    this.bindPointer(this.renderer.canvas);
    this.renderer.resize();
    this.renderer.render(this.world);
  }

  // Emergence boundary selector — the "facing the decision" surface. The
  // user picks the ONE adjacent layer pair across which bound clusters are
  // promoted into composites. Because it is a single selector (None / one
  // adjacent pair / the other), the one-level rule is enforced in the UI:
  // there is no way to activate two boundaries at once or a skip-level pair.
  private buildEmergenceControl(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'editor-control';
    const label = document.createElement('span');
    label.className = 'eyebrow';
    label.textContent = t('Emergence boundary', 'Confine di emergenza');

    this.boundaryHost = document.createElement('div');

    this.emergeBtn = document.createElement('button');
    this.emergeBtn.type = 'button';
    this.emergeBtn.className = 'btn btn-secondary btn-sm';
    this.emergeBtn.textContent = t('Emerge ▲', 'Emergi ▲');
    this.emergeBtn.title = t(
      'Aggregate bound clusters into composites at the next layer up.',
      'Aggrega i cluster legati in compositi al livello superiore.',
    );
    this.emergeBtn.addEventListener('click', () => this.doEmerge());

    const row = document.createElement('div');
    row.className = 'editor-topbar-group';
    row.append(this.boundaryHost, this.emergeBtn);
    wrap.append(label, row);
    this.renderBoundaryTabs();
    return wrap;
  }

  private renderBoundaryTabs(): void {
    const active = this.world.params.activeBoundary ?? 'none';
    this.boundaryHost.innerHTML = '';
    this.boundaryHost.appendChild(makeTabs({
      items: [
        { label: t('None', 'Nessuno'), value: 'none' },
        { label: t('sub→atom', 'sub→atom'), value: 'subatomic-atomic' },
        { label: t('atom→mol', 'atom→mol'), value: 'atomic-molecular' },
      ],
      active,
      accent: 'blue',
      onChange: v => {
        // Single value -> only one adjacent boundary can ever be active.
        this.world.params.activeBoundary = v === 'none' ? null : (v as EmergenceBoundary);
        if (this.emergeBtn) this.emergeBtn.disabled = v === 'none';
        this.updateStatus();
      },
    }));
    if (this.emergeBtn) this.emergeBtn.disabled = active === 'none';
  }

  // Trigger one aggregation pass across the active boundary.
  private doEmerge(): void {
    const result = runEmergence(this.world);
    this.engine.sync();
    this.select(null);
    this.updateStatus();
    this.requestRender();
    if (result.composedCount === 0) {
      this.statusBar.textContent = t(
        'No bound cluster ready to emerge — let constituents settle, or widen the bind radius.',
        'Nessun cluster legato pronto a emergere — lascia assestare i costituenti o allarga il raggio di legame.',
      );
    }
  }

  private buildFileControls(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'editor-file';

    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'btn btn-secondary btn-sm';
    save.textContent = t('Save', 'Salva');
    save.addEventListener('click', () => downloadScene(this.world.toScene()));

    const load = document.createElement('button');
    load.type = 'button';
    load.className = 'btn btn-secondary btn-sm';
    load.textContent = t('Load', 'Carica');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json,.json';
    fileInput.style.display = 'none';
    load.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      try {
        this.loadScene(parseScene(await file.text()));
      } catch (err) {
        alert(t('Could not load scene: ', 'Impossibile caricare la scena: ') + (err as Error).message);
      }
      fileInput.value = '';
    });

    const field = makeSwitch({
      label: t('Field', 'Campo'),
      checked: this.fieldOn,
      onChange: on => {
        this.fieldOn = on;
        this.renderer.setFieldOverlay(on);
        this.requestRender();
      },
    });

    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'btn btn-secondary btn-sm';
    clear.textContent = t('Clear', 'Svuota');
    clear.addEventListener('click', () => {
      this.world.clear();
      this.resetSnapshot = this.world.toScene();
      this.engine.sync();
      this.select(null);
      this.updateStatus();
      this.requestRender();
    });

    wrap.append(field, save, load, clear, fileInput);
    return wrap;
  }

  // ---- scene management ----

  private loadScene(scene: SceneData): void {
    this.setRunning(false);
    this.timeline.setPlaying(false);
    this.world.loadScene(scene);
    this.resetSnapshot = this.world.toScene();
    this.engine.reset();
    this.select(null);
    this.renderBoundaryTabs();
    this.updateStatus();
    this.requestRender();
  }

  private reset(): void {
    this.setRunning(false);
    this.world.loadScene(this.resetSnapshot);
    this.engine.reset();
    this.select(null);
    this.renderBoundaryTabs();
    this.updateStatus();
    this.requestRender();
  }

  // ---- tools & selection ----

  private setTool(tool: Tool): void {
    this.tool = tool;
    this.springStartId = null;
    this.palette.setActive(tool);
  }

  private select(sel: Selection): void {
    this.selection = sel;
    this.inspector.show(sel);
  }

  // ---- pointer interaction ----

  private bindPointer(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('pointerdown', this.pdHandler);
    canvas.addEventListener('pointermove', this.pmHandler);
  }

  private unbindPointer(canvas: HTMLCanvasElement): void {
    canvas.removeEventListener('pointerdown', this.pdHandler);
    canvas.removeEventListener('pointermove', this.pmHandler);
  }

  private pointerScreen(e: PointerEvent): { x: number; y: number } {
    const rect = this.renderer.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private onPointerDown(e: PointerEvent): void {
    const s = this.pointerScreen(e);
    const world = this.renderer.screenToWorld(s.x, s.y);

    switch (this.tool) {
      case 'select': {
        const ent = this.hitTestEntity(s.x, s.y);
        if (ent) {
          this.select({ type: 'entity', entity: ent });
          this.draggingId = ent.id;
        } else {
          const link = this.hitTestLink(s.x, s.y);
          this.select(link ? { type: 'link', link } : null);
        }
        break;
      }
      case 'mass':
      case 'anchor': {
        const ent = this.world.addEntity({ kind: this.tool, pos: world });
        this.engine.sync();
        this.select({ type: 'entity', entity: ent });
        this.updateStatus();
        break;
      }
      case 'atom': {
        const ent = this.world.addEntity({ kind: 'atom', pos: world });
        // Make the LJ interaction visible the moment atoms exist.
        if (this.world.params.ljEpsilon <= 0) this.world.params.ljEpsilon = 1;
        this.engine.sync();
        this.select({ type: 'entity', entity: ent });
        this.updateStatus();
        break;
      }
      case 'quark': {
        const colors = ['#e74c3c', '#27ae60', '#3b82f6']; // R / G / B color charge
        const labels = ['r', 'g', 'b'];
        const idx = this.quarkColorIndex % 3;
        this.quarkColorIndex++;
        const ent = this.world.addEntity({
          kind: 'quark',
          pos: world,
          mass: 0.5,
          radius: 0.18,
          color: colors[idx],
          label: labels[idx],
        });
        // Switch on the confining force once quarks exist.
        if (this.world.params.strongTension <= 0) this.world.params.strongTension = 2;
        this.engine.sync();
        this.select({ type: 'entity', entity: ent });
        this.updateStatus();
        break;
      }
      case 'charge-pos':
      case 'charge-neg': {
        const positive = this.tool === 'charge-pos';
        const ent = this.world.addEntity({
          kind: 'mass',
          pos: world,
          charge: positive ? 1 : -1,
          color: positive ? '#e74c3c' : '#2980b9',
          label: positive ? '+' : '−',
        });
        this.engine.sync();
        this.select({ type: 'entity', entity: ent });
        this.updateStatus();
        break;
      }
      case 'spring': {
        const ent = this.hitTestEntity(s.x, s.y);
        if (!ent) { this.springStartId = null; break; }
        if (!this.springStartId) {
          this.springStartId = ent.id;
        } else if (this.springStartId !== ent.id) {
          const a = this.world.entities.get(this.springStartId)!;
          const rest = Math.hypot(a.pos.x - ent.pos.x, a.pos.y - ent.pos.y);
          const link = this.world.addLink({ a: this.springStartId, b: ent.id, rest });
          this.engine.sync();
          this.select({ type: 'link', link });
          this.springStartId = null;
          this.updateStatus();
        }
        break;
      }
      case 'erase': {
        const ent = this.hitTestEntity(s.x, s.y);
        if (ent) {
          this.world.removeEntity(ent.id);
        } else {
          const link = this.hitTestLink(s.x, s.y);
          if (link) this.world.removeLink(link.id);
        }
        this.engine.sync();
        this.select(null);
        this.updateStatus();
        break;
      }
    }
    this.requestRender();
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.draggingId) return;
    const ent = this.world.entities.get(this.draggingId);
    if (!ent) { this.draggingId = null; return; }
    const s = this.pointerScreen(e);
    const world = this.renderer.screenToWorld(s.x, s.y);
    ent.pos.x = world.x;
    ent.pos.y = world.y;
    // Dragging is kinematic: cancel velocity so the body doesn't fling.
    ent.vel.x = 0;
    ent.vel.y = 0;
    this.requestRender();
  }

  private onPointerUp(): void {
    this.draggingId = null;
  }

  // Pick the topmost entity whose screen-space disc contains the point.
  private hitTestEntity(sx: number, sy: number): Entity | null {
    let best: Entity | null = null;
    let bestD = Infinity;
    for (const e of this.world.entities.values()) {
      const p = this.renderer.worldToScreen(e.pos);
      const edge = this.renderer.worldToScreen({ x: e.pos.x + e.radius, y: e.pos.y });
      const rPx = Math.max(12, Math.abs(edge.x - p.x));
      const d = Math.hypot(sx - p.x, sy - p.y);
      if (d <= rPx && d < bestD) { best = e; bestD = d; }
    }
    return best;
  }

  // Pick a link whose drawn segment passes near the point.
  private hitTestLink(sx: number, sy: number): Link | null {
    const threshold = 8;
    for (const l of this.world.links.values()) {
      const a = this.world.entities.get(l.a);
      const b = this.world.entities.get(l.b);
      if (!a || !b) continue;
      const pa = this.renderer.worldToScreen(a.pos);
      const pb = this.renderer.worldToScreen(b.pos);
      if (pointSegmentDistance(sx, sy, pa.x, pa.y, pb.x, pb.y) <= threshold) return l;
    }
    return null;
  }

  // ---- simulation loop ----

  private setRunning(running: boolean): void {
    this.running = running;
    this.timeline.setPlaying(running);
    this.lastTime = performance.now();
    this.updateStatus();
  }

  private singleStep(): void {
    this.engine.step((1 / 60) * this.speed);
    this.refreshInspectorReadout();
    this.updateStatus();
    this.requestRender();
  }

  private startLoop(): void {
    const tick = (now: number) => {
      this.rafId = requestAnimationFrame(tick);
      if (this.running && !this.draggingId) {
        const dt = Math.min(0.05, (now - this.lastTime) / 1000);
        this.lastTime = now;
        this.engine.step(dt * this.speed);
        this.refreshInspectorReadout();
      } else {
        this.lastTime = now;
      }
      this.renderer.render(this.world);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  // Cheap live readout: refresh only the inspector's position note while
  // an entity is selected and the sim is running.
  private refreshInspectorReadout(): void {
    if (this.running && this.selection?.type === 'entity') {
      this.inspector.show(this.selection);
    }
  }

  private requestRender(): void {
    if (!this.running) this.renderer.render(this.world);
  }

  private updateStatus(): void {
    const n = this.world.entities.size;
    const s = this.world.links.size;
    const state = this.running ? t('running', 'in esecuzione') : t('paused', 'in pausa');
    this.statusBar.textContent = `${this.engine.name} · ${n} ${t('bodies', 'corpi')} · ${s} ${t('springs', 'molle')} · ${state}`;
  }

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.boundOnResize);
    window.removeEventListener('pointerup', this.puHandler);
    this.engine.dispose();
    this.renderer.dispose();
  }
}

// Distance from point (px,py) to segment (ax,ay)-(bx,by), in screen px.
function pointSegmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-9) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
