import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AstronomySnapshot } from '../types';
import { Box, Eye, Sun, Compass, Sparkles, Layers, RotateCcw, Play, Pause } from 'lucide-react';

interface LunarLighting3DProps {
  snapshot: AstronomySnapshot;
}

export const LunarLighting3D: React.FC<LunarLighting3DProps> = ({ snapshot }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'earth' | 'space' | 'sun' | 'free'>('earth');
  const [showVectors, setShowVectors] = useState(true);
  const [customPhaseAngle, setCustomPhaseAngle] = useState<number | null>(null);

  const { solarAngles, moonPhase } = snapshot;
  const activePhaseAngle = customPhaseAngle !== null ? customPhaseAngle : solarAngles.phaseAngle;

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Renderer Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050811');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Stars Background
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 400;
      starPositions[i + 1] = (Math.random() - 0.5) * 400;
      starPositions[i + 2] = (Math.random() - 0.5) * 400;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.8, transparent: true, opacity: 0.7 });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // 3. Moon Mesh Creation (Sphere with procedural craters texture)
    const moonRadius = 2.5;
    const moonGeometry = new THREE.SphereGeometry(moonRadius, 64, 64);

    // Create realistic lunar canvas texture
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 1024;
    textureCanvas.height = 512;
    const ctx = textureCanvas.getContext('2d')!;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 1024, 512);

    // Draw procedural craters & maria
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const r = Math.random() * 25 + 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = Math.random() > 0.4 ? '#475569' : '#e2e8f0';
      ctx.globalAlpha = 0.25;
      ctx.fill();
    }

    const canvasTexture = new THREE.CanvasTexture(textureCanvas);
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: canvasTexture,
      roughness: 0.9,
      metalness: 0.1,
    });
    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moonMesh);

    // 4. Directional Sun Light Vector
    // Convert phase angle to 3D direction vector
    // Phase angle = 0 (Full, Sun behind Earth), Phase angle = 180 (New, Sun behind Moon)
    const radPhase = (activePhaseAngle * Math.PI) / 180;
    const sunDistance = 20;
    const sunX = Math.sin(radPhase) * sunDistance;
    const sunZ = Math.cos(radPhase) * sunDistance;

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    sunLight.position.set(sunX, 1, sunZ);
    scene.add(sunLight);

    // Ambient space light (earthshine / starlight shadow tone)
    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.15);
    scene.add(ambientLight);

    // Sun Visual Sphere Representation
    const sunSphereGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const sunSphereMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const sunSphere = new THREE.Mesh(sunSphereGeo, sunSphereMat);
    sunSphere.position.set(sunX * 1.2, 1, sunZ * 1.2);
    scene.add(sunSphere);

    // 5. Vectors Overlay (Sun Incident Light, Earth Sight Line, Normal Vector)
    let sunVectorArrow: THREE.ArrowHelper | null = null;
    let earthVectorArrow: THREE.ArrowHelper | null = null;

    if (showVectors) {
      // Vector from Sun to Moon
      const sunDir = new THREE.Vector3(-sunX, 0, -sunZ).normalize();
      sunVectorArrow = new THREE.ArrowHelper(sunDir, new THREE.Vector3(sunX * 0.6, 0, sunZ * 0.6), 4, 0xf59e0b, 0.6, 0.4);
      scene.add(sunVectorArrow);

      // Vector from Earth to Moon (Earth is at +Z)
      const earthDir = new THREE.Vector3(0, 0, -1);
      earthVectorArrow = new THREE.ArrowHelper(earthDir, new THREE.Vector3(0, 0, 7), 4, 0x38bdf8, 0.6, 0.4);
      scene.add(earthVectorArrow);
    }

    // 6. Camera Positioning Based on View Mode
    if (viewMode === 'earth') {
      // Looking directly from Earth at Moon center
      camera.position.set(0, 0, 9);
      camera.lookAt(0, 0, 0);
    } else if (viewMode === 'space') {
      // Space Top-Down View
      camera.position.set(0, 12, 0.1);
      camera.lookAt(0, 0, 0);
    } else if (viewMode === 'sun') {
      // View looking from Sun toward Moon
      camera.position.set(sunX * 0.8, 1, sunZ * 0.8);
      camera.lookAt(0, 0, 0);
    } else {
      // Free orbit view angled
      camera.position.set(6, 4, 7);
      camera.lookAt(0, 0, 0);
    }

    // Render loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (viewMode === 'free') {
        moonMesh.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [viewMode, activePhaseAngle, showVectors]);

  return (
    <div className="space-y-6">
      {/* Title & View Controls Header */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-display text-slate-100 flex items-center gap-2">
            <Box className="w-5 h-5 text-amber-400" /> Visualização Gráfica da Incidência Solar e Ângulos Lunares
          </h2>
          <p className="text-xs text-slate-400">
            Simulação tridimensional interativa da luz solar incidindo sobre a superfície lunar, vetores de radiação e ângulo de fase ($\psi$).
          </p>
        </div>

        {/* View Perspective Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('earth')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'earth' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Visão da Terra
          </button>
          <button
            onClick={() => setViewMode('space')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'space' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Visão Superior
          </button>
          <button
            onClick={() => setViewMode('sun')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'sun' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Visão do Sol
          </button>
          <button
            onClick={() => setViewMode('free')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'free' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Órbita Livre
          </button>
        </div>
      </div>

      {/* Main 3D Canvas + Angle Readout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 3D WebGL Canvas */}
        <div className="lg:col-span-8 relative bg-[#060a14] border border-slate-800 rounded-2xl overflow-hidden h-[480px] shadow-2xl flex items-center justify-center">
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Overlaid Controls Badge */}
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Fase: <strong>{Math.round(activePhaseAngle)}°</strong></span>
            <button
              onClick={() => setShowVectors(!showVectors)}
              className="ml-2 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200"
            >
              {showVectors ? 'Ocultar Vetores' : 'Mostrar Vetores'}
            </button>
          </div>

          {/* Angle Legend Overlay */}
          <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <span className="w-3 h-1 bg-amber-400 inline-block rounded"></span> Vetor Sol-Lua
              </span>
              <span className="flex items-center gap-1 text-sky-400 font-semibold">
                <span className="w-3 h-1 bg-sky-400 inline-block rounded"></span> Linha de Visão da Terra
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              {viewMode === 'earth' && 'Visualização idêntica à observada do céu terrestre.'}
              {viewMode === 'space' && 'Visão do polo eclíptico norte mostrando a geometria Sol-Terra-Lua.'}
              {viewMode === 'sun' && 'Visão a partir do Sol (disco lunar 100% iluminado).'}
              {viewMode === 'free' && 'Rotação livre do globo lunar.'}
            </div>
          </div>
        </div>

        {/* Detailed Geometric Angle Metrics Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Phase Angle Manual Slider Tester */}
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> Simulador de Ângulo de Fase
              </h3>
              {customPhaseAngle !== null && (
                <button
                  onClick={() => setCustomPhaseAngle(null)}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Restaurar Tempo Real
                </button>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>0° (Cheia)</span>
                <span className="font-bold text-amber-300">{Math.round(activePhaseAngle)}°</span>
                <span>180° (Nova)</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="1"
                value={activePhaseAngle}
                onChange={(e) => setCustomPhaseAngle(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Astronomical Angles Table */}
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Ângulos de Incidência Calculados
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/80">
                <span className="text-slate-400">Ângulo de Fase ($\psi$):</span>
                <span className="font-bold text-amber-300">{solarAngles.phaseAngle.toFixed(1)}°</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/80">
                <span className="text-slate-400">Elongação Solar:</span>
                <span className="font-bold text-sky-300">{solarAngles.elongation.toFixed(1)}°</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/80">
                <span className="text-slate-400">Incidência Solar no Centro:</span>
                <span className="font-bold text-emerald-300">{solarAngles.sunIncidenceAngleAtCenter.toFixed(1)}°</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/80">
                <span className="text-slate-400">Ponto Sub-Solar Lunar:</span>
                <span className="font-bold text-slate-200">
                  {solarAngles.subSolarLat.toFixed(1)}° lat, {solarAngles.subSolarLon.toFixed(1)}° lon
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/80">
                <span className="text-slate-400">Ponto Sub-Terrestre Lunar:</span>
                <span className="font-bold text-slate-200">
                  {solarAngles.subEarthLat.toFixed(1)}° lat, {solarAngles.subEarthLon.toFixed(1)}° lon
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/80">
                <span className="text-slate-400">Longitude do Terminador:</span>
                <span className="font-bold text-indigo-300">{solarAngles.terminatorLongitude.toFixed(1)}°</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
