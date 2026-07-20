"use client";

import { useState, useEffect } from "react";
import CircuitDiagram from "./CircuitDiagram";
import SystemLogs from "./SystemLogs";
import LiveChart from "./LiveChart";
import AnalysisModal from "./AnalysisModal";
import QuantumMachine from "./QuantumMachine";
import QuantumVideoScene from "./QuantumVideoScene";

const PROCESSES = [
  "Quantum Error Correction",
  "Qubit Calibration",
  "Entanglement Verification",
  "Quantum Teleportation",
  "Randomized Benchmarking",
];

const ALGOS = [
  "Shor's Algorithm",
  "Grover's Search",
  "Quantum Fourier Transform",
  "Variational Quantum Eigensolver",
  "Quantum Machine Learning",
];

const NAV_LINKS = ["DASHBOARD", "SYSTEM", "NETWORK", "ANALYTICS"];

function AnimatedNumber({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    const timer = setTimeout(() => {
      const num = parseFloat(target);
      if (isNaN(num)) { setDisplay(target); return; }
      let start = 0;
      const step = num / 40;
      const id = setInterval(() => {
        start += step;
        if (start >= num) { setDisplay(target); clearInterval(id); }
        else setDisplay(start.toFixed(target.includes(".") ? 3 : 0));
      }, 30);
      return () => clearInterval(id);
    }, 0);
    return () => clearTimeout(timer);
  }, [target]);
  return <>{display}{suffix}</>;
}

