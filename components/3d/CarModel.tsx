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

interface CarModelProps extends CarMaterialSpec {
  autoRotate?: boolean;
}

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
}: CarModelProps) {
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

  return (
    <group ref={group} position={[0, 0, 0]} dispose={null}>
      {/* ---------- Lower body (sill / rocker) ---------- */}
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.22, 1.75]} />
        <primitive object={trimMaterial} attach="material" />
      </mesh>

      {/* ---------- Main body volume ---------- */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.0, 0.42, 1.78]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      {/* Hood (sloped) */}
      <mesh position={[1.4, 0.78, 0]} rotation={[0, 0, -0.06]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.18, 1.68]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      {/* Trunk (slightly higher than hood) */}
      <mesh position={[-1.45, 0.82, 0]} rotation={[0, 0, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.18, 1.68]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      {/* ---------- Greenhouse / cabin ---------- */}
      <mesh position={[-0.05, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.52, 1.55]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      {/* Windshield (angled) */}
      <mesh position={[0.95, 1.0, 0]} rotation={[0, 0, -0.62]} castShadow>
        <boxGeometry args={[0.9, 0.08, 1.5]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Rear window */}
      <mesh position={[-1.0, 1.0, 0]} rotation={[0, 0, 0.6]} castShadow>
        <boxGeometry args={[0.9, 0.08, 1.5]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Side windows */}
      <mesh position={[-0.05, 1.15, 0.78]}>
        <boxGeometry args={[1.7, 0.3, 0.02]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      <mesh position={[-0.05, 1.15, -0.78]}>
        <boxGeometry args={[1.7, 0.3, 0.02]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Roof */}
      <mesh position={[-0.05, 1.3, 0]} castShadow>
        <boxGeometry args={[1.9, 0.05, 1.52]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      {/* Front bumper */}
      <mesh position={[2.05, 0.42, 0]} castShadow>
        <boxGeometry args={[0.18, 0.3, 1.7]} />
        <primitive object={trimMaterial} attach="material" />
      </mesh>

      {/* Rear bumper */}
      <mesh position={[-2.05, 0.46, 0]} castShadow>
        <boxGeometry args={[0.18, 0.3, 1.7]} />
        <primitive object={trimMaterial} attach="material" />
      </mesh>

      {/* ---------- Headlights ---------- */}
      <mesh position={[2.08, 0.75, 0.55]}>
        <boxGeometry args={[0.08, 0.12, 0.42]} />
        <primitive object={headlightMaterial} attach="material" />
      </mesh>
      <mesh position={[2.08, 0.75, -0.55]}>
        <boxGeometry args={[0.08, 0.12, 0.42]} />
        <primitive object={headlightMaterial} attach="material" />
      </mesh>

      {/* ---------- Taillights ---------- */}
      <mesh position={[-2.08, 0.78, 0.55]}>
        <boxGeometry args={[0.06, 0.14, 0.45]} />
        <primitive object={taillightMaterial} attach="material" />
      </mesh>
      <mesh position={[-2.08, 0.78, -0.55]}>
        <boxGeometry args={[0.06, 0.14, 0.45]} />
        <primitive object={taillightMaterial} attach="material" />
      </mesh>

      {/* ---------- Wheels (4) ---------- */}
      <Wheel position={[1.35, 0.4, 0.9]} style={wheelStyle} />
      <Wheel position={[1.35, 0.4, -0.9]} style={wheelStyle} />
      <Wheel position={[-1.35, 0.4, 0.9]} style={wheelStyle} />
      <Wheel position={[-1.35, 0.4, -0.9]} style={wheelStyle} />

      {/* Headlight glow projection on ground */}
      {headlightsOn && (
        <mesh position={[3.4, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
}: {
  position: [number, number, number];
  style: CarMaterialSpec['wheelStyle'];
}) {
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

  return (
    <group position={position}>
      {/* Tire */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.22, 32]} />
        <primitive object={tireMaterial} attach="material" />
      </mesh>
      {/* Rim face */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, position[2] > 0 ? 0.001 : -0.001]}>
        <cylinderGeometry args={[0.3, 0.3, 0.24, 32]} />
        <primitive object={rimMaterial} attach="material" />
      </mesh>
      {/* Center hub */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, position[2] > 0 ? 0.12 : -0.12]}>
        <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
        <primitive object={rimMaterial} attach="material" />
      </mesh>
      {/* Spokes */}
      {Array.from({ length: spokeCount }).map((_, i) => {
        const angle = (i / spokeCount) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.17, Math.sin(angle) * 0.17, position[2] > 0 ? 0.11 : -0.11]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.22, 0.04, 0.02]} />
            <primitive object={rimMaterial} attach="material" />
          </mesh>
        );
      })}
    </group>
  );
}
