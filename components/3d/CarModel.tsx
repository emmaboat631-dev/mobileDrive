'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface CarMaterialSpec {
  bodyHex: string;
  bodyFinish: 'metallic' | 'solid' | 'pearl' | 'matte';
  wheelStyle: 'performance' | 'sport' | 'carbon' | 'luxury';
  headlightsOn: boolean;
}

/** Silhouette variants. Mapped from Vehicle['bodyType'] in CarViewer. */
export type CarSilhouette = 'coupe' | 'sedan' | 'sports' | 'suv' | 'wagon' | 'pickup';

interface CarModelProps extends CarMaterialSpec {
  autoRotate?: boolean;
  silhouette?: CarSilhouette;
}

/**
 * Per-silhouette proportions. All offsets/sizes are in the car's local units.
 * Keep wheelbase symmetric around x=0 so OrbitControls targets the car centre.
 */
interface Proportions {
  length: number;       // overall body length (x)
  width: number;        // overall body width (z)
  bodyHeight: number;   // lower-body thickness
  cabinLength: number;  // greenhouse length (x)
  cabinHeight: number;  // greenhouse height (y above body)
  cabinOffsetX: number; // greenhouse offset along x (positive = toward front)
  roofY: number;        // roof top height (y)
  hoodSlope: number;    // forward hood tilt (negative = nose-down)
  trunkY: number;       // rear deck height (y)
  wheelbase: number;    // front-rear wheel distance / 2
  trackHalf: number;    // half-track (z offset of wheels)
  wheelRadius: number;
  tireWidth: number;
  rideHeight: number;   // wheel centre y
}

const SILHOUETTES: Record<CarSilhouette, Proportions> = {
  coupe:  { length: 4.0, width: 1.78, bodyHeight: 0.42, cabinLength: 2.0, cabinHeight: 0.52, cabinOffsetX: -0.05, roofY: 1.30, hoodSlope: -0.06, trunkY: 0.82, wheelbase: 1.35, trackHalf: 0.90, wheelRadius: 0.42, tireWidth: 0.22, rideHeight: 0.40 },
  sports: { length: 4.1, width: 1.80, bodyHeight: 0.36, cabinLength: 1.6, cabinHeight: 0.44, cabinOffsetX: -0.35, roofY: 1.18, hoodSlope: -0.09, trunkY: 0.72, wheelbase: 1.45, trackHalf: 0.92, wheelRadius: 0.44, tireWidth: 0.24, rideHeight: 0.36 },
  sedan:  { length: 4.4, width: 1.80, bodyHeight: 0.46, cabinLength: 2.3, cabinHeight: 0.58, cabinOffsetX: -0.10, roofY: 1.36, hoodSlope: -0.04, trunkY: 0.88, wheelbase: 1.55, trackHalf: 0.90, wheelRadius: 0.40, tireWidth: 0.22, rideHeight: 0.42 },
  wagon:  { length: 4.6, width: 1.82, bodyHeight: 0.48, cabinLength: 2.7, cabinHeight: 0.60, cabinOffsetX: -0.30, roofY: 1.40, hoodSlope: -0.04, trunkY: 1.00, wheelbase: 1.60, trackHalf: 0.90, wheelRadius: 0.40, tireWidth: 0.22, rideHeight: 0.44 },
  suv:    { length: 4.6, width: 1.95, bodyHeight: 0.60, cabinLength: 2.6, cabinHeight: 0.78, cabinOffsetX: -0.15, roofY: 1.70, hoodSlope: -0.02, trunkY: 1.10, wheelbase: 1.55, trackHalf: 0.95, wheelRadius: 0.48, tireWidth: 0.28, rideHeight: 0.52 },
  pickup: { length: 4.9, width: 1.95, bodyHeight: 0.58, cabinLength: 1.8, cabinHeight: 0.70, cabinOffsetX:  0.30, roofY: 1.60, hoodSlope: -0.02, trunkY: 1.05, wheelbase: 1.70, trackHalf: 0.95, wheelRadius: 0.48, tireWidth: 0.28, rideHeight: 0.50 },
};

/**
 * Procedural "demo" sports coupe built from primitives.
 * Separate meshes for body, roof/glass, wheels, lights so materials
 * can be updated independently from the configurator state.
 * Replace this with <GLTFCar/> when a licensed GLB is available.
 */
