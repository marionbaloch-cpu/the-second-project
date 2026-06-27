"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AnalysisModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", surname: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      sessionStorage.setItem("qc-name", form.name);
      router.push("/scan");
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="modal-bg" onClick={loading ? undefined : onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {!loading && (
          <button className="modal-close" onClick={onClose}>✕</button>
        )}
        <div className="modal-tag">▸ QUANTUM ASSET ANALYSIS INITIATION</div>
        <h2 className="modal-title">Begin Quantum Search</h2>
        <p className="modal-desc">
          Provide your credentials to initiate the quantum asset verification process.
          All data is encrypted end-to-end.
        </p>

        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-field">
              <label>First Name</label>
              <input type="text" placeholder="Enter first name"
                value={form.name} onChange={set("name")} required disabled={loading} />
            </div>
            <div className="form-field">
              <label>Surname</label>
              <input type="text" placeholder="Enter surname"
                value={form.surname} onChange={set("surname")} required disabled={loading} />
            </div>
          </div>

          <div className="form-field">
            <label>Phone Number</label>
            <input type="tel" placeholder="+1 000 000 0000"
              value={form.phone} onChange={set("phone")} required disabled={loading} />
          </div>

          {error && (
            <p style={{ color: "#ff4040", fontSize: 10, letterSpacing: "0.06em", margin: "8px 0" }}>
              ✕ Connection error — please try again.
            </p>
          )}

          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? (
              <><span className="submit-spinner" />Connecting to quantum network…</>
            ) : (
              <>▸ START QUANTUM ASSET ANALYSIS</>
            )}
          </button>

          <p className="form-legal">
            By submitting you agree to our Terms of Service and Privacy Policy.
            Quantum-encrypted transmission — Session ID generated automatically.
          </p>
        </form>
      </div>
    </div>
  );
}
