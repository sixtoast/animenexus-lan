"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import { PlaceholderChibi } from "./PlaceholderChibi";
import { useMascotStore } from "@/lib/mascot/store";
import { useEffect } from "react";

type Props = {
  reducedMotion?: boolean;
};

function SceneContent({ reducedMotion }: Props) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[2.5, 4, 3]}
        intensity={1.1}
        color="#fff5f0"
      />
      <pointLight position={[-2, 1, 2]} intensity={0.35} color="#f0a090" />
      <PlaceholderChibi />
      {!reducedMotion ? (
        <ContactShadows
          position={[0, -0.72, 0]}
          opacity={0.35}
          scale={4}
          blur={2.2}
          far={2}
        />
      ) : null}
      <Environment preset="warehouse" environmentIntensity={0.25} />
    </>
  );
}

export function MascotScene({ reducedMotion }: Props) {
  const dispatch = useMascotStore((s) => s.dispatch);

  useEffect(() => {
    const onVis = () => {
      // store stays; Canvas frameloop handled by parent via key/dpr
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <Canvas
      className="mascot-canvas"
      camera={{ position: [0, 0.15, 2.4], fov: 35 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      frameloop={reducedMotion ? "demand" : "always"}
      onPointerMissed={() => {}}
      onClick={() => dispatch({ type: "click" })}
      aria-label="Lantern companion"
    >
      <SceneContent reducedMotion={reducedMotion} />
    </Canvas>
  );
}
