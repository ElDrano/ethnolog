"use client";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function SidebarLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Initialen User-Status abfragen
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    // Listener für Auth-Status-Änderungen
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else setSuccess("Login erfolgreich!");
    setLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setSuccess("Registrierung erfolgreich! Bitte bestätige deine E-Mail.");
    setLoading(false);
  }

  async function handleLogout() {
    setLoading(true);
    setError("");
    setSuccess("");
    await supabase.auth.signOut();
    setLoading(false);
  }

  if (user) {
    // Light Mode erkennen
    const isLight = typeof window !== "undefined" && document.body.classList.contains("light-mode");
    return (
      <div style={{ marginTop: 32, width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Eingeloggt als:</div>
        <div style={{ wordBreak: 'break-all', marginBottom: 8 }}>{user.email}</div>
        <button
          onClick={handleLogout}
          className="logout-button"
          disabled={loading}
        >
          {loading ? "Abmelden..." : "Logout"}
        </button>
      </div>
    );
  }

  return (
    <form className="sidebar-login" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 32, width: '100%' }}>
      <input
        type="email"
        placeholder="E-Mail-Adresse"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Passwort"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Einloggen..." : "Login"}
      </button>
      <button
        type="button"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? "Bitte warten..." : "Registrieren"}
      </button>
      {error && <div className="login-error">{error}</div>}
      {success && <div className="login-success">{success}</div>}
    </form>
  );
} 