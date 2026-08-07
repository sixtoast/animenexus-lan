"use client";

/**
 * Occasional page climbs from the corner home base.
 * Most of the time the companion rests bottom-right; sometimes they hop UI / modals.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  buildTerrain,
  getHomePlatform,
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

type Phase = "home" | "outing" | "returning";

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

function Actor({
  platforms,
  lowPower,
}: {
  platforms: TerrainPlatform[];
  lowPower: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const pose = useRef<THREE.Group>(null);
  const tip = useRef<THREE.Mesh>(null);
  const body = useRef<TerrainBody | null>(null);
  const queue = useRef<TerrainPlatform[]>([]);
  const phase = useRef<Phase>("home");
  const nextOuting = useRef(Date.now() + 8000 + Math.random() * 6000);
  const homeUntil = useRef(0);
  const emotions = useMascotStore((s) => s.emotions);
  const setAnim = useMascotStore((s) => s.setAnim);
  const requestAnim = useMascotStore((s) => s.requestAnim);
  const anim = useMascotStore((s) => s.anim);

  // Init at home corner
  useEffect(() => {
    const home = getHomePlatform(platforms);
    if (home) {
      body.current = snapToPlatform(createTerrainBody(), home);
    } else {
      body.current = createTerrainBody(0.9, -0.7);
    }
  }, [platforms.length]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const motion = motionFromEmotions(emotions);
    const g = root.current;
    const p = pose.current;
    if (!g || !p || !body.current || platforms.length < 1) return;

    const home = getHomePlatform(platforms);
    const now = Date.now();

    // Detect open modal → prioritize climbing it
    const modalOpen = platforms.some((x) => x.type === "modal");

    // Schedule outings (occasional, not constant)
    if (
      phase.current === "home" &&
      now > nextOuting.current &&
      now > homeUntil.current &&
      body.current.onGround &&
      queue.current.length === 0
    ) {
      const dest = pickWanderPlatform(
        platforms,
        body.current.platformId ?? undefined,
        modalOpen,
      );
      if (dest && dest.id !== "home-corner") {
        phase.current = "outing";
        const current =
          platforms.find((x) => x.id === body.current!.platformId) ?? home;
        queue.current = planHops(current, dest, platforms);
        const first = queue.current[0];
        if (first && body.current) {
          body.current = jumpToward(body.current, first);
          setAnim("jump");
        }
      }
      // Next outing in 12–28s (faster if modal)
      nextOuting.current =
        now +
        (modalOpen
          ? 4000 + Math.random() * 3000
          : lowPower
            ? 18000 + Math.random() * 12000
            : 12000 + Math.random() * 16000);
    }

    // After outing, return home
    if (
      phase.current === "outing" &&
      queue.current.length === 0 &&
      body.current.onGround &&
      home
    ) {
      // Linger briefly on UI then go home
      if (!homeUntil.current || now > homeUntil.current) {
        if (body.current.platformId !== "home-corner") {
          // just landed on UI — stay 2–4s then return
          if (homeUntil.current === 0) {
            homeUntil.current = now + 2000 + Math.random() * 2000;
            if (Math.random() < 0.35)
              requestAnim({ anim: "wave", holdMs: 700 });
            else if (Math.random() < 0.25)
              requestAnim({ anim: "point", holdMs: 800 });
          } else if (now > homeUntil.current) {
            phase.current = "returning";
            const current =
              platforms.find((x) => x.id === body.current!.platformId) ?? null;
            queue.current = planHops(current, home, platforms);
            const first = queue.current[0];
            if (first && body.current) {
              body.current = jumpToward(body.current, first);
              setAnim("jump");
            }
            homeUntil.current = 0;
          }
        }
      }
    }

    if (
      phase.current === "returning" &&
      queue.current.length === 0 &&
      body.current.platformId === "home-corner"
    ) {
      phase.current = "home";
      setAnim("idle");
      homeUntil.current = 0;
    }

    // Follow hop queue
    const goal = queue.current[0];
    if (goal && body.current) {
      const goalY = goal.y + goal.hh;
      if (body.current.onGround) {
        body.current = steerTerrain(
          body.current,
          goal.x,
          goalY,
          Math.max(0.5, motion.walkSpeed * 1.4),
        );
        if (anim !== "walk" && anim !== "jump") setAnim("walk");
      }
      if (
        Math.abs(body.current.x - goal.x) < Math.max(0.08, goal.hw * 0.75) &&
        Math.abs(body.current.y - goalY) < 0.2
      ) {
        body.current = snapToPlatform(body.current, goal);
        queue.current.shift();
        if (queue.current.length > 0) {
          const nxt = queue.current[0];
          body.current = jumpToward(body.current, nxt);
          setAnim("jump");
        } else if (phase.current === "returning") {
          setAnim("idle");
        } else if (phase.current === "outing") {
          setAnim("idle");
          homeUntil.current = Date.now() + 2000 + Math.random() * 2000;
        }
      }
    }

    body.current = stepTerrain(body.current, platforms, dt);

    // Soft idle bob at home
    g.position.set(body.current.x, body.current.y + 0.08, 0.3);
    if (Math.abs(body.current.vx) > 0.03) {
      g.rotation.y = THREE.MathUtils.lerp(
        g.rotation.y,
        body.current.vx > 0 ? 0.5 : -0.5,
        0.12,
      );
    }

    const breathe = Math.sin(t * 2.2) * 0.01;
    const walkBob =
      anim === "walk" && body.current.onGround
        ? Math.abs(Math.sin(t * 10)) * 0.022
        : anim === "jump"
          ? 0.035
          : phase.current === "home"
            ? Math.sin(t * 1.5) * 0.012
            : 0;
    p.position.y = walkBob + breathe;
    p.scale.setScalar(0.5 * (anim === "jump" ? 1.07 : 1));

    if (tip.current) {
      const mat = tip.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity =
        0.3 + motion.glow * 0.45 + (phase.current === "home" ? 0.1 : 0);
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
            emissiveIntensity={0.55}
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

export function LiveTerrain({ reducedMotion, lowPower = false }: Props) {
  const [platforms, setPlatforms] = useState<TerrainPlatform[]>([]);

  useEffect(() => {
    const rebuild = () => setPlatforms(buildTerrain());
    const t0 = window.setTimeout(rebuild, 80);
    const t1 = window.setTimeout(rebuild, 400);
    const id = window.setInterval(rebuild, lowPower ? 1800 : 1100);
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

  if (reducedMotion) return null;

  return (
    <div className="live-terrain" aria-hidden>
      <Canvas
        className="live-terrain-canvas"
        dpr={lowPower ? [1, 1] : [1, 1.4]}
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
        <ambientLight intensity={0.85} />
        <directionalLight position={[2, 3, 4]} intensity={0.65} />
        <Actor platforms={platforms} lowPower={lowPower} />
      </Canvas>
    </div>
  );
}
