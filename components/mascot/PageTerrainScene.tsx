"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { buildTerrain, pickWanderPlatform, type TerrainPlatform } from "@/lib/mascot/page-terrain";
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

function TerrainChibi({
  platforms,
}: {
  platforms: TerrainPlatform[];
}) {
  const root = useRef<THREE.Group>(null);
  const pose = useRef<THREE.Group>(null);
  const body = useRef<TerrainBody>(createTerrainBody());
  const target = useRef<TerrainPlatform | null>(null);
  const nextPick = useRef(0);
  const emotions = useMascotStore((s) => s.emotions);
  const anim = useMascotStore((s) => s.anim);
  const setAnim = useMascotStore((s) => s.setAnim);
  const requestAnim = useMascotStore((s) => s.requestAnim);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const motion = motionFromEmotions(emotions);
    const g = root.current;
    const p = pose.current;
    if (!g || !p || !platforms.length) return;

    // Periodic wander to another UI platform
    if (Date.now() > nextPick.current && body.current.onGround) {
      const next = pickWanderPlatform(platforms, body.current.platformId ?? undefined);
      if (next) {
        target.current = next;
        const higher = next.y + next.hh > body.current.y + 0.15;
        if (higher || Math.random() < 0.35) {
          body.current = jumpToward(body.current, next);
          setAnim("jump");
        } else {
          setAnim("walk");
        }
      }
      nextPick.current = Date.now() + 3500 + Math.random() * 2500;
    }

    if (target.current) {
      const tg = target.current;
      const goalY = tg.y + tg.hh;
      if (body.current.onGround) {
        body.current = steerTerrain(
          body.current,
          tg.x,
          goalY,
          Math.max(0.4, motion.walkSpeed * 1.2),
        );
      }
      if (
        Math.abs(body.current.x - tg.x) < tg.hw * 0.6 &&
        Math.abs(body.current.y - goalY) < 0.15
      ) {
        body.current = snapToPlatform(body.current, tg);
        target.current = null;
        setAnim("idle");
        if (Math.random() < 0.3) requestAnim({ anim: "wave", holdMs: 800 });
      }
    }

    body.current = stepTerrain(body.current, platforms, dt);

    g.position.x = body.current.x;
    g.position.y = body.current.y + 0.12;
    g.position.z = 0.15;

    // Face movement
    if (Math.abs(body.current.vx) > 0.05) {
      g.rotation.y = body.current.vx > 0 ? 0.4 : -0.4;
    }

    const breathe = Math.sin(t * 2) * 0.015;
    let bob = body.current.onGround ? Math.sin(t * 8) * 0.02 * (anim === "walk" ? 1 : 0.3) : 0.05;
    p.position.y = bob + breathe;
    p.scale.setScalar(0.55 + breathe);
  });

  return (
    <group ref={root}>
      <group ref={pose}>
        <mesh position={[0, -0.15, 0]}>
          <capsuleGeometry args={[0.12, 0.14, 4, 8]} />
          <meshStandardMaterial color="#e8a598" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.2, 20, 20]} />
          <meshStandardMaterial color="#f5d0c8" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <sphereGeometry args={[0.045, 10, 10]} />
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

function PlatformMeshes({
  platforms,
  onSelect,
}: {
  platforms: TerrainPlatform[];
  onSelect: (p: TerrainPlatform) => void;
}) {
  return (
    <group>
      {platforms.map((p) => (
        <mesh
          key={p.id}
          position={[p.x, p.y, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(p);
          }}
        >
          <boxGeometry args={[p.hw * 2, p.hh * 2, 0.04]} />
          <meshStandardMaterial
            color={
              p.type === "card"
                ? "#4a3a32"
                : p.type === "floor"
                  ? "#2a2220"
                  : "#3d322c"
            }
            transparent
            opacity={p.type === "floor" ? 0.25 : 0.4}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

function CameraFit() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(0, 0, 3.2);
    cam.lookAt(0, 0, 0);
    cam.fov = 50;
    cam.aspect = size.width / size.height;
    cam.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

type Props = {
  onClose: () => void;
  reducedMotion?: boolean;
};

export function PageTerrainScene({ onClose, reducedMotion }: Props) {
  const [platforms, setPlatforms] = useState<TerrainPlatform[]>([]);
  const bodyRef = useRef<TerrainBody | null>(null);
  const targetRef = useRef<TerrainPlatform | null>(null);

  useEffect(() => {
    const rebuild = () => setPlatforms(buildTerrain());
    rebuild();
    const id = window.setInterval(rebuild, 1200);
    window.addEventListener("resize", rebuild);
    window.addEventListener("scroll", rebuild, { passive: true });
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", rebuild);
      window.removeEventListener("scroll", rebuild);
    };
  }, []);

  const onSelect = (p: TerrainPlatform) => {
    // Store selection for next frame via custom event on window
    window.dispatchEvent(
      new CustomEvent("mascot:terrain-goto", { detail: p }),
    );
  };

  return (
    <div className="page-terrain-overlay" role="dialog" aria-label="Page terrain">
      <div className="page-terrain-chrome">
        <span className="page-terrain-title">Terrain mode</span>
        <span className="page-terrain-hint">Tap platforms · scroll updates map</span>
        <button type="button" className="page-terrain-close" onClick={onClose}>
          Exit
        </button>
      </div>
      <Canvas
        className="page-terrain-canvas"
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        }}
        frameloop={reducedMotion ? "demand" : "always"}
        camera={{ position: [0, 0, 3.2], fov: 50 }}
      >
        <CameraFit />
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 4]} intensity={0.9} />
        <PlatformMeshes platforms={platforms} onSelect={onSelect} />
        <TerrainActor platforms={platforms} />
      </Canvas>
    </div>
  );
}

