import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Noise, rim and flow parameters reconstructed from the reference's public shader.
const fragmentShader = `
precision highp float;
uniform vec2 resolution;
uniform float time;
varying vec2 vUv;
float hash(vec3 p) {
  p = fract(p * .1031);
  p += dot(p, p.zyx + 33.33);
  return fract((p.x + p.y) * p.z);
}
float sinlerp(float a, float b, float w) {
  return mix(a, b, (sin(w * 3.14159265 - 1.5707963) + 1.) / 2.);
}
float noise(vec2 p, float s, float seed) {
  vec2 cell = floor(p / s), rel = mod(p, s) / s;
  float a = hash(vec3(cell, seed));
  float b = hash(vec3(cell + vec2(1., 0.), seed));
  float c = hash(vec3(cell + vec2(1., 1.), seed));
  float d = hash(vec3(cell + vec2(0., 1.), seed));
  return sinlerp(sinlerp(a,b,rel.x), sinlerp(d,c,rel.x), rel.y);
}
float layered(vec2 p, float s, float seed) {
  float o = s / 2.;
  return (2.*noise(p,s,seed) + 1.5*noise(p+vec2(o,o),s,seed+.1)
    +1.25*noise(p+vec2(-o,o),s,seed+.2)
    +1.125*noise(p+vec2(o,-o),s,seed+.3)
    +noise(p+vec2(-o,-o),s,seed+.4))/7.;
}
void main() {
  vec2 p = vUv * resolution / resolution.y * (700. / 1.28);
  float t = time * 72.;
  float d1 = noise(p+vec2(t,0.),60.,10.)*50.*.72;
  float d2 = noise(p-vec2(t,0.),120.,15.)*100.*.72;
  float peak1 = layered(p+d1+vec2(0.,-t*.5),40.,1.);
  float peak2 = layered(p+d2-vec2(0.,-t*.5),40.,0.);
  float valley = -.12 * log2(exp2(-peak1/.12) + exp2(-peak2/.12));
  float band = (.19 - abs((valley-.4)*2.))*5.;
  float light = pow(clamp(band-noise(p+vec2(0.,-t*.5),60.,12.)*1.25,0.,1.),3.15)*1.55;
  float hue = clamp(.5+(peak1-peak2)*.8,0.,1.);
  vec3 color = hue < .3333 ? vec3(0.,.2784,.4196) : hue < .6667 ? vec3(0.,.2784,.4392) : vec3(1.);
  vec3 result = color * light;
  gl_FragColor = vec4(result, clamp(max(result.r,max(result.g,result.b)),0.,1.)*.54);
}`;

export default function FluidBackground() {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let renderer, material, geometry, observer, frame = 0, active = false, elapsed = 0, last = 0, lastPaint = 0;
    let failed = false;
    const scene = new THREE.Scene(), camera = new THREE.Camera();
    const render = () => {
      if (!renderer) return;
      material.uniforms.time.value = elapsed;
      renderer.render(scene, camera);
    };
    const resize = () => {
      if (!renderer) return;
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(width, height);
      material.uniforms.resolution.value.set(renderer.domElement.width, renderer.domElement.height);
      render();
    };
    const init = () => {
      if (renderer || failed) return;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
        renderer.setPixelRatio(innerWidth <= 700 ? .5 : .55);
        renderer.setClearColor(0, 0);
        renderer.domElement.setAttribute('aria-hidden', 'true');
        host.appendChild(renderer.domElement);
        material = new THREE.RawShaderMaterial({
          vertexShader: 'precision highp float; attribute vec3 position; attribute vec2 uv; varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.); }',
          fragmentShader, transparent: true, depthTest: false, depthWrite: false,
          uniforms: { resolution: { value: new THREE.Vector2(1, 1) }, time: { value: 0 } },
        });
        geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        scene.add(mesh);
        observer = new ResizeObserver(resize);
        observer.observe(host);
        resize();
        host.dataset.ready = 'true';
      } catch {
        failed = true;
        host.dataset.fallback = 'true';
      }
    };
    const tick = now => {
      frame = 0;
      if (!active || document.hidden || motion.matches || failed) return;
      elapsed += Math.min((now - last) / 1000, .1);
      last = now;
      if (now - lastPaint > 1000 / (innerWidth <= 700 ? 20 : 24)) { render(); lastPaint = now; }
      frame = requestAnimationFrame(tick);
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (active && !document.hidden && !motion.matches && !failed) {
        last = performance.now(); frame = requestAnimationFrame(tick);
      } else render();
    };
    const intersection = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (active) init();
      resume();
    }, { rootMargin: '100px' });
    intersection.observe(host);
    motion.addEventListener('change', resume);
    document.addEventListener('visibilitychange', resume);
    return () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      observer?.disconnect();
      motion.removeEventListener('change', resume);
      document.removeEventListener('visibilitychange', resume);
      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
      renderer?.domElement.remove();
    };
  }, []);
  return <div className="fluid-background" ref={ref} aria-hidden="true" />;
}
