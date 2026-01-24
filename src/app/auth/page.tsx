"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AuthPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [magicStatus, setMagicStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [magicMessage, setMagicMessage] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [magicEmail, setMagicEmail] = useState("");

  async function handleMagic(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMagicStatus("loading");
    setMagicMessage(null);
    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email: magicEmail,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined,
      },
    });

    if (error) {
      setMagicStatus("error");
      setMagicMessage(error.message);
      return;
    }

    setMagicStatus("done");
    setMagicMessage("Bağlantı maili gönderildi.");
    setMagicEmail("");
  }

  async function handlePasswordAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthStatus("loading");
    setAuthMessage(null);

    if (mode === "signin") {
      const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthStatus("error");
        setAuthMessage(error.message);
        return;
      }
      setAuthStatus("done");
      setAuthMessage("Giriş başarılı.");
    } else {
      const { error } = await supabaseBrowser.auth.signUp({ email, password });
      if (error) {
        setAuthStatus("error");
        setAuthMessage(error.message);
        return;
      }
      setAuthStatus("done");
      setAuthMessage("Kayıt oluşturuldu. Mail doğrulaması gerekebilir.");
    }
    setEmail("");
    setPassword("");
  }

  return (
    <main className="content">
      <div className="container auth-grid">
        <section className="card">
          <p className="eyebrow">Giriş</p>
          <h1>Hesabına eriş</h1>
          <p className="subtitle">
            Yorum ve maaş paylaşmak için hesap oluştur veya giriş yap.
          </p>
          {user && (
            <div className="notice">
              Zaten giriş yaptın: <strong>{user.email}</strong>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Magic Link</h2>
          <form className="form-grid" onSubmit={handleMagic}>
            <input
              type="email"
              placeholder="E-posta"
              value={magicEmail}
              onChange={(event) => setMagicEmail(event.target.value)}
              required
            />
            <button className="btn primary" type="submit" disabled={magicStatus === "loading"}>
              Bağlantı Gönder
            </button>
            {magicMessage && <p className="muted">{magicMessage}</p>}
          </form>
        </section>

        <section className="card">
          <div className="mode-toggle">
            <button
              type="button"
              className={mode === "signin" ? "btn primary" : "btn ghost"}
              onClick={() => setMode("signin")}
            >
              Giriş
            </button>
            <button
              type="button"
              className={mode === "signup" ? "btn primary" : "btn ghost"}
              onClick={() => setMode("signup")}
            >
              Kayıt Ol
            </button>
          </div>
          <form className="form-grid" onSubmit={handlePasswordAuth}>
            <input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button className="btn primary" type="submit" disabled={authStatus === "loading"}>
              {mode === "signin" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
            {authMessage && <p className="muted">{authMessage}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}