function QubitStabilityBar({ value, color = "var(--gold)" }: { value: number; color?: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { setTimeout(() => setWidth(value), 200); }, [value]);
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${width}%`, transition: "width 1.5s ease", background: color, boxShadow: `0 0 6px ${color}` }} />
    </div>
  );
}

export default function Dashboard() {
  const [modal, setModal] = useState(false);
  const [activeNav, setActiveNav] = useState(0);
  const [temp, setTemp] = useState(15);

  useEffect(() => {
    const id = setInterval(() => {
      setTemp(t => parseFloat((t + (Math.random() - 0.5) * 0.3).toFixed(1)));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <QuantumMachine />
      <QuantumVideoScene />

      <div className="qc-root">
        {/* ── NAV ── */}
        <nav className="qc-nav hologram-nav">
          <div className="qc-logo">
            <div className="qc-logo-icon gold">QC</div>
            <span>QUANTUM</span><span style={{ color: "var(--gold)" }}>CORE</span>
          </div>

          <div className="qc-nav-links">
            {NAV_LINKS.map((l, i) => (
              <button key={l} className={`qc-nav-link${i === activeNav ? " active" : ""}`}
                onClick={() => setActiveNav(i)}>
                {l}
              </button>
            ))}
          </div>

          <div className="qc-nav-user">
            USER: Q_ADMIN <div className="dot gold" />
            <div className="hamburger">≡</div>
          </div>
        </nav>

        {/* ── LEFT PANEL ── */}
        <aside className="qc-left hologram-panel">
          <div className="panel" style={{ borderColor: "rgba(212,160,32,0.25)" }}>
            <div className="panel-label">System Status <button className="panel-close">✕</button></div>
            <div className="status-badge gold"><div className="dot gold" /> OPERATIONAL</div>
            <p className="panel-desc">
              All quantum systems online. Real hardware feed active.
            </p>
          </div>

          <div className="stat-row">
            <div className="stat-label">Qubit Stability</div>
            <div className="stat-value gold"><AnimatedNumber target="99.992" />%</div>
            <QubitStabilityBar value={99.992} color="#d4a020" />
            <div className="stat-target">TARGET: &gt; 99.9%</div>
          </div>

          <div className="stat-row">
            <div className="stat-label">System Temperature</div>
            <div className="stat-value blue">{temp} <span style={{ fontSize: 14 }}>mK</span></div>
            <QubitStabilityBar value={(20 - temp) / 20 * 100} color="#00d4ff" />
            <div className="stat-target">TARGET: &lt; 20 mK</div>
          </div>

          <div className="stat-row">
            <div className="stat-label">Quantum Volume</div>
            <div className="stat-value gold"><AnimatedNumber target="128" /></div>
            <div className="stat-target" style={{ marginTop: 4 }}>Last calibration: 3h 42m ago</div>
          </div>

          <div>
            <div className="panel-label" style={{ marginBottom: 8 }}>Active Processes</div>
            <div className="process-list">
              {PROCESSES.map(p => (
                <div key={p} className="process-item">
                  <span className="process-name"><div className="dot gold" />{p}</span>
                  <span className="active-tag gold">Active</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "auto", paddingTop: 8 }}>
            <button className="cta-btn gold" style={{ width: "100%" }}
              onClick={() => setModal(true)}>
              ▸ INITIATE ANALYSIS
            </button>
          </div>
        </aside>

        {/* ── CENTER PANEL ── */}
        <main className="qc-center hologram-panel">
          <div className="panel">
            <div className="panel-label">Quantum Processor</div>
            <div className="panel-title gold">IBM Eagle 127-Qubit</div>
            <div className="qp-status">
              <span>STATUS:</span>
              <span className="status-badge gold"><div className="dot gold" />OPERATIONAL</span>
            </div>
            <div className="qp-grid">
              <div className="qp-visual">
                <svg viewBox="0 0 100 80" width="100" height="80">
                  {[[25,20],[50,20],[75,20],[12,40],[37,40],[62,40],[87,40],[25,60],[50,60],[75,60]].map(([cx,cy],i) => (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r={7} fill="none" stroke="#d4a020" strokeWidth="1" opacity="0.6" />
                      <circle cx={cx} cy={cy} r={3} fill="#d4a020" opacity="0.8" />
                      <text x={cx} y={cy+4} fontSize="5" fill="#d4a020" textAnchor="middle" opacity="0.5">q{i}</text>
                    </g>
                  ))}
                  {[[25,20,12,40],[50,20,37,40],[50,20,62,40],[75,20,62,40],[75,20,87,40],
                    [25,60,12,40],[25,60,37,40],[50,60,37,40],[50,60,62,40],[75,60,62,40],[75,60,87,40]
                  ].map(([x1,y1,x2,y2], i) => (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d4a020" strokeWidth="0.5" opacity="0.3" />
                  ))}
                </svg>
              </div>
              <div className="qp-info">
                {[["127 QUBITS", ""], ["4 LAYERS", ""], ["T1:", "135 µs"], ["T2:", "90 µs"]].map(([k, v], i) => (
                  <div key={i} className="qp-metric">
                    <span>{k}</span>
                    {v && <span>{v}</span>}
                  </div>
                ))}
                <button className="view-btn gold">VIEW TOPOLOGY</button>
              </div>
            </div>
          </div>

          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-label">Quantum Circuit Monitor</div>
            <div style={{ height: 100 }}>
              <CircuitDiagram />
            </div>
          </div>
        </main>

        {/* ── BOTTOM BAR ── */}
        <footer className="qc-bottom hologram-panel">
          <div><SystemLogs /></div>

          <div>
            <div className="panel-label">Real-Time Metrics</div>
            <div style={{ display: "flex", gap: 12, height: "calc(100% - 20px)" }}>
              <LiveChart label="Qubit Coherence" unit="T₂ (µs)" min={85} max={100} color="#d4a020" />
              <LiveChart label="Gate Fidelity" unit="Fidelity (%)" min={99.0} max={100} color="#00d4ff" />
              <LiveChart label="Circuit Depth" unit="Depth" min={400} max={1100} color="#f7a600" />
            </div>
          </div>

          <div>
            <div className="panel-label">Quantum Algorithms</div>
            {ALGOS.map(a => (
              <div key={a} className="algo-row">
                <span>· {a}</span>
                <span className="algo-ready gold">Ready</span>
              </div>
            ))}
          </div>

          <div>
            <div className="panel-label">Network Status</div>
            <div className="status-badge gold" style={{ marginBottom: 10 }}>
              <div className="dot gold" />STATUS: SECURE
            </div>
            {[["LATENCY", "2.3 ms"], ["BANDWIDTH", "10.2 Gbps"], ["ERROR RATE", "0.001%"]].map(([k, v]) => (
              <div key={k} className="net-stat">
                <span>{k}</span><span>{v}</span>
              </div>
            ))}
          </div>
        </footer>
      </div>

      {modal && <AnalysisModal onClose={() => setModal(false)} />}
    </>
  );
}
