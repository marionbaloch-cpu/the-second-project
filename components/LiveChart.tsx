"use client";

import { useEffect, useRef } from "react";

interface Props {
  label: string;
  unit: string;
  min: number;
  max: number;
  color?: string;
}

export default function LiveChart({ label, unit, min, max, color = "#00ff41" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<number[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;

    // Seed with some history
    for (let i = 0; i < 60; i++) {
      dataRef.current.push(min + Math.random() * (max - min));
    }

    let lastTick = 0;
    function draw(now: number) {
      if (now - lastTick > 400) {
        lastTick = now;
        const last = dataRef.current[dataRef.current.length - 1];
        const next = Math.max(min, Math.min(max, last + (Math.random() - 0.48) * (max - min) * 0.06));
        dataRef.current.push(next);
        if (dataRef.current.length > 80) dataRef.current.shift();
      }

      ctx.clearRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = "rgba(0,255,65,0.06)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 3; i++) {
        const y = (i / 3) * H;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Gradient fill
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, `${color}28`);
      grad.addColorStop(1, "transparent");

      const data = dataRef.current;
      const step = W / (data.length - 1);

      ctx.beginPath();
      data.forEach((v, i) => {
        const x = i * step;
        const y = H - ((v - min) / (max - min)) * H;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      const lastX = (data.length - 1) * step;
      const lastY = H - ((data[data.length - 1] - min) / (max - min)) * H;
      ctx.lineTo(lastX, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = i * step;
        const y = H - ((v - min) / (max - min)) * H;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 4;
      ctx.stroke();

      // Current dot
      ctx.beginPath();
      ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowBlur = 8;
      ctx.fill();

      // Current value
      const cur = data[data.length - 1].toFixed(1);
      ctx.font = "10px 'Courier New'";
      ctx.fillStyle = "#fff";
      ctx.shadowBlur = 0;
      ctx.fillText(cur, lastX - 24, lastY - 7);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [min, max, color]);

  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "var(--text-dim)", marginBottom: 4 }}>
        {label} ({unit})
      </div>
      <canvas ref={canvasRef} width={160} height={54}
        style={{ width: "100%", height: 54, display: "block" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "var(--text-dim)", marginTop: 2 }}>
        <span>-60s</span><span>-30s</span><span>Now</span>
      </div>
    </div>
  );
}
