import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import NetWorth from "./pages/NetWorth";
import Loans from "./pages/Loans";
import Goals from "./pages/Goals";
import Budget from "./pages/Budget";
import Analysis from "./pages/Analysis";
import Reports from "./pages/Reports";

const PAGE_TITLE = {
  dash:"Dashboard", txn:"Transactions", networth:"Net Worth",
  loans:"Loans & EMI", goals:"Goals", budget:"Budget",
  analysis:"Analysis", reports:"Reports",
};

function AppInner() {
  const { user, loading } = useAuth();
  const [screen,   setScreen]   = useState("landing");
  const [page,     setPage]     = useState("dash");
  const [sideOpen, setSideOpen] = useState(false);

  // Go back to landing whenever user logs out
  useEffect(() => {
    if (!user && !loading) setScreen("landing");
  }, [user, loading]);

  // Go to app when user logs in
  useEffect(() => {
    if (user) setScreen("app");
  }, [user]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const fn = () => { if (window.innerWidth > 960) setSideOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Close sidebar when navigating
  const handleSetPage = (p) => { setPage(p); setSideOpen(false); };

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:48, height:48, background:"var(--A)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--mono)", fontSize:16, fontWeight:600, color:"#fff", margin:"0 auto 14px" }}>Ft</div>
          <div style={{ fontSize:12, color:"var(--text3)", fontFamily:"var(--mono)" }}>Loading…</div>
        </div>
      </div>
    );
  }

  if (screen === "landing") return <Landing onGetStarted={() => setScreen("auth")} />;
  if (screen === "auth" && !user) return <Auth />;

  const PAGES = {
    dash:     <Dashboard />,
    txn:      <Transactions />,
    networth: <NetWorth />,
    loans:    <Loans />,
    goals:    <Goals />,
    budget:   <Budget />,
    analysis: <Analysis />,
    reports:  <Reports />,
  };

  return (
    <div className="shell">
      {/* Overlay for mobile sidebar */}
      <div
        className={`sidebar-overlay${sideOpen ? "" : " hidden"}`}
        onClick={() => setSideOpen(false)}
      />

      <Sidebar page={page} setPage={handleSetPage} open={sideOpen} onClose={() => setSideOpen(false)} />

      <div className="main">
        {/* Mobile top bar */}
        <div className="top-bar">
          <button className="burger" onClick={() => setSideOpen((o) => !o)} aria-label="Menu">☰</button>
          <div className="top-bar-logo">
            <div className="logo-ic" style={{ width:26, height:26, fontSize:9, borderRadius:7 }}>Ft</div>
            <span className="top-bar-title">{PAGE_TITLE[page]}</span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
          {PAGES[page]}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
