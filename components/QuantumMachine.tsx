"use client";

import { useEffect, useState } from "react";

export default function QuantumMachine() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMouse({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const px = mouse.x * 18;
  const py = mouse.y * 12;

  return (
    <div style={{
      position: "fixed",
      right: 0, top: 0, bottom: 0,
      width: "54%",
      zIndex: 0,
      overflow: "hidden",
      pointerEvents: "none",
    }}>

      {/* ── PHOTO (parallax layer 1 — primary) ── */}
      <img
        src="/quantum-computer.png"
        alt=""
        style={{
          position: "absolute",
          top: "50%", left: "55%",
          transform: `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`,
          height: "95%",
          width: "auto",
          objectFit: "contain",
          zIndex: 1,
          transition: "transform 0.12s ease-out",
          filter: "brightness(0.85) contrast(1.12) saturate(1.08)",
        }}
      />

      {/* ── DEPTH LAYER: warm gold glow behind machine (moves faster = farther) ── */}
      <div style={{
        position: "absolute",
        top: "50%", left: "55%",
        transform: `translate(calc(-50% + ${px * 1.8}px), calc(-50% + ${py * 1.8}px))`,
        width: 500, height: 600,
        marginLeft: -250, marginTop: -300,
        background: "radial-gradient(ellipse at center, rgba(200,130,10,0.22) 0%, rgba(160,90,0,0.08) 50%, transparent 75%)",
        zIndex: 0,
        transition: "transform 0.18s ease-out",
        animation: "qm-glow 4s ease-in-out infinite",
      }} />

      {/* ── DEPTH LAYER: blue quantum glow at base ── */}
      <div style={{
        position: "absolute",
        bottom: "18%", left: "55%",
        transform: `translateX(calc(-50% + ${px * 1.4}px))`,
        width: 320, height: 100,
        background: "radial-gradient(ellipse at center, rgba(0,60,255,0.45) 0%, rgba(0,20,180,0.15) 50%, transparent 75%)",
        filter: "blur(10px)",
        zIndex: 2,
        transition: "transform 0.15s ease-out",
        animation: "qm-blue 3s ease-in-out infinite",
      }} />

      {/* ── SCAN LINE ── */}
      <div style={{
        position: "absolute",
        left: "15%", right: 0,
        height: 2,
        background: "linear-gradient(to right, transparent 0%, rgba(0,255,65,0.5) 30%, rgba(0,255,65,0.15) 70%, transparent 100%)",
        zIndex: 5,
        animation: "qm-scan 7s linear infinite",
        boxShadow: "0 0 8px rgba(0,255,65,0.3)",
      }} />

      {/* ── SECOND SCAN (offset) ── */}
      <div style={{
        position: "absolute",
        left: "15%", right: 0,
        height: 1,
        background: "linear-gradient(to right, transparent 0%, rgba(0,180,255,0.3) 40%, transparent 100%)",
        zIndex: 5,
        animation: "qm-scan 7s linear infinite 3.5s",
      }} />

      {/* ── LEFT EDGE FADE (blends into panels) ── */}
      <div style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0,
        width: "36%",
        background: "linear-gradient(to right, #050508 0%, rgba(5,5,8,0.92) 40%, rgba(5,5,8,0.5) 70%, transparent 100%)",
        zIndex: 6,
        pointerEvents: "none",
      }} />

      {/* ── TOP EDGE FADE ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "12%",
        background: "linear-gradient(to bottom, #050508 0%, transparent 100%)",
        zIndex: 6, pointerEvents: "none",
      }} />

      {/* ── BOTTOM EDGE FADE ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: "18%",
        background: "linear-gradient(to top, #050508 0%, transparent 100%)",
        zIndex: 6, pointerEvents: "none",
      }} />

      {/* ── VIGNETTE (darkens edges, adds depth) ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 70% 75% at 62% 48%, transparent 30%, rgba(2,3,6,0.65) 100%)",
        zIndex: 4,
        pointerEvents: "none",
      }} />

      {/* ── SUBTLE COOL TOP (data-center ceiling color) ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "35%",
        background: "linear-gradient(to bottom, rgba(0,10,30,0.35) 0%, transparent 100%)",
        zIndex: 3,
        pointerEvents: "none",
      }} />

      {/* ── SCANLINE TEXTURE (CRT feel) ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
        zIndex: 7,
        pointerEvents: "none",
        opacity: 0.6,
      }} />
    </div>
  );
}
