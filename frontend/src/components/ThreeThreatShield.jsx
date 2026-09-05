import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

function lerpColor(a, b, t) {
  const ca = new THREE.Color(a);
  const cb = new THREE.Color(b);
  return ca.lerp(cb, t);
}

export default function ThreeThreatShield({ riskScore = 15, classification = 'Safe' }) {
  const mountRef = useRef(null);
  const prevClassification = useRef(classification);

  const colorConfig = useMemo(() => {
    const configs = {
      Safe: { primary: 0x10b981, secondary: 0x06b6d4, accent: 0x34d399 },
      Suspicious: { primary: 0xf59e0b, secondary: 0xef4444, accent: 0xfbbf24 },
      'High Risk': { primary: 0xf43f5e, secondary: 0x9333ea, accent: 0xfb7185 },
    };
    return configs[classification] || configs.Safe;
  }, [classification]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.z = 6.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const { primary, secondary, accent } = colorConfig;
    const speedMult = classification === 'High Risk' ? 2.5 : classification === 'Suspicious' ? 1.4 : 0.8;
    const isHighRisk = classification === 'High Risk';

    // 1. Inner dodecahedron wireframe
    const innerGeo = new THREE.DodecahedronGeometry(0.65, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: accent,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // 2. Central icosahedron wireframe (main core)
    const coreDetail = isHighRisk ? 0 : 2;
    const coreGeo = new THREE.IcosahedronGeometry(1.1, coreDetail);
    const coreMat = new THREE.MeshStandardMaterial({
      color: primary,
      wireframe: true,
      emissive: primary,
      emissiveIntensity: isHighRisk ? 0.9 : 0.45,
      roughness: 0.15,
      metalness: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // 3. Outer icosahedron wireframe (ghost)
    const outerGeo = new THREE.IcosahedronGeometry(1.65, 1);
    const outerMat = new THREE.MeshBasicMaterial({
      color: secondary,
      wireframe: true,
      transparent: true,
      opacity: isHighRisk ? 0.2 : 0.1,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    scene.add(outerMesh);

    // 4. Inner glowing sphere (bloom fake)
    const glowGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: secondary,
      transparent: true,
      opacity: 0.18,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);

    // 5. Orbital rings (4 rings)
    const rings = [];
    const ringConfigs = [
      { radius: 1.95, thickness: 0.022, color: primary, opacity: 0.65, rotX: Math.PI / 3, rotZ: 0 },
      { radius: 2.25, thickness: 0.016, color: secondary, opacity: 0.5, rotX: Math.PI / 4, rotZ: Math.PI / 6 },
      { radius: 2.55, thickness: 0.012, color: accent, opacity: 0.3, rotX: Math.PI / 2.5, rotZ: Math.PI / 3 },
      { radius: 1.7, thickness: 0.018, color: primary, opacity: 0.4, rotX: Math.PI / 5, rotZ: Math.PI / 2 },
    ];

    ringConfigs.forEach((rc) => {
      const geo = new THREE.TorusGeometry(rc.radius, rc.thickness, 16, 120);
      const mat = new THREE.MeshBasicMaterial({
        color: rc.color,
        transparent: true,
        opacity: rc.opacity,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = rc.rotX;
      mesh.rotation.z = rc.rotZ;
      scene.add(mesh);
      rings.push(mesh);
    });

    // 6. Particle field (300 particles)
    const particleCount = 300;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.2 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      particleSizes[i] = 0.02 + Math.random() * 0.04;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      color: primary,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 7. Connection lines between random particle pairs
    const lineCount = isHighRisk ? 40 : 15;
    const lineGroup = new THREE.Group();
    for (let i = 0; i < lineCount; i++) {
      const idx1 = Math.floor(Math.random() * particleCount) * 3;
      const idx2 = Math.floor(Math.random() * particleCount) * 3;
      const lineGeo = new THREE.BufferGeometry();
      const linePositions = new Float32Array([
        positions[idx1], positions[idx1 + 1], positions[idx1 + 2],
        positions[idx2], positions[idx2 + 1], positions[idx2 + 2],
      ]);
      lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      const lineMat = new THREE.LineBasicMaterial({
        color: primary,
        transparent: true,
        opacity: isHighRisk ? 0.15 : 0.06,
      });
      lineGroup.add(new THREE.Line(lineGeo, lineMat));
    }
    scene.add(lineGroup);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(primary, 2.5, 60);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(secondary, 1.5, 50);
    pointLight2.position.set(-4, -3, 3);
    scene.add(pointLight2);

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Entry animation
    let entryProgress = 0;
    const entrySpeed = 0.015;
    const targetScale = 1;

    // Glitch timer for High Risk
    let glitchTimer = 0;
    let glitchActive = false;
    let glitchDuration = 0;

    // Animation loop
    let reqId;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Entry scale animation
      if (entryProgress < targetScale) {
        entryProgress = Math.min(entryProgress + entrySpeed, targetScale);
        const ease = 1 - Math.pow(1 - entryProgress, 3);
        coreMesh.scale.setScalar(ease);
        innerMesh.scale.setScalar(ease);
        outerMesh.scale.setScalar(ease);
        glowMesh.scale.setScalar(ease);
        rings.forEach(r => r.scale.setScalar(ease));
        particleSystem.scale.setScalar(ease);
      }

      // Core rotations
      coreMesh.rotation.x = t * 0.3 * speedMult;
      coreMesh.rotation.y = t * 0.4 * speedMult;

      innerMesh.rotation.x = -t * 0.5 * speedMult;
      innerMesh.rotation.z = t * 0.3 * speedMult;

      outerMesh.rotation.y = t * 0.15 * speedMult;
      outerMesh.rotation.z = -t * 0.1 * speedMult;

      // Inner core pulse
      const pulse = 1 + Math.sin(t * 3 * speedMult) * (isHighRisk ? 0.18 : 0.07);
      glowMesh.scale.set(pulse, pulse, pulse);
      glowMat.opacity = 0.12 + Math.sin(t * 2.5) * 0.08;

      // Ring rotations
      rings[0].rotation.z += 0.009 * speedMult;
      rings[1].rotation.x += 0.007 * speedMult;
      rings[2].rotation.z -= 0.005 * speedMult;
      rings[3].rotation.y += 0.011 * speedMult;

      // Particle system
      particleSystem.rotation.y = t * 0.06 * speedMult;
      particleSystem.rotation.x = Math.sin(t * 0.1) * 0.1;

      // Line group gentle rotation
      lineGroup.rotation.y = t * 0.03 * speedMult;

      // Glitch effect for High Risk
      if (isHighRisk) {
        glitchTimer += 0.016;
        if (!glitchActive && glitchTimer > 2 + Math.random() * 3) {
          glitchActive = true;
          glitchDuration = 0.08 + Math.random() * 0.12;
          glitchTimer = 0;
        }
        if (glitchActive) {
          glitchDuration -= 0.016;
          coreMesh.position.x = (Math.random() - 0.5) * 0.12;
          coreMesh.position.y = (Math.random() - 0.5) * 0.08;
          coreMat.emissiveIntensity = 1.2 + Math.random() * 0.5;
          if (glitchDuration <= 0) {
            glitchActive = false;
            coreMesh.position.set(0, 0, 0);
            coreMat.emissiveIntensity = 0.9;
          }
        }
      }

      // Mouse tracking (3 depth layers)
      scene.rotation.y += (mouseX * 0.25 - scene.rotation.y) * 0.04;
      scene.rotation.x += (-mouseY * 0.2 - scene.rotation.x) * 0.04;
      innerMesh.rotation.y += (mouseX * 0.15 - innerMesh.rotation.y) * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    prevClassification.current = classification;

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [classification, colorConfig]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div ref={mountRef} className="w-full h-full min-h-[340px] sm:min-h-[420px] lg:min-h-[520px] cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300">
        <span className={`w-2 h-2 rounded-full ${classification === 'High Risk' ? 'bg-rose-500 animate-ping' : classification === 'Suspicious' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
        <span>3D SHIELD MATRIX: {classification.toUpperCase()}</span>
      </div>
    </div>
  );
}
