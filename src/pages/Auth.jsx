import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { GoogleIcon } from "../components/UI";

const ERR_MAP = {
  "auth/user-not-found":         "No account found with this email. Please register.",
  "auth/wrong-password":         "Wrong password. Try again.",
  "auth/invalid-credential":     "Wrong email or password.",
  "auth/email-already-in-use":   "Email already registered. Sign in instead.",
  "auth/invalid-email":          "Invalid email address.",
  "auth/too-many-requests":      "Too many attempts. Please try later.",
  "auth/popup-closed-by-user":   "Sign-in window closed. Please try again.",
  "auth/unauthorized-domain":    "This domain is not authorized. Deploy to Netlify/Vercel and add the domain to Firebase Console → Authentication → Authorized Domains.",
  "auth/network-request-failed": "Network error. Check your internet connection.",
  "auth/operation-not-allowed":  "Google sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.",
};

// ── Email validation ─────────────────────────────────────────────
const DISPOSABLE_DOMAINS = [
  "mailinator.com","guerrillamail.com","tempmail.com","10minutemail.com",
  "throwaway.email","yopmail.com","trashmail.com","sharklasers.com",
  "guerrillamailblock.com","grr.la","guerrillamail.info","guerrillamail.biz",
  "guerrillamail.de","guerrillamail.net","guerrillamail.org","spam4.me",
  "fakeinbox.com","maildrop.cc","dispostable.com","mailnull.com",
  "spamgourmet.com","spamgourmet.net","spamgourmet.org","spamgourmet.me",
  "mt2015.com","mt2014.com","discard.email","spamfree24.org","spamfree24.de",
  "spamfree24.net","spamfree24.info","spamfree24.biz","spamfree24.eu",
];

const VALID_TLDS = [
  "com","in","co","org","net","edu","gov","io","info","biz",
  "ac","co.in","org.in","net.in","edu.in","gov.in",
  "co.uk","org.uk","me","app","dev","tech","ai","xyz",
];

