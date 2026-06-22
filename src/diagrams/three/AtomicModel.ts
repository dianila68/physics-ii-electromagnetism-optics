import * as THREE from 'three';
import { getLang } from '../../utils/lang.js';

interface Particle {
  mesh: THREE.Mesh;
  orbit?: { radius: number; speed: number; phase: number; tilt: THREE.Euler };
  isElectron?: boolean;
}

export function initAtomicModel(container: HTMLElement) {
  const W = container.clientWidth || 600;
  const H = 420;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 200);
  camera.position.set(0, 0, 12);

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);
  const point = new THREE.PointLight(0xffffff, 1.5, 50);
  point.position.set(6, 6, 6);
  scene.add(point);

  const particles: Particle[] = [];
  // Non-particle scene additions (electron clouds, gluon lines) tracked so
  // they can be disposed cleanly on every mode switch.
  const extras: THREE.Object3D[] = [];

  let mode: 'atom' | 'nucleus' | 'quark' = 'atom';

  function addExtra(obj: THREE.Object3D) {
    scene.add(obj);
    extras.push(obj);
  }

  function disposeObject(obj: THREE.Object3D) {
    const anyObj = obj as THREE.Mesh | THREE.Points | THREE.Line;
    anyObj.geometry?.dispose?.();
    const mat = anyObj.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach(m => m.dispose());
    else mat?.dispose?.();
  }

  function clearScene() {
    particles.forEach(p => { scene.remove(p.mesh); disposeObject(p.mesh); });
    particles.length = 0;
    extras.forEach(o => { scene.remove(o); disposeObject(o); });
    extras.length = 0;
  }

  function buildAtom() {
    clearScene();
    mode = 'atom';

    // Nucleus
    const nucGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const nucMat = new THREE.MeshPhongMaterial({ color: 0xe74c3c, emissive: 0x7f1c10, shininess: 80 });
    const nucleus = new THREE.Mesh(nucGeo, nucMat);
    scene.add(nucleus);
    particles.push({ mesh: nucleus });

    // Electron shells as probability clouds (state-of-the-art depiction):
    // electrons are not balls on orbits but a smeared-out density. Each shell
    // is a spherical point cloud whose radial spread mimics |ψ|², plus a faint
    // translucent halo for body. No rings, no orbiting motion.
    const shellConfig = [
      { r: 2.5, n: 2, color: 0x89b4fa },
      { r: 4.0, n: 6, color: 0xa6e3a1 },
      { r: 5.5, n: 10, color: 0xf9e2af },
    ];

    shellConfig.forEach(shell => {
      addExtra(makeElectronCloud(shell.r, shell.n, shell.color));
      // Faint translucent halo at the shell radius.
      const haloGeo = new THREE.SphereGeometry(shell.r, 24, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: shell.color, transparent: true, opacity: 0.05, depthWrite: false,
      });
      addExtra(new THREE.Mesh(haloGeo, haloMat));
    });

    infoEl.textContent = getLang() === 'en'
      ? 'Atom view — electrons shown as probability clouds, not orbits — click to zoom into the nucleus'
      : 'Vista atomo — gli elettroni sono nubi di probabilità, non orbite — clicca per ingrandire il nucleo';
  }

  // A spherical electron probability cloud: points scattered around radius `r`
  // with Gaussian radial spread, rendered as soft additive dots. Density scales
  // with the electron count `n`.
  function makeElectronCloud(r: number, n: number, color: number): THREE.Points {
    const count = n * 160;
    const positions = new Float32Array(count * 3);
    const gauss = () => {
      // Box–Muller standard normal.
      const u = Math.random() || 1e-6, v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    for (let i = 0; i < count; i++) {
      const rr = Math.max(0.2, r + gauss() * 0.4);
      // Uniform direction on the unit sphere.
      const ct = 2 * Math.random() - 1;
      const st = Math.sqrt(1 - ct * ct);
      const ph = Math.random() * Math.PI * 2;
      positions[i * 3] = rr * st * Math.cos(ph);
      positions[i * 3 + 1] = rr * st * Math.sin(ph);
      positions[i * 3 + 2] = rr * ct;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color, size: 0.09, transparent: true, opacity: 0.55,
      sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    return new THREE.Points(geo, mat);
  }

  function buildNucleus() {
    clearScene();
    mode = 'nucleus';

    const protonColor = 0xe74c3c;
    const neutronColor = 0x95a5a6;

    // ~6 protons + 6 neutrons (Carbon-12 style)
    const total = 12;
    for (let i = 0; i < total; i++) {
      const isProton = i < 6;
      const geo = new THREE.SphereGeometry(0.35, 24, 24);
      const mat = new THREE.MeshPhongMaterial({
        color: isProton ? protonColor : neutronColor,
        emissive: isProton ? 0x7f1c10 : 0x2c3e50,
        shininess: 60,
      });
      const mesh = new THREE.Mesh(geo, mat);

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.4 + Math.random() * 0.8;
      mesh.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      scene.add(mesh);
      particles.push({ mesh, orbit: { radius: 0, speed: 0.05, phase: Math.random() * Math.PI * 2, tilt: new THREE.Euler() } });
    }

    infoEl.textContent = getLang() === 'en'
      ? 'Nucleus view (protons=red, neutrons=gray) — click for quarks'
      : 'Vista nucleo (protoni=rosso, neutroni=grigio) — clicca per i quark';
  }

  function buildQuarks() {
    clearScene();
    mode = 'quark';

    // Show 1 proton composed of 2 up + 1 down quark
    const quarkDefs = [
      { color: 0x3498db, label: 'u', pos: new THREE.Vector3(-0.8, 0.5, 0) },
      { color: 0x3498db, label: 'u', pos: new THREE.Vector3(0.8, 0.5, 0) },
      { color: 0xe74c3c, label: 'd', pos: new THREE.Vector3(0, -0.8, 0) },
    ];

    quarkDefs.forEach(q => {
      const geo = new THREE.SphereGeometry(0.28, 24, 24);
      const mat = new THREE.MeshPhongMaterial({ color: q.color, emissive: q.color, emissiveIntensity: 0.2 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(q.pos);
      scene.add(mesh);
      particles.push({ mesh, orbit: { radius: 0.3, speed: 0.3, phase: Math.random() * Math.PI * 2, tilt: new THREE.Euler() } });

      // Gluon lines (springs between quarks)
      quarkDefs.forEach(q2 => {
        if (q2 === q) return;
        const lineMat = new THREE.LineBasicMaterial({ color: 0xf9e2af, opacity: 0.6, transparent: true });
        const pts = [q.pos.clone(), q2.pos.clone()];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        addExtra(new THREE.Line(lineGeo, lineMat));
      });
    });

    infoEl.textContent = getLang() === 'en'
      ? 'Proton = 2 up quarks (blue) + 1 down quark (red), bound by gluons (yellow) — click to reset'
      : 'Protone = 2 quark up (blu) + 1 quark down (rosso), legati da gluoni (giallo) — clicca per tornare';
  }

  // Info text
  const infoEl = document.createElement('div');
  infoEl.style.cssText = 'position:absolute;bottom:8px;left:0;right:0;text-align:center;font-size:0.75rem;color:var(--text3);pointer-events:none;';
  container.style.position = 'relative';
  container.appendChild(infoEl);

  renderer.domElement.addEventListener('click', () => {
    if (mode === 'atom') buildNucleus();
    else if (mode === 'nucleus') buildQuarks();
    else buildAtom();
  });

  buildAtom();

  let autoRotate = true;
  let isDragging = false;
  let prevX = 0, prevY = 0;
  let rotX = 0, rotY = 0;

  renderer.domElement.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; autoRotate = false; });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    rotY += (e.clientX - prevX) * 0.005;
    rotX += (e.clientY - prevY) * 0.005;
    prevX = e.clientX; prevY = e.clientY;
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.016;

    if (autoRotate) { rotY += 0.004; }

    particles.forEach(p => {
      if (p.isElectron && p.orbit) {
        const o = p.orbit;
        const angle = t * o.speed + o.phase;
        const v = new THREE.Vector3(Math.cos(angle) * o.radius, 0, Math.sin(angle) * o.radius);
        v.applyEuler(o.tilt);
        p.mesh.position.copy(v);
      } else if (p.orbit && p.orbit.radius > 0) {
        const o = p.orbit;
        const angle = t * o.speed + o.phase;
        const base = p.mesh.position.clone();
        p.mesh.position.x = base.x + Math.sin(angle) * 0.08;
        p.mesh.position.y = base.y + Math.cos(angle) * 0.08;
      }
    });

    scene.rotation.x = rotX;
    scene.rotation.y = rotY;

    renderer.render(scene, camera);
  }

  animate();

  const ro = new ResizeObserver(() => {
    const w = container.clientWidth;
    renderer.setSize(w, H);
    camera.aspect = w / H;
    camera.updateProjectionMatrix();
  });
  ro.observe(container);
}
