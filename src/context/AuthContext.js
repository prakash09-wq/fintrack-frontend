import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile,
} from "firebase/auth";
import { SEED } from "../data/mockData";
import { api, setToken, clearToken, getToken } from "../utils/api";

// ── Firebase ──────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyCrsOBfYT55CaVR5UI0oLD6XkFkitjk6AI",
  authDomain:        "fintrack-47c01.firebaseapp.com",
  projectId:         "fintrack-47c01",
  storageBucket:     "fintrack-47c01.firebasestorage.app",
  messagingSenderId: "537814429700",
  appId:             "1:537814429700:web:27022515d5c399c1134551",
  measurementId:     "G-KV82QZTDJJ",
};

let auth_ = null, googleProvider_ = null;
try {
  const app_ = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth_           = getAuth(app_);
  googleProvider_ = new GoogleAuthProvider();
  googleProvider_.setCustomParameters({ prompt: "select_account" });
} catch (e) { console.warn("Firebase:", e.message); }

// ── Local fallback (demo / offline mode) ─────────────────────────
const USERS_KEY       = "ft_users_v3";
const getLocalUsers   = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY) || "{}"); } catch { return {}; } };
const saveLocalUser   = (email, pass, name) => { const u = getLocalUsers(); u[email] = { hash: btoa(unescape(encodeURIComponent(email + ":" + pass))), name }; localStorage.setItem(USERS_KEY, JSON.stringify(u)); };
const verifyLocalUser = (email, pass) => { const u = getLocalUsers(); return u[email]?.hash === btoa(unescape(encodeURIComponent(email + ":" + pass))) ? u[email] : null; };

const dbKey  = (uid) => `ft_data_${uid}`;
const loadDB = (uid) => { try { const d = localStorage.getItem(dbKey(uid)); return d ? JSON.parse(d) : null; } catch { return null; } };
const saveDB = (uid, data) => { try { localStorage.setItem(dbKey(uid), JSON.stringify(data)); } catch (e) {} };

// ── Check if backend is available ─────────────────────────────────
let backendAvailable = null;
async function checkBackend() {
  if (backendAvailable !== null) return backendAvailable;
  try {
    const res = await fetch((await import("../utils/api")).API_URL + "/api/health", { signal: AbortSignal.timeout(3000) });
    backendAvailable = res.ok;
  } catch { backendAvailable = false; }
  return backendAvailable;
}

// ── Convert backend data format to frontend format ─────────────────
function backendToFrontend(bData) {
  return {
    txns:    (bData.transactions || []).map(t => ({
      id: t.txn_id, type: t.type, amount: Number(t.amount),
      category: t.category, description: t.description || "",
      date: t.date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    })),
    loans:   (bData.loans || []).map(l => ({
      id: l.loan_id, lender: l.lender_name, principal: Number(l.principal),
      rate: Number(l.interest_rate), months: l.tenure_months,
      start: l.start_date?.slice(0, 10) || "",
      paid: Number(l.amount_paid), status: l.status,
      payments: (l.payments || []).map(p => ({
        id: p.payment_id, m: p.month_label, amt: Number(p.emi_amount),
        prin: Number(p.principal_part), int: Number(p.interest_part),
        done: p.is_paid,
      })),
    })),
    goals:   (bData.goals || []).map(g => ({
      id: g.goal_id, name: g.name,
      target: Number(g.target_amount), saved: Number(g.saved_amount),
      deadline: g.deadline?.slice(0, 10) || "",
    })),
    budgets: (bData.budgets || []).map(b => ({
      id: b.budget_id, category: b.category,
      limit: Number(b.limit_amount), spent: Number(b.spent_amount),
      month: b.month, year: b.year,
    })),
    assets:  (bData.assets || []).map(a => ({
      id: a.asset_id, name: a.name, type: a.type, value: Number(a.value),
    })),
    liabs:   (bData.liabilities || []).map(l => ({
      id: l.liability_id, name: l.name, type: l.type,
      owed: Number(l.amount_owed), due: l.due_date?.slice(0, 10) || "",
    })),
  };
}

