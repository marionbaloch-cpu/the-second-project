"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/public/videos/hf_20260714_144850_b913f87f-8fec-466c-9cc8-04568de04728.mp4";

export default function QuantumMachine() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const px = mouse.x * 12;
  const py = mouse.y * 8;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        background: "#050508",
      }}
    >
      {/* Real quantum computer video backdrop */}
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          minWidth: "100%",
          minHeight: "100%",
          width: "auto",
          height: "auto",
          transform: `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`,
          objectFit: "cover",
          opacity: 0.95,
          transition: "transform 0.15s ease-out",
          filter: "brightness(0.85) contrast(1.08) saturate(1.05)",
        }}
      />

      {/* Server-room vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 80% at 50% 45%, transparent 30%, rgba(5,5,10,0.55) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Left edge fade for HUD readability */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: "28%",
          background:
            "linear-gradient(to right, rgba(5,5,10,0.92) 0%, rgba(5,5,10,0.6) 50%, transparent 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Bottom edge fade for bottom bar readability */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "22%",
          background:
            "linear-gradient(to top, rgba(5,5,10,0.92) 0%, rgba(5,5,10,0.4) 60%, transparent 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* CRT scanline texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
          zIndex: 3,
          pointerEvents: "none",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