function validateEmail(email) {
  email = email.trim().toLowerCase();
  if (!email) return "Email is required.";

  // Basic format check
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return "Invalid email format. Example: name@gmail.com";

  const [local, domain] = email.split("@");

  // Local part checks
  if (local.length < 1)          return "Email username is too short.";
  if (local.length > 64)         return "Email username is too long.";
  if (local.startsWith("."))     return "Email cannot start with a dot.";
  if (local.endsWith("."))       return "Email cannot end with a dot.";
  if (local.includes(".."))      return "Email cannot contain consecutive dots.";
  if (/[<>()[\]\\,;:@"]/.test(local)) return "Email contains invalid characters.";

  // Domain checks
  if (!domain.includes("."))     return "Email domain is invalid.";
  const parts = domain.split(".");
  if (parts.some(p => p.length === 0)) return "Email domain is invalid.";
  if (parts[0].length < 2)      return "Email domain name is too short.";

  // TLD check
  const tld = parts.slice(-1)[0];
  if (tld.length < 2)            return "Email TLD is invalid.";
  if (/[^a-z]/.test(tld))        return "Email TLD contains invalid characters.";

  // Disposable email check
  if (DISPOSABLE_DOMAINS.includes(domain)) {
    return "Disposable/temporary email addresses are not allowed. Please use a real email.";
  }

  // Common typo detection
  const typoMap = {
    "gmial.com":"gmail.com","gmali.com":"gmail.com","gmal.com":"gmail.com",
    "gmaill.com":"gmail.com","gmai.com":"gmail.com","gmail.co":"gmail.com",
    "gnail.com":"gmail.com","yahooo.com":"yahoo.com","yhoo.com":"yahoo.com",
    "yaho.com":"yahoo.com","yahoo.co":"yahoo.in","hotmal.com":"hotmail.com",
    "hotmaill.com":"hotmail.com","hotmial.com":"hotmail.com",
    "outlok.com":"outlook.com","outlookk.com":"outlook.com",
  };
  if (typoMap[domain]) {
    return `Did you mean ${local}@${typoMap[domain]}?`;
  }

  return null; // valid
}

function validatePassword(pass, isRegister) {
  if (!pass) return "Password is required.";
  if (!isRegister) return null; // only strict checks on register
  if (pass.length < 6) return "Password must be at least 6 characters.";
  if (pass.length > 128) return "Password is too long.";
  if (/^\s+$/.test(pass)) return "Password cannot be only spaces.";
  // Check for very weak passwords
  const weak = ["123456","password","123456789","qwerty","abc123","111111","letmein","welcome","monkey","dragon"];
  if (weak.includes(pass.toLowerCase())) return "This password is too common. Choose a stronger one.";
  return null;
}

function validateName(name) {
  if (!name.trim()) return "Full name is required.";
  if (name.trim().length < 2) return "Name is too short.";
  if (name.trim().length > 100) return "Name is too long.";
  if (/[^a-zA-Z\s\-\.']/.test(name)) return "Name contains invalid characters.";
  if (/^\s/.test(name) || /\s$/.test(name)) return "Name cannot start or end with spaces.";
  return null;
}

export default function Auth() {
  const { loginGoogle, loginEmail, registerEmail } = useAuth();
  const [tab,    setTab]    = useState("in");
  const [name,   setName]   = useState("");
  const [email,  setEmail]  = useState("");
  const [pass,   setPass]   = useState("");
  const [errors, setErrors] = useState({});
  const [gErr,   setGErr]   = useState("");
  const [load,   setLoad]   = useState(false);
  const [gLoad,  setGLoad]  = useState(false);

  const clearErr = (field) => setErrors(prev => ({ ...prev, [field]: "" }));

  // Real-time email validation on blur
  const handleEmailBlur = () => {
    const e = validateEmail(email);
    if (e) setErrors(prev => ({ ...prev, email: e }));
    else clearErr("email");
  };

  const validate = () => {
    const errs = {};
    if (tab === "up") {
      const ne = validateName(name);
      if (ne) errs.name = ne;
    }
    const ee = validateEmail(email);
    if (ee) errs.email = ee;
    const pe = validatePassword(pass, tab === "up");
    if (pe) errs.pass = pe;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGoogle = async () => {
    setGErr(""); setGLoad(true);
    try { await loginGoogle(); }
    catch (e) { setGErr(ERR_MAP[e.code] || e.message || "Google sign-in failed. Try email instead."); }
    setGLoad(false);
  };

  const handleEmail = async () => {
    if (!validate()) return;
    setLoad(true);
    try {
      if (tab === "in") await loginEmail(email.trim(), pass);
      else await registerEmail(name.trim(), email.trim(), pass);
    } catch (e) {
      const msg = ERR_MAP[e.code] || e.message || "Something went wrong.";
      // Route error to appropriate field
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") setErrors({ pass: msg });
      else if (e.code === "auth/user-not-found") setErrors({ email: msg });
      else if (e.code === "auth/email-already-in-use") setErrors({ email: msg });
      else setErrors({ form: msg });
    }
    setLoad(false);
  };

  const switchTab = (t) => { setTab(t); setErrors({}); setGErr(""); };

  const inputStyle = (field) => ({
    borderColor: errors[field] ? "var(--R)" : undefined,
    boxShadow:   errors[field] ? "0 0 0 3px var(--RL)" : undefined,
  });

  return (
    <div className="auth-wrap">
      {/* Left promo */}
      <div className="auth-left">
        <div className="auth-promo">
          <div className="auth-promo-tag">Personal Finance, Simplified</div>
          <h1 className="auth-promo-h">Know where every<br /><span>rupee</span> goes.</h1>
          <p className="auth-promo-p">FinTrack gives you a complete financial cockpit — income, expenses, loans, goals, calendar view and financial health insights — all in one clean dashboard.</p>
          <div className="auth-bullets">
            {[
              "Track income and expenses with one click",
              "Interactive calendar shows daily transactions",
              "Mark EMI payments as paid with a checkbox",
              "Financial health score based on your real data",
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
            <button className={`tab${tab === "in" ? " on" : ""}`} style={{ flex: 1 }} onClick={() => switchTab("in")}>Sign In</button>
            <button className={`tab${tab === "up" ? " on" : ""}`} style={{ flex: 1 }} onClick={() => switchTab("up")}>Register</button>
          </div>

          {/* Google */}
          <button className="btn bgoog" onClick={handleGoogle} disabled={gLoad || load}>
            {gLoad ? <span style={{ fontSize: 13 }}>Opening Google…</span> : <><GoogleIcon />Continue with Google</>}
          </button>
          {gErr && <div className="err-box" style={{ marginTop: 8 }}><span style={{ flexShrink: 0 }}>⚠</span><span>{gErr}</span></div>}
          <p style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--mono)", textAlign: "center", margin: "6px 0 10px" }}>
            Google login works after deploying to Netlify/Vercel
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span className="xs cm mono">or with email</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Name (register only) */}
          {tab === "up" && (
            <div className="fr">
              <label className="fl">Full Name</label>
              <input className="fi" placeholder="Jay Prakash Shaw" value={name}
                onChange={e => { setName(e.target.value); clearErr("name"); }}
                style={inputStyle("name")} />
              {errors.name && <div style={{ fontSize: 11, color: "var(--R)", marginTop: 4, fontFamily: "var(--mono)" }}>⚠ {errors.name}</div>}
            </div>
          )}

          {/* Email */}
          <div className="fr">
            <label className="fl">Email Address</label>
            <input className="fi" type="email" placeholder="you@gmail.com" value={email}
              onChange={e => { setEmail(e.target.value); clearErr("email"); }}
              onBlur={handleEmailBlur}
              style={inputStyle("email")} />
            {errors.email && <div style={{ fontSize: 11, color: "var(--R)", marginTop: 4, fontFamily: "var(--mono)" }}>⚠ {errors.email}</div>}
          </div>

          {/* Password */}
          <div className="fr">
            <label className="fl">Password</label>
            <input className="fi" type="password"
              placeholder={tab === "up" ? "Min 6 characters" : "••••••••"}
              value={pass}
              onChange={e => { setPass(e.target.value); clearErr("pass"); }}
              onKeyDown={e => e.key === "Enter" && handleEmail()}
              style={inputStyle("pass")} />
            {errors.pass && <div style={{ fontSize: 11, color: "var(--R)", marginTop: 4, fontFamily: "var(--mono)" }}>⚠ {errors.pass}</div>}
            {tab === "up" && !errors.pass && pass.length > 0 && (
              <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                {[1,2,3,4].map(i => {
                  const strength = pass.length >= 12 ? 4 : pass.length >= 8 ? 3 : pass.length >= 6 ? 2 : 1;
                  const colors = ["var(--R)","var(--Y)","var(--B)","var(--G)"];
                  return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? colors[strength-1] : "var(--border)", transition: "background 0.3s" }} />;
                })}
                <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--mono)", marginLeft: 6, whiteSpace: "nowrap" }}>
                  {pass.length >= 12 ? "Strong" : pass.length >= 8 ? "Good" : pass.length >= 6 ? "Weak" : "Too short"}
                </span>
              </div>
            )}
          </div>

          {/* Form-level error */}
          {errors.form && (
            <div className="err-box"><span style={{ flexShrink: 0 }}>⚠</span><span>{errors.form}</span></div>
          )}

          <button className="btn bp w100" style={{ justifyContent: "center", padding: "11px" }}
            onClick={handleEmail} disabled={load || gLoad}>
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
