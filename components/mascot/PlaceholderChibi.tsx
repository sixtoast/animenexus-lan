"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMascotStore } from "@/lib/mascot/store";

/**
 * Procedural placeholder chibi — swap for GLTF in a later milestone.
 * Oversized head, small body, warm lantern palette.
 */
export function PlaceholderChibi() {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const leftEye = useRef<THREE.Mesh>(null);
  const rightEye = useRef<THREE.Mesh>(null);
  const anim = useMascotStore((s) => s.anim);
  const pointer = useRef({ x: 0, y: 0 });

  // Mild look-at from pointer events on habitat
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;

    // Idle breathe
    const breathe = Math.sin(t * 2.2) * 0.02;
    const bob = Math.sin(t * 1.6) * 0.03;

    let scale = 1;
    let yOff = bob;
    let rotZ = 0;

    if (anim === "happy") {
      scale = 1 + Math.sin(t * 14) * 0.04;
      yOff = Math.abs(Math.sin(t * 10)) * 0.12;
      rotZ = Math.sin(t * 12) * 0.08;
    } else if (anim === "wave") {
      yOff = bob + 0.04;
      rotZ = Math.sin(t * 8) * 0.15;
    } else if (anim === "sleep") {
      yOff = -0.05 + breathe;
      rotZ = -0.12;
    }

    g.position.y = yOff;
    g.rotation.z = rotZ;
    g.scale.setScalar(scale * (1 + breathe * 0.5));

    // Head tracks pointer softly
    if (head.current) {
      const targetX = pointer.current.x * 0.25;
      const targetY = pointer.current.y * 0.15;
      head.current.rotation.y = THREE.MathUtils.lerp(
        head.current.rotation.y,
        targetX,
        0.08,
      );
      head.current.rotation.x = THREE.MathUtils.lerp(
        head.current.rotation.x,
        -targetY,
        0.08,
      );
    }

    // Blink occasionally
    const blink = Math.sin(t * 0.7) > 0.96 ? 0.15 : 1;
    if (leftEye.current) leftEye.current.scale.y = blink;
    if (rightEye.current) rightEye.current.scale.y = blink;
  });

  return (
    <group
      ref={group}
      position={[0, -0.15, 0]}
      onPointerMove={(e) => {
        // normalize roughly from mesh space
        pointer.current.x = THREE.MathUtils.clamp(e.point.x * 1.2, -1, 1);
        pointer.current.y = THREE.MathUtils.clamp(e.point.y * 1.2, -1, 1);
      }}
    >
      {/* Body */}
      <mesh ref={body} position={[0, -0.35, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.28, 6, 12]} />
        <meshStandardMaterial color="#e8a598" roughness={0.45} metalness={0.05} />
      </mesh>

      {/* Head */}
      <group ref={head} position={[0, 0.22, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshStandardMaterial color="#f5d0c8" roughness={0.4} />
        </mesh>
        {/* Cheeks */}
        <mesh position={[-0.22, -0.08, 0.32]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#f0a090" transparent opacity={0.55} />
        </mesh>
        <mesh position={[0.22, -0.08, 0.32]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#f0a090" transparent opacity={0.55} />
        </mesh>
        {/* Eyes */}
        <mesh ref={leftEye} position={[-0.14, 0.06, 0.36]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#2a1810" />
        </mesh>
        <mesh ref={rightEye} position={[0.14, 0.06, 0.36]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#2a1810" />
        </mesh>
        {/* Eye shine */}
        <mesh position={[-0.12, 0.09, 0.42]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        <mesh position={[0.16, 0.09, 0.42]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        {/* Mouth */}
        <mesh position={[0, -0.1, 0.38]} rotation={[0.2, 0, 0]}>
          <torusGeometry args={[0.06, 0.012, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#c4786a" />
        </mesh>
        {/* Antenna / lantern tip */}
        <mesh position={[0, 0.48, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial
            color="#f0a090"
            emissive="#f0a090"
            emissiveIntensity={0.45}
          />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
          <meshStandardMaterial color="#d4847a" />
        </mesh>
      </group>

      {/* Tiny arms */}
      <mesh position={[-0.32, -0.28, 0]} rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[0.07, 0.16, 4, 8]} />
        <meshStandardMaterial color="#e8a598" />
      </mesh>
      <mesh position={[0.32, -0.28, 0]} rotation={[0, 0, -0.4]}>
        <capsuleGeometry args={[0.07, 0.16, 4, 8]} />
        <meshStandardMaterial color="#e8a598" />
      </mesh>
    </group>
  );
}
