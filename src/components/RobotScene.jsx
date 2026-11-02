import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

function makeRobot(color, variant) {
  const robot = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: '#a9b2b2', metalness: 1, roughness: 0.2 });
  const shell = new THREE.MeshPhysicalMaterial({ color: '#e0e4df', metalness: 0.78, roughness: 0.26, clearcoat: 1 });
  const black = new THREE.MeshStandardMaterial({ color: '#0b1114', metalness: 0.75, roughness: 0.23 });
  const accent = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  const dark = new THREE.MeshStandardMaterial({ color: '#303638', metalness: 0.95, roughness: 0.32 });
  const add = (geometry, material, position, parent = robot) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    parent.add(mesh);
    return mesh;
  };
  const rounded = (w, h, d, r = 0.15) => new RoundedBoxGeometry(w, h, d, 5, r);
  const head = new THREE.Group();
  head.position.y = 1.05;
  robot.add(head);
  add(rounded(2.12, 1.64, 1.46, 0.35), shell, [0, 0, 0], head);
  add(rounded(1.86, 1.02, 0.44, 0.27), black, [0, -0.02, 0.69], head);
  add(rounded(1.68, 0.03, 0.02, 0.01), metal, [0, 0.37, 0.929], head);
  [-0.48, 0.48].forEach(x => {
    add(rounded(0.2, 0.32, 0.04, 0.065), accent, [x, 0.04, 0.926], head);
    add(rounded(0.38, 0.13, 0.04, 0.04), accent, [x, 0.04, 0.928], head);
  });
  add(rounded(0.32, 0.055, 0.04, 0.02), metal, [0, -0.3, 0.925], head);
  [-1, 1].forEach(side => {
    const ear = add(new THREE.CylinderGeometry(0.34, 0.34, 0.18, 40), dark, [side * 1.12, 0, 0], head);
    ear.rotation.z = Math.PI / 2;
    const light = add(new THREE.TorusGeometry(0.235, 0.025, 8, 40), accent, [side * 1.22, 0, 0], head);
    light.rotation.y = Math.PI / 2;
    for (let i = 0; i < 3; i++) add(rounded(0.045, 0.14, 0.045, 0.015), dark, [side * (0.6 + i * 0.105), -0.64, 0.61], head);
  });
  add(new THREE.CylinderGeometry(0.31, 0.38, 0.42, 24), dark, [0, -0.01, 0]);
  for (let i = 0; i < 3; i++) {
    add(new THREE.TorusGeometry(0.32, 0.04, 8, 32), metal, [0, 0.02 - i * 0.1, 0]).rotation.x = Math.PI / 2;
  }
  add(rounded(1.76, 1.45, 1.05, 0.3), shell, [0, -0.88, 0]);
  add(rounded(1.45, 0.2, 0.95, 0.08), dark, [0, -0.26, 0.02]);
  add(rounded(0.58, 0.62, 0.055, 0.1), black, [0, -0.84, 0.53]);
  add(rounded(0.085, 0.32, 0.06, 0.02), accent, [0, -0.84, 0.566]);
  add(rounded(0.32, 0.085, 0.06, 0.02), accent, [0, -0.84, 0.567]);
  [-1, 1].forEach(side => {
    const arm = new THREE.Group();
    arm.position.set(side * 1.07, -0.45, 0);
    arm.rotation.z = side * 0.12;
    robot.add(arm);
    add(new THREE.SphereGeometry(0.29, 24, 16), dark, [0, 0, 0], arm);
    add(rounded(0.46, 0.85, 0.53, 0.2), shell, [side * 0.03, -0.43, 0], arm);
    add(new THREE.SphereGeometry(0.23, 20, 12), dark, [side * 0.03, -0.89, 0], arm);
    add(rounded(0.42, 0.59, 0.47, 0.17), metal, [side * 0.04, -1.15, 0.07], arm);
    add(rounded(0.3, 0.09, 0.04, 0.02), accent, [side * 0.04, -0.49, 0.275], arm);
  });
  add(rounded(1.25, 0.18, 0.8, 0.07), dark, [0, -1.57, 0]);
  if (variant === 'creative') {
    const halo = add(new THREE.TorusGeometry(1.3, 0.025, 12, 96), accent, [0, 1.3, -0.5]);
    halo.rotation.x = 0.55;
  }
  if (variant === 'research') {
    const monocle = add(new THREE.TorusGeometry(0.31, 0.035, 10, 40), metal, [0.47, 1.1, 0.99]);
    monocle.rotation.y = 0.03;
  }
  if (variant === 'service') {
    const band = add(new THREE.TorusGeometry(1.14, 0.085, 12, 60, Math.PI), dark, [0, 1.08, 0]);
    band.rotation.z = 0;
    const mic = add(rounded(0.48, 0.065, 0.06, 0.03), dark, [0.93, 0.64, 0.92]);
    mic.rotation.z = -0.2;
    add(new THREE.SphereGeometry(0.09, 12, 12), accent, [0.68, 0.68, 0.95]);
  }
  robot.userData.head = head;
  return robot;
}

