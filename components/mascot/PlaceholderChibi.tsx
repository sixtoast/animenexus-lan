"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMascotStore } from "@/lib/mascot/store";
import { distXZ } from "@/lib/mascot/navigation";

const WALK_SPEED = 0.55;

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
  const decayAcc = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const store = useMascotStore.getState();
    const {
      anim,
      target,
      position,
      setPosition,
      setTarget,
      setAnim,
      emotions,
      decayEmotions,
      dispatch,
    } = store;

    // Emotion decay + ambient tick (~1Hz)
    decayAcc.current += dt;
    if (decayAcc.current > 1) {
      decayEmotions(decayAcc.current);
      dispatch({ type: "tick" });
      decayAcc.current = 0;
    }

    const g = root.current;
    const p = pose.current;
    if (!g || !p) return;

    let moving = false;
    if (target && anim !== "sleep" && anim !== "happy" && anim !== "wave") {
      const d = distXZ(position.x, position.z, target.x, target.z);
      if (d < 0.04) {
        setPosition(target);
        setTarget(null);
        if (anim === "walk") setAnim("idle");
      } else {
        moving = true;
        if (anim !== "walk" && anim !== "surprised") setAnim("walk");
        const speed = WALK_SPEED * (0.55 + emotions.energy * 0.55);
        const nx = position.x + ((target.x - position.x) / d) * speed * dt;
        const nz = position.z + ((target.z - position.z) / d) * speed * dt;
        setPosition({ x: nx, z: nz });
        facing.current = Math.atan2(
          target.x - position.x,
          target.z - position.z,
        );
      }
    }

    g.position.x = position.x;
    g.position.z = position.z;
    g.position.y = -0.15;
    g.rotation.y = THREE.MathUtils.lerp(
      g.rotation.y,
      facing.current,
      1 - Math.pow(0.001, dt),
    );

    const breathe = Math.sin(t * 2.2) * 0.02;
    let bob = Math.sin(t * 1.6) * 0.025;
    let scale = 1;
    let rotZ = 0;
    let armSwing = 0;
    let headPitch = 0;

    switch (anim) {
      case "walk": {
        const gait = t * 10;
        bob = Math.abs(Math.sin(gait)) * 0.06;
        armSwing = Math.sin(gait) * 0.45;
        rotZ = Math.sin(gait) * 0.04;
        break;
      }
      case "happy":
        scale = 1 + Math.sin(t * 14) * 0.04;
        bob = Math.abs(Math.sin(t * 10)) * 0.12;
        rotZ = Math.sin(t * 12) * 0.08;
        armSwing = Math.sin(t * 14) * 0.6;
        break;
      case "wave":
        bob = 0.04 + breathe;
        armSwing = 0.25 + Math.sin(t * 9) * 0.95;
        rotZ = Math.sin(t * 6) * 0.1;
        break;
      case "think":
        bob = breathe;
        headPitch = -0.25 + Math.sin(t * 1.2) * 0.05;
        armSwing = 0.15;
        rotZ = 0.06;
        break;
      case "sleep":
        bob = -0.08 + breathe * 0.5;
        rotZ = -0.18;
        headPitch = 0.35;
        break;
      case "surprised":
        scale = 1.06;
        bob = 0.08;
        headPitch = -0.1;
        armSwing = 0.5;
        break;
      default:
        bob = bob + breathe * 0.5;
        if (moving) {
          const gait = t * 10;
          bob = Math.abs(Math.sin(gait)) * 0.06;
          armSwing = Math.sin(gait) * 0.4;
        }
    }

    p.position.y = bob;
    p.rotation.z = rotZ;
    p.scale.setScalar(scale * (1 + breathe * 0.35));

    if (leftArm.current) leftArm.current.rotation.x = armSwing;
    if (rightArm.current) {
      rightArm.current.rotation.x =
        anim === "wave" ? -0.2 : -armSwing;
      rightArm.current.rotation.z =
        anim === "wave" ? -0.5 + Math.sin(t * 9) * 0.55 : -0.4;
    }

    if (head.current) {
      const lookY = pointer.current.x * 0.25;
      const lookX = -pointer.current.y * 0.15 + headPitch;
      head.current.rotation.y = THREE.MathUtils.lerp(
        head.current.rotation.y,
        lookY,
        0.08,
      );
      head.current.rotation.x = THREE.MathUtils.lerp(
        head.current.rotation.x,
        lookX,
        0.08,
      );
    }

    const blink =
      anim === "sleep" ? 0.1 : Math.sin(t * 0.7) > 0.96 ? 0.15 : 1;
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

        <mesh ref={leftArm} position={[-0.32, -0.28, 0]} rotation={[0, 0, 0.4]}>
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
