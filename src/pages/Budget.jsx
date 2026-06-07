import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { fmt, pct } from "../utils/format";
import { BDG_CATS, uid, CAT_COLORS } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { Stat, CDel } from "../components/UI";

export default function Budget() {
  const { data, setData } = useAuth();
  const budgets = data?.budgets || [];

  const [modal,  setModal]  = useState(null);
  const [conf,   setConf]   = useState(null);
  const blank = { category: "Food", limit: "", spent: "0" };
  const [form, setForm] = useState(blank);

  const total = budgets.reduce((s, b) => s + b.limit, 0);
  const spent = budgets.reduce((s, b) => s + b.spent, 0);
  const over  = budgets.filter((b) => b.spent > b.limit);

  const save = () => {
    if (!form.limit) return;
    const entry = { ...form, limit: parseFloat(form.limit), spent: parseFloat(form.spent || 0) };
    setData((prev) => ({
      ...prev,
      budgets: modal === "add"
        ? [...prev.budgets, { ...entry, id: uid() }]
        : prev.budgets.map((b) => b.id === modal ? { ...entry, id: b.id } : b),
    }));
    setModal(null);
  };

  const del = (id) => {
    setData((prev) => ({ ...prev, budgets: prev.budgets.filter((b) => b.id !== id) }));
    setConf(null);
  };

  const R = 54; const circ = 2 * Math.PI * R;
  const u  = Math.min(100, pct(spent, total));
  const rc = u > 90 ? "var(--R)" : u > 75 ? "var(--Y)" : "var(--A)";

  const pieData = budgets.map((b) => ({
    name:  b.category,
    value: b.spent,
    color: CAT_COLORS[b.category] || "#6b5f52",
  }));

  return (
    <div className="page">
      <div className="ph">
        <div><div className="ptitle">Budget Planner</div><div className="psub">Monthly spending limits</div></div>
        <div className="phr">
          <button className="btn bp" onClick={() => { setForm(blank); setModal("add"); }}>+ Set Budget</button>
        </div>
      </div>

      <div className="sg sg4">
        <Stat label="Total Budget"  value={fmt(total)}                      color="var(--B)" />
        <Stat label="Total Spent"   value={fmt(spent)}                      color="var(--Y)" />
        <Stat label="Remaining"     value={fmt(Math.max(0, total - spent))} color="var(--G)" />
        <Stat label="Over Budget"   value={`${over.length} categories`}     color={over.length > 0 ? "var(--R)" : "var(--G)"} />
      </div>

      {over.length > 0 && (
        <div className="al al-d mb3">
          <span>⚠</span>
          <span>Over budget in: <strong>{over.map((b) => b.category).join(", ")}</strong></span>
        </div>
      )}

      <div className="g21 sec">
        {/* Category budgets list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {budgets.map((b) => {
            const p   = pct(b.spent, b.limit);
            const isO = b.spent > b.limit;
            const bc  = isO ? "var(--R)" : p > 80 ? "var(--Y)" : "var(--A)";
            return (
              <div key={b.id} className="card" style={{ padding: "14px 16px", borderLeft: `3px solid ${bc}` }}>
                <div className="fx jb aic mb2">
                  <div className="fx aic g2h">
                    <span style={{ fontWeight: 700 }}>{b.category}</span>
                    {isO && <span className="tag tr">Over</span>}
                  </div>
                  <div className="fx aic g2h">
                    <span className="mono xs bold" style={{ color: bc }}>{fmt(b.spent)} <span className="cm">/ {fmt(b.limit)}</span></span>
                    <button className="btn bg bic" onClick={() => { setForm({ ...b, limit: String(b.limit), spent: String(b.spent) }); setModal(b.id); }}>✎</button>
                    <button className="btn bd bic" onClick={() => setConf(b.id)}>✕</button>
                  </div>
                </div>
                <div className="fx aic g2h">
                  <div className="pt" style={{ flex: 1, height: 8 }}>
                    <div className="pf" style={{ width: `${Math.min(p, 100)}%`, background: bc }} />
                  </div>
                  <span className="mono xs cm" style={{ minWidth: 32, textAlign: "right" }}>{p}%</span>
                </div>
                <div className="mono xs cm mt1">
                  {isO
                    ? <span style={{ color: "var(--R)" }}>Overspent by {fmt(b.spent - b.limit)}</span>
                    : <span>{fmt(b.limit - b.spent)} remaining</span>
                  }
                </div>
              </div>
            );
          })}
          {budgets.length === 0 && <div className="card"><div className="empty">No budgets set yet.</div></div>}
        </div>

        {/* Right: donut + legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28 }}>
            <div className="ctitle">Overall Utilization</div>
            <div style={{ position: "relative", width: 130, height: 130 }}>
              <svg viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                <circle cx="65" cy="65" r={R} fill="none" stroke="var(--card2)"    strokeWidth="12" />
                <circle cx="65" cy="65" r={R} fill="none" stroke={rc} strokeWidth="12"
                  strokeDasharray={`${circ * u / 100} ${circ}`} strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span className="mono" style={{ fontSize: 28, fontWeight: 700, color: rc }}>{u}%</span>
                <span className="mono xs cm" style={{ letterSpacing: "0.08em" }}>USED</span>
              </div>
            </div>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                { l: "Budget",    v: fmt(total),                       c: "var(--B)"  },
                { l: "Spent",     v: fmt(spent),                       c: "var(--Y)"  },
                { l: "Remaining", v: fmt(Math.max(0, total - spent)),  c: "var(--G)"  },
              ].map((r, i) => (
                <div key={i} className="fx jb aic">
                  <span className="sm c2">{r.l}</span>
                  <span className="mono xs bold" style={{ color: r.c }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          {pieData.length > 0 && (
            <div className="card">
              <div className="ctitle">Spending by Category</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "var(--mono)", fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="ov" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="mtitle">{modal === "add" ? "Set Budget" : "Edit Budget"}</div>
            <div className="fr">
              <label className="fl">Category</label>
              <select className="fi" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} disabled={modal !== "add"}>
                {BDG_CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="g2" style={{ gap: 10 }}>
              <div className="fr"><label className="fl">Monthly Limit (₹)</label><input className="fi" type="number" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} autoFocus /></div>
              <div className="fr"><label className="fl">Amount Spent (₹)</label><input className="fi" type="number" value={form.spent} onChange={(e) => setForm({ ...form, spent: e.target.value })} /></div>
            </div>
            <div className="mfooter">
              <button className="btn bg" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn bp" onClick={save}>{modal === "add" ? "Set Budget" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {conf && <CDel msg="This budget entry will be deleted." onOk={() => del(conf)} onNo={() => setConf(null)} />}
    </div>
  );
}