export default function RobotScene({ color = '#c8f76b', variant = 'office', poster = false }) {
  const host = useRef(null);
  useEffect(() => {
    const container = host.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: poster });
    } catch {
      container.dataset.fallback = 'true';
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.4, 11.5);
    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environmentMap = pmrem.fromScene(environment, 0.04);
    scene.environment = environmentMap.texture;
    environment.dispose();
    const mainLight = new THREE.DirectionalLight('#ffffff', 3);
    mainLight.position.set(-3, 5, 6);
    scene.add(mainLight);
    const rim = new THREE.DirectionalLight(color, 4);
    rim.position.set(4, 2, -4);
    scene.add(rim);
    const fill = new THREE.DirectionalLight('#b2d4ff', 2.5);
    fill.position.set(-4, -1, 3);
    scene.add(fill);
    const robot = makeRobot(color, variant);
    robot.rotation.set(0.06, -0.3, 0.035);
    scene.add(robot);
    const platform = new THREE.Group();
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.76, 1.88, 0.12, 96),
      new THREE.MeshStandardMaterial({ color: '#111616', metalness: 0.8, roughness: 0.3, envMapIntensity: 0.3 }),
    );
    platform.add(plate);
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.5 + i * 0.18, 0.012, 8, 96),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: i === 1 ? 0.65 : 0.18 }),
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.08 + i * 0.008;
      platform.add(ring);
    }
    platform.position.y = -2.25;
    scene.add(platform);
    const pointer = { x: 0, y: 0 };
    let mobile = false;
    let baseY = 0.14;
    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      mobile = width < 760;
      if (poster) {
        camera.position.set(0, -0.25, 10.6);
        robot.position.set(0, -0.15, 0);
        platform.position.x = 0;
        platform.position.y = -2.5;
        robot.scale.setScalar(1.05);
      } else {
        const tablet = !mobile && width < 1000;
        const horizontalRoom = (width / height) * Math.tan(THREE.MathUtils.degToRad(17)) * 11.5;
        const x = mobile ? Math.min(1.15, horizontalRoom - 1.55) : tablet ? 1.45 : (width / height > 1.9 ? 2.45 : 2.2);
        const shortPhone = mobile && width < 360 && height < 440;
        platform.visible = !shortPhone;
        baseY = mobile ? (shortPhone ? -1.25 : width < 360 ? -0.65 : -0.25) : 0.14;
        robot.position.set(x, baseY, 0);
        robot.scale.setScalar(mobile ? 0.93 : tablet ? 0.72 : 1.03);
        platform.position.set(x, mobile ? (shortPhone ? -3.15 : width < 360 ? -2.7 : -2.46) : tablet ? -1.95 : -2.25, 0);
        platform.scale.setScalar(mobile ? 0.75 : tablet ? 0.72 : 1);
        camera.position.z = 11.5;
      }
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    const onPointer = event => {
      const rect = container.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width - 0.5;
      pointer.y = (event.clientY - rect.top) / rect.height - 0.5;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = media.matches;
    const motionChange = () => { reduced = media.matches; };
    media.addEventListener('change', motionChange);
    let visible = true;
    const visibilityObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; });
    visibilityObserver.observe(container);
    const clock = new THREE.Clock();
    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!visible || document.hidden) return;
      const elapsed = clock.getElapsedTime();
      if (!reduced && !poster) {
        robot.rotation.y = THREE.MathUtils.lerp(robot.rotation.y, -0.24 + pointer.x * 0.28, 0.025);
        robot.rotation.z = Math.sin(elapsed * 0.55) * 0.025;
        robot.userData.head.rotation.x = THREE.MathUtils.lerp(robot.userData.head.rotation.x, pointer.y * 0.1, 0.03);
        robot.position.y = baseY + Math.sin(elapsed * 1.2) * 0.075;
        platform.rotation.y = elapsed * 0.06;
      }
      renderer.render(scene, camera);
      container.dataset.ready = 'true';
    };
    resize();
    animate();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener('pointermove', onPointer);
      media.removeEventListener('change', motionChange);
      const materials = new Set();
      scene.traverse(object => {
        object.geometry?.dispose();
        if (object.material) materials.add(object.material);
      });
      materials.forEach(material => material.dispose());
      environmentMap.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [color, variant, poster]);
  return <div ref={host} className={`robot-scene${poster ? ' robot-scene--poster' : ''}`} role="img" aria-label="银色数字员工，配有发光眼睛和悬浮展示台">
    {!poster && <img className="robot-fallback" src="/artworks/hero-fallback.webp" alt="" />}
  </div>;
}
