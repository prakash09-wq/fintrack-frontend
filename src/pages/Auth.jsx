import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { GoogleIcon } from "../components/UI";

const ERR_MAP = {
  "auth/user-not-found":       "No account found with this email. Please register.",
  "auth/wrong-password":       "Wrong password. Try again.",
  "auth/invalid-credential":   "Wrong email or password.",
  "auth/email-already-in-use": "Email already registered. Sign in instead.",
  "auth/invalid-email":        "Invalid email address.",
  "auth/too-many-requests":    "Too many attempts. Please try later.",
  "auth/popup-closed-by-user": "Sign-in window closed. Please try again.",
  "auth/unauthorized-domain":  "This domain is not authorized. Deploy to Netlify/Vercel and add the domain to Firebase Console → Authentication → Authorized Domains.",
  "auth/network-request-failed": "Network error. Check your internet connection.",
  "auth/operation-not-allowed":  "Google sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.",
};

export default function Auth() {
  const { loginGoogle, loginEmail, registerEmail } = useAuth();
  const [tab,   setTab]   = useState("in");
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const [load,  setLoad]  = useState(false);
  const [gLoad, setGLoad] = useState(false);

  const handleGoogle = async () => {
    setErr(""); setGLoad(true);
    try {
      await loginGoogle();
    } catch (e) {
      setErr(ERR_MAP[e.code] || e.message || "Google sign-in failed. Try email/password instead.");
    }
    setGLoad(false);
  };

  const handleEmail = async () => {
    setErr(""); setLoad(true);
    if (!email.trim() || !pass) { setErr("Please fill in all fields."); setLoad(false); return; }
    if (tab === "up" && !name.trim()) { setErr("Please enter your name."); setLoad(false); return; }
    if (tab === "up" && pass.length < 6) { setErr("Password must be at least 6 characters."); setLoad(false); return; }
    try {
      if (tab === "in") await loginEmail(email.trim(), pass);
      else await registerEmail(name.trim(), email.trim(), pass);
    } catch (e) {
      setErr(ERR_MAP[e.code] || e.message || "Something went wrong. Please try again.");
    }
    setLoad(false);
  };

  return (
    <div className="auth-wrap">
      {/* Left promo */}
      <div className="auth-left">
        <div className="auth-promo">
          <div className="auth-promo-tag">Personal Finance, Simplified</div>
          <h1 className="auth-promo-h">Know where every<br /><span>rupee</span> goes.</h1>
          <p className="auth-promo-p">FinTrack gives you a complete financial cockpit — income, expenses, loans, goals, calendar view and AI-powered insights — all in one clean dashboard.</p>
          <div className="auth-bullets">
            {[
              "Track income and expenses with one click",
              "Interactive calendar shows daily transactions",
              "Mark EMI payments as paid with a checkbox",
              "AI health score based on your real data",
            ].map((b, i) => (
              <div key={i} className="auth-bullet">
                <div className="auth-bullet-ic">✓</div>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-right">
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <div className="auth-brand-ic">Ft</div>
            <div className="auth-brand-nm">Fin<span>Track</span></div>
          </div>
          <div className="auth-tagline">Your personal finance dashboard</div>
        </div>

        <div className="auth-form">
          <div className="tabs" style={{ width: "100%", marginBottom: 22 }}>
            <button className={`tab${tab === "in" ? " on" : ""}`} style={{ flex: 1 }} onClick={() => { setTab("in"); setErr(""); }}>Sign In</button>
            <button className={`tab${tab === "up" ? " on" : ""}`} style={{ flex: 1 }} onClick={() => { setTab("up"); setErr(""); }}>Register</button>
          </div>

          <button className="btn bgoog" onClick={handleGoogle} disabled={gLoad || load}>
            {gLoad
              ? <span style={{ fontSize: 13 }}>Opening Google…</span>
              : <><GoogleIcon />Continue with Google</>
            }
          </button>

          {/* Info about Google auth */}
          <p style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--mono)", textAlign: "center", margin: "6px 0 10px", lineHeight: 1.5 }}>
            Google login works after deploying to Netlify/Vercel
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span className="xs cm mono">or with email</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {tab === "up" && (
            <div className="fr">
              <label className="fl">Full Name</label>
              <input className="fi" placeholder="Jay Prakash Shaw" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div className="fr">
            <label className="fl">Email Address</label>
            <input className="fi" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="fr">
            <label className="fl">Password</label>
            <input
              className="fi" type="password"
              placeholder={tab === "up" ? "Min 6 characters" : "••••••••"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmail()}
            />
          </div>

          {err && (
            <div className="err-box">
              <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
              <span>{err}</span>
            </div>
          )}

          <button className="btn bp w100" style={{ justifyContent: "center", padding: "11px" }} onClick={handleEmail} disabled={load || gLoad}>
            {load ? "Please wait…" : tab === "in" ? "Sign In →" : "Create Account →"}
          </button>

          <p style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)", lineHeight: 1.7 }}>
            NSU Jamshedpur · BCA Final Year 2023–26<br />
            <span style={{ opacity: 0.6 }}>Email/password works offline without Firebase</span>
          </p>
        </div>
      </div>
    </div>
  );
}
