'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Environment,
  OrbitControls,
  ContactShadows,
  AdaptiveDpr,
  Preload,
  Html,
  useProgress,
} from '@react-three/drei';
import * as THREE from 'three';
import { Maximize2, Minimize2 } from 'lucide-react';
import { CarModel, type CarMaterialSpec, type CarSilhouette } from './CarModel';
import { GLTFCarWithFallback } from './GLTFCarWithFallback';
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

// Preset positions assume the car's nose points along -Z (the glTF convention
// most Sketchfab exports follow). Positive Z is "in front of" the car. Y is
// up. X is the car's right-hand side.
const CAMERA_PRESETS: Record<CameraPreset, [number, number, number]> = {
  orbit: [3.2, 1.9, 3.2],
  front: [0.001, 1.2, 4.2],
  rear: [0.001, 1.2, -4.2],
  side: [4.2, 1.0, 0.001],
  interior: [1.0, 1.0, 1.0],
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

  // Pick HQ model (2k/4k textures) for desktop, standard (1k) for mobile/tablet.
  // Breakpoint: 1024px matches our desktop layout threshold.
  const [resolvedModelPath, setResolvedModelPath] = useState<string | undefined>(modelPath);
  useEffect(() => {
    if (!modelPath) {
      setResolvedModelPath(undefined);
      return;
    }
    const mql = window.matchMedia('(min-width: 1024px)');
    const apply = () => {
      if (mql.matches && modelPath.endsWith('.glb') && !modelPath.endsWith('-hq.glb')) {
        setResolvedModelPath(modelPath.replace(/\.glb$/, '-hq.glb'));
      } else {
        setResolvedModelPath(modelPath);
      }
    };
    apply();
    mql.addEventListener('change', apply);
    return () => mql.removeEventListener('change', apply);
  }, [modelPath]);

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
    <div
      ref={wrapRef}
      className={className}
      style={{
        // Sketchfab-style radial backdrop — soft center light fading to dark
        // edges. Sits behind the Canvas as a page-level background.
        background: 'radial-gradient(120% 85% at 50% 55%, #3a3d44 0%, #22242a 55%, #0f1013 100%)',
      }}
    >
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
        camera={{ position: CAMERA_PRESETS.orbit, fov: 55 }}
      >
        {/* Studio lighting rig — key / fill / rim */}
        <ambientLight intensity={0.22} />
        {/* Key light — high and warm, casts the main shadow */}
        <directionalLight
          position={[6, 9, 5]}
          intensity={1.25}
          color="#FFF4E6"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-7}
          shadow-camera-right={7}
          shadow-camera-top={7}
          shadow-camera-bottom={-7}
          shadow-bias={-0.0004}
        />
        {/* Fill light — cool, from the opposite side, softens shadows */}
        <directionalLight position={[-6, 4, -2]} intensity={0.55} color="#8FB2FF" />
        {/* Rim light — behind the car, picks out the silhouette */}
        <directionalLight position={[0, 3, -8]} intensity={0.65} color="#D7E8FF" />
        {/* Underglow — subtle, lifts the chassis off the floor */}
        <pointLight position={[0, 0.6, 0]} intensity={0.25} color="#8AA5FF" distance={6} decay={2} />

        {/* HDRI environment for reflections — studio preset reads cleaner on
            metallic paint than the busy 'city' preset */}
        <Suspense fallback={null}>
          <Environment preset="studio" background={false} />
        </Suspense>

        {/* Floor — neutral mid-grey backdrop (Sketchfab-like) so dark cars read
            cleanly without a bright studio hotspot behind them. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color="#2a2d33" roughness={0.75} metalness={0.3} />
        </mesh>

        {/* Soft contact shadow under car — crisper core, softer penumbra */}
        <ContactShadows
          position={[0, 0.015, 0]}
          opacity={0.72}
          scale={12}
          blur={2.2}
          far={5}
          resolution={1024}
          color="#000000"
        />

        {/* The car — GLB when provided (with procedural fallback if it fails
            to load), otherwise straight procedural. */}
        <Suspense fallback={<LoadingOverlay />}>
          {resolvedModelPath ? (
            <GLTFCarWithFallback
              modelPath={resolvedModelPath}
              bodyHex={bodyHex}
              bodyFinish={bodyFinish}
              wheelStyle={wheelStyle}
              headlightsOn={headlightsOn}
              autoRotate={autoRotate}
              fallbackSilhouette={resolvedSilhouette}
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
          target={[0, 0.8, 0]}
        />

        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
}

/**
 * In-canvas loading overlay shown while a GLB is downloading.
 * Styled like Sketchfab's: "Loading 3D model" + a thin horizontal progress bar.
 */
function LoadingOverlay() {
  const { progress, active } = useProgress();
  return (
    <Html center zIndexRange={[20, 10]} style={{ pointerEvents: 'none' }}>
      <div style={{
        minWidth: 280,
        padding: '14px 18px',
        borderRadius: 12,
        background: 'rgba(10, 11, 14, 0.72)',
        backdropFilter: 'blur(6px)',
        color: '#E7E9EC',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: 13,
        letterSpacing: 0.2,
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: 10, opacity: 0.9 }}>
          {active ? 'Loading 3D model' : 'Preparing scene'}
        </div>
        <div style={{
          height: 3,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 999,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.max(5, Math.min(100, progress))}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4a9eff, #8cc5ff)',
            transition: 'width 180ms ease-out',
          }} />
        </div>
      </div>
    </Html>
  );
}
