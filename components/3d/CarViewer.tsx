'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Environment,
  OrbitControls,
  ContactShadows,
  AdaptiveDpr,
  Preload,
} from '@react-three/drei';
import * as THREE from 'three';
import { CarModel, type CarMaterialSpec } from './CarModel';
import { GLTFCar } from './GLTFCar';
import type { CameraPreset } from '@/store/configuratorStore';

interface CarViewerProps extends CarMaterialSpec {
  /** When set, loads the GLB at this path; otherwise falls back to the procedural car. */
  modelPath?: string;
  autoRotate?: boolean;
  interactive?: boolean;
  cameraPreset?: CameraPreset;
  className?: string;
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
}: CarViewerProps) {
  // drei's OrbitControls ref is an instance from three-stdlib; type as any to avoid
  // depending on that package name here. It exposes .object (the camera) and .update().
  const controlsRef = useRef<any>(null);

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
    <div className={className}>
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
