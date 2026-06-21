import type { PhysicsEngine } from '../PhysicsEngine.js';
import type { World } from '../../core/world.js';

// GPU-accelerated backend (Phase 5).
//
// Implements the same PhysicsEngine interface as CpuEngine, so the editor
// can switch to it at runtime with no other changes. All per-particle and
// pairwise forces (gravity, Coulomb, Lennard-Jones, strong, Lorentz) plus
// wall collisions and integration run in a WGSL compute shader over
// ping-pong storage buffers. Spring/link forces (variable connectivity)
// are evaluated on the CPU each step and uploaded as a per-particle
// external force, keeping the GPU kernel uniform.
//
// Device acquisition is async, so construct via `GpuEngine.create(world)`.
// Position/velocity readback is async too: `step` is fire-and-forget and
// the World is updated when the copy resolves (≈one frame of latency),
// which the Canvas2D renderer tolerates fine.

const WORKGROUP = 64;
const FIXED_DT = 1 / 240;
const MAX_SUBSTEPS = 8;

const SHADER = /* wgsl */ `
struct Params {
  gravity: vec2<f32>,
  efield: vec2<f32>,
  bounds: vec2<f32>,
  linearDamping: f32,
  restitution: f32,
  coulombK: f32,
  bfield: f32,
  ljEpsilon: f32,
  ljSigma: f32,
  strongTension: f32,
  strongCore: f32,
  h: f32,
  n: f32,
};

@group(0) @binding(0) var<uniform> P: Params;
@group(0) @binding(1) var<storage, read>        posIn:  array<vec2<f32>>;
@group(0) @binding(2) var<storage, read>        velIn:  array<vec2<f32>>;
@group(0) @binding(3) var<storage, read>        attr:   array<vec4<f32>>; // mass, charge, radius, packed(kind+8*fixed)
@group(0) @binding(4) var<storage, read>        extF:   array<vec2<f32>>; // spring force (CPU prepass)
@group(0) @binding(5) var<storage, read_write>  posOut: array<vec2<f32>>;
@group(0) @binding(6) var<storage, read_write>  velOut: array<vec2<f32>>;

@compute @workgroup_size(${WORKGROUP})
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  let n = u32(P.n);
  if (i >= n) { return; }

  let ai = attr[i];
  let mass = ai.x;
  let charge_i = ai.y;
  let packed_i = ai.w;
  let fixed_i = packed_i > 7.5;
  let kind_i = packed_i - select(0.0, 8.0, fixed_i);

  let pi = posIn[i];
  let vi = velIn[i];

  if (fixed_i) {
    posOut[i] = pi;
    velOut[i] = vec2<f32>(0.0, 0.0);
    return;
  }

  var force = P.gravity * mass + extF[i];

  // Lorentz: q(E + v x B), B out of plane (+z).
  if (charge_i != 0.0) {
    force += charge_i * (P.efield + vec2<f32>(vi.y * P.bfield, -vi.x * P.bfield));
  }

  // Pairwise interactions.
  for (var j: u32 = 0u; j < n; j = j + 1u) {
    if (j == i) { continue; }
    let aj = attr[j];
    let dj = posIn[j] - pi;          // vector from i to j
    let d2 = dot(dj, dj);
    let charge_j = aj.y;
    let packed_j = aj.w;
    let fixed_j = packed_j > 7.5;
    let kind_j = packed_j - select(0.0, 8.0, fixed_j);

    // Coulomb (softened): attractive toward j when product negative.
    if (P.coulombK != 0.0 && charge_i != 0.0 && charge_j != 0.0) {
      let soft = ai.z + aj.z;
      let r2 = d2 + soft * soft;
      let r = sqrt(r2);
      let mag = (P.coulombK * charge_i * charge_j) / r2;
      force += -(dj / r) * mag; // repulsive for like signs (push i away from j)
    }

    // Lennard-Jones between atoms (kind == 1).
    if (P.ljEpsilon > 0.0 && kind_i == 1.0 && kind_j == 1.0) {
      let sigma = P.ljSigma;
      let cutoff = 2.5 * sigma;
      if (d2 <= cutoff * cutoff) {
        var r = sqrt(d2);
        let minR = 0.8 * sigma;
        if (r < minR) { r = minR; }
        let sr = sigma / r;
        let sr6 = pow(sr, 6.0);
        let sr12 = sr6 * sr6;
        var fMag = (24.0 * P.ljEpsilon / r) * (2.0 * sr12 - sr6);
        let maxF = 200.0 * P.ljEpsilon;
        fMag = clamp(fMag, -maxF, maxF);
        force += -(dj / r) * fMag; // +fMag repels i from j
      }
    }

    // Toy strong force between quarks (kind == 2).
    if ((P.strongTension > 0.0 || P.strongCore > 0.0) && kind_i == 2.0 && kind_j == 2.0) {
      var r = sqrt(d2);
      if (r < 0.2) { r = 0.2; }
      var fMag = P.strongCore / (r * r) - P.strongTension;
      fMag = clamp(fMag, -500.0, 500.0);
      force += -(dj / r) * fMag;
    }
  }

  // Semi-implicit Euler with linear damping.
  let damp = max(0.0, 1.0 - P.linearDamping * P.h);
  var v = (vi + force / mass * P.h) * damp;
  var p = pi + v * P.h;

  // Wall collisions.
  let rad = ai.z;
  if (p.x - rad < 0.0)            { p.x = rad;              v.x = -v.x * P.restitution; }
  else if (p.x + rad > P.bounds.x){ p.x = P.bounds.x - rad; v.x = -v.x * P.restitution; }
  if (p.y - rad < 0.0)            { p.y = rad;              v.y = -v.y * P.restitution; }
  else if (p.y + rad > P.bounds.y){ p.y = P.bounds.y - rad; v.y = -v.y * P.restitution; }

  posOut[i] = p;
  velOut[i] = v;
}
`;

