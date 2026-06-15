import { useState } from "react";
import { supabase } from "./supabase";

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "register" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handle = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    setLoading(true);

    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setInfo("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
        setLoading(false);
        return;
      }

      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && !data.session) {
          setInfo("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
          setLoading(false);
          return;
        }
        onAuth(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      }
    } catch (err) {
      const msgs = {
        "Invalid login credentials": "E-mail ou senha incorretos.",
        "Email not confirmed": "Confirme seu e-mail antes de entrar.",
        "User already registered": "Este e-mail já está cadastrado.",
        "Password should be at least 6 characters": "A senha deve ter no mínimo 6 caracteres.",
      };
      setError(msgs[err.message] || err.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.logo}>✍️</div>
        <h1 style={styles.title}>Romance Writer Studio</h1>
        <p style={styles.subtitle}>
          {mode === "login" && "Entre para acessar suas histórias em qualquer dispositivo"}
          {mode === "register" && "Crie sua conta e escreva de onde quiser"}
          {mode === "reset" && "Recupere o acesso à sua conta"}
        </p>

        <form onSubmit={handle} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>

          {mode !== "reset" && (
            <div style={styles.field}>
              <label style={styles.label}>Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
          )}

          {error && <p style={styles.error}>{error}</p>}
          {info && <p style={styles.info}>{info}</p>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : mode === "register" ? "Criar Conta" : "Enviar E-mail"}
          </button>
        </form>

        <div style={styles.links}>
          {mode === "login" && (
            <>
              <button style={styles.link} onClick={() => { setMode("register"); setError(""); setInfo(""); }}>
                Criar nova conta
              </button>
              <span style={{ color: "#c9a96e", opacity: 0.4 }}>·</span>
              <button style={styles.link} onClick={() => { setMode("reset"); setError(""); setInfo(""); }}>
                Esqueci a senha
              </button>
            </>
          )}
          {(mode === "register" || mode === "reset") && (
            <button style={styles.link} onClick={() => { setMode("login"); setError(""); setInfo(""); }}>
              ← Voltar para o login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1a0a2e 0%, #2d1052 50%, #1a0a2e 100%)",
    padding: 20,
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(201,169,110,0.2)",
    borderRadius: 20,
    padding: "40px 36px",
    maxWidth: 400,
    width: "100%",
    textAlign: "center",
    backdropFilter: "blur(12px)",
  },
  logo: { fontSize: 48, marginBottom: 8 },
  title: {
    fontFamily: "'Playfair Display', Georgia, serif",
    color: "#c9a96e",
    fontSize: 22,
    fontWeight: 700,
    margin: "0 0 8px",
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginBottom: 28,
    lineHeight: 1.5,
  },
  form: { textAlign: "left" },
  field: { marginBottom: 16 },
  label: {
    display: "block",
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginBottom: 6,
    fontWeight: 500,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(201,169,110,0.25)",
    borderRadius: 10,
    color: "#fff",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  },
  error: {
    color: "#ff8a8a",
    fontSize: 13,
    marginBottom: 12,
    padding: "8px 12px",
    background: "rgba(255,100,100,0.1)",
    borderRadius: 8,
  },
  info: {
    color: "#8aff9e",
    fontSize: 13,
    marginBottom: 12,
    padding: "8px 12px",
    background: "rgba(100,255,150,0.1)",
    borderRadius: 8,
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #c9a96e, #e8c98a)",
    color: "#1a0a2e",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 4,
  },
  links: {
    marginTop: 20,
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  link: {
    background: "none",
    border: "none",
    color: "#c9a96e",
    fontSize: 13,
    cursor: "pointer",
    textDecoration: "underline",
    padding: 0,
  },
};
