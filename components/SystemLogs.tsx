"use client";

import { useEffect, useRef, useState } from "react";

const LOG_POOL = [
  "Qubit calibration completed",
  "Quantum error correction cycle completed",
  "Entanglement verification passed",
  "System temperature stable at 15 mK",
  "All quantum systems operational",
  "Gate fidelity threshold exceeded",
  "Randomized benchmarking complete",
  "Quantum volume validated: 128",
  "Coherence time measurement: T1=135µs T2=90µs",
  "Superconducting junction initialized",
  "Flux bias calibration complete",
  "Cross-resonance gate optimized",
  "Quantum state tomography: PASS",
  "Microwave pulse sequence loaded",
  "Cryostat temperature: 12.4 mK — nominal",
];

type LogEntry = { time: string; level: string; msg: string; id: number };

function getTime() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}:${d.getSeconds().toString().padStart(2,"0")}`;
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>(() =>
    LOG_POOL.slice(0, 5).map((msg, i) => ({ time: "14:35:0" + (9 - i), level: "INFO", msg, id: i }))
  );
  const counter = useRef(100);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const msg = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)];
      setLogs(prev => {
        const next = [{ time: getTime(), level: "INFO", msg, id: counter.current++ }, ...prev].slice(0, 14);
        return next;
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="panel-label">System Logs</div>
      <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 0, overflowY: "hidden" }}>
        {logs.map(l => (
          <div key={l.id} className="log-row">
            <span className="log-time">{l.time}</span>
            <span className="log-level">{l.level}</span>
            <span className="log-msg">{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
