/**
 * Luxury 3D Islamic Celestial & Geometric Visualization (Three.js)
 * Features an authentic 3D Rub-el-Hizb (Islamic 8-pointed star polyhedron),
 * astrolabe armillary golden rings, and celestial stardust particle field.
 */
import * as THREE from 'three';

export function initIslamic3D(canvasId = 'canvas3d-login', options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const parent = canvas.parentElement || document.body;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    options.fov || 45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.z = options.cameraZ || 14;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting: Luxury Emerald & Warm Champagne Gold
  const ambientLight = new THREE.AmbientLight(0x063124, 1.8);
  scene.add(ambientLight);

  const goldKeyLight = new THREE.DirectionalLight(0xf5e2b3, 2.4);
  goldKeyLight.position.set(5, 8, 7);
  scene.add(goldKeyLight);

  const emeraldFillLight = new THREE.DirectionalLight(0x15916f, 1.6);
  emeraldFillLight.position.set(-6, -4, -4);
  scene.add(emeraldFillLight);

  const centerPointLight = new THREE.PointLight(0xdfb76c, 2.0, 25);
  centerPointLight.position.set(0, 0, 3);
  scene.add(centerPointLight);

  // Group for all celestial objects
  const mainGroup = new THREE.Group();
  scene.add(mainGroup);

  // 1. Create 3D Islamic 8-Pointed Star (Rub-el-Hizb)
  const starShape = new THREE.Shape();
  const R = 2.6;
  const r = 2.6 * 0.765366; // exact ratio cos(pi/4)/cos(pi/8)
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8;
    const rad = i % 2 === 0 ? R : r;
    const x = Math.cos(angle) * rad;
    const y = Math.sin(angle) * rad;
    if (i === 0) starShape.moveTo(x, y);
    else starShape.lineTo(x, y);
  }
  starShape.closePath();

  const starGeom = new THREE.ExtrudeGeometry(starShape, {
    depth: 0.9,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.45,
    bevelThickness: 0.55
  });
  starGeom.center();

  // Emerald jewel translucent body
  const starMat = new THREE.MeshPhysicalMaterial({
    color: 0x094331,
    metalness: 0.25,
    roughness: 0.28,
    transmission: 0.45,
    transparent: true,
    opacity: 0.92,
    reflectivity: 0.8,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2
  });
  const starMesh = new THREE.Mesh(starGeom, starMat);
  mainGroup.add(starMesh);

  // Gold Wireframe Edge Lattice
  const wireGeom = new THREE.WireframeGeometry(starGeom);
  const wireMat = new THREE.LineBasicMaterial({
    color: 0xdfb76c,
    transparent: true,
    opacity: 0.65,
    linewidth: 1
  });
  const wireMesh = new THREE.LineSegments(wireGeom, wireMat);
  starMesh.add(wireMesh);

  // 2. Intersecting Secondary 8-Point Star (Rotated 45° offset for 3D depth)
  const starMesh2 = starMesh.clone();
  starMesh2.scale.set(0.68, 0.68, 0.68);
  starMesh2.rotation.z = Math.PI / 8;
  mainGroup.add(starMesh2);

  // 3. Astrolabe Rings (Champagne Gold Celestial Rings)
  const ringGroup = new THREE.Group();
  mainGroup.add(ringGroup);

  const ringGeom1 = new THREE.TorusGeometry(3.8, 0.035, 16, 100);
  const ringMat1 = new THREE.MeshStandardMaterial({
    color: 0xdfb76c,
    metalness: 0.88,
    roughness: 0.22,
    emissive: 0x422d08,
    emissiveIntensity: 0.2
  });
  const ring1 = new THREE.Mesh(ringGeom1, ringMat1);
  ring1.rotation.x = Math.PI / 3;
  ringGroup.add(ring1);

  const ringGeom2 = new THREE.TorusGeometry(4.4, 0.03, 16, 100);
  const ring2 = new THREE.Mesh(ringGeom2, ringMat1);
  ring2.rotation.y = Math.PI / 4;
  ringGroup.add(ring2);

  // 4. Celestial Stardust Particle Cloud
  const particleCount = 130;
  const particleGeom = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorGold = new THREE.Color(0xdfb76c);
  const colorEmerald = new THREE.Color(0x19a07b);
  const colorWhite = new THREE.Color(0xfff7e6);

  for (let i = 0; i < particleCount; i++) {
    const radius = 4.2 + Math.random() * 5.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const randC = Math.random();
    const c = randC > 0.6 ? colorGold : randC > 0.3 ? colorEmerald : colorWhite;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Canvas circle texture for particles
  const dotCanvas = document.createElement('canvas');
  dotCanvas.width = 32;
  dotCanvas.height = 32;
  const dotCtx = dotCanvas.getContext('2d');
  const gradient = dotCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.35, 'rgba(255,230,170,0.85)');
  gradient.addColorStop(0.8, 'rgba(25,160,123,0.3)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  dotCtx.fillStyle = gradient;
  dotCtx.fillRect(0, 0, 32, 32);

  const dotTexture = new THREE.CanvasTexture(dotCanvas);
  const particleMat = new THREE.PointsMaterial({
    size: 0.32,
    vertexColors: true,
    map: dotTexture,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const particleSystem = new THREE.Points(particleGeom, particleMat);
  mainGroup.add(particleSystem);

  // Mouse Parallax
  let targetRotX = 0;
  let targetRotY = 0;
  let mouseX = 0;
  let mouseY = 0;

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    targetRotY = x * 0.9;
    targetRotX = y * 0.9;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Handle Resize
  function onResize() {
    if (!canvas || !canvas.parentElement) return;
    const w = canvas.parentElement.clientWidth || window.innerWidth;
    const h = canvas.parentElement.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // Animation Loop
  let reqId = null;
  let isRunning = true;
  let clock = new THREE.Clock();

  function animate() {
    if (!isRunning) return;
    reqId = requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Check visibility to save battery and GPU if offscreen/hidden
    if (canvas.offsetParent === null) {
      return;
    }

    if (!isReduced) {
      // Rotation
      starMesh.rotation.y += 0.007;
      starMesh.rotation.x += 0.003;
      starMesh2.rotation.y -= 0.009;
      starMesh2.rotation.z += 0.005;

      ringGroup.rotation.y += 0.005;
      ringGroup.rotation.x -= 0.003;

      particleSystem.rotation.y += 0.002;
    }

    // Parallax damping (lerp)
    mouseX += (targetRotX - mouseX) * 0.05;
    mouseY += (targetRotY - mouseY) * 0.05;

    mainGroup.rotation.x = mouseX;
    mainGroup.rotation.y = mouseY + (isReduced ? 0 : clock.getElapsedTime() * 0.05);

    renderer.render(scene, camera);
  }

  animate();

  return {
    destroy() {
      isRunning = false;
      if (reqId) cancelAnimationFrame(reqId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      starGeom.dispose();
      starMat.dispose();
      ringGeom1.dispose();
      ringGeom2.dispose();
      particleGeom.dispose();
    }
  };
}
