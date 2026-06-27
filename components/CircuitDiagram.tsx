"use client";

import { useEffect, useRef } from "react";

export default function CircuitDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const gates = svgRef.current?.querySelectorAll(".gate-box");
    let frame = 0;
    const id = setInterval(() => {
      gates?.forEach((g, i) => {
        const el = g as SVGElement;
        const active = (frame + i) % 5 === 0;
        el.setAttribute("opacity", active ? "1" : "0.4");
        el.setAttribute("filter", active ? "url(#glow)" : "");
      });
      frame++;
    }, 600);
    return () => clearInterval(id);
  }, []);

  const rows = ["q[0]", "q[1]", "q[2]", "q[3]", "q[126]"];
  const gateSymbols = [
    ["H", "•", "T", "S", "X", "H"],
    ["•", "X", "H", "T", "S", "•"],
    ["T", "H", "•", "X", null, "H"],
    [null, null, "X", "H", "T", "S"],
    [null, null, null, null, "X", "H"],
  ];

  const W = 320;
  const H = 110;
  const rowH = 18;
  const startY = 14;
  const labelX = 28;
  const wireStartX = 42;
  const gateSpacing = 44;
  const firstGateX = 55;

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {rows.map((label, ri) => {
        const y = startY + ri * rowH;
        return (
          <g key={ri}>
            {/* Label */}
            <text x={labelX - 2} y={y + 4} fontSize="7" fill="#4a6a4a"
              textAnchor="end" fontFamily="Courier New">{label}</text>
            {/* Wire */}
            <line x1={wireStartX} y1={y} x2={W - 8} y2={y}
              stroke="#00ff41" strokeWidth="0.5" opacity="0.3" />
          </g>
        );
      })}

      {rows.map((_, ri) => {
        const y = startY + ri * rowH;
        return gateSymbols[ri].map((sym, gi) => {
          if (!sym) {
            const x = firstGateX + gi * gateSpacing;
            if (ri > 0 && gateSymbols[ri - 1][gi] === "•") {
              return (
                <line key={`ctrl-${ri}-${gi}`}
                  x1={x} y1={startY + (ri - 1) * rowH}
                  x2={x} y2={y}
                  stroke="#00ff41" strokeWidth="0.5" opacity="0.4" />
              );
            }
            return null;
          }
          const x = firstGateX + gi * gateSpacing;
          if (sym === "•") {
            return (
              <circle key={`${ri}-${gi}`} cx={x} cy={y} r={4}
                fill="#00ff41" opacity="0.5" className="gate-box" />
            );
          }
          return (
            <g key={`${ri}-${gi}`} className="gate-box">
              <rect x={x - 9} y={y - 7} width={18} height={14}
                fill="rgba(0,18,8,0.9)" stroke="#00ff41" strokeWidth="0.8" opacity="0.5" rx="1" />
              <text x={x} y={y + 4} fontSize="8" fill="#00ff41"
                textAnchor="middle" fontFamily="Courier New">{sym}</text>
            </g>
          );
        });
      })}
    </svg>
  );
}