export class GpuEngine implements PhysicsEngine {
  readonly name = 'GPU (WebGPU compute)';
  readonly accelerated = true;

  private device: GPUDevice;
  private pipeline: GPUComputePipeline;
  private world!: World;

  private ids: string[] = [];
  private n = 0;
  private copyBytes = 0;
  private revision = -1;

  private posA!: GPUBuffer; private posB!: GPUBuffer;
  private velA!: GPUBuffer; private velB!: GPUBuffer;
  private attrBuf!: GPUBuffer;
  private extBuf!: GPUBuffer;
  private paramBuf!: GPUBuffer;
  private bindAtoB!: GPUBindGroup; // in=A, out=B
  private bindBtoA!: GPUBindGroup; // in=B, out=A
  private stagingPos!: GPUBuffer;
  private stagingVel!: GPUBuffer;

  private extScratch = new Float32Array(0);
  private readBusy = false;

  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'gpu' in navigator;
  }

  private constructor(device: GPUDevice, pipeline: GPUComputePipeline) {
    this.device = device;
    this.pipeline = pipeline;
  }

  // Async factory: acquires the device, compiles the shader, binds to world.
  static async create(world: World): Promise<GpuEngine> {
    if (!GpuEngine.isSupported()) throw new Error('WebGPU not available in this browser.');
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('No WebGPU adapter found.');
    const device = await adapter.requestDevice();
    const module = device.createShaderModule({ code: SHADER });
    const pipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module, entryPoint: 'main' },
    });
    const engine = new GpuEngine(device, pipeline);
    engine.init(world);
    return engine;
  }

  init(world: World): void {
    this.world = world;
    this.paramBuf = this.device.createBuffer({
      size: 64,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.sync();
  }

  // (Re)build all per-particle buffers from the current world membership.
  sync(): void {
    this.revision = this.world.structureRevision;
    const entities = [...this.world.entities.values()];
    this.ids = entities.map(e => e.id);
    this.n = entities.length;
    this.copyBytes = this.n * 2 * 4;
    this.destroyParticleBuffers();
    if (this.n === 0) return;

    const pos = new Float32Array(this.n * 2);
    const vel = new Float32Array(this.n * 2);
    const attr = new Float32Array(this.n * 4);
    for (let i = 0; i < this.n; i++) {
      const e = entities[i];
      pos[i * 2] = e.pos.x; pos[i * 2 + 1] = e.pos.y;
      vel[i * 2] = e.vel.x; vel[i * 2 + 1] = e.vel.y;
      const kind = e.kind === 'atom' ? 1 : e.kind === 'quark' ? 2 : 0;
      const packed = kind + (e.fixed ? 8 : 0);
      attr[i * 4] = e.mass;
      attr[i * 4 + 1] = e.charge;
      attr[i * 4 + 2] = e.radius;
      attr[i * 4 + 3] = packed;
    }
    this.extScratch = new Float32Array(this.n * 2);

    const storage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;
    this.posA = this.makeBuffer(pos, storage);
    this.posB = this.makeBuffer(new Float32Array(this.n * 2), storage);
    this.velA = this.makeBuffer(vel, storage);
    this.velB = this.makeBuffer(new Float32Array(this.n * 2), storage);
    this.attrBuf = this.makeBuffer(attr, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST);
    this.extBuf = this.makeBuffer(this.extScratch, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST);
    this.stagingPos = this.device.createBuffer({ size: pos.byteLength, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    this.stagingVel = this.device.createBuffer({ size: vel.byteLength, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });

    this.bindAtoB = this.makeBindGroup(this.posA, this.velA, this.posB, this.velB);
    this.bindBtoA = this.makeBindGroup(this.posB, this.velB, this.posA, this.velA);
  }

  private makeBuffer(data: Float32Array, usage: number): GPUBuffer {
    const buf = this.device.createBuffer({ size: Math.max(16, data.byteLength), usage });
    if (data.byteLength > 0) this.device.queue.writeBuffer(buf, 0, data);
    return buf;
  }

  private makeBindGroup(pIn: GPUBuffer, vIn: GPUBuffer, pOut: GPUBuffer, vOut: GPUBuffer): GPUBindGroup {
    return this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.paramBuf } },
        { binding: 1, resource: { buffer: pIn } },
        { binding: 2, resource: { buffer: vIn } },
        { binding: 3, resource: { buffer: this.attrBuf } },
        { binding: 4, resource: { buffer: this.extBuf } },
        { binding: 5, resource: { buffer: pOut } },
        { binding: 6, resource: { buffer: vOut } },
      ],
    });
  }

  step(dt: number): void {
    if (this.revision !== this.world.structureRevision) this.sync();
    if (this.n === 0 || this.readBusy) return;

    const clamped = Math.min(dt, FIXED_DT * MAX_SUBSTEPS);
    const substeps = Math.max(1, Math.min(MAX_SUBSTEPS, Math.ceil(clamped / FIXED_DT)));
    const h = clamped / substeps;

    this.uploadParams(h);
    this.uploadSpringForces();

    const encoder = this.device.createCommandEncoder();
    const groups = Math.ceil(this.n / WORKGROUP);
    // Ping-pong: A->B, B->A, ... so the freshly written buffer feeds the
    // next substep. Pass s uses A->B when s is even.
    for (let s = 0; s < substeps; s++) {
      const pass = encoder.beginComputePass();
      pass.setPipeline(this.pipeline);
      pass.setBindGroup(0, s % 2 === 0 ? this.bindAtoB : this.bindBtoA);
      pass.dispatchWorkgroups(groups);
      pass.end();
    }

    // After `substeps` passes the latest data is in B when substeps is odd.
    // Copy it back into A so the next frame can always start from A->B.
    const resultInB = substeps % 2 === 1;
    if (resultInB) {
      encoder.copyBufferToBuffer(this.posB, 0, this.posA, 0, this.copyBytes);
      encoder.copyBufferToBuffer(this.velB, 0, this.velA, 0, this.copyBytes);
    }
    encoder.copyBufferToBuffer(this.posA, 0, this.stagingPos, 0, this.copyBytes);
    encoder.copyBufferToBuffer(this.velA, 0, this.stagingVel, 0, this.copyBytes);
    this.device.queue.submit([encoder.finish()]);

    void this.readbackInto();
  }

  private uploadParams(h: number): void {
    const p = this.world.params;
    const a = new Float32Array(16);
    a[0] = p.gravity.x; a[1] = p.gravity.y;
    a[2] = p.efield.x; a[3] = p.efield.y;
    a[4] = p.bounds.w; a[5] = p.bounds.h;
    a[6] = p.linearDamping; a[7] = p.restitution;
    a[8] = p.coulombK; a[9] = p.bfield;
    a[10] = p.ljEpsilon; a[11] = p.ljSigma;
    a[12] = p.strongTension; a[13] = p.strongCore;
    a[14] = h; a[15] = this.n;
    this.device.queue.writeBuffer(this.paramBuf, 0, a);
  }

  // CPU pre-pass: spring/link forces accumulated per particle, then uploaded.
  private uploadSpringForces(): void {
    const ext = this.extScratch;
    ext.fill(0);
    const index = new Map<string, number>();
    this.ids.forEach((id, i) => index.set(id, i));

    for (const l of this.world.links.values()) {
      if (l.kind !== 'spring') continue;
      const ia = index.get(l.a); const ib = index.get(l.b);
      if (ia === undefined || ib === undefined) continue;
      const a = this.world.entities.get(l.a)!;
      const b = this.world.entities.get(l.b)!;
      const dx = b.pos.x - a.pos.x;
      const dy = b.pos.y - a.pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 1e-9) continue;
      const ux = dx / dist, uy = dy / dist;
      const stretch = dist - l.rest;
      const relV = (b.vel.x - a.vel.x) * ux + (b.vel.y - a.vel.y) * uy;
      const fMag = l.stiffness * stretch + l.damping * relV;
      const fx = ux * fMag, fy = uy * fMag;
      ext[ia * 2] += fx; ext[ia * 2 + 1] += fy;
      ext[ib * 2] -= fx; ext[ib * 2 + 1] -= fy;
    }
    this.device.queue.writeBuffer(this.extBuf, 0, ext);
  }

  // Map the result buffers and write positions/velocities back to the world.
  private async readbackInto(): Promise<void> {
    this.readBusy = true;
    const expected = this.n;
    try {
      await Promise.all([
        this.stagingPos.mapAsync(GPUMapMode.READ),
        this.stagingVel.mapAsync(GPUMapMode.READ),
      ]);
      const pos = new Float32Array(this.stagingPos.getMappedRange().slice(0));
      const vel = new Float32Array(this.stagingVel.getMappedRange().slice(0));
      this.stagingPos.unmap();
      this.stagingVel.unmap();
      // Guard against a sync() having changed membership mid-flight.
      if (expected === this.n && pos.length === this.n * 2) {
        for (let i = 0; i < this.n; i++) {
          const e = this.world.entities.get(this.ids[i]);
          if (!e) continue;
          e.pos.x = pos[i * 2]; e.pos.y = pos[i * 2 + 1];
          e.vel.x = vel[i * 2]; e.vel.y = vel[i * 2 + 1];
        }
      }
    } finally {
      this.readBusy = false;
    }
  }

  reset(): void {
    this.readBusy = false;
    this.sync();
  }

  private destroyParticleBuffers(): void {
    [this.posA, this.posB, this.velA, this.velB, this.attrBuf, this.extBuf, this.stagingPos, this.stagingVel]
      .forEach(b => b?.destroy());
  }

  dispose(): void {
    this.destroyParticleBuffers();
    this.paramBuf?.destroy();
    this.device?.destroy();
  }
}