function TerrainActor({ platforms }: { platforms: TerrainPlatform[] }) {
  const root = useRef<THREE.Group>(null);
  const pose = useRef<THREE.Group>(null);
  const body = useRef<TerrainBody>(createTerrainBody());
  const target = useRef<TerrainPlatform | null>(null);
  const nextPick = useRef(Date.now() + 2000);
  const emotions = useMascotStore((s) => s.emotions);
  const setAnim = useMascotStore((s) => s.setAnim);
  const requestAnim = useMascotStore((s) => s.requestAnim);
  const anim = useMascotStore((s) => s.anim);

  useEffect(() => {
    const onGoto = (e: Event) => {
      const p = (e as CustomEvent).detail as TerrainPlatform;
      target.current = p;
      if (body.current.onGround) {
        body.current = jumpToward(body.current, p);
        setAnim("jump");
      }
    };
    window.addEventListener("mascot:terrain-goto", onGoto);
    return () => window.removeEventListener("mascot:terrain-goto", onGoto);
  }, [setAnim]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const motion = motionFromEmotions(emotions);
    const g = root.current;
    const p = pose.current;
    if (!g || !p || !platforms.length) return;

    if (Date.now() > nextPick.current && body.current.onGround && !target.current) {
      const next = pickWanderPlatform(platforms, body.current.platformId ?? undefined);
      if (next) {
        target.current = next;
        if (next.y + next.hh > body.current.y + 0.12 || Math.random() < 0.4) {
          body.current = jumpToward(body.current, next);
          setAnim("jump");
        } else setAnim("walk");
      }
      nextPick.current = Date.now() + 4000 + Math.random() * 3000;
    }

    if (target.current) {
      const tg = target.current;
      const goalY = tg.y + tg.hh;
      if (body.current.onGround) {
        body.current = steerTerrain(
          body.current,
          tg.x,
          goalY,
          Math.max(0.45, motion.walkSpeed * 1.3),
        );
      }
      if (
        Math.abs(body.current.x - tg.x) < Math.max(0.12, tg.hw * 0.7) &&
        Math.abs(body.current.y - goalY) < 0.18
      ) {
        body.current = snapToPlatform(body.current, tg);
        target.current = null;
        setAnim("idle");
        if (Math.random() < 0.35) requestAnim({ anim: "wave", holdMs: 900 });
      }
    }

    body.current = stepTerrain(body.current, platforms, dt);

    g.position.set(body.current.x, body.current.y + 0.1, 0.2);
    if (Math.abs(body.current.vx) > 0.04) {
      g.rotation.y = THREE.MathUtils.lerp(
        g.rotation.y,
        body.current.vx > 0 ? 0.5 : -0.5,
        0.1,
      );
    }

    const breathe = Math.sin(t * 2.2) * 0.012;
    const walkBob =
      anim === "walk" && body.current.onGround
        ? Math.abs(Math.sin(t * 10)) * 0.03
        : 0;
    p.position.y = walkBob + breathe;
    p.scale.setScalar(0.5 * (anim === "jump" ? 1.05 : 1));
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
        <mesh position={[0, -0.12, 0]}>
          <capsuleGeometry args={[0.1, 0.12, 4, 8]} />
          <meshStandardMaterial color="#e8a598" />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#f5d0c8" />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color="#f0a090"
            emissive="#f0a090"
            emissiveIntensity={0.7}
          />
        </mesh>
      </group>
    </group>
  );
}