export function CarModel({
  bodyHex,
  bodyFinish,
  wheelStyle,
  headlightsOn,
  autoRotate = false,
  silhouette = 'coupe',
}: CarModelProps) {
  const p = SILHOUETTES[silhouette];
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && group.current) {
      group.current.rotation.y += delta * 0.18;
    }
  });

  const bodyMaterial = useMemo(() => {
    const base = new THREE.Color(bodyHex);
    const metalness =
      bodyFinish === 'matte' ? 0.1 : bodyFinish === 'solid' ? 0.4 : bodyFinish === 'pearl' ? 0.7 : 0.9;
    const roughness =
      bodyFinish === 'matte' ? 0.85 : bodyFinish === 'solid' ? 0.45 : bodyFinish === 'pearl' ? 0.25 : 0.2;
    return new THREE.MeshPhysicalMaterial({
      color: base,
      metalness,
      roughness,
      clearcoat: bodyFinish === 'matte' ? 0.0 : 0.9,
      clearcoatRoughness: bodyFinish === 'matte' ? 0.8 : 0.08,
      reflectivity: bodyFinish === 'matte' ? 0.1 : 0.6,
    });
  }, [bodyHex, bodyFinish]);

  const trimMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#111214'),
        metalness: 0.5,
        roughness: 0.5,
      }),
    [],
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#0C1016'),
        metalness: 0,
        roughness: 0.05,
        transmission: 0.55,
        transparent: true,
        opacity: 0.65,
        ior: 1.45,
      }),
    [],
  );

  const headlightMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F5F7FB'),
      emissive: new THREE.Color(headlightsOn ? '#FFFFFF' : '#000000'),
      emissiveIntensity: headlightsOn ? 2.4 : 0,
      metalness: 0.1,
      roughness: 0.1,
    });
  }, [headlightsOn]);

  const taillightMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4a0b0b'),
      emissive: new THREE.Color('#C72525'),
      emissiveIntensity: headlightsOn ? 1.4 : 0.25,
      metalness: 0.1,
      roughness: 0.3,
    });
  }, [headlightsOn]);

  const bodyY = p.rideHeight + p.bodyHeight / 2 + 0.08;
  const sillY = p.rideHeight + 0.02;
  const greenhouseY = bodyY + p.bodyHeight / 2 + p.cabinHeight / 2;
  const windowShade = p.cabinHeight * 0.6;
  const noseX = p.length / 2;
  const tailX = -p.length / 2;
  const windshieldX = p.cabinOffsetX + p.cabinLength / 2;
  const rearWindowX = p.cabinOffsetX - p.cabinLength / 2;
  const hoodLen = Math.max(0.6, noseX - windshieldX - 0.1);
  const trunkLen = Math.max(0.5, (rearWindowX - tailX) - 0.1);
  const hoodX = windshieldX + hoodLen / 2 + 0.05;
  const trunkX = rearWindowX - trunkLen / 2 - 0.05;
  const headlightY = p.trunkY - 0.07;

  return (
    <group ref={group} position={[0, 0, 0]} dispose={null}>
      {/* Lower sill / rocker */}
      <mesh position={[0, sillY, 0]} castShadow receiveShadow>
        <boxGeometry args={[p.length - 0.1, 0.22, p.width - 0.03]} />
        <primitive object={trimMaterial} attach="material" />
      </mesh>

      {/* Main body volume */}
      <mesh position={[0, bodyY, 0]} castShadow receiveShadow>
        <boxGeometry args={[p.length - 0.3, p.bodyHeight, p.width]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      {/* Hood (sloped forward) */}
      <mesh position={[hoodX, p.trunkY - 0.04, 0]} rotation={[0, 0, p.hoodSlope]} castShadow receiveShadow>
        <boxGeometry args={[hoodLen, 0.18, p.width - 0.1]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      {/* Trunk / rear deck */}
      <mesh position={[trunkX, p.trunkY, 0]} rotation={[0, 0, Math.abs(p.hoodSlope) * 0.6]} castShadow receiveShadow>
        <boxGeometry args={[trunkLen, 0.18, p.width - 0.1]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      {/* Greenhouse / cabin */}
      <mesh position={[p.cabinOffsetX, greenhouseY, 0]} castShadow receiveShadow>
        <boxGeometry args={[p.cabinLength, p.cabinHeight, p.width - 0.23]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      {/* Windshield */}
      <mesh position={[windshieldX, greenhouseY, 0]} rotation={[0, 0, -0.62]} castShadow>
        <boxGeometry args={[0.9, 0.08, p.width - 0.28]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Rear window (steeper on wagons/SUVs) */}
      <mesh
        position={[rearWindowX, greenhouseY, 0]}
        rotation={[0, 0, silhouette === 'wagon' || silhouette === 'suv' || silhouette === 'pickup' ? 0.25 : 0.6]}
        castShadow
      >
        <boxGeometry args={[0.9, 0.08, p.width - 0.28]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Side windows (both sides) */}
      <mesh position={[p.cabinOffsetX, greenhouseY + windowShade / 2 - 0.12, (p.width - 0.21) / 2]}>
        <boxGeometry args={[p.cabinLength - 0.3, windowShade, 0.02]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      <mesh position={[p.cabinOffsetX, greenhouseY + windowShade / 2 - 0.12, -(p.width - 0.21) / 2]}>
        <boxGeometry args={[p.cabinLength - 0.3, windowShade, 0.02]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Roof */}
      <mesh position={[p.cabinOffsetX, p.roofY, 0]} castShadow>
        <boxGeometry args={[p.cabinLength - 0.1, 0.05, p.width - 0.26]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      {/* Pickup bed walls */}
      {silhouette === 'pickup' && (
        <>
          <mesh position={[tailX + 0.55, bodyY + p.bodyHeight / 2 + 0.08, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.1, 0.3, p.width - 0.06]} />
            <primitive object={bodyMaterial} attach="material" />
          </mesh>
          <mesh position={[tailX + 1.1, bodyY + p.bodyHeight / 2 + 0.18, 0]}>
            <boxGeometry args={[0.02, 0.1, p.width - 0.1]} />
            <primitive object={trimMaterial} attach="material" />
          </mesh>
        </>
      )}

      {/* Front bumper */}
      <mesh position={[noseX + 0.03, p.rideHeight + 0.05, 0]} castShadow>
        <boxGeometry args={[0.18, 0.3, p.width - 0.08]} />
        <primitive object={trimMaterial} attach="material" />
      </mesh>

      {/* Rear bumper */}
      <mesh position={[tailX - 0.03, p.rideHeight + 0.08, 0]} castShadow>
        <boxGeometry args={[0.18, 0.3, p.width - 0.08]} />
        <primitive object={trimMaterial} attach="material" />
      </mesh>

      {/* Headlights */}
      <mesh position={[noseX + 0.03, headlightY, (p.width - 0.6) / 2]}>
        <boxGeometry args={[0.08, 0.12, 0.42]} />
        <primitive object={headlightMaterial} attach="material" />
      </mesh>
      <mesh position={[noseX + 0.03, headlightY, -(p.width - 0.6) / 2]}>
        <boxGeometry args={[0.08, 0.12, 0.42]} />
        <primitive object={headlightMaterial} attach="material" />
      </mesh>

      {/* Taillights */}
      <mesh position={[tailX - 0.03, headlightY + 0.03, (p.width - 0.6) / 2]}>
        <boxGeometry args={[0.06, 0.14, 0.45]} />
        <primitive object={taillightMaterial} attach="material" />
      </mesh>
      <mesh position={[tailX - 0.03, headlightY + 0.03, -(p.width - 0.6) / 2]}>
        <boxGeometry args={[0.06, 0.14, 0.45]} />
        <primitive object={taillightMaterial} attach="material" />
      </mesh>

      {/* Wheels — positions scale with wheelbase/track */}
      <Wheel position={[ p.wheelbase, p.rideHeight,  p.trackHalf]} style={wheelStyle} radius={p.wheelRadius} width={p.tireWidth} />
      <Wheel position={[ p.wheelbase, p.rideHeight, -p.trackHalf]} style={wheelStyle} radius={p.wheelRadius} width={p.tireWidth} />
      <Wheel position={[-p.wheelbase, p.rideHeight,  p.trackHalf]} style={wheelStyle} radius={p.wheelRadius} width={p.tireWidth} />
      <Wheel position={[-p.wheelbase, p.rideHeight, -p.trackHalf]} style={wheelStyle} radius={p.wheelRadius} width={p.tireWidth} />

      {/* ---------- Added detail passes (purely additive — don't change silhouette) ---------- */}

      {/* Side mirrors — small aero caps at the front of each window */}
      <mesh position={[windshieldX - 0.1, greenhouseY + windowShade * 0.1, (p.width - 0.1) / 2]} castShadow>
        <boxGeometry args={[0.18, 0.1, 0.14]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      <mesh position={[windshieldX - 0.1, greenhouseY + windowShade * 0.1, -(p.width - 0.1) / 2]} castShadow>
        <boxGeometry args={[0.18, 0.1, 0.14]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      {/* Front grille — 5 horizontal slats across the lower bumper */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={`grille-${i}`}
          position={[noseX + 0.05, p.rideHeight - 0.03 + i * 0.06, 0]}
        >
          <boxGeometry args={[0.03, 0.025, p.width - 0.5]} />
          <primitive object={trimMaterial} attach="material" />
        </mesh>
      ))}

      {/* Headlight glass covers — slightly ahead of the emissive housing */}
      <mesh position={[noseX + 0.07, headlightY, (p.width - 0.6) / 2]}>
        <boxGeometry args={[0.03, 0.14, 0.46]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      <mesh position={[noseX + 0.07, headlightY, -(p.width - 0.6) / 2]}>
        <boxGeometry args={[0.03, 0.14, 0.46]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Rear diffuser — three vertical ribs under the rear bumper */}
      {[-0.25, 0, 0.25].map((z) => (
        <mesh key={`diff-${z}`} position={[tailX - 0.06, p.rideHeight - 0.02, z]}>
          <boxGeometry args={[0.08, 0.14, 0.06]} />
          <primitive object={trimMaterial} attach="material" />
        </mesh>
      ))}

      {/* Exhaust tips — twin dark cylinders flanking the rear */}
      <mesh
        position={[tailX - 0.12, p.rideHeight - 0.02, (p.width - 0.8) / 2]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.055, 0.055, 0.1, 16]} />
        <primitive object={trimMaterial} attach="material" />
      </mesh>
      <mesh
        position={[tailX - 0.12, p.rideHeight - 0.02, -(p.width - 0.8) / 2]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.055, 0.055, 0.1, 16]} />
        <primitive object={trimMaterial} attach="material" />
      </mesh>

      {/* Door seam line — thin dark strip running along both sides at belt height */}
      <mesh position={[0, bodyY + p.bodyHeight / 2 - 0.02, p.width / 2 - 0.002]}>
        <boxGeometry args={[p.length - 0.6, 0.025, 0.004]} />
        <primitive object={trimMaterial} attach="material" />
      </mesh>
      <mesh position={[0, bodyY + p.bodyHeight / 2 - 0.02, -(p.width / 2 - 0.002)]}>
        <boxGeometry args={[p.length - 0.6, 0.025, 0.004]} />
        <primitive object={trimMaterial} attach="material" />
      </mesh>

      {/* A-pillar + C-pillar accents — slim upright darker members at window corners */}
      <mesh position={[windshieldX - 0.08, greenhouseY, p.width / 2 - 0.12]} rotation={[0, 0, -0.62]}>
        <boxGeometry args={[0.08, p.cabinHeight * 0.9, 0.06]} />
        <primitive object={trimMaterial} attach="material" />
      </mesh>
      <mesh position={[windshieldX - 0.08, greenhouseY, -(p.width / 2 - 0.12)]} rotation={[0, 0, -0.62]}>
        <boxGeometry args={[0.08, p.cabinHeight * 0.9, 0.06]} />
        <primitive object={trimMaterial} attach="material" />
      </mesh>
      <mesh position={[rearWindowX + 0.08, greenhouseY, p.width / 2 - 0.12]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.08, p.cabinHeight * 0.9, 0.06]} />
        <primitive object={trimMaterial} attach="material" />
      </mesh>
      <mesh position={[rearWindowX + 0.08, greenhouseY, -(p.width / 2 - 0.12)]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.08, p.cabinHeight * 0.9, 0.06]} />
        <primitive object={trimMaterial} attach="material" />
      </mesh>

      {/* Headlight glow projection on ground */}
      {headlightsOn && (
        <mesh position={[noseX + 1.4, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.6, 1.6]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.08} />
        </mesh>
      )}
    </group>
  );
}

function Wheel({
  position,
  style,
  radius = 0.42,
  width = 0.22,
}: {
  position: [number, number, number];
  style: CarMaterialSpec['wheelStyle'];
  radius?: number;
  width?: number;
}) {
  const rimR = radius * 0.72;
  const spokeR = radius * 0.4;
  const hubOffset = width / 2 + 0.001;
  const tireMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0A0B0D'),
        metalness: 0.1,
        roughness: 0.95,
      }),
    [],
  );

  const rimColor = useMemo(() => {
    switch (style) {
      case 'performance':
        return '#1A1D22';
      case 'sport':
        return '#C9CDD3';
      case 'carbon':
        return '#1C1C1E';
      case 'luxury':
        return '#E7E9EC';
    }
  }, [style]);

  const rimMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(rimColor),
        metalness: style === 'carbon' ? 0.3 : 1.0,
        roughness: style === 'carbon' ? 0.4 : 0.2,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
      }),
    [rimColor, style],
  );

  const spokeCount = style === 'performance' ? 10 : style === 'luxury' ? 12 : style === 'sport' ? 5 : 6;

  const outward = position[2] > 0 ? 1 : -1;

  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, width, 32]} />
        <primitive object={tireMaterial} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.001 * outward]}>
        <cylinderGeometry args={[rimR, rimR, width + 0.02, 32]} />
        <primitive object={rimMaterial} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, hubOffset * outward]}>
        <cylinderGeometry args={[rimR * 0.27, rimR * 0.27, 0.03, 16]} />
        <primitive object={rimMaterial} attach="material" />
      </mesh>
      {Array.from({ length: spokeCount }).map((_, i) => {
        const angle = (i / spokeCount) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * spokeR * 0.55, Math.sin(angle) * spokeR * 0.55, (hubOffset - 0.01) * outward]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[spokeR * 1.3, 0.04, 0.02]} />
            <primitive object={rimMaterial} attach="material" />
          </mesh>
        );
      })}
    </group>
  );
}
