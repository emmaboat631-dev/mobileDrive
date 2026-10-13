'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Environment,
  OrbitControls,
  ContactShadows,
  AdaptiveDpr,
  Preload,
} from '@react-three/drei';
import * as THREE from 'three';
import { Maximize2, Minimize2 } from 'lucide-react';
import { CarModel, type CarMaterialSpec, type CarSilhouette } from './CarModel';
import { GLTFCar } from './GLTFCar';
import type { CameraPreset } from '@/store/configuratorStore';
import type { BodyType } from '@/types/vehicle';

interface CarViewerProps extends CarMaterialSpec {
  /** When set, loads the GLB at this path; otherwise falls back to the procedural car. */
  modelPath?: string;
  autoRotate?: boolean;
  interactive?: boolean;
  cameraPreset?: CameraPreset;
  className?: string;
  /** Pick the procedural silhouette, or let it be derived from `bodyType`. */
  silhouette?: CarSilhouette;
  bodyType?: BodyType;
  /** Render a built-in fullscreen button in the viewer corner. */
  showFullscreen?: boolean;
}

/** Map Vehicle.bodyType → procedural silhouette. */
export function silhouetteFromBodyType(b: BodyType | undefined): CarSilhouette {
  switch (b) {
    case 'SUV':     return 'suv';
    case 'Sedan':   return 'sedan';
    case 'Coupe':   return 'coupe';
    case 'Sports':  return 'sports';
    case 'Luxury':  return 'wagon';
    case 'Pickup':  return 'pickup';
    case 'Electric':
    default:        return 'sedan';
  }
}

const CAMERA_PRESETS: Record<CameraPreset, [number, number, number]> = {
  orbit: [6.5, 2.6, 6.5],
  front: [8, 1.6, 0.001],
  rear: [-8, 1.6, 0.001],
  side: [0.001, 1.4, 8],
  interior: [1.5, 1.4, 1.5],
};

export function CarViewer({
  modelPath,
  bodyHex,
  bodyFinish,
  wheelStyle,
  headlightsOn,
  autoRotate = false,
  interactive = true,
  cameraPreset = 'orbit',
  className,
  silhouette,
  bodyType,
  showFullscreen = false,
}: CarViewerProps) {
  // drei's OrbitControls ref is an instance from three-stdlib; type as any to avoid
  // depending on that package name here. It exposes .object (the camera) and .update().
  const controlsRef = useRef<any>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const resolvedSilhouette: CarSilhouette = silhouette ?? silhouetteFromBodyType(bodyType);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (el.requestFullscreen) {
      void el.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const target = CAMERA_PRESETS[cameraPreset];
    const camera = controls.object as THREE.PerspectiveCamera;

    // Smooth transition between presets
    const start = camera.position.clone();
    const end = new THREE.Vector3(...target);
    const duration = 650;
    const t0 = performance.now();

    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(start, end, e);
      controls.update();
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cameraPreset]);

  return (
    <div ref={wrapRef} className={className} style={{ position: 'relative' }}>
      {showFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-ink-900/60 text-ink-100 backdrop-blur transition hover:bg-ink-900/90 hover:text-white"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      )}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: CAMERA_PRESETS.orbit, fov: 32 }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[6, 8, 4]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
        />
        <directionalLight position={[-5, 5, -3]} intensity={0.4} color="#8aa5ff" />
        <directionalLight position={[0, 3, -6]} intensity={0.3} color="#ffd3a1" />

        {/* HDRI environment for reflections */}
        <Suspense fallback={null}>
          <Environment preset="city" background={false} />
        </Suspense>

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color="#0A0B0E" roughness={0.6} metalness={0.3} />
        </mesh>

        {/* Soft contact shadow under car */}
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.55}
          scale={14}
          blur={2.6}
          far={6}
          resolution={1024}
          color="#000000"
        />

        {/* The car — GLB when provided, procedural fallback otherwise */}
        <Suspense fallback={null}>
          {modelPath ? (
            <GLTFCar
              modelPath={modelPath}
              bodyHex={bodyHex}
              bodyFinish={bodyFinish}
              wheelStyle={wheelStyle}
              headlightsOn={headlightsOn}
              autoRotate={autoRotate}
            />
          ) : (
            <CarModel
              bodyHex={bodyHex}
              bodyFinish={bodyFinish}
              wheelStyle={wheelStyle}
              headlightsOn={headlightsOn}
              autoRotate={autoRotate}
              silhouette={resolvedSilhouette}
            />
          )}
          <Preload all />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enabled={interactive}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={4.5}
          maxDistance={14}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 0.6, 0]}
        />

        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
}
