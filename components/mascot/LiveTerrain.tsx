"use client";

/**
 * Corner home + occasional UI climbs.
 * Faces the camera; drag via an HTML handle that tracks the 3D body.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  buildTerrain,
  getHomePlatform,
  pickWanderPlatform,
  planHops,
  screenToWorld,
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

export type MascotScreenPos = { x: number; y: number; visible: boolean };

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
  dragging,
  dragWorld,
  onScreenPos,
  bodyRef,
}: {
  platforms: TerrainPlatform[];
  lowPower: boolean;
  dragging: boolean;
  dragWorld: { x: number; y: number } | null;
  onScreenPos: (p: MascotScreenPos) => void;
  bodyRef: React.MutableRefObject<TerrainBody | null>;
}) {
  const root = useRef<THREE.Group>(null);
  const pose = useRef<THREE.Group>(null);
  const tip = useRef<THREE.Mesh>(null);
  const queue = useRef<TerrainPlatform[]>([]);
  const phase = useRef<Phase>("home");
  const nextOuting = useRef(Date.now() + 8000 + Math.random() * 6000);
  const homeUntil = useRef(0);
  const facing = useRef(Math.PI); // face camera by default (meshes built toward +Z)
  const emotions = useMascotStore((s) => s.emotions);
  const setAnim = useMascotStore((s) => s.setAnim);
  const requestAnim = useMascotStore((s) => s.requestAnim);
  const anim = useMascotStore((s) => s.anim);
  const { camera, size } = useThree();

  useEffect(() => {
    const home = getHomePlatform(platforms);
    if (home) {
      bodyRef.current = snapToPlatform(createTerrainBody(), home);
    } else if (!bodyRef.current) {
      bodyRef.current = createTerrainBody(0.9, -0.7);
    }
  }, [platforms.length, bodyRef]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const motion = motionFromEmotions(emotions);
    const g = root.current;
    const p = pose.current;
    if (!g || !p || !bodyRef.current || platforms.length < 1) return;

    const body = bodyRef.current;
    const home = getHomePlatform(platforms);
    const now = Date.now();

    // —— Drag override ——
    if (dragging && dragWorld) {
      body.x = dragWorld.x;
      body.y = dragWorld.y;
      body.vx = 0;
      body.vy = 0;
      body.onGround = false;
      body.platformId = null;
      queue.current = [];
      phase.current = "outing";
      setAnim("surprised");
    } else {
      const modalOpen = platforms.some((x) => x.type === "modal");

      if (
        phase.current === "home" &&
        now > nextOuting.current &&
        now > homeUntil.current &&
        body.onGround &&
        queue.current.length === 0
      ) {
        const dest = pickWanderPlatform(
          platforms,
          body.platformId ?? undefined,
          modalOpen,
        );
        if (dest && dest.id !== "home-corner") {
          phase.current = "outing";
          const current =
            platforms.find((x) => x.id === body.platformId) ?? home;
          queue.current = planHops(current, dest, platforms);
          const first = queue.current[0];
          if (first) {
            bodyRef.current = jumpToward(body, first);
            setAnim("jump");
          }
        }
        nextOuting.current =
          now +
          (modalOpen
            ? 4000 + Math.random() * 3000
            : lowPower
              ? 18000 + Math.random() * 12000
              : 12000 + Math.random() * 16000);
      }

      if (
        phase.current === "outing" &&
        queue.current.length === 0 &&
        body.onGround &&
        home
      ) {
        if (body.platformId !== "home-corner") {
          if (homeUntil.current === 0) {
            homeUntil.current = now + 2000 + Math.random() * 2000;
            if (Math.random() < 0.35)
              requestAnim({ anim: "wave", holdMs: 700 });
            else if (Math.random() < 0.25)
              requestAnim({ anim: "point", holdMs: 800 });
          } else if (now > homeUntil.current) {
            phase.current = "returning";
            const current =
              platforms.find((x) => x.id === body.platformId) ?? null;
            queue.current = planHops(current, home, platforms);
            const first = queue.current[0];
            if (first) {
              bodyRef.current = jumpToward(bodyRef.current, first);
              setAnim("jump");
            }
            homeUntil.current = 0;
          }
        }
      }

      if (
        phase.current === "returning" &&
        queue.current.length === 0 &&
        body.platformId === "home-corner"
      ) {
        phase.current = "home";
        setAnim("idle");
        homeUntil.current = 0;
      }

      const goal = queue.current[0];
      if (goal) {
        const goalY = goal.y + goal.hh;
        if (body.onGround) {
          bodyRef.current = steerTerrain(
            bodyRef.current,
            goal.x,
            goalY,
            Math.max(0.5, motion.walkSpeed * 1.4),
          );
          if (anim !== "walk" && anim !== "jump") setAnim("walk");
        }
        if (
          Math.abs(bodyRef.current.x - goal.x) <
            Math.max(0.08, goal.hw * 0.75) &&
          Math.abs(bodyRef.current.y - goalY) < 0.2
        ) {
          bodyRef.current = snapToPlatform(bodyRef.current, goal);
          queue.current.shift();
          if (queue.current.length > 0) {
            const nxt = queue.current[0];
            bodyRef.current = jumpToward(bodyRef.current, nxt);
            setAnim("jump");
          } else {
            setAnim("idle");
            if (phase.current === "outing") {
              homeUntil.current = Date.now() + 2000 + Math.random() * 2000;
            }
          }
        }
      }

      bodyRef.current = stepTerrain(bodyRef.current, platforms, dt);
    }

    const b = bodyRef.current;

    // —— Facing: always mostly toward camera; lean into movement ——
    // Camera looks from +Z; face (+Z side of mesh) needs y = Math.PI in three default?
    // Our sphere face details are on +Z local → to face camera at +Z world, rotation.y = 0
    // (local +Z aligns with world +Z). Previous code used ±0.5 which showed the back.
    const baseFace = 0; // face camera
    let targetYaw = baseFace;
    if (Math.abs(b.vx) > 0.04) {
      // Slight turn toward movement (not full profile / back)
      targetYaw = baseFace + (b.vx > 0 ? -0.35 : 0.35);
    }
    if (dragging) targetYaw = baseFace;
    facing.current = THREE.MathUtils.lerp(facing.current, targetYaw, 0.12);
    g.rotation.y = facing.current;

    g.position.set(b.x, b.y + 0.08, 0.3);

    const breathe = Math.sin(t * 2.2) * 0.01;
    const walkBob =
      anim === "walk" && b.onGround
        ? Math.abs(Math.sin(t * 10)) * 0.022
        : anim === "jump"
          ? 0.035
          : phase.current === "home"
            ? Math.sin(t * 1.5) * 0.012
            : 0;
    p.position.y = walkBob + breathe;
    p.scale.setScalar(0.5 * (anim === "jump" ? 1.07 : dragging ? 1.1 : 1));

    if (tip.current) {
      const mat = tip.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity =
        0.3 + motion.glow * 0.45 + (phase.current === "home" ? 0.1 : 0);
    }

    // Project to screen for drag handle
    const world = new THREE.Vector3(b.x, b.y + 0.12, 0.3);
    world.project(camera);
    const sx = (world.x * 0.5 + 0.5) * size.width;
    const sy = (-world.y * 0.5 + 0.5) * size.height;
    onScreenPos({
      x: sx,
      y: sy,
      visible: world.z < 1 && world.z > -1,
    });
  });

  return (
    <group ref={root}>
      <group ref={pose}>
        {/* Body */}
        <mesh position={[0, -0.1, 0]}>
          <capsuleGeometry args={[0.09, 0.11, 4, 8]} />
          <meshStandardMaterial color="#e8a598" roughness={0.45} />
        </mesh>
        {/* Head — face features on +Z (toward camera when rotation.y = 0) */}
        <mesh position={[0, 0.13, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#f5d0c8" roughness={0.4} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.045, 0.14, 0.12]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshStandardMaterial color="#2a1810" />
        </mesh>
        <mesh position={[0.045, 0.14, 0.12]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshStandardMaterial color="#2a1810" />
        </mesh>
        {/* Cheeks */}
        <mesh position={[-0.07, 0.11, 0.1]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#f0a090" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.07, 0.11, 0.1]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#f0a090" transparent opacity={0.5} />
        </mesh>
        {/* Lantern tip */}
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
  const [screenPos, setScreenPos] = useState<MascotScreenPos>({
    x: 0,
    y: 0,
    visible: false,
  });
  const [dragging, setDragging] = useState(false);
  const [dragWorld, setDragWorld] = useState<{ x: number; y: number } | null>(
    null,
  );
  const bodyRef = useRef<TerrainBody | null>(null);
  const dragMoved = useRef(false);

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

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragMoved.current = false;
    setDragging(true);
    const w = screenToWorld(e.clientX, e.clientY);
    setDragWorld(w);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      e.preventDefault();
      dragMoved.current = true;
      setDragWorld(screenToWorld(e.clientX, e.clientY));
    },
    [dragging],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setDragging(false);
      const w = screenToWorld(e.clientX, e.clientY);
      setDragWorld(null);

      if (!bodyRef.current) return;

      if (!dragMoved.current) {
        // Tap = pet / celebrate
        useMascotStore.getState().dispatch({ type: "click" });
        return;
      }

      // Snap to nearest platform if close, else free-fall onto path
      let best: TerrainPlatform | null = null;
      let bestD = 0.35;
      for (const p of platforms) {
        if (p.type === "floor") continue;
        const d = Math.hypot(w.x - p.x, w.y - (p.y + p.hh));
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      }
      if (best) {
        bodyRef.current = snapToPlatform(bodyRef.current, best);
      } else {
        bodyRef.current.x = w.x;
        bodyRef.current.y = w.y;
        bodyRef.current.vy = 0;
        bodyRef.current.onGround = false;
        bodyRef.current.platformId = null;
      }
      useMascotStore.getState().dispatch({ type: "pet" });
    },
    [platforms],
  );

  if (reducedMotion) return null;

  return (
    <>
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
          <Actor
            platforms={platforms}
            lowPower={lowPower}
            dragging={dragging}
            dragWorld={dragWorld}
            onScreenPos={setScreenPos}
            bodyRef={bodyRef}
          />
        </Canvas>
      </div>

      {/* HTML drag handle — only this captures pointers, rest of UI stays free */}
      {screenPos.visible ? (
        <button
          type="button"
          className={
            "mascot-drag-handle" + (dragging ? " mascot-drag-handle--active" : "")
          }
          style={{
            left: screenPos.x,
            top: screenPos.y,
          }}
          aria-label="Drag Lantern-ko"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      ) : null}
    </>
  );
}
