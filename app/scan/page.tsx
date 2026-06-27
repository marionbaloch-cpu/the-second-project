"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Phase = "scanning" | "located" | "analysis";

// ─── Radar ──────────────────────────────────────────────────────────────────
function RadarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const maxR = Math.min(W, H) * 0.44;

    const blips = Array.from({ length: 18 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 0.25 + Math.random() * 0.68,
      alpha: 0,
      size: 1.5 + Math.random() * 3.5,
      color: Math.random() > 0.8 ? "#ff4040" : "#00ff41",
    }));

    let rafId: number;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Outer ring labels
      const labels = ["25 km", "50 km", "75 km", "100 km"];
      for (let i = 1; i <= 4; i++) {
        const r = (maxR / 4) * i;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = i === 4 ? "rgba(0,255,65,0.2)" : "rgba(0,255,65,0.1)";
        ctx.lineWidth = i === 4 ? 1.5 : 1;
        ctx.stroke();
        ctx.fillStyle = "rgba(0,255,65,0.3)";
        ctx.font = "8px 'Courier New'";
        ctx.fillText(labels[i - 1], cx + r + 3, cy - 3);
      }

      // Crosshairs + diagonals
      ctx.strokeStyle = "rgba(0,255,65,0.08)";
      ctx.lineWidth = 0.5;
      [0, 45, 90, 135].forEach(deg => {
        const rad = (deg * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(rad) * (maxR + 12), cy + Math.sin(rad) * (maxR + 12));
        ctx.lineTo(cx - Math.cos(rad) * (maxR + 12), cy - Math.sin(rad) * (maxR + 12));
        ctx.stroke();
      });

      // Compass labels
      const compass = [["N", 0, -1], ["E", 1, 0], ["S", 0, 1], ["W", -1, 0]];
      compass.forEach(([lbl, dx, dy]) => {
        ctx.fillStyle = "rgba(0,255,65,0.4)";
        ctx.font = "9px 'Courier New'";
        ctx.fillText(String(lbl), cx + Number(dx) * (maxR + 16) - 4, cy + Number(dy) * (maxR + 16) + 3);
      });

      // Sweep
      const sweepAngle = (frame.current * 0.03) % (Math.PI * 2);
      for (let i = 0; i < 80; i++) {
        const a = sweepAngle - i * 0.03;
        const alpha = (1 - i / 80) * 0.4;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, a, a + 0.035);
        ctx.closePath();
        ctx.fillStyle = `rgba(0,255,65,${alpha})`;
        ctx.fill();
      }

      // Sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * maxR, cy + Math.sin(sweepAngle) * maxR);
      ctx.strokeStyle = "rgba(0,255,65,0.95)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#00ff41";
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Blips
      blips.forEach(b => {
        const diff = ((sweepAngle - b.angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (diff < 0.12) b.alpha = 1;
        else b.alpha = Math.max(0, b.alpha - 0.004);
        if (b.alpha > 0) {
          const bx = cx + Math.cos(b.angle) * b.dist * maxR;
          const by = cy + Math.sin(b.angle) * b.dist * maxR;
          ctx.beginPath();
          ctx.arc(bx, by, b.size, 0, Math.PI * 2);
          ctx.fillStyle = b.color === "#ff4040"
            ? `rgba(255,64,64,${b.alpha * 0.8})`
            : `rgba(0,255,65,${b.alpha})`;
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Center
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#00ff41";
      ctx.shadowColor = "#00ff41";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Coord overlay
      ctx.fillStyle = "rgba(0,255,65,0.4)";
      ctx.font = "7px 'Courier New'";
      ctx.fillText(`LAT: 50.4501°N`, 6, H - 22);
      ctx.fillText(`LON: 30.5234°E`, 6, H - 12);

      frame.current++;
      rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas ref={canvasRef} width={360} height={360}
      style={{ width: "min(360px, 70vw)", height: "min(360px, 70vw)" }} />
  );
}

// ─── Ukraine Map ─────────────────────────────────────────────────────────────
function UkraineMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;

    // Simplified Europe outline
    const europe: [number, number][] = [
      [0.38,0.12],[0.44,0.08],[0.52,0.06],[0.60,0.08],[0.68,0.12],[0.72,0.18],
      [0.80,0.16],[0.86,0.20],[0.90,0.28],[0.88,0.36],[0.82,0.40],[0.78,0.48],
      [0.84,0.52],[0.86,0.60],[0.80,0.66],[0.72,0.68],[0.64,0.72],[0.60,0.80],
      [0.52,0.84],[0.44,0.80],[0.36,0.76],[0.28,0.72],[0.22,0.64],[0.18,0.56],
      [0.14,0.48],[0.12,0.36],[0.16,0.26],[0.22,0.18],[0.30,0.14],[0.38,0.12],
    ];

    // Ukraine approx outline (within the Europe frame)
    const ukraine: [number, number][] = [
      [0.62,0.34],[0.67,0.30],[0.74,0.28],[0.80,0.30],[0.83,0.35],
      [0.82,0.40],[0.78,0.44],[0.74,0.46],[0.70,0.48],[0.65,0.50],
      [0.60,0.48],[0.57,0.44],[0.56,0.40],[0.58,0.36],[0.62,0.34],
    ];

    // Kyiv pin
    const kyivX = 0.70 * W;
    const kyivY = 0.38 * H;

    let ring = 0;
    const id = setInterval(() => {
      ctx.clearRect(0, 0, W, H);

      // Grid
      for (let x = 0; x <= W; x += 32) {
        ctx.strokeStyle = "rgba(0,255,65,0.05)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y <= H; y += 32) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Europe fill
      ctx.beginPath();
      europe.forEach(([px, py], i) => {
        i === 0 ? ctx.moveTo(px * W, py * H) : ctx.lineTo(px * W, py * H);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(0,255,65,0.04)";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,255,65,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Ukraine highlight
      ctx.beginPath();
      ukraine.forEach(([px, py], i) => {
        i === 0 ? ctx.moveTo(px * W, py * H) : ctx.lineTo(px * W, py * H);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(0,255,65,0.14)";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,255,65,0.6)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#00ff41";
      ctx.shadowBlur = 4;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Connection lines from west Europe capitals to Kyiv
      const capitals = [[0.38 * W, 0.28 * H], [0.32 * W, 0.36 * H], [0.44 * W, 0.22 * H]];
      capitals.forEach(([ox, oy]) => {
        ctx.beginPath();
        ctx.setLineDash([3, 5]);
        ctx.moveTo(ox, oy);
        ctx.lineTo(kyivX, kyivY);
        ctx.strokeStyle = "rgba(0,255,65,0.15)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Ping rings at Kyiv
      for (let r = 0; r < 3; r++) {
        const radius = ((ring + r * 18) % 54) + 4;
        const alpha = 1 - radius / 58;
        ctx.beginPath();
        ctx.arc(kyivX, kyivY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,255,65,${alpha * 0.9})`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "#00ff41";
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Kyiv dot
      ctx.beginPath();
      ctx.arc(kyivX, kyivY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#00ff41";
      ctx.shadowColor = "#00ff41";
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Crosshair at Kyiv
      ctx.strokeStyle = "rgba(0,255,65,0.5)";
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(kyivX - 16, kyivY); ctx.lineTo(kyivX + 16, kyivY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(kyivX, kyivY - 16); ctx.lineTo(kyivX, kyivY + 16); ctx.stroke();

      // Label
      ctx.fillStyle = "#00ff41";
      ctx.font = "bold 9px 'Courier New'";
      ctx.fillText("KYIV", kyivX + 8, kyivY - 8);
      ctx.fillStyle = "rgba(0,255,65,0.5)";
      ctx.font = "7px 'Courier New'";
      ctx.fillText("50.45°N 30.52°E", kyivX + 8, kyivY + 2);

      // Lat/lon grid labels
      ctx.fillStyle = "rgba(0,255,65,0.3)";
      ctx.font = "7px 'Courier New'";
      ctx.fillText("45°N", 4, H * 0.55);
      ctx.fillText("50°N", 4, H * 0.38);
      ctx.fillText("55°N", 4, H * 0.22);
      ctx.fillText("25°E", W * 0.54, H - 4);
      ctx.fillText("30°E", W * 0.66, H - 4);
      ctx.fillText("35°E", W * 0.78, H - 4);

      ring = (ring + 1) % 54;
    }, 28);
    return () => clearInterval(id);
  }, []);

  return (
    <canvas ref={canvasRef} width={420} height={320}
      style={{ width: "100%", maxWidth: 420, height: 320 }} />
  );
}

// ─── Decorative corner brackets ──────────────────────────────────────────────
function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const s = 16;
  const style: React.CSSProperties = {
    position: "absolute",
    width: s, height: s,
    borderColor: "rgba(0,255,65,0.35)",
    borderStyle: "solid",
    ...(pos === "tl" ? { top: 0, left: 0, borderWidth: "1px 0 0 1px" } :
        pos === "tr" ? { top: 0, right: 0, borderWidth: "1px 1px 0 0" } :
        pos === "bl" ? { bottom: 0, left: 0, borderWidth: "0 0 1px 1px" } :
                       { bottom: 0, right: 0, borderWidth: "0 1px 1px 0" }),
  };
  return <div style={style} />;
}

// ─── Live metric block ────────────────────────────────────────────────────────
function MetricBox({ label, value, unit, color = "#00ff41" }: {
  label: string; value: string; unit?: string; color?: string;
}) {
  return (
    <div style={{
      padding: "10px 14px",
      border: "1px solid rgba(0,255,65,0.12)",
      background: "rgba(0,10,4,0.6)",
      position: "relative",
    }}>
      <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
      <div style={{ fontSize: 8, letterSpacing: "0.14em", color: "var(--text-dim)", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, color, fontWeight: 700, letterSpacing: "0.04em", lineHeight: 1 }}>
        {value}
        {unit && <span style={{ fontSize: 10, marginLeft: 4, color: "var(--text-dim)" }}>{unit}</span>}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const SCAN_STEPS = [
  { text: "Initializing quantum search protocol v4.7...", detail: "Loading QNA authentication keys" },
  { text: "Establishing quantum key distribution tunnel [QKD-256]...", detail: "E91 protocol handshake" },
  { text: "Connecting to 14 distributed quantum network nodes...", detail: "EU-QNet backbone online" },
  { text: "Broadcasting asset hash signature across blockchain ledgers...", detail: "SHA3-512 fingerprint match" },
  { text: "Running 127-qubit entanglement verification sweep...", detail: "Bell state fidelity: 99.97%" },
  { text: "Cross-referencing European Financial Regulatory Database...", detail: "EQRA access granted" },
  { text: "Authenticating with Quantum Network Authority [QNA-EU]...", detail: "Certificate valid · expires 2026-12-31" },
  { text: "Scanning 3,294 registered quantum asset repositories...", detail: "Grover search depth: 12 iterations" },
  { text: "Triangulating geolocation via quantum GPS signature...", detail: "Precision: ±0.3 m" },
  { text: "Decrypting quantum hash signature — match confidence: 99.97%...", detail: "Quantum signature verified" },
  { text: "Verifying asset provenance on distributed ledger...", detail: "Block height #2,847,391 confirmed" },
  { text: "Identifying nearest certified processing facility...", detail: "Eastern European node selected" },
  { text: "Facility authenticated. Secure channel established.", detail: "TLS 1.3 + QKD layer active" },
  { text: "Location confirmed. Preparing analysis report.", detail: "Report ready" },
];

const FACT_CARDS = [
  {
    tag: "QUANTUM HARDWARE",
    title: "127-Qubit Eagle Processor",
    body: "IBM Eagle R3 operates at 15 millikelvin — 180× colder than outer space. Transmon qubits achieve coherence times exceeding 300 µs in the latest generation, enabling deep quantum circuits previously impossible.",
    stat: "COHERENCE: 300 µs",
    color: "#00ff41",
  },
  {
    tag: "CRYPTOGRAPHY",
    title: "Quantum Key Distribution",
    body: "E91 protocol uses entangled photon pairs to create theoretically unbreakable encryption keys. Any eavesdropping attempt collapses the quantum state, making interception detectable by law of physics — not by algorithm.",
    stat: "SECURITY: INFORMATION-THEORETIC",
    color: "#00d4ff",
  },
  {
    tag: "ALGORITHM",
    title: "Grover's Search Algorithm",
    body: "Classically searching N unsorted items takes O(N) operations. Grover's quantum algorithm achieves O(√N) — a quadratic speedup. For 3,294 asset repositories this means 57× fewer computational steps than any classical approach.",
    stat: "SPEEDUP: O(√N) vs O(N)",
    color: "#00ff41",
  },
  {
    tag: "PERFORMANCE",
    title: "Quantum Volume 128",
    body: "QV measures holistic processor quality combining qubit count, connectivity, gate fidelity, and circuit depth. A QV of 128 means reliably executing random circuits of width and depth 7 — a benchmark no classical simulator can match at this scale.",
    stat: "QV: 128 — CERTIFIED",
    color: "#d4a020",
  },
  {
    tag: "THREAT INTELLIGENCE",
    title: "Post-Quantum Cryptography",
    body: "Shor's algorithm can break RSA-2048 in hours on a 4,000-logical-qubit machine. NIST finalized CRYSTALS-Kyber and CRYSTALS-Dilithium as post-quantum standards in 2024. Your asset analysis uses PQC-hardened encryption.",
    stat: "STANDARD: NIST FIPS 203 / 204",
    color: "#ff4040",
  },
  {
    tag: "ERROR CORRECTION",
    title: "Surface Code Architecture",
    body: "Physical qubits have error rates of ~0.1%. Surface code uses 1,000+ physical qubits per logical qubit to suppress errors below 10⁻¹⁵ per operation — enabling fault-tolerant quantum computation at scale.",
    stat: "PHYSICAL / LOGICAL: ~1000:1",
    color: "#b060ff",
  },
  {
    tag: "NETWORK",
    title: "EU Quantum Internet Alliance",
    body: "The Kyiv node is registered as EU-QNet Node #7 within the European Quantum Communication Infrastructure (EuroQCI). This provides direct encrypted quantum channels to 23 partner facilities across Eastern and Central Europe.",
    stat: "NODE: EU-QNET #7 · 23 PARTNERS",
    color: "#00ff41",
  },
  {
    tag: "FINANCE",
    title: "Quantum Portfolio Optimisation",
    body: "Variational Quantum Eigensolver (VQE) algorithms running on quantum hardware can evaluate exponentially more portfolio configurations simultaneously — finding optimal risk/return allocations classical computers approximate but cannot solve exactly.",
    stat: "UNIVERSE: 2¹²⁷ CONFIGURATIONS",
    color: "#00d4ff",
  },
];

const FACILITY_ROWS = [
  ["LOCATION", "Kyiv, Ukraine"],
  ["FACILITY", "Eastern European Quantum Computing Centre"],
  ["ADDRESS", "Akademika Palladin Ave, Kyiv 03142"],
  ["COORDINATES", "50.4501°N, 30.5234°E"],
  ["STATUS", "FULLY OPERATIONAL"],
  ["PROCESSOR", "IBM Eagle R3 — 127 Qubits"],
  ["QUANTUM VOLUME", "128 (Certified 2025-Q4)"],
  ["NETWORK NODE", "EU-QNet #7 · EuroQCI Partner"],
  ["SECURITY", "NATO-grade QKD + PQC Layer"],
  ["AVAILABILITY", "Priority slots available — this week"],
];

export default function ScanPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("scanning");
  const [name, setName] = useState("");
  const [timer, setTimer] = useState(0);
  const [steps, setSteps] = useState<typeof SCAN_STEPS>([]);
  const [nodesConn, setNodesConn] = useState(0);
  const [signalStr, setSignalStr] = useState(0);
  const [dataScanned, setDataScanned] = useState(0);

  useEffect(() => {
    setName(sessionStorage.getItem("qc-name") || "USER");
  }, []);

  // Scanning phase
  useEffect(() => {
    if (phase !== "scanning") return;
    let idx = 0;
    const stepId = setInterval(() => {
      if (idx < SCAN_STEPS.length) {
        setSteps(p => [...p, SCAN_STEPS[idx]]);
        idx++;
      } else {
        clearInterval(stepId);
        setTimeout(() => setPhase("located"), 900);
      }
    }, 1100);

    // Live metrics during scan
    const metricId = setInterval(() => {
      setNodesConn(n => Math.min(14, n + 1));
      setSignalStr(s => Math.min(98, s + Math.round(4 + Math.random() * 6)));
      setDataScanned(d => Math.min(3294, d + Math.round(150 + Math.random() * 220)));
    }, 900);

    return () => { clearInterval(stepId); clearInterval(metricId); };
  }, [phase]);

  // Located timer
  useEffect(() => {
    if (phase !== "located") return;
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const completePct = Math.round((steps.length / SCAN_STEPS.length) * 100);

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      {/* ── NAV ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "0 24px", height: 48,
        borderBottom: "1px solid var(--border)",
        background: "rgba(5,5,8,0.96)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8,
          fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", color: "#fff" }}>
          <div style={{ width: 26, height: 26, border: "2px solid var(--green)",
            borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, color: "var(--green)", boxShadow: "0 0 8px var(--green-glow)" }}>QC</div>
          QUANTUM<span style={{ color: "var(--green)" }}>CORE</span>
        </div>
        <div style={{ width: 1, height: 20, background: "var(--border)" }} />
        <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.14em" }}>
          CLASSIFIED · ASSET ANALYSIS SESSION
        </div>
        <div style={{ fontSize: 9, color: "var(--green)", letterSpacing: "0.1em",
          padding: "3px 8px", border: "1px solid rgba(0,255,65,0.2)", background: "rgba(0,255,65,0.04)" }}>
          OPERATOR: {name.toUpperCase()}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 20, alignItems: "center" }}>
          {phase === "scanning" && (
            <div style={{ fontSize: 9, color: "var(--green)", letterSpacing: "0.1em", animation: "counter-glow 1.5s infinite" }}>
              ● SCAN ACTIVE — {completePct}%
            </div>
          )}
          {phase !== "scanning" && (
            <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em" }}>
              SESSION: {timer}s · FACILITY: KYIV-UA
            </div>
          )}
          <button onClick={() => router.push("/")} style={{
            background: "none", border: "1px solid var(--border)",
            color: "var(--text-dim)", fontFamily: "inherit", fontSize: 9,
            letterSpacing: "0.1em", padding: "4px 10px", cursor: "pointer" }}>
            ← DASHBOARD
          </button>
        </div>
      </div>

      {/* ── SCANNING PHASE ── */}
      {phase === "scanning" && (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 400px", overflow: "hidden" }}>

          {/* Left: Radar + progress bar */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 28, padding: "32px 40px",
            borderRight: "1px solid var(--border)",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.22em", color: "var(--green)",
                marginBottom: 10, textShadow: "0 0 8px var(--green)" }}>
                ▸ QUANTUM ASSET SEARCH — PROTOCOL 4.7
              </div>
              <div style={{ fontSize: 26, color: "#fff", fontWeight: 700, letterSpacing: "0.03em", marginBottom: 4 }}>
                Scanning Global Registry
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.06em" }}>
                Quantum-encrypted geolocation sweep in progress
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <RadarCanvas />
              {/* Corner overlays on radar */}
              {(["tl","tr","bl","br"] as const).map(p => (
                <div key={p} style={{
                  position: "absolute",
                  ...(p === "tl" ? { top: 8, left: 8 } : p === "tr" ? { top: 8, right: 8 } :
                      p === "bl" ? { bottom: 8, left: 8 } : { bottom: 8, right: 8 }),
                  width: 14, height: 14,
                  borderColor: "rgba(0,255,65,0.4)", borderStyle: "solid",
                  ...(p === "tl" ? { borderWidth: "1px 0 0 1px" } :
                      p === "tr" ? { borderWidth: "1px 1px 0 0" } :
                      p === "bl" ? { borderWidth: "0 0 1px 1px" } :
                                   { borderWidth: "0 1px 1px 0" }),
                }} />
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ width: "100%", maxWidth: 360 }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 6 }}>
                <span>SCAN PROGRESS</span>
                <span style={{ color: "var(--green)" }}>{completePct}%</span>
              </div>
              <div style={{ height: 3, background: "rgba(0,255,65,0.1)", position: "relative" }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: `${completePct}%`,
                  background: "var(--green)",
                  boxShadow: "0 0 8px var(--green)",
                  transition: "width 0.8s ease",
                }} />
              </div>
            </div>
          </div>

          {/* Right: Step log + live metrics */}
          <div style={{
            display: "flex", flexDirection: "column",
            padding: "24px 20px",
            gap: 20,
            overflowY: "auto",
          }}>
            {/* Live metrics */}
            <div>
              <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "var(--text-dim)", marginBottom: 10 }}>
                ▸ LIVE SCAN METRICS
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <MetricBox label="NODES CONNECTED" value={String(nodesConn)} unit="/ 14" />
                <MetricBox label="SIGNAL STRENGTH" value={String(Math.min(signalStr, 98))} unit="%" />
                <MetricBox label="REPOSITORIES SCANNED" value={dataScanned.toLocaleString()} unit="/ 3,294" />
                <MetricBox label="MATCH CONFIDENCE" value={steps.length > 10 ? "99.97" : "—"} unit="%" color="#d4a020" />
              </div>
            </div>

            {/* Protocol log */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "var(--text-dim)", marginBottom: 10 }}>
                ▸ PROTOCOL LOG
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {steps.map((s, i) => {
                  const isLast = i === steps.length - 1;
                  return (
                    <div key={i} style={{
                      padding: "7px 10px",
                      borderLeft: `2px solid ${isLast ? "var(--green)" : "rgba(0,255,65,0.15)"}`,
                      marginBottom: 4,
                      animation: "fade-in-up 0.25s ease both",
                      background: isLast ? "rgba(0,255,65,0.03)" : "transparent",
                    }}>
                      <div style={{
                        fontSize: 10, letterSpacing: "0.05em",
                        color: isLast ? "var(--green)" : "var(--text-mid)",
                        marginBottom: 2,
                      }}>
                        <span style={{ opacity: 0.5 }}>▸ </span>{s.text}
                      </div>
                      <div style={{ fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.08em" }}>
                        {s.detail}
                      </div>
                    </div>
                  );
                })}
                {steps.length < SCAN_STEPS.length && (
                  <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em",
                    padding: "6px 10px", animation: "counter-glow 1s infinite" }}>
                    ▸ PROCESSING...
                  </div>
                )}
              </div>
            </div>

            {/* Encryption info */}
            <div style={{
              padding: "10px 12px",
              border: "1px solid rgba(0,255,65,0.1)",
              background: "rgba(0,8,3,0.6)",
              fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.08em", lineHeight: 1.8,
            }}>
              ENCRYPTION: QKD-256 · PROTOCOL: E91<br />
              AUTHORITY: QNA-EU CERT #2025-0471<br />
              SESSION KEY: {name.substring(0,2).toUpperCase()}**-****-****-{Math.floor(Math.random()*9999).toString().padStart(4,"0")}
            </div>
          </div>
        </div>
      )}

      {/* ── LOCATED PHASE ── */}
      {phase === "located" && (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "340px 1fr 280px", overflow: "hidden" }}>

          {/* Col 1: Facility details */}
          <div style={{
            padding: "32px 28px",
            borderRight: "1px solid var(--border)",
            display: "flex", flexDirection: "column", gap: 0,
            overflowY: "auto",
          }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--green)",
              marginBottom: 14, textShadow: "0 0 6px var(--green)" }}>
              ▸ QUANTUM ASSET LOCATED
            </div>

            {/* Classified badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 12px", marginBottom: 18,
              border: "1px solid rgba(255,180,0,0.4)",
              background: "rgba(255,140,0,0.06)",
              fontSize: 9, color: "#d4a020", letterSpacing: "0.15em",
            }}>
              ■ CLASSIFIED — AUTHORISED OPERATOR ONLY
            </div>

            <h1 style={{ fontSize: 22, color: "#fff", fontWeight: 700,
              letterSpacing: "0.02em", margin: "0 0 6px", lineHeight: 1.2 }}>
              Facility Identified
            </h1>
            <p style={{ fontSize: 11, color: "var(--text-mid)", lineHeight: 1.7,
              letterSpacing: "0.03em", margin: "0 0 24px" }}>
              Quantum search complete. Your certified Eastern European quantum
              computing facility has been located, authenticated, and secured.
            </p>

            {FACILITY_ROWS.map(([k, v]) => (
              <div key={k} style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                fontSize: 10, letterSpacing: "0.04em",
                padding: "8px 0",
                borderBottom: "1px solid rgba(0,255,65,0.07)",
                gap: 12,
              }}>
                <span style={{ color: "var(--text-dim)", flexShrink: 0 }}>{k}</span>
                <span style={{
                  color: k === "STATUS" ? "var(--green)" : "#e0e0e0",
                  textShadow: k === "STATUS" ? "0 0 6px var(--green)" : "none",
                  textAlign: "right",
                  fontSize: k === "FACILITY" || k === "ADDRESS" ? 9 : 10,
                }}>
                  {v}
                </span>
              </div>
            ))}

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button className="cta-btn" style={{ flex: 1, fontSize: 10 }}
                onClick={() => setPhase("analysis")}>
                ▸ VIEW REPORT
              </button>
            </div>
          </div>

          {/* Col 2: Map */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "32px 40px", gap: 20,
          }}>
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between",
              fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.14em" }}>
              <span>QUANTUM FACILITY MAP — EASTERN EUROPE</span>
              <span>ZOOM: CONTINENTAL · CRS: WGS84</span>
            </div>

            <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
              <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
              <UkraineMap />
            </div>

            {/* Map legend */}
            <div style={{ display: "flex", gap: 28, fontSize: 9, color: "var(--text-dim)",
              letterSpacing: "0.1em" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%",
                  background: "var(--green)", display: "inline-block",
                  boxShadow: "0 0 8px var(--green)" }} />
                ACTIVE FACILITY — KYIV, UA
              </span>
              <span style={{ color: "var(--green)" }}>SESSION: {timer}s</span>
            </div>

            {/* Coordinate bar */}
            <div style={{
              width: "100%", padding: "8px 16px",
              border: "1px solid rgba(0,255,65,0.1)",
              background: "rgba(0,8,3,0.7)",
              display: "flex", justifyContent: "space-between",
              fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em",
            }}>
              <span>LAT: 50.4501°N</span>
              <span>LON: 30.5234°E</span>
              <span>ALT: 179 m ASL</span>
              <span style={{ color: "var(--green)" }}>LOCK: ± 0.3 m</span>
            </div>
          </div>

          {/* Col 3: Live readouts */}
          <div style={{
            borderLeft: "1px solid var(--border)",
            padding: "32px 20px",
            display: "flex", flexDirection: "column", gap: 16,
            overflowY: "auto",
          }}>
            <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "var(--text-dim)", marginBottom: 4 }}>
              ▸ FACILITY READOUTS
            </div>

            <MetricBox label="QUBITS AVAILABLE" value="127" color="#00ff41" />
            <MetricBox label="QUANTUM VOLUME" value="128" color="#d4a020" />
            <MetricBox label="COHERENCE TIME" value="300" unit="µs" color="#00d4ff" />
            <MetricBox label="GATE FIDELITY" value="99.97" unit="%" color="#00ff41" />
            <MetricBox label="BASE TEMP" value="15" unit="mK" color="#4080ff" />
            <MetricBox label="UPTIME (30D)" value="99.8" unit="%" color="#00ff41" />

            <div style={{
              padding: "12px",
              border: "1px solid rgba(0,255,65,0.1)",
              background: "rgba(0,8,3,0.6)",
              fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.07em", lineHeight: 1.9,
            }}>
              <div style={{ color: "var(--green)", marginBottom: 6, fontSize: 8, letterSpacing: "0.14em" }}>
                ▸ NETWORK STATUS
              </div>
              EU-QNET NODE #7<br />
              EUROQCI PARTNER<br />
              QKD CHANNEL: ACTIVE<br />
              LATENCY TO NODE: 4.2 ms<br />
              BANDWIDTH: 40 Gbps
            </div>

            <div style={{
              padding: "12px",
              border: "1px solid rgba(255,180,0,0.2)",
              background: "rgba(255,140,0,0.04)",
              fontSize: 9, color: "#a07010", letterSpacing: "0.07em", lineHeight: 1.9,
            }}>
              <div style={{ color: "#d4a020", marginBottom: 6, fontSize: 8, letterSpacing: "0.14em" }}>
                ▸ AUTHORISATION
              </div>
              CLEARANCE: LEVEL 4<br />
              OPERATOR: {name.toUpperCase()}<br />
              CERT: QNA-EU #2025-0471<br />
              EXPIRES: 2026-12-31
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYSIS PHASE ── */}
      {phase === "analysis" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "36px 56px" }}>

          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            marginBottom: 32, paddingBottom: 20,
            borderBottom: "1px solid var(--border)",
          }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.22em", color: "var(--green)",
                marginBottom: 10, textShadow: "0 0 6px var(--green)" }}>
                ▸ QUANTUM INTELLIGENCE REPORT — FACILITY: KYIV, UKRAINE
              </div>
              <h1 style={{ fontSize: 26, color: "#fff", fontWeight: 700,
                margin: "0 0 6px", letterSpacing: "0.03em" }}>
                Quantum Asset Analysis Report
              </h1>
              <p style={{ fontSize: 11, color: "var(--text-mid)", margin: 0,
                letterSpacing: "0.03em", lineHeight: 1.7, maxWidth: 640 }}>
                Comprehensive analysis of quantum computing capabilities, cryptographic security,
                and algorithmic performance relevant to your asset profile. Classified operator access only.
              </p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 4 }}>
                REPORT DATE
              </div>
              <div style={{ fontSize: 13, color: "#fff", letterSpacing: "0.06em" }}>
                2026-06-27
              </div>
              <div style={{ fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.1em", marginTop: 8, marginBottom: 4 }}>
                CLASSIFICATION
              </div>
              <div style={{ fontSize: 11, color: "#d4a020", letterSpacing: "0.08em" }}>
                RESTRICTED
              </div>
            </div>
          </div>

          {/* Metrics summary bar */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
            gap: 12, marginBottom: 32,
          }}>
            {[
              ["FACILITY", "KYIV, UA", "#00ff41"],
              ["QUBITS", "127", "#00d4ff"],
              ["QUANTUM VOL.", "128", "#d4a020"],
              ["COHERENCE", "300 µs", "#00ff41"],
              ["FIDELITY", "99.97%", "#b060ff"],
            ].map(([lbl, val, col]) => (
              <div key={lbl} style={{
                padding: "12px 16px",
                border: `1px solid ${col}25`,
                background: `${col}06`,
                textAlign: "center", position: "relative",
              }}>
                <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
                <div style={{ fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 6 }}>
                  {lbl}
                </div>
                <div style={{ fontSize: 16, color: col as string, fontWeight: 700, letterSpacing: "0.04em" }}>
                  {val}
                </div>
              </div>
            ))}
          </div>

          {/* Fact cards grid */}
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "var(--text-dim)", marginBottom: 14 }}>
            ▸ KEY INTELLIGENCE FINDINGS — 8 ENTRIES
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 28 }}>
            {FACT_CARDS.map((card, i) => (
              <div key={i} style={{
                background: "rgba(0,12,5,0.7)",
                border: `1px solid ${card.color}20`,
                padding: "18px 20px",
                position: "relative",
                animation: `fade-in-up 0.35s ease ${i * 0.07}s both`,
              }}>
                <Corner pos="tl" /><Corner pos="br" />
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 8, letterSpacing: "0.16em", color: card.color, opacity: 0.8 }}>
                    ▸ {card.tag}
                  </div>
                  <div style={{ fontSize: 7, color: "var(--text-dim)", letterSpacing: "0.1em" }}>
                    {String(i + 1).padStart(2, "0")} / 08
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 600,
                  marginBottom: 10, letterSpacing: "0.02em", lineHeight: 1.3 }}>
                  {card.title}
                </div>
                <p style={{ fontSize: 10, color: "var(--text-mid)", lineHeight: 1.7,
                  margin: "0 0 12px", letterSpacing: "0.02em" }}>
                  {card.body}
                </p>
                <div style={{
                  fontSize: 8, color: card.color, letterSpacing: "0.1em",
                  padding: "5px 8px",
                  border: `1px solid ${card.color}20`,
                  background: `${card.color}06`,
                }}>
                  {card.stat}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom: CTA + Ukraine context */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 32 }}>
            {/* Ukraine advantage */}
            <div style={{
              padding: "22px 24px",
              border: "1px solid rgba(0,255,65,0.2)",
              background: "rgba(0,15,6,0.7)",
              position: "relative",
              animation: "fade-in-up 0.4s ease 0.56s both",
            }}>
              <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
              <div style={{ fontSize: 8, letterSpacing: "0.16em", color: "var(--green)",
                opacity: 0.8, marginBottom: 10 }}>▸ REGIONAL ADVANTAGE</div>
              <div style={{ fontSize: 14, color: "#fff", fontWeight: 600, marginBottom: 10 }}>
                Why Ukraine — Kyiv Quantum Centre
              </div>
              <p style={{ fontSize: 10, color: "var(--text-mid)", lineHeight: 1.7,
                margin: "0 0 12px", letterSpacing: "0.02em" }}>
                Kyiv hosts one of Eastern Europe's most advanced quantum infrastructure nodes,
                operating under EuroQCI partnership with direct fibre-optic quantum links to
                Vienna, Warsaw, and Bucharest. The facility operates under EU technology-transfer
                agreements, providing NATO-grade quantum key distribution to registered operators.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["EU-QNET #7", "EUROQCI", "NATO QKD", "ISO 27001", "GDPR COMPLIANT"].map(tag => (
                  <span key={tag} style={{
                    fontSize: 8, color: "var(--green)", letterSpacing: "0.1em",
                    padding: "3px 7px", border: "1px solid rgba(0,255,65,0.2)",
                    background: "rgba(0,255,65,0.04)",
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Reserve slot */}
            <div style={{
              padding: "22px 24px",
              border: "1px solid rgba(0,255,65,0.35)",
              background: "rgba(0,255,65,0.03)",
              display: "flex", flexDirection: "column", gap: 14,
              justifyContent: "center",
              animation: "fade-in-up 0.4s ease 0.63s both",
              position: "relative",
            }}>
              <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
              <div style={{ fontSize: 8, letterSpacing: "0.16em", color: "var(--green)" }}>
                ▸ PRIORITY ACCESS — LIMITED AVAILABILITY
              </div>
              <div style={{ fontSize: 18, color: "#fff", fontWeight: 700 }}>
                Reserve Your Quantum Slot
              </div>
              <p style={{ fontSize: 11, color: "var(--text-mid)", lineHeight: 1.7, margin: 0 }}>
                Secure priority access to the Kyiv Quantum Centre for your upcoming
                processing cycle. Direct operator-to-facility quantum-encrypted channel.
                Slots are allocated on a first-come, first-served basis for verified operators.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.07em", lineHeight: 1.9 }}>
                  FACILITY: KYIV, UKRAINE<br />
                  CAPACITY: 12 SLOTS / WEEK<br />
                  NEXT AVAILABLE: MONDAY
                </div>
              </div>
              <button className="cta-btn" style={{ alignSelf: "flex-start" }}>
                ▸ CONTACT US FOR ACCESS
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setPhase("located")} style={{
              padding: "10px 22px", background: "transparent",
              border: "1px solid var(--border)", color: "var(--text-dim)",
              fontFamily: "inherit", fontSize: 10, letterSpacing: "0.12em",
              cursor: "pointer",
            }}>
              ← FACILITY MAP
            </button>
            <button onClick={() => router.push("/")} style={{
              padding: "10px 22px", background: "transparent",
              border: "1px solid var(--border)", color: "var(--text-dim)",
              fontFamily: "inherit", fontSize: 10, letterSpacing: "0.12em",
              cursor: "pointer",
            }}>
              ← RETURN TO DASHBOARD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
