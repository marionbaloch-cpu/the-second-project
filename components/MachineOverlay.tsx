"use client";

import { useState } from "react";

const HOTSPOTS = [
  {
    id: "flange",
    x: 50, y: 9,
    color: "#b8ccd8",
    title: "Mounting Flange",
    subtitle: "20 mK Stage",
    body: "The stainless steel top plate suspends the entire dilution refrigerator assembly. All cabling and thermal links connect here before descending through successive temperature stages.",
    stat: "TEMP: 20 mK — 180× COLDER THAN OUTER SPACE",
  },
  {
    id: "shields",
    x: 26, y: 30,
    color: "#e8b030",
    title: "Thermal Radiation Shields",
    subtitle: "4K Stage",
    body: "Concentric gold-plated copper shields intercept infrared radiation. Each successive shield reduces the thermal load by orders of magnitude, enabling the base temperature to reach millikelvin range.",
    stat: "REDUCTION: 10,000× PER STAGE",
  },
  {
    id: "dilution",
    x: 73, y: 50,
    color: "#d4a020",
    title: "Dilution Refrigerator Core",
    subtitle: "100 mK Stage",
    body: "A ³He/⁴He mixture undergoes quantum phase separation in the mixing chamber, absorbing heat as ³He atoms cross the phase boundary. This is the only continuous cooling mechanism below 300 mK.",
    stat: "COOLING POWER: ~10 µW AT 100 mK",
  },
  {
    id: "processor",
    x: 50, y: 72,
    color: "#4080ff",
    title: "Superconducting Quantum Processor",
    subtitle: "15 mK Base Stage",
    body: "IBM Eagle 127-qubit transmon processor. Superconducting loops encode quantum states as microwave photons. At this temperature, thermal noise is 100× below the qubit energy — enabling coherence times above 100 µs.",
    stat: "127 QUBITS · T1: 135 µs · T2: 90 µs",
  },
  {
    id: "cables",
    x: 27, y: 56,
    color: "#00c832",
    title: "Superconducting Coax Lines",
    subtitle: "5–7 GHz Control",
    body: "Precision stainless-steel coaxial cables carry microwave control pulses. Attenuated 20 dB at each temperature stage to prevent thermal photons from reaching the qubits and causing decoherence.",
    stat: "FREQUENCY: 5–7 GHz · ATTENUATION: 60 dB",
  },
] as const;

type SpotId = typeof HOTSPOTS[number]["id"];

export default function MachineOverlay() {
  const [active, setActive] = useState<SpotId | null>(null);
  const spot = HOTSPOTS.find(h => h.id === active);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", pointerEvents: "none" }}>

      {HOTSPOTS.map((h, i) => {
        const isActive = active === h.id;
        return (
          <div
            key={h.id}
            onClick={() => setActive(isActive ? null : h.id)}
            title={h.title}
            style={{
              position: "absolute",
              left: `${h.x}%`,
              top: `${h.y}%`,
              transform: "translate(-50%, -50%)",
              pointerEvents: "auto",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            {/* Outer pulse ring 1 */}
            <div style={{
              position: "absolute",
              inset: -10,
              borderRadius: "50%",
              border: `1px solid ${h.color}`,
              animation: `hs-pulse 2.4s ease-out infinite ${i * 0.5}s`,
              opacity: isActive ? 0 : 0.7,
            }} />
            {/* Outer pulse ring 2 (delayed) */}
            <div style={{
              position: "absolute",
              inset: -10,
              borderRadius: "50%",
              border: `1px solid ${h.color}`,
              animation: `hs-pulse 2.4s ease-out infinite ${i * 0.5 + 1.2}s`,
              opacity: isActive ? 0 : 0.5,
            }} />
            {/* Core dot */}
            <div style={{
              width: 10, height: 10,
              borderRadius: "50%",
              background: isActive ? h.color : `${h.color}40`,
              border: `2px solid ${h.color}`,
              boxShadow: isActive
                ? `0 0 12px ${h.color}, 0 0 24px ${h.color}80`
                : `0 0 6px ${h.color}80`,
              transition: "all 0.2s ease",
            }} />
            {/* Label tag */}
            {!isActive && (
              <div style={{
                position: "absolute",
                left: 18, top: -4,
                whiteSpace: "nowrap",
                fontSize: 9,
                letterSpacing: "0.12em",
                color: h.color,
                textShadow: `0 0 8px ${h.color}`,
                pointerEvents: "none",
                opacity: 0.8,
              }}>
                {h.title.toUpperCase()}
              </div>
            )}
          </div>
        );
      })}

      {/* ── INFO CARD ── */}
      {spot && (
        <div
          key={spot.id}
          onClick={() => setActive(null)}
          style={{
            position: "absolute",
            left: spot.x > 55
              ? `calc(${spot.x}% - 252px)`
              : `calc(${spot.x}% + 20px)`,
            top: spot.y > 65
              ? `calc(${spot.y}% - 170px)`
              : `${spot.y}%`,
            width: 236,
            background: "rgba(4, 8, 14, 0.96)",
            border: `1px solid ${spot.color}50`,
            boxShadow: `0 0 0 1px ${spot.color}18, 0 0 24px ${spot.color}20, 0 8px 32px rgba(0,0,0,0.8)`,
            backdropFilter: "blur(12px)",
            padding: "16px",
            pointerEvents: "auto",
            cursor: "pointer",
            zIndex: 20,
            animation: "hs-card 0.18s ease both",
          }}
        >
          {/* Top bar */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: 2,
            background: `linear-gradient(to right, transparent, ${spot.color}, transparent)`,
            opacity: 0.7,
          }} />

          <div style={{ fontSize: 8, letterSpacing: "0.22em", color: spot.color, marginBottom: 8, opacity: 0.8 }}>
            ▸ COMPONENT DETAIL
          </div>

          <div style={{ fontSize: 13, color: "#fff", fontWeight: 700, marginBottom: 2, letterSpacing: "0.03em", lineHeight: 1.3 }}>
            {spot.title}
          </div>
          <div style={{ fontSize: 9, color: spot.color, letterSpacing: "0.1em", marginBottom: 10, opacity: 0.7 }}>
            {spot.subtitle}
          </div>

          <p style={{
            fontSize: 10, color: "#5a8a5a", lineHeight: 1.65,
            margin: "0 0 12px", letterSpacing: "0.03em",
          }}>
            {spot.body}
          </p>

          <div style={{
            fontSize: 8, color: spot.color,
            letterSpacing: "0.1em", lineHeight: 1.5,
            padding: "6px 8px",
            border: `1px solid ${spot.color}25`,
            background: `${spot.color}08`,
          }}>
            {spot.stat}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <div style={{ fontSize: 8, color: "#2a4a2a", letterSpacing: "0.1em" }}>
              ✕ CLOSE
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
