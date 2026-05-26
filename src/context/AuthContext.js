import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile,
} from "firebase/auth";
import { SEED } from "../data/mockData";

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
} catch (e) { console.warn("Firebase init:", e.message); }

// ── Local user store (offline/demo mode) ──────────────────────
const USERS_KEY      = "ft_users_v3";
const getLocalUsers  = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY) || "{}"); } catch { return {}; } };
const saveLocalUser  = (email, pass, name) => {
  const u = getLocalUsers();
  u[email] = { hash: btoa(unescape(encodeURIComponent(email + ":" + pass))), name };
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
};
const verifyLocalUser = (email, pass) => {
  const u = getLocalUsers();
  const expected = btoa(unescape(encodeURIComponent(email + ":" + pass)));
  return u[email]?.hash === expected ? u[email] : null;
};

// ── DB persistence ─────────────────────────────────────────────
const dbKey  = (uid) => `ft_data_${uid}`;
export const loadDB = (uid) => { try { const d = localStorage.getItem(dbKey(uid)); return d ? JSON.parse(d) : null; } catch { return null; } };
export const saveDB = (uid, data) => { try { localStorage.setItem(dbKey(uid), JSON.stringify(data)); } catch (e) { console.warn("saveDB:", e); } };

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [data,    setData_]   = useState(null);

  const initUser = useCallback((u) => {
    setUser(u);
    const saved = loadDB(u.uid);
    const d = saved || SEED();
    setData_(d);
    if (!saved) saveDB(u.uid, d);
    setLoading(false);
  }, []);

  const setData = useCallback((updater) => {
    setData_((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }, []);

  // Auto-save on every data change
  useEffect(() => {
    if (user && data) saveDB(user.uid, data);
  }, [user, data]);

  // Firebase auth listener + redirect result handler
  useEffect(() => {
    if (!auth_) { setLoading(false); return; }

    // Handle Google redirect result first
    getRedirectResult(auth_)
      .then((res) => {
        if (res?.user) {
          const u = res.user;
          initUser({ uid: u.uid, name: u.displayName || u.email?.split("@")[0] || "User", email: u.email, photo: u.photoURL, provider: "google" });
        }
      })
      .catch((e) => { if (e.code !== "auth/no-current-user") console.warn("redirect result:", e.code); });

    const unsub = onAuthStateChanged(auth_, (fu) => {
      if (fu) {
        initUser({
          uid:      fu.uid,
          name:     fu.displayName || fu.email?.split("@")[0] || "User",
          email:    fu.email,
          photo:    fu.photoURL,
          provider: fu.providerData[0]?.providerId || "email",
        });
      } else {
        setUser(null); setData_(null); setLoading(false);
      }
    });
    return unsub;
  }, [initUser]);

  // ── Google login ──────────────────────────────────────────────
  const loginGoogle = async () => {
    if (!auth_) throw new Error("Firebase not configured. Use email/password.");
    try {
      const res = await signInWithPopup(auth_, googleProvider_);
      const u = res.user;
      initUser({ uid: u.uid, name: u.displayName || u.email?.split("@")[0] || "User", email: u.email, photo: u.photoURL, provider: "google" });
    } catch (e) {
      if (e.code === "auth/popup-blocked" || e.code === "auth/cancelled-popup-request") {
        // Fallback to redirect — works on mobile and when popups are blocked
        try { await signInWithRedirect(auth_, googleProvider_); }
        catch (re) { throw new Error("Redirect also failed: " + re.message); }
      } else {
        throw e;
      }
    }
  };

  // ── Email login ───────────────────────────────────────────────
  const loginEmail = async (email, pass) => {
    if (auth_) {
      const res = await signInWithEmailAndPassword(auth_, email, pass);
      const u = res.user;
      initUser({ uid: u.uid, name: u.displayName || email.split("@")[0], email: u.email, photo: null, provider: "email" });
    } else {
      const found = verifyLocalUser(email, pass);
      if (!found) throw new Error("Invalid email or password");
      initUser({ uid: btoa(email).replace(/=/g, ""), name: found.name, email, photo: null, provider: "email" });
    }
  };

  // ── Email register ─────────────────────────────────────────────
  const registerEmail = async (name, email, pass) => {
    if (auth_) {
      const res = await createUserWithEmailAndPassword(auth_, email, pass);
      await updateProfile(res.user, { displayName: name });
      initUser({ uid: res.user.uid, name, email: res.user.email, photo: null, provider: "email" });
    } else {
      if (getLocalUsers()[email]) throw new Error("Email already registered. Sign in instead.");
      saveLocalUser(email, pass, name);
      initUser({ uid: btoa(email).replace(/=/g, ""), name, email, photo: null, provider: "email" });
    }
  };

  // ── Logout ─────────────────────────────────────────────────────
  const logout = async () => {
    if (auth_) try { await signOut(auth_); } catch (e) {}
    setUser(null); setData_(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, data, setData, loginGoogle, loginEmail, registerEmail, logout, firebaseReady: !!auth_ }}>
      {children}
    </AuthCtx.Provider>
  );
}