// ── Load all data from backend ─────────────────────────────────────
async function loadFromBackend() {
  const [txnRes, assetRes, liabRes, loanRes, goalRes] = await Promise.all([
    api.txns.getAll({ limit: 200 }),
    api.assets.getAll(),
    api.liabs.getAll(),
    api.loans.getAll(),
    api.goals.getAll(),
  ]);

  const now = new Date();
  const budgetRes = await api.budgets.getAll(now.getMonth() + 1, now.getFullYear()).catch(() => ({ budgets: [] }));

  return backendToFrontend({
    transactions: txnRes.data?.transactions || [],
    assets:       assetRes.data?.assets     || [],
    liabilities:  liabRes.data?.liabilities || [],
    loans:        loanRes.data?.loans        || [],
    goals:        goalRes.data?.goals        || [],
    budgets:      budgetRes.data?.budgets    || [],
  });
}

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user,       setUser]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [data,       setData_]      = useState(null);
  const [useBackend, setUseBackend] = useState(false);

  const initUser = useCallback(async (u, jwtToken = null) => {
    setUser(u);
    if (jwtToken) setToken(jwtToken);

    // Try backend first
    const hasBackend = await checkBackend();
    setUseBackend(hasBackend && !!getToken());

    if (hasBackend && getToken()) {
      try {
        const d = await loadFromBackend();
        setData_(d);
        setLoading(false);
        return;
      } catch (e) {
        console.warn("Backend load failed, falling back to localStorage:", e.message);
      }
    }

    // Fallback: localStorage
    const saved = loadDB(u.uid);
    const d = saved || SEED();
    setData_(d);
    if (!saved) saveDB(u.uid, d);
    setLoading(false);
  }, []);

  const setData = useCallback((updater) => {
    setData_((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }, []);

  // Auto-save to localStorage as backup
  useEffect(() => {
    if (user && data) saveDB(user.uid, data);
  }, [user, data]);

  // Firebase auth state
  useEffect(() => {
    if (!auth_) { setLoading(false); return; }

    getRedirectResult(auth_).then(async (res) => {
      if (res?.user) {
        const u = res.user;
        let jwt = null;
        try {
          const idToken = await u.getIdToken();
          const r = await api.auth.firebaseSync(idToken);
          jwt = r.data?.token;
        } catch {}
        await initUser({ uid: u.uid, name: u.displayName || u.email?.split("@")[0] || "User", email: u.email, photo: u.photoURL, provider: "google" }, jwt);
      }
    }).catch(() => {});

    const unsub = onAuthStateChanged(auth_, async (fu) => {
      if (fu) {
        let jwt = null;
        try {
          const idToken = await fu.getIdToken();
          const r = await api.auth.firebaseSync(idToken);
          jwt = r.data?.token;
        } catch {}
        await initUser({
          uid: fu.uid, name: fu.displayName || fu.email?.split("@")[0] || "User",
          email: fu.email, photo: fu.photoURL,
          provider: fu.providerData[0]?.providerId || "email",
        }, jwt);
      } else {
        setUser(null); setData_(null); clearToken(); setLoading(false);
      }
    });
    return unsub;
  }, [initUser]);

  // ── Google login ───────────────────────────────────────────────
  const loginGoogle = async () => {
    if (!auth_) throw new Error("Firebase not configured. Use email/password.");
    try {
      const res = await signInWithPopup(auth_, googleProvider_);
      const u   = res.user;
      let jwt   = null;
      try {
        const idToken = await u.getIdToken();
        const r = await api.auth.firebaseSync(idToken);
        jwt = r.data?.token;
      } catch {}
      await initUser({ uid: u.uid, name: u.displayName || u.email?.split("@")[0] || "User", email: u.email, photo: u.photoURL, provider: "google" }, jwt);
    } catch (e) {
      if (e.code === "auth/popup-blocked" || e.code === "auth/cancelled-popup-request") {
        await signInWithRedirect(auth_, googleProvider_);
      } else throw e;
    }
  };

  // ── Email login ────────────────────────────────────────────────
  const loginEmail = async (email, pass) => {
    // Try backend first
    const hasBackend = await checkBackend();
    if (hasBackend) {
      try {
        const r   = await api.auth.login(email, pass);
        const jwt = r.data?.token;
        const u   = r.data?.user;
        setToken(jwt);
        await initUser({ uid: u.user_id, name: u.name, email: u.email, photo: u.avatar_url || null, provider: "email" }, jwt);
        return;
      } catch (e) {
        // If backend says wrong password, throw. If backend unreachable, fall through.
        if (e.message && !e.message.includes("fetch")) throw e;
      }
    }

    // Firebase fallback
    if (auth_) {
      const res = await signInWithEmailAndPassword(auth_, email, pass);
      await initUser({ uid: res.user.uid, name: res.user.displayName || email.split("@")[0], email: res.user.email, photo: null, provider: "email" });
      return;
    }

    // Local demo fallback
    const found = verifyLocalUser(email, pass);
    if (!found) throw new Error("Invalid email or password");
    await initUser({ uid: btoa(email).replace(/=/g, ""), name: found.name, email, photo: null, provider: "email" });
  };

  // ── Email register ─────────────────────────────────────────────
  const registerEmail = async (name, email, pass) => {
    const hasBackend = await checkBackend();
    if (hasBackend) {
      try {
        const r   = await api.auth.register(name, email, pass);
        const jwt = r.data?.token;
        const u   = r.data?.user;
        setToken(jwt);
        await initUser({ uid: u.user_id, name: u.name, email: u.email, photo: null, provider: "email" }, jwt);
        return;
      } catch (e) {
        if (e.message && !e.message.includes("fetch")) throw e;
      }
    }

    if (auth_) {
      const res = await createUserWithEmailAndPassword(auth_, email, pass);
      await updateProfile(res.user, { displayName: name });
      await initUser({ uid: res.user.uid, name, email: res.user.email, photo: null, provider: "email" });
      return;
    }

    if (getLocalUsers()[email]) throw new Error("Email already registered. Sign in instead.");
    saveLocalUser(email, pass, name);
    await initUser({ uid: btoa(email).replace(/=/g, ""), name, email, photo: null, provider: "email" });
  };

  // ── Logout ─────────────────────────────────────────────────────
  const logout = async () => {
    if (auth_) try { await signOut(auth_); } catch {}
    clearToken();
    setUser(null); setData_(null); setUseBackend(false);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, data, setData, loginGoogle, loginEmail, registerEmail, logout, useBackend, firebaseReady: !!auth_ }}>
      {children}
    </AuthCtx.Provider>
  );
}
