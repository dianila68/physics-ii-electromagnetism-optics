import * as THREE from 'three';

export function initEMWave(container: HTMLElement) {
  const W = container.clientWidth || 700;
  const H = 420;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);
  camera.position.set(12, 6, 12);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));

  // Propagation axis
  const axisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-8, 0, 0), new THREE.Vector3(8, 0, 0),
  ]);
  scene.add(new THREE.Line(axisGeo, new THREE.LineBasicMaterial({ color: 0x888888, opacity: 0.5, transparent: true })));

  // Arrow helper for axis label
  scene.add(new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0), new THREE.Vector3(6, 0, 0), 1.5, 0xaaaaaa, 0.4, 0.2
  ));

  const N = 120;
  const lambda = 6;

  // E field (y-axis, red)
  const ePoints: THREE.Vector3[] = [];
  const eGeo = new THREE.BufferGeometry();
  const eMat = new THREE.LineBasicMaterial({ color: 0xe74c3c, linewidth: 2 });
  const eLine = new THREE.Line(eGeo, eMat);
  scene.add(eLine);

  // B field (z-axis, blue)
  const bPoints: THREE.Vector3[] = [];
  const bGeo = new THREE.BufferGeometry();
  const bMat = new THREE.LineBasicMaterial({ color: 0x89b4fa, linewidth: 2 });
  const bLine = new THREE.Line(bGeo, bMat);
  scene.add(bLine);

  // Vertical E-field tick lines
  const eArrows: THREE.ArrowHelper[] = [];
  const bArrows: THREE.ArrowHelper[] = [];
  const tickN = 24;

  for (let i = 0; i < tickN; i++) {
    const x = -8 + (16 / tickN) * i;
    const ea = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x, 0, 0), 0.01, 0xe74c3c, 0.15, 0.08);
    const ba = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(x, 0, 0), 0.01, 0x89b4fa, 0.15, 0.08);
    eArrows.push(ea);
    bArrows.push(ba);
    scene.add(ea, ba);
  }

  // Planes to show layers
  const ePlane = (() => {
    const g = new THREE.PlaneGeometry(16, 4);
    const m = new THREE.MeshBasicMaterial({ color: 0xe74c3c, opacity: 0.05, transparent: true, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.z = Math.PI / 2;
    mesh.rotation.y = Math.PI / 2;
    return mesh;
  })();
  scene.add(ePlane);

  const bPlane = (() => {
    const g = new THREE.PlaneGeometry(16, 4);
    const m = new THREE.MeshBasicMaterial({ color: 0x89b4fa, opacity: 0.05, transparent: true, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  })();
  scene.add(bPlane);

  let showE = true, showB = true, showPlanes = false;
  let speed = 1.0;
  let t = 0;

  function updateWave() {
    ePoints.length = 0;
    bPoints.length = 0;

    for (let i = 0; i <= N; i++) {
      const x = -8 + (16 / N) * i;
      const phase = (2 * Math.PI / lambda) * (x - t * speed * 2);
      const ey = Math.sin(phase);
      const bz = Math.sin(phase);
      ePoints.push(new THREE.Vector3(x, ey, 0));
      bPoints.push(new THREE.Vector3(x, 0, bz));
    }

    eGeo.setFromPoints(ePoints);
    bGeo.setFromPoints(bPoints);

    for (let i = 0; i < tickN; i++) {
      const x = -8 + (16 / tickN) * i;
      const phase = (2 * Math.PI / lambda) * (x - t * speed * 2);
      const ey = Math.sin(phase);
      const bz = Math.sin(phase);

      eArrows[i].position.set(x, 0, 0);
      eArrows[i].setDirection(ey >= 0 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, -1, 0));
      eArrows[i].setLength(Math.abs(ey) * 0.8 + 0.01, 0.15, 0.08);
      eArrows[i].visible = showE;

      bArrows[i].position.set(x, 0, 0);
      bArrows[i].setDirection(bz >= 0 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 0, -1));
      bArrows[i].setLength(Math.abs(bz) * 0.8 + 0.01, 0.15, 0.08);
      bArrows[i].visible = showB;
    }

    eLine.visible = showE;
    bLine.visible = showB;
    ePlane.visible = showPlanes && showE;
    bPlane.visible = showPlanes && showB;
  }

  let animId: number;
  function animate() {
    animId = requestAnimationFrame(animate);
    t += 0.016;
    updateWave();
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

  return {
    setShowE(v: boolean) { showE = v; },
    setShowB(v: boolean) { showB = v; },
    setShowPlanes(v: boolean) { showPlanes = v; },
    setSpeed(v: number) { speed = v; },
    destroy() { cancelAnimationFrame(animId); renderer.dispose(); },
  };
}
