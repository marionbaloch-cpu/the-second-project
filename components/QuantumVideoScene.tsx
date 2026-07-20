"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Torus, Sphere, Line, Text } from "@react-three/drei";
import * as THREE from "three";

type HologramItem =
  | { id: string; type: "crypto"; name: string; symbol: string; color: string; description: string }
  | { id: string; type: "security"; name: string; color: string; description: string }
  | { id: string; type: "network"; name: string; color: string; description: string };

const HOLOGRAMS: HologramItem[] = [
  { id: "btc", type: "crypto", name: "Bitcoin", symbol: "₿", color: "#f7a600", description: "Quantum-secured store of value. SHA-256 hashing benchmark target." },
  { id: "eth", type: "crypto", name: "Ethereum", symbol: "Ξ", color: "#627eea", description: "Smart-contract execution layer. ECDSA signature analysis ready." },
  { id: "xrp", type: "crypto", name: "XRP", symbol: "✕", color: "#ffffff", description: "Cross-border liquidity network. Consensus ledger verification." },
  { id: "ltc", type: "crypto", name: "Litecoin", symbol: "Ł", color: "#bfbbbb", description: "Scrypt-based classical mining baseline." },
  { id: "qkd", type: "security", name: "QKD Lock", color: "#00d4ff", description: "Quantum Key Distribution channel active. E91 protocol handshake verified." },
  { id: "node", type: "network", name: "EU-QNet Node #7", color: "#00ff41", description: "EuroQCI backbone partner. Direct fibre link to Vienna, Warsaw, Bucharest." },
];

function IconHtml({
  item,
  active,
  onClick,
}: {
  item: HologramItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        transform: "translate(-50%, -50%)",
        cursor: "pointer",
        pointerEvents: "auto",
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          fontWeight: 700,
          color: item.color,
          background: active
            ? `radial-gradient(circle, ${item.color}30 0%, transparent 70%)`
            : `radial-gradient(circle, ${item.color}12 0%, transparent 70%)`,
          border: `1px solid ${item.color}${active ? "ff" : "60"}`,
          boxShadow: active
            ? `0 0 24px ${item.color}, inset 0 0 12px ${item.color}40`
            : `0 0 8px ${item.color}40`,
          transition: "all 0.25s ease",
          backdropFilter: "blur(2px)",
        }}
      >
        {item.type === "crypto" ? item.symbol : item.type === "security" ? "🔒" : "◉"}
      </div>
      <div
        style={{
          position: "absolute",
          top: 56,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 9,
          letterSpacing: "0.12em",
          color: item.color,
          whiteSpace: "nowrap",
          textShadow: `0 0 8px ${item.color}`,
          opacity: active ? 1 : 0.7,
        }}
      >
        {item.name.toUpperCase()}
      </div>
    </div>
  );
}

