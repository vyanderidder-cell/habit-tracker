import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Auth() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const action =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error } = await action;
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    if (mode === "signup") {
      setConfirmSent(true);
    }
  }

  return (
    <div className="auth-shell">
      <h1>Carnet</h1>
      <p>Sport, peau, énergie — coche chaque jour, garde tes séries.</p>

      {confirmSent ? (
        <p>Vérifie ta boîte mail pour confirmer ton compte, puis reviens te connecter.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "…" : mode === "signin" ? "Se connecter" : "Créer un compte"}
          </button>
        </form>
      )}

      <div className="auth-toggle">
        {mode === "signin" ? (
          <>
            Pas encore de compte ?{" "}
            <button onClick={() => setMode("signup")}>Créer un compte</button>
          </>
        ) : (
          <>
            Déjà un compte ?{" "}
            <button onClick={() => setMode("signin")}>Se connecter</button>
          </>
        )}
      </div>
    </div>
  );
}
