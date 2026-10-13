'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { CarMaterialSpec } from './CarModel';

interface GLTFCarProps extends CarMaterialSpec {
  modelPath: string;
  autoRotate?: boolean;
}

/**
 * GLB/GLTF loader for licensed vehicle models.
 *
 * Expected mesh/material naming convention (see public/models/README.md):
 *   Body_Paint, Body_Trim, Glass, Headlights, Taillights, Wheels,
 *   Interior_Seat, Interior_Trim
 *
 * Materials matching these names are patched at runtime from the configurator
 * state. Unknown materials are left untouched.
 */
export function GLTFCar({
  modelPath,
  bodyHex,
  bodyFinish,
  wheelStyle,
  headlightsOn,
  autoRotate = false,
}: GLTFCarProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);

  useFrame((_, delta) => {
    if (autoRotate && group.current) {
      group.current.rotation.y += delta * 0.18;
    }
  });

  const paintMaterial = useMemo(() => {
    const metalness =
      bodyFinish === 'matte' ? 0.1 : bodyFinish === 'solid' ? 0.4 : bodyFinish === 'pearl' ? 0.7 : 0.9;
    const roughness =
      bodyFinish === 'matte' ? 0.85 : bodyFinish === 'solid' ? 0.45 : bodyFinish === 'pearl' ? 0.25 : 0.2;
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(bodyHex),
      metalness,
      roughness,
      clearcoat: bodyFinish === 'matte' ? 0 : 0.9,
      clearcoatRoughness: bodyFinish === 'matte' ? 0.8 : 0.08,
    });
  }, [bodyHex, bodyFinish]);

  const rimColor = useMemo(() => {
    switch (wheelStyle) {
      case 'performance': return '#1A1D22';
      case 'sport':       return '#C9CDD3';
      case 'carbon':      return '#1C1C1E';
      case 'luxury':      return '#E7E9EC';
    }
  }, [wheelStyle]);

  const rimMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(rimColor),
        metalness: wheelStyle === 'carbon' ? 0.3 : 1,
        roughness: wheelStyle === 'carbon' ? 0.4 : 0.2,
        clearcoat: 0.6,
      }),
    [rimColor, wheelStyle],
  );

  // Patch materials onto the loaded scene by mesh/material name.
  useEffect(() => {
    const headlightEmissive = headlightsOn ? 2.4 : 0;
    const taillightEmissive = headlightsOn ? 1.4 : 0.25;

    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const mat = obj.material as THREE.Material | THREE.Material[];
      const name = (Array.isArray(mat) ? mat[0]?.name : mat?.name) ?? obj.name;

      if (name === 'Body_Paint') {
        obj.material = paintMaterial;
      } else if (name === 'Wheels' || name === 'Rim') {
        obj.material = rimMaterial;
      } else if (name === 'Headlights' && mat instanceof THREE.MeshStandardMaterial) {
        mat.emissive = new THREE.Color(headlightsOn ? '#FFFFFF' : '#000000');
        mat.emissiveIntensity = headlightEmissive;
        mat.needsUpdate = true;
      } else if (name === 'Taillights' && mat instanceof THREE.MeshStandardMaterial) {
        mat.emissive = new THREE.Color('#C72525');
        mat.emissiveIntensity = taillightEmissive;
        mat.needsUpdate = true;
      }

      obj.castShadow = true;
      obj.receiveShadow = true;
    });
  }, [scene, paintMaterial, rimMaterial, headlightsOn]);

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

// Preload is called by the viewer once the first vehicle with a modelPath is picked.
export const preloadGLTF = (path: string) => useGLTF.preload(path);
