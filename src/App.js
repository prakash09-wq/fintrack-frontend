import { useState } from "react";
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

function AppInner() {
  const { user, loading } = useAuth();
  const [screen,  setScreen]  = useState("landing");
  const [page,    setPage]    = useState("dash");
  const [sideOpen,setSideOpen]= useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, background: "var(--A)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 16, fontWeight: 600, color: "#fff", margin: "0 auto 16px" }}>Ft</div>
          <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)" }}>Loading…</div>
        </div>
      </div>
    );
  }

  if (user && screen !== "app") setScreen("app");

  if (screen === "landing") return <Landing onGetStarted={() => setScreen("auth")} />;
  if (screen === "auth" && !user) return <Auth />;

  const PAGES = {
    dash:      <Dashboard />,
    txn:       <Transactions />,
    networth:  <NetWorth />,
    loans:     <Loans />,
    goals:     <Goals />,
    budget:    <Budget />,
    analysis:  <Analysis />,
    reports:   <Reports />,
  };

  const pageTitle = {
    dash: "Dashboard", txn: "Transactions", networth: "Net Worth",
    loans: "Loans & EMI", goals: "Goals", budget: "Budget",
    analysis: "Analysis", reports: "Reports",
  };

  return (
    <div className="shell">
      <Sidebar page={page} setPage={setPage} open={sideOpen} onClose={() => setSideOpen(false)} />
      <div className="main">
        {/* Mobile top bar */}
        <div className="top-bar">
          <button className="burger" onClick={() => setSideOpen(true)}>☰</button>
          <div className="top-bar-logo">
            <div className="logo-ic" style={{ width: 24, height: 24, fontSize: 9 }}>Ft</div>
            <span className="top-bar-title">{pageTitle[page]}</span>
          </div>
        </div>
        {PAGES[page]}
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
