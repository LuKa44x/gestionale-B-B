"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setErrore("Inserisci email e password.");
      return;
    }
    setLoading(true);
    setErrore("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrore(data.errore || "Errore durante il login");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-black bg-gradient">
      <div className="card shadow" style={{ width: "400px" }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1">🏨 Gestionale B&B</h2>
            <p className="text-muted small">Accedi al sistema di gestione</p>
          </div>

          {errore && (
            <div className="alert alert-danger py-2 small mb-3">{errore}</div>
          )}

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <button
            className="btn btn-primary w-100 py-2"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" />
                Accesso in corso...
              </span>
            ) : (
              "Accedi"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