function HologramCard({
  item,
  onClose,
}: {
  item: HologramItem;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        width: 260,
        background: "rgba(4, 8, 14, 0.96)",
        border: `1px solid ${item.color}50`,
        boxShadow: `0 0 0 1px ${item.color}18, 0 0 24px ${item.color}20, 0 8px 32px rgba(0,0,0,0.8)`,
        backdropFilter: "blur(12px)",
        padding: "16px",
        cursor: "pointer",
        animation: "hs-card 0.18s ease both",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(to right, transparent, ${item.color}, transparent)`,
          opacity: 0.7,
        }}
      />
      <div
        style={{
          fontSize: 8,
          letterSpacing: "0.22em",
          color: item.color,
          marginBottom: 8,
          opacity: 0.8,
        }}
      >
        ▸ HOLOGRAPHIC ASSET
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#fff",
          fontWeight: 700,
          marginBottom: 10,
          letterSpacing: "0.03em",
        }}
      >
        {item.name}
      </div>
      <p
        style={{
          fontSize: 10,
          color: "#8aa8c8",
          lineHeight: 1.65,
          margin: "0 0 12px",
          letterSpacing: "0.03em",
        }}
      >
        {item.description}
      </p>
      <div
        style={{
          fontSize: 8,
          color: item.color,
          letterSpacing: "0.1em",
          lineHeight: 1.5,
          padding: "6px 8px",
          border: `1px solid ${item.color}25`,
          background: `${item.color}08`,
        }}
      >
        {item.type === "crypto" ? "BLOCKCHAIN INTEGRATION ACTIVE" : item.type === "security" ? "QUANTUM SECURITY VERIFIED" : "NETWORK NODE ONLINE"}
      </div>
    </div>
  );
}

function OrbitingIcons({
  activeId,
  setActiveId,
}: {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const iconRefs = useRef<THREE.Group[]>([]);

  const rings = useMemo(
    () => [
      { radius: 2.4, speed: 0.35, tilt: [0.25, 0, 0] as const, items: [HOLOGRAMS[0], HOLOGRAMS[1]] },
      { radius: 3.2, speed: -0.25, tilt: [0.4, 0.6, 0] as const, items: [HOLOGRAMS[2], HOLOGRAMS[3]] },
      { radius: 4.0, speed: 0.18, tilt: [0.15, 1.0, 0.3] as const, items: [HOLOGRAMS[4], HOLOGRAMS[5]] },
    ],
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.03;
    }
    iconRefs.current.forEach((icon, i) => {
      if (!icon) return;
      const ringIdx = Math.floor(i / 2);
      const ring = rings[ringIdx];
      const offset = (i % 2) * Math.PI;
      const angle = t * ring.speed + offset;
      icon.position.x = Math.cos(angle) * ring.radius;
      icon.position.y = Math.sin(angle) * ring.radius * 0.35;
      icon.position.z = Math.sin(angle) * ring.radius;
      icon.lookAt(0, 0, 0);
    });
  });

  let iconIndex = 0;

  return (
    <group ref={groupRef}>
      {rings.map((ring, ri) => (
        <group key={ri} rotation={[ring.tilt[0], ring.tilt[1], ring.tilt[2]]}>
      <Torus args={[ring.radius, 0.012, 8, 128] as [number, number, number, number]}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
      </Torus>
          {ring.items.map((item) => {
            const idx = iconIndex++;
            return (
              <group
                key={item.id}
                ref={(el) => {
                  if (el) iconRefs.current[idx] = el;
                }}
              >
                <Html center transform={false} style={{ pointerEvents: "none" }}>
                  <IconHtml
                    item={item}
                    active={activeId === item.id}
                    onClick={() => setActiveId(activeId === item.id ? null : item.id)}
                  />
                </Html>
                {activeId === item.id && (
                  <Html center transform={false} position={[0, -0.65, 0]} style={{ pointerEvents: "none" }}>
                    <HologramCard item={item} onClose={() => setActiveId(null)} />
                  </Html>
                )}
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}

function NetworkGraph() {
  const nodes = useMemo(
    () => [
      [-2.6, 0.8, 0.6] as [number, number, number],
      [-2.0, 1.4, -0.4] as [number, number, number],
      [-1.4, 0.6, 0.8] as [number, number, number],
      [-2.2, -0.2, -0.2] as [number, number, number],
      [-1.6, -0.8, 0.4] as [number, number, number],
      [2.6, -0.6, 0.5] as [number, number, number],
      [2.0, 0.2, -0.5] as [number, number, number],
      [1.5, -1.2, 0.3] as [number, number, number],
      [2.2, 1.0, -0.3] as [number, number, number],
    ],
    []
  );
  const edges = useMemo(
    () => [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [0, 3],
      [1, 3],
      [5, 6],
      [6, 7],
      [7, 8],
      [5, 8],
      [6, 8],
    ],
    []
  );

  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.08) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {edges.map(([a, b], i) => {
        const p1 = new THREE.Vector3(...nodes[a]);
        const p2 = new THREE.Vector3(...nodes[b]);
        return (
          <Line
            key={i}
            points={[p1, p2]}
            color="#00d4ff"
            lineWidth={0.5}
            transparent
            opacity={0.25}
          />
        );
      })}
      {nodes.map((pos, i) => (
        <Sphere key={i} args={[0.04, 16, 16] as [number, number, number]} position={pos}>
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.7} />
        </Sphere>
      ))}
    </group>
  );
}

function DataPanels() {
  const panels = useMemo(
    () => [
      { pos: [-3.4, 1.2, 0.8] as [number, number, number], label: "QUBIT COHERENCE", value: "99.992%", color: "#00d4ff" },
      { pos: [3.4, 1.6, -0.6] as [number, number, number], label: "GATE FIDELITY", value: "99.97%", color: "#f7a600" },
      { pos: [-3.0, -1.2, -0.4] as [number, number, number], label: "BASE TEMPERATURE", value: "15 mK", color: "#ffffff" },
      { pos: [3.0, -1.6, 0.4] as [number, number, number], label: "QUANTUM VOLUME", value: "128", color: "#00ff41" },
    ],
    []
  );

  return (
    <>
      {panels.map((p, i) => (
        <Html key={i} center position={p.pos} transform={false} style={{ pointerEvents: "none" }}>
          <div
            style={{
              width: 140,
              padding: "10px 12px",
              border: `1px solid ${p.color}30`,
              background: "rgba(4, 8, 14, 0.72)",
              backdropFilter: "blur(4px)",
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontSize: 7,
                letterSpacing: "0.16em",
                color: "#5a7a9a",
                marginBottom: 4,
              }}
            >
              ▸ {p.label}
            </div>
            <div
              style={{
                fontSize: 14,
                color: p.color,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textShadow: `0 0 10px ${p.color}60`,
              }}
            >
              {p.value}
            </div>
          </div>
        </Html>
      ))}
    </>
  );
}

function CentralLabel() {
  return (
    <Html center position={[0, -2.8, 0] as [number, number, number]} transform={false} style={{ pointerEvents: "none" }}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.22em",
            color: "#d4a020",
            marginBottom: 6,
            textShadow: "0 0 8px #d4a020",
          }}
        >
          ▸ REAL QUANTUM HARDWARE
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#fff",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          IBM Eagle 127-Qubit
        </div>
      </div>
    </Html>
  );
}

function SceneContent() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sceneRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  useFrame(({ pointer, clock }) => {
    if (sceneRef.current) {
      const targetX = pointer.x * 0.18;
      const targetY = pointer.y * 0.12;
      sceneRef.current.rotation.y = THREE.MathUtils.lerp(sceneRef.current.rotation.y, targetX + clock.elapsedTime * 0.015, 0.04);
      sceneRef.current.rotation.x = THREE.MathUtils.lerp(sceneRef.current.rotation.x, -targetY, 0.04);
    }
  });

  const scale = Math.min(viewport.width / 9, viewport.height / 6, 1);

  return (
    <group ref={sceneRef} scale={[scale, scale, scale] as [number, number, number]}>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 2, 4]} intensity={1.2} color="#d4a020" />
      <pointLight position={[0, -2, 4]} intensity={0.8} color="#4080ff" />

      <OrbitingIcons activeId={activeId} setActiveId={setActiveId} />
      <NetworkGraph />
      <DataPanels />
      <CentralLabel />

      <Text
        position={[0, 0, -6] as [number, number, number]}
        fontSize={0.8}
        color="#ffffff"
        fillOpacity={0.04}
        anchorX="center"
        anchorY="middle"
      >
        QUANTUM CORE
      </Text>
    </group>
  );
}

export default function QuantumVideoScene() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: false }}
        style={{ background: "transparent" }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
