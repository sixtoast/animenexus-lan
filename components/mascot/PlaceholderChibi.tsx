"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMascotStore } from "@/lib/mascot/store";
import { distXZ } from "@/lib/mascot/navigation";

const WALK_SPEED = 0.55;

/**
 * Procedural placeholder chibi + M2 locomotion on habitat XZ plane.
 */
export function PlaceholderChibi() {
  const root = useRef<THREE.Group>(null);
  const pose = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const leftEye = useRef<THREE.Mesh>(null);
  const rightEye = useRef<THREE.Mesh>(null);
  const leftArm = useRef<THREE.Mesh>(null);
  const rightArm = useRef<THREE.Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const facing = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const store = useMascotStore.getState();
    const { anim, target, position, setPosition, setTarget, setAnim, emotions } =
      store;

    const g = root.current;
    const p = pose.current;
    if (!g || !p) return;

    // —— Locomotion ——
    let moving = false;
    if (target && (anim === "walk" || anim === "idle")) {
      const d = distXZ(position.x, position.z, target.x, target.z);
      if (d < 0.04) {
        setPosition(target);
        setTarget(null);
        if (anim === "walk") setAnim("idle");
      } else {
        moving = true;
        if (anim !== "walk") setAnim("walk");
        const speed = WALK_SPEED * (0.65 + emotions.energy * 0.5);
        const nx = position.x + ((target.x - position.x) / d) * speed * dt;
        const nz = position.z + ((target.z - position.z) / d) * speed * dt;
        setPosition({ x: nx, z: nz });
        facing.current = Math.atan2(target.x - position.x, target.z - position.z);
      }
    }

    g.position.x = position.x;
    g.position.z = position.z;
    g.position.y = -0.15;

    // Smooth yaw
    const yaw = facing.current;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, yaw, 1 - Math.pow(0.001, dt));

    // —— Pose / anim layer ——
    const breathe = Math.sin(t * 2.2) * 0.02;
    let bob = Math.sin(t * 1.6) * 0.025;
    let scale = 1;
    let rotZ = 0;
    let armSwing = 0;

    if (anim === "walk" || moving) {
      const gait = t * 10;
      bob = Math.abs(Math.sin(gait)) * 0.06;
      armSwing = Math.sin(gait) * 0.45;
      rotZ = Math.sin(gait) * 0.04;
    } else if (anim === "happy") {
      scale = 1 + Math.sin(t * 14) * 0.04;
      bob = Math.abs(Math.sin(t * 10)) * 0.12;
      rotZ = Math.sin(t * 12) * 0.08;
      armSwing = Math.sin(t * 14) * 0.6;
    } else if (anim === "wave") {
      bob = 0.04 + breathe;
      armSwing = 0.2 + Math.sin(t * 9) * 0.9;
      rotZ = Math.sin(t * 6) * 0.1;
    } else if (anim === "sleep") {
      bob = -0.06 + breathe;
      rotZ = -0.15;
    } else {
      bob = bob + breathe * 0.5;
    }

    p.position.y = bob;
    p.rotation.z = rotZ;
    p.scale.setScalar(scale * (1 + breathe * 0.35));

    if (leftArm.current) {
      leftArm.current.rotation.x = armSwing;
    }
    if (rightArm.current) {
      rightArm.current.rotation.x = -armSwing * (anim === "wave" ? 0.2 : 1);
      if (anim === "wave") {
        rightArm.current.rotation.z = -0.5 + Math.sin(t * 9) * 0.5;
      } else {
        rightArm.current.rotation.z = -0.4;
      }
    }

    // Head look
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

    const blink =
      anim === "sleep" ? 0.12 : Math.sin(t * 0.7) > 0.96 ? 0.15 : 1;
    if (leftEye.current) leftEye.current.scale.y = blink;
    if (rightEye.current) rightEye.current.scale.y = blink;
  });

  return (
    <group
      ref={root}
      onPointerMove={(e) => {
        pointer.current.x = THREE.MathUtils.clamp(e.point.x * 1.2, -1, 1);
        pointer.current.y = THREE.MathUtils.clamp(e.point.y * 1.2, -1, 1);
      }}
    >
      <group ref={pose}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <capsuleGeometry args={[0.22, 0.28, 6, 12]} />
          <meshStandardMaterial
            color="#e8a598"
            roughness={0.45}
            metalness={0.05}
          />
        </mesh>

        <group ref={head} position={[0, 0.22, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.42, 32, 32]} />
            <meshStandardMaterial color="#f5d0c8" roughness={0.4} />
          </mesh>
          <mesh position={[-0.22, -0.08, 0.32]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#f0a090" transparent opacity={0.55} />
          </mesh>
          <mesh position={[0.22, -0.08, 0.32]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#f0a090" transparent opacity={0.55} />
          </mesh>
          <mesh ref={leftEye} position={[-0.14, 0.06, 0.36]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#2a1810" />
          </mesh>
          <mesh ref={rightEye} position={[0.14, 0.06, 0.36]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#2a1810" />
          </mesh>
          <mesh position={[-0.12, 0.09, 0.42]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <mesh position={[0.16, 0.09, 0.42]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <mesh position={[0, -0.1, 0.38]} rotation={[0.2, 0, 0]}>
            <torusGeometry args={[0.06, 0.012, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#c4786a" />
          </mesh>
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

        <mesh
          ref={leftArm}
          position={[-0.32, -0.28, 0]}
          rotation={[0, 0, 0.4]}
        >
          <capsuleGeometry args={[0.07, 0.16, 4, 8]} />
          <meshStandardMaterial color="#e8a598" />
        </mesh>
        <mesh
          ref={rightArm}
          position={[0.32, -0.28, 0]}
          rotation={[0, 0, -0.4]}
        >
          <capsuleGeometry args={[0.07, 0.16, 4, 8]} />
          <meshStandardMaterial color="#e8a598" />
        </mesh>
      </group>
    </group>
  );
}
