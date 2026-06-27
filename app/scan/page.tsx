"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Phase = "scanning" | "located" | "analysis";

const FACT_CARDS = [
  { title: "127-Qubit Processor", body: "IBM Eagle operates at 15 millikelvin — 180× colder than outer space — enabling coherence times exceeding 135 µs." },
  { title: "Quantum Volume 128", body: "Quantum Volume measures holistic system performance combining qubit count, connectivity, and gate fidelity into a single benchmark." },
  { title: "Shor's Algorithm", body: "Quantum computers can factor large integers exponentially faster than classical machines — breaking RSA-2048 in hours, not millions of years." },
  { title: "Error Correction", body: "Surface code error correction uses 1000+ physical qubits to protect a single logical qubit, enabling fault-tolerant quantum computing." },
  { title: "Entanglement", body: "Quantum entanglement creates instantaneous correlations across any distance — Einstein called it 'spooky action at a distance'." },
];

function RadarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const maxR = Math.min(W, H) * 0.44;

    const blips: { angle: number; dist: number; alpha: number; size: number }[] = Array.from({ length: 14 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 0.3 + Math.random() * 0.65,
      alpha: 0,
      size: 2 + Math.random() * 3,
    }));

    let rafId: number;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Grid circles
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (maxR / 4) * i, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,255,65,0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Cross hairs
      ctx.strokeStyle = "rgba(0,255,65,0.1)";
      ctx.beginPath(); ctx.moveTo(cx, cy - maxR - 10); ctx.lineTo(cx, cy + maxR + 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - maxR - 10, cy); ctx.lineTo(cx + maxR + 10, cy); ctx.stroke();

      // Sweep
      const sweepAngle = (frame.current * 0.04) % (Math.PI * 2);
      const grad = ctx.createConicalGradient
        ? null // not standard
        : null;

      // Sweep gradient (arc trail)
      for (let i = 0; i < 60; i++) {
        const a = sweepAngle - (i * 0.04);
        const alpha = (1 - i / 60) * 0.35;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, a, a + 0.04);
        ctx.closePath();
        ctx.fillStyle = `rgba(0,255,65,${alpha})`;
        ctx.fill();
      }

      // Sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * maxR, cy + Math.sin(sweepAngle) * maxR);
      ctx.strokeStyle = "rgba(0,255,65,0.9)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#00ff41";
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Blips
      blips.forEach(b => {
        const angleDiff = ((sweepAngle - b.angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (angleDiff < 0.15) b.alpha = 1;
        else b.alpha = Math.max(0, b.alpha - 0.005);
        if (b.alpha > 0) {
          const bx = cx + Math.cos(b.angle) * b.dist * maxR;
          const by = cy + Math.sin(b.angle) * b.dist * maxR;
          ctx.beginPath();
          ctx.arc(bx, by, b.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,255,65,${b.alpha})`;
          ctx.shadowColor = "#00ff41";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#00ff41";
      ctx.shadowColor = "#00ff41";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      frame.current++;
      rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas ref={canvasRef} width={400} height={400}
      style={{ width: "min(400px, 80vw)", height: "min(400px, 80vw)" }} />
  );
}

function EuropeMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;

    // Approximate Europe outline as polyline points (simplified)
    const continentPoints: [number, number][] = [
      [0.38,0.12],[0.44,0.08],[0.52,0.06],[0.60,0.08],[0.68,0.12],[0.72,0.18],
      [0.80,0.16],[0.86,0.20],[0.90,0.28],[0.88,0.36],[0.82,0.40],[0.78,0.48],
      [0.84,0.52],[0.86,0.60],[0.80,0.66],[0.72,0.68],[0.64,0.72],[0.60,0.80],
      [0.52,0.84],[0.44,0.80],[0.36,0.76],[0.28,0.72],[0.22,0.64],[0.18,0.56],
      [0.14,0.48],[0.12,0.36],[0.16,0.26],[0.22,0.18],[0.30,0.14],[0.38,0.12],
    ];

    // Grid
    for (let x = 0; x < W; x += 40) {
      ctx.strokeStyle = "rgba(0,255,65,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Draw continent shape
    ctx.beginPath();
    continentPoints.forEach(([px, py], i) => {
      const x = px * W;
      const y = py * H;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(0,255,65,0.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,255,65,0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Target location (UK/Western Europe)
    const tx = 0.38 * W;
    const ty = 0.30 * H;

    // Concentric rings animation
    let ring = 0;
    const id = setInterval(() => {
      ctx.clearRect(0, 0, W, H);

      // Redraw grid
      for (let x = 0; x < W; x += 40) {
        ctx.strokeStyle = "rgba(0,255,65,0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Continent
      ctx.beginPath();
      continentPoints.forEach(([px, py], i) => {
        const x = px * W; const y = py * H;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(0,255,65,0.05)";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,255,65,0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Ping rings
      for (let r = 0; r < 3; r++) {
        const radius = ((ring + r * 20) % 60) + 5;
        const alpha = 1 - radius / 65;
        ctx.beginPath();
        ctx.arc(tx, ty, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,255,65,${alpha * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "#00ff41";
        ctx.shadowBlur = 4;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Center dot
      ctx.beginPath();
      ctx.arc(tx, ty, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#00ff41";
      ctx.shadowColor = "#00ff41";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Cross hairs
      ctx.strokeStyle = "rgba(0,255,65,0.4)";
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(tx - 20, ty); ctx.lineTo(tx + 20, ty); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx, ty - 20); ctx.lineTo(tx, ty + 20); ctx.stroke();

      ring = (ring + 1) % 60;
    }, 30);
    return () => clearInterval(id);
  }, []);

  return (
    <canvas ref={canvasRef} width={380} height={300}
      style={{ width: "100%", maxWidth: 380, height: 300 }} />
  );
}

export default function ScanPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("scanning");
  const [name, setName] = useState("");
  const [timer, setTimer] = useState(0);
  const [progressSteps, setProgressSteps] = useState<string[]>([]);

  const SCAN_STEPS = [
    "Initializing quantum search protocol...",
    "Connecting to quantum network nodes...",
    "Scanning global asset registry...",
    "Cross-referencing blockchain ledgers...",
    "Running entanglement verification...",
    "Locating nearest quantum facility...",
    "Asset location confirmed.",
  ];

  useEffect(() => {
    setName(sessionStorage.getItem("qc-name") || "USER");
  }, []);

  useEffect(() => {
    if (phase !== "scanning") return;
    let step = 0;
    const id = setInterval(() => {
      if (step < SCAN_STEPS.length) {
        setProgressSteps(p => [...p, SCAN_STEPS[step]]);
        step++;
      } else {
        clearInterval(id);
        setTimeout(() => setPhase("located"), 800);
      }
    }, 1200);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "located") return;
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "var(--bg)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Nav */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "0 24px", height: 48,
        borderBottom: "1px solid var(--border)",
        background: "rgba(5,5,8,0.95)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8,
          fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", color: "#fff" }}>
          <div style={{ width: 26, height: 26, border: "2px solid var(--green)",
            borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, color: "var(--green)" }}>QC</div>
          QUANTUM<span style={{ color: "var(--green)" }}>CORE</span>
        </div>
        <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", marginLeft: 24 }}>
          ▸ ANALYSIS SESSION — {name.toUpperCase()}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-dim)" }}>
          {phase === "located" && `SESSION ACTIVE: ${timer}s`}
        </div>
      </div>

      {/* Phase: Scanning */}
      {phase === "scanning" && (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 40
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--green)",
              marginBottom: 12, textShadow: "0 0 8px var(--green)" }}>
              ▸ QUANTUM ASSET SEARCH ACTIVE
            </div>
            <div style={{ fontSize: 22, color: "#fff", fontWeight: 700, letterSpacing: "0.04em", marginBottom: 4 }}>
              Scanning Global Registry
            </div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.06em" }}>
              Quantum-encrypted search in progress
            </div>
          </div>
          <RadarCanvas />
          <div style={{ width: 460, display: "flex", flexDirection: "column", gap: 6 }}>
            {progressSteps.map((s, i) => (
              <div key={i} style={{
                fontSize: 10, letterSpacing: "0.06em", color: i === progressSteps.length - 1 ? "var(--green)" : "var(--text-mid)",
                display: "flex", alignItems: "center", gap: 8,
                animation: "fade-in-up 0.3s ease"
              }}>
                <span style={{ color: "var(--green)", opacity: 0.6 }}>▸</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase: Located */}
      {phase === "located" && (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
          {/* Left: Info */}
          <div style={{
            padding: "40px 48px",
            borderRight: "1px solid var(--border)",
            display: "flex", flexDirection: "column", justifyContent: "center", gap: 24
          }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--green)",
                marginBottom: 12, textShadow: "0 0 6px var(--green)" }}>
                ▸ QUANTUM ASSET LOCATED
              </div>
              <h1 style={{ fontSize: 28, color: "#fff", fontWeight: 700,
                letterSpacing: "0.02em", margin: "0 0 8px", lineHeight: 1.2 }}>
                Facility Identified
              </h1>
              <p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.7,
                letterSpacing: "0.04em", margin: 0 }}>
                Quantum search complete. Your nearest certified quantum computing
                facility has been identified and verified.
              </p>
            </div>

            {[
              ["LOCATION", "London, United Kingdom"],
              ["FACILITY", "IBM Quantum Network Partner"],
              ["DISTANCE", "< 50 km from your region"],
              ["STATUS", "OPERATIONAL"],
              ["QUBITS", "127 (IBM Eagle)"],
              ["AVAILABILITY", "Slots available this week"],
            ].map(([k, v]) => (
              <div key={k} style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 11, letterSpacing: "0.05em",
                padding: "8px 0",
                borderBottom: "1px solid rgba(0,255,65,0.08)",
              }}>
                <span style={{ color: "var(--text-dim)" }}>{k}</span>
                <span style={{ color: k === "STATUS" ? "var(--green)" : "#fff",
                  textShadow: k === "STATUS" ? "0 0 6px var(--green)" : "none" }}>
                  {v}
                </span>
              </div>
            ))}

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button className="cta-btn" style={{ flex: 1 }}
                onClick={() => setPhase("analysis")}>
                ▸ VIEW ANALYSIS REPORT
              </button>
              <button onClick={() => router.push("/")} style={{
                padding: "12px 20px", background: "transparent",
                border: "1px solid var(--border)", color: "var(--text-dim)",
                fontFamily: "inherit", fontSize: 10, letterSpacing: "0.12em",
                cursor: "pointer", transition: "all 0.2s"
              }}>
                ← BACK
              </button>
            </div>
          </div>

          {/* Right: Map */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: 40, gap: 20
          }}>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--text-dim)" }}>
              QUANTUM FACILITY MAP — EUROPE
            </div>
            <EuropeMap />
            <div style={{ display: "flex", gap: 24, fontSize: 9, color: "var(--text-dim)",
              letterSpacing: "0.1em" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%",
                  background: "var(--green)", display: "inline-block",
                  boxShadow: "0 0 8px var(--green)" }} />
                ACTIVE FACILITY
              </span>
              <span>SESSION: {timer}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Phase: Analysis Report */}
      {phase === "analysis" && (
        <div style={{ flex: 1, padding: "40px 60px", overflowY: "auto" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--green)",
            marginBottom: 8, textShadow: "0 0 6px var(--green)" }}>
            ▸ QUANTUM INTELLIGENCE REPORT
          </div>
          <h1 style={{ fontSize: 24, color: "#fff", fontWeight: 700,
            margin: "0 0 32px", letterSpacing: "0.04em" }}>
            Quantum Computing — Key Intelligence
          </h1>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {FACT_CARDS.map((card, i) => (
              <div key={i} style={{
                background: "rgba(0,18,8,0.6)",
                border: "1px solid var(--border)",
                padding: "20px 22px",
                animation: `fade-in-up 0.4s ease ${i * 0.1}s both`,
              }}>
                <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "var(--green)",
                  marginBottom: 8 }}>
                  ▸ FACT {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ fontSize: 14, color: "#fff", fontWeight: 600,
                  marginBottom: 10, letterSpacing: "0.03em" }}>
                  {card.title}
                </div>
                <p style={{ fontSize: 11, color: "var(--text-mid)", lineHeight: 1.7,
                  margin: 0, letterSpacing: "0.03em" }}>
                  {card.body}
                </p>
              </div>
            ))}

            {/* Reserve spot card */}
            <div style={{
              background: "rgba(0,255,65,0.03)",
              border: "1px solid rgba(0,255,65,0.3)",
              padding: "20px 22px",
              display: "flex", flexDirection: "column", justifyContent: "center",
              alignItems: "flex-start", gap: 12,
              animation: `fade-in-up 0.4s ease 0.5s both`,
            }}>
              <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "var(--green)" }}>
                ▸ EXCLUSIVE ACCESS
              </div>
              <div style={{ fontSize: 16, color: "#fff", fontWeight: 700, letterSpacing: "0.03em" }}>
                Reserve Your Quantum Slot
              </div>
              <p style={{ fontSize: 11, color: "var(--text-mid)", lineHeight: 1.6, margin: 0 }}>
                Secure priority access to the quantum computing facility identified for your
                region. Limited slots available for the upcoming processing cycle.
              </p>
              <button className="cta-btn">▸ CONTACT US FOR ACCESS</button>
            </div>
          </div>

          <button onClick={() => router.push("/")} style={{
            marginTop: 32, padding: "10px 24px", background: "transparent",
            border: "1px solid var(--border)", color: "var(--text-dim)",
            fontFamily: "inherit", fontSize: 10, letterSpacing: "0.12em",
            cursor: "pointer", transition: "all 0.2s"
          }}>
            ← RETURN TO DASHBOARD
          </button>
        </div>
      )}
    </div>
  );
}
