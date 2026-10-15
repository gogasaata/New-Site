"use client";

import { useEffect, useRef, useState } from "react";
import Earth from "./Earth";

const D2R = Math.PI / 180;
// [lon, lat] hubs that the red connection arcs run between
const HUBS: [number, number][] = [
  [-0.12, 51.5], [2.35, 48.85], [13.4, 52.5], [12.5, 41.9], [37.6, 55.75], [28.97, 41.0],
  [44.8, 41.7], [55.3, 25.2], [51.4, 35.7], [31.2, 30.0], [3.4, 6.5], [36.8, -1.3],
  [18.4, -33.9], [77.2, 28.6], [72.8, 19.0], [67.0, 24.9], [-74, 40.7], [121.5, 31.2],
  [103.8, 1.35], [-3.7, 40.4], [30.5, 50.4], [10.7, 59.9],
];
const ARCS: [number, number][] = [
  [0, 4], [0, 7], [1, 8], [2, 5], [3, 9], [4, 7], [5, 10], [6, 13], [7, 14], [8, 15], [9, 11], [10, 0],
  [12, 9], [13, 17], [14, 18], [0, 16], [19, 5], [20, 7], [21, 3], [2, 13], [1, 10], [4, 17], [6, 9], [3, 8], [16, 19],
];

export default function Globe() {
  const wrap = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      try {
        const THREE = await import("three");
        if (disposed) return;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);
        renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -5000, 5000);
        const globe = new THREE.Group(); // positioned / scaled per layout
        const tilt = new THREE.Group(); // axis tilt
        const spin = new THREE.Group(); // rotates with time
        scene.add(globe);
        globe.add(tilt);
        tilt.add(spin);

        // lon/lat -> unit vector, same convention as SphereGeometry's UV mapping
        const toVec = (lon: number, lat: number, r = 1) => {
          const phi = (lon + 180) * D2R, la = lat * D2R;
          return new THREE.Vector3(-Math.cos(phi) * Math.cos(la) * r, Math.sin(la) * r, Math.sin(phi) * Math.cos(la) * r);
        };

        const tex = await new THREE.TextureLoader().loadAsync("/earth-night.jpg");
        if (disposed) return;
        tex.anisotropy = 4;

        const body = new THREE.Mesh(
          new THREE.SphereGeometry(1, 128, 96),
          new THREE.ShaderMaterial({
            uniforms: { map: { value: tex } },
            vertexShader: `varying vec3 vN; varying vec2 vUv;
              void main(){ vN = normalize(normalMatrix * normal); vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
            fragmentShader: `uniform sampler2D map; varying vec3 vN; varying vec2 vUv;
              void main(){
                vec3 n = normalize(vN);
                vec3 t = texture2D(map, vUv).rgb;
                float lit = max(dot(n, normalize(vec3(-0.55, 0.65, 0.55))), 0.0);
                float fres = pow(1.0 - max(n.z, 0.0), 2.6);
                vec3 base = vec3(0.016, 0.014, 0.016) + vec3(0.050, 0.046, 0.050) * pow(lit, 1.8);
                vec3 col = base + t * (1.25 + 0.6 * n.z);
                col += vec3(0.78, 0.74, 0.78) * fres * (0.10 + 0.80 * lit);
                gl_FragColor = vec4(col, 1.0);
              }`,
          }),
        );
        spin.add(body);

        // soft silver atmosphere
        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(1.045, 96, 64),
          new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.BackSide,
            depthWrite: false,
            vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
            fragmentShader: `varying vec3 vN; void main(){ float a = pow(clamp(0.62 + dot(vN, vec3(0.0,0.0,1.0)), 0.0, 1.0), 3.0); gl_FragColor = vec4(0.82,0.78,0.82, a * 0.28); }`,
          }),
        );
        globe.add(halo);

        // red connection arcs + hub points
        const arcMat = new THREE.LineBasicMaterial({ color: 0xc41e3a, transparent: true, opacity: 0.85 });
        for (const [a, b] of ARCS) {
          const A = toVec(...HUBS[a]), B = toVec(...HUBS[b]);
          const ang = A.angleTo(B);
          const mid = A.clone().add(B).normalize().multiplyScalar(1 + 0.18 + ang * 0.28);
          const curve = new THREE.QuadraticBezierCurve3(A.clone().multiplyScalar(1.004), mid, B.clone().multiplyScalar(1.004));
          spin.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(72)), arcMat));
        }
        const hubGeo = new THREE.SphereGeometry(0.0075, 10, 10);
        const hubMat = new THREE.MeshBasicMaterial({ color: 0xffc27a });
        for (const [lon, lat] of HUBS) {
          const m = new THREE.Mesh(hubGeo, hubMat);
          m.position.copy(toVec(lon, lat, 1.003));
          spin.add(m);
        }

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const START_LON = 14; // centre of the view when the page loads (Europe / Middle East)
        const baseSpin = -(Math.PI / 2) - START_LON * D2R + Math.PI; // brings the lon to the camera
        tilt.rotation.x = 0.14;
        tilt.rotation.z = -0.08;

        const layout = () => {
          const w = el.clientWidth, h = el.clientHeight;
          if (!w || !h) return;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.setSize(w, h, false);
          // ortho camera in "pixel" units; sphere radius / centre follow the reference composition
          camera.left = 0; camera.right = w; camera.top = 0; camera.bottom = -h;
          camera.updateProjectionMatrix();
          const narrow = w < 600;
          const R = narrow ? w * 0.8 : h * 1.44;
          const cx = narrow ? w * 0.78 : w * 0.9;
          const cy = narrow ? h * 0.98 : h * 1.46;
          globe.position.set(cx, -cy, 0);
          globe.scale.setScalar(R);
        };
        layout();
        const ro = new ResizeObserver(layout);
        ro.observe(el);

        let raf = 0, last = performance.now(), visible = true, angle = 0;
        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!visible) { last = now; return; }
          const dt = Math.min((now - last) / 1000, 0.1);
          last = now;
          if (!reduce) angle += dt * 0.1;
          spin.rotation.y = baseSpin + angle;
          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(frame);
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(el);

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          io.disconnect();
          tex.dispose();
          scene.traverse((o) => {
            const m = o as import("three").Mesh;
            m.geometry?.dispose?.();
          });
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        if (!disposed) setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  if (failed) return <Earth src="/earth.webp" />;
  return (
    <div
      ref={wrap}
      role="img"
      aria-label="Rotating globe at night showing Europe, the Middle East and Africa with global connections"
      className="absolute inset-x-0 bottom-0 h-[340px] lg:bottom-0 lg:left-auto lg:right-0 lg:top-[60px] lg:h-auto lg:w-[66%]"
    />
  );
}
