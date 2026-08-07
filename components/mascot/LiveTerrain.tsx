"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  buildTerrain,
  pickWanderPlatform,
  planHops,
  type TerrainPlatform,
} from "@/lib/mascot/page-terrain";
import {
  createTerrainBody,
  jumpToward,
  snapToPlatform,
  stepTerrain,
  steerTerrain,
  type TerrainBody,
} from "@/lib/mascot/terrain-physics";
import { useMascotStore } from "@/lib/mascot/store";
import { motionFromEmotions } from "@/lib/mascot/emotions";
import { tryRunSkit } from "@/lib/mascot/run-skit";

function CameraFit() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(0, 0, 3.0);
    cam.lookAt(0, 0, 0);
    cam.fov = 50;
    cam.aspect = size.width / size.height;
    cam.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

/** Invisible collision slabs — no visual clutter */
function InvisiblePlatforms({ platforms }: { platforms: TerrainPlatform[] }) {
  return (
    <group visible={false}>
      {platforms.map((p) => (
        <mesh key={p.id} position={[p.x, p.y, 0]}>
          <boxGeometry args={[p.hw * 2, p.hh * 2, 0.02]} />
          <meshBasicMaterial />
        </mesh>
      ))}
    </group>
  );
}

function LiveActor({
  platforms,
  aggressive,
}: {
  platforms: TerrainPlatform[];
  aggressive: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const pose = useRef<THREE.Group>(null);
  const tip = useRef<THREE.Mesh>(null);
  const body = useRef<TerrainBody>(createTerrainBody(0, -0.5));
  const queue = useRef<TerrainPlatform[]>([]);
  const nextPick = useRef(Date.now() + 800);
  const emotions = useMascotStore((s) => s.emotions);
  const setAnim = useMascotStore((s) => s.setAnim);
  const requestAnim = useMascotStore((s) => s.requestAnim);
  const anim = useMascotStore((s) => s.anim);
  const runBehaviourTick = useMascotStore((s) => s.runBehaviourTick);

  // Keep behaviour + skits alive while roaming
  useEffect(() => {
    const id = window.setInterval(() => {
      runBehaviourTick();
      tryRunSkit();
    }, aggressive ? 2800 : 4000);
    return () => window.clearInterval(id);
  }, [aggressive, runBehaviourTick]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const motion = motionFromEmotions(emotions);
    const g = root.current;
    const p = pose.current;
    if (!g || !p || platforms.length < 2) return;

    // Constant roaming — short gaps between hops
    const gap = aggressive ? 1800 + Math.random() * 1200 : 2800 + Math.random() * 2000;
    if (
      Date.now() > nextPick.current &&
      body.current.onGround &&
      queue.current.length === 0
    ) {
      const next = pickWanderPlatform(
        platforms,
        body.current.platformId ?? undefined,
      );
      if (next) {
        const current =
          platforms.find((x) => x.id === body.current.platformId) ?? null;
        queue.current = planHops(current, next, platforms);
        const first = queue.current[0];
        if (first) {
          // Prefer jumps — climbing energy
          body.current = jumpToward(body.current, first);
          setAnim("jump");
        }
      }
      nextPick.current = Date.now() + gap;
    }

    const goal = queue.current[0];
    if (goal) {
      const goalY = goal.y + goal.hh;
      if (body.current.onGround) {
        body.current = steerTerrain(
          body.current,
          goal.x,
          goalY,
          Math.max(0.55, motion.walkSpeed * 1.5),
        );
        if (anim !== "walk" && anim !== "jump") setAnim("walk");
      }
      if (
        Math.abs(body.current.x - goal.x) < Math.max(0.1, goal.hw * 0.7) &&
        Math.abs(body.current.y - goalY) < 0.22
      ) {
        body.current = snapToPlatform(body.current, goal);
        queue.current.shift();
        if (queue.current.length === 0) {
          // Brief pose then go again soon
          setAnim("idle");
          if (Math.random() < 0.2) requestAnim({ anim: "wave", holdMs: 600 });
          else if (Math.random() < 0.15)
            requestAnim({ anim: "point", holdMs: 700 });
          nextPick.current = Date.now() + (aggressive ? 600 : 1200);
        } else {
          const nxt = queue.current[0];
          body.current = jumpToward(body.current, nxt);
          setAnim("jump");
        }
      }
    }

    body.current = stepTerrain(body.current, platforms, dt);

    g.position.set(body.current.x, body.current.y + 0.08, 0.3);
    if (Math.abs(body.current.vx) > 0.03) {
      g.rotation.y = THREE.MathUtils.lerp(
        g.rotation.y,
        body.current.vx > 0 ? 0.55 : -0.55,
        0.14,
      );
    }

    const breathe = Math.sin(t * 2.4) * 0.01;
    const walkBob =
      (anim === "walk" || anim === "jump") && body.current.onGround
        ? Math.abs(Math.sin(t * 11)) * 0.025
        : anim === "jump"
          ? 0.04
          : 0;
    p.position.y = walkBob + breathe;
    p.scale.setScalar(0.48 * (anim === "jump" ? 1.08 : 1));

    if (tip.current) {
      const mat = tip.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.35 + motion.glow * 0.5;
    }
  });

  return (
    <group
      ref={root}
      onClick={(e) => {
        e.stopPropagation();
        useMascotStore.getState().dispatch({ type: "click" });
      }}
    >
      <group ref={pose}>
        <mesh position={[0, -0.1, 0]}>
          <capsuleGeometry args={[0.09, 0.11, 4, 8]} />
          <meshStandardMaterial color="#e8a598" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#f5d0c8" roughness={0.4} />
        </mesh>
        <mesh ref={tip} position={[0, 0.24, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial
            color="#f0a090"
            emissive="#f0a090"
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>
    </group>
  );
}

type Props = {
  reducedMotion?: boolean;
  lowPower?: boolean;
};

export function LiveTerrain({ reducedMotion, lowPower }: Props) {
  const [platforms, setPlatforms] = useState<TerrainPlatform[]>([]);

  useEffect(() => {
    const rebuild = () => setPlatforms(buildTerrain());
    // Wait a tick for layout paint
    const t0 = window.setTimeout(rebuild, 100);
    const t1 = window.setTimeout(rebuild, 500);
    const id = window.setInterval(rebuild, lowPower ? 1600 : 900);
    window.addEventListener("resize", rebuild);
    window.addEventListener("scroll", rebuild, { passive: true });
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearInterval(id);
      window.removeEventListener("resize", rebuild);
      window.removeEventListener("scroll", rebuild);
    };
  }, [lowPower]);

  if (reducedMotion) {
    // Soft fallback: no constant motion
    return null;
  }

  return (
    <div className="live-terrain" aria-hidden>
      <Canvas
        className="live-terrain-canvas"
        dpr={lowPower ? [1, 1] : [1, 1.5]}
        gl={{
          alpha: true,
          antialias: !lowPower,
          powerPreference: "low-power",
          failIfMajorPerformanceCaveat: false,
        }}
        frameloop="always"
        camera={{ position: [0, 0, 3.0], fov: 50 }}
        style={{ pointerEvents: "none" }}
      >
        <CameraFit />
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 3, 4]} intensity={0.7} />
        <InvisiblePlatforms platforms={platforms} />
        <LiveActor platforms={platforms} aggressive={!lowPower} />
      </Canvas>
    </div>
  );
}
