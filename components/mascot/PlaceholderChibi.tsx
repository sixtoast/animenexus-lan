"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMascotStore } from "@/lib/mascot/store";
import { distXZ } from "@/lib/mascot/navigation";
import { motionFromEmotions } from "@/lib/mascot/emotions";

export function PlaceholderChibi() {
  const root = useRef<THREE.Group>(null);
  const pose = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const tip = useRef<THREE.Mesh>(null);
  const leftEye = useRef<THREE.Mesh>(null);
  const rightEye = useRef<THREE.Mesh>(null);
  const leftArm = useRef<THREE.Mesh>(null);
  const rightArm = useRef<THREE.Mesh>(null);
  const cheekL = useRef<THREE.Mesh>(null);
  const cheekR = useRef<THREE.Mesh>(null);
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

    const motion = motionFromEmotions(emotions);

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
        const speed = Math.max(0.2, motion.walkSpeed);
        const nx = position.x + ((target.x - position.x) / d) * speed * dt;
        const nz = position.z + ((target.z - position.z) / d) * speed * dt;
        setPosition({ x: nx, z: nz });
        facing.current = Math.atan2(
          target.x - position.x,
          target.z - position.z,
        );
      }
    }

    const jit = motion.jitter;
    g.position.x = position.x + (jit ? Math.sin(t * 20) * jit : 0);
    g.position.z = position.z;
    g.position.y = -0.15;
    g.rotation.y = THREE.MathUtils.lerp(
      g.rotation.y,
      facing.current,
      1 - Math.pow(0.001, dt),
    );

    const breathe = Math.sin(t * (1.8 + emotions.energy)) * 0.02;
    let bob = Math.sin(t * 1.6) * 0.02 * motion.bobAmp;
    let scale = 0.96 + motion.poseOpenness * 0.08;
    let rotZ = 0;
    let armSwing = 0;
    let headPitch = motion.headDroop;

    switch (anim) {
      case "walk": {
        const gait = t * (8 + emotions.energy * 4);
        bob = Math.abs(Math.sin(gait)) * 0.055 * motion.bobAmp;
        armSwing = Math.sin(gait) * 0.4 * motion.armAmp;
        rotZ = Math.sin(gait) * 0.035;
        break;
      }
      case "happy":
        scale *= 1 + Math.sin(t * 14) * 0.045;
        bob = Math.abs(Math.sin(t * 10)) * 0.11 * motion.bobAmp;
        rotZ = Math.sin(t * 12) * 0.08;
        armSwing = Math.sin(t * 14) * 0.55 * motion.armAmp;
        headPitch = -0.05;
        break;
      case "wave":
        bob = 0.04 + breathe;
        armSwing = 0.25 + Math.sin(t * 9) * 0.9;
        rotZ = Math.sin(t * 6) * 0.1;
        break;
      case "think":
        bob = breathe;
        headPitch = -0.22 + Math.sin(t * 1.2) * 0.05 + motion.headDroop;
        armSwing = 0.12;
        rotZ = 0.06;
        break;
      case "sleep":
        bob = -0.08 + breathe * 0.5;
        rotZ = -0.18;
        headPitch = 0.35;
        break;
      case "surprised":
        scale *= 1.06;
        bob = 0.08;
        headPitch = -0.12;
        armSwing = 0.5;
        break;
      default:
        bob = bob + breathe * 0.5;
        if (moving) {
          const gait = t * 10;
          bob = Math.abs(Math.sin(gait)) * 0.05 * motion.bobAmp;
          armSwing = Math.sin(gait) * 0.35 * motion.armAmp;
        }
    }

    p.position.y = bob;
    p.rotation.z = rotZ;
    p.scale.setScalar(scale * (1 + breathe * 0.35));

    if (leftArm.current) leftArm.current.rotation.x = armSwing;
    if (rightArm.current) {
      rightArm.current.rotation.x = anim === "wave" ? -0.2 : -armSwing;
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

    // Lantern tip glow tracks happiness/attention
    if (tip.current) {
      const mat = tip.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.2 + motion.glow * 0.7;
    }

    // Cheek flush with happiness
    const cheekOp = 0.35 + emotions.happiness * 0.4;
    if (cheekL.current) {
      (cheekL.current.material as THREE.MeshStandardMaterial).opacity = cheekOp;
    }
    if (cheekR.current) {
      (cheekR.current.material as THREE.MeshStandardMaterial).opacity = cheekOp;
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
          <mesh ref={cheekL} position={[-0.22, -0.08, 0.32]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#f0a090" transparent opacity={0.55} />
          </mesh>
          <mesh ref={cheekR} position={[0.22, -0.08, 0.32]}>
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
          <mesh ref={tip} position={[0, 0.48, 0]}>
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
