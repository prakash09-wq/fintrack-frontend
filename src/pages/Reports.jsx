import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { fmt, fmtD } from "../utils/format";
import { MONTHLY_CHART, CAT_COLORS } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { Stat, Prog, ChartTip } from "../components/UI";

export default function Reports() {
  const { data } = useAuth();
  const txns = data?.txns || [];

  const inc  = txns.filter((t) => t.type === "income").reduce((s, t)  => s + t.amount, 0);
  const exp  = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const sr   = inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0;

  const catExp = {};
  txns.filter((t) => t.type === "expense").forEach((t) => {
    catExp[t.category] = (catExp[t.category] || 0) + t.amount;
  });
  const catData = Object.entries(catExp)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, color: CAT_COLORS[name] || "#6b5f52" }));

  const top5  = [...txns].filter((t) => t.type === "expense").sort((a, b) => b.amount - a.amount).slice(0, 5);
  const total = catData.reduce((s, c) => s + c.value, 0);

  const doExport = () => {
    const rows = [
      ["Date", "Description", "Category", "Type", "Amount"],
      ...[...txns]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((t) => [t.date, t.description, t.category, t.type, t.amount]),
    ];
    const csv  = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "fintrack_report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <div className="ph">
        <div><div className="ptitle">Reports</div><div className="psub">Financial summary — April 2025</div></div>
        <div className="phr">
          <button className="btn bg" onClick={doExport}>↓ Export CSV</button>
        </div>
      </div>

      <div className="sg sg4">
        <Stat label="Total Income"   value={fmt(inc)}        color="var(--G)" />
        <Stat label="Total Expenses" value={fmt(exp)}        color="var(--R)" />
        <Stat label="Net Savings"    value={fmt(inc - exp)}  color="var(--B)" />
        <Stat label="Savings Rate"   value={sr + "%"}        color="var(--A)" />
      </div>

      {/* 6-Month overview */}
      <div className="sec card mb3">
        <div className="ctitle">6-Month Financial Overview</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={MONTHLY_CHART}>
            <defs>
              {[["ig", "var(--G)"], ["eg", "var(--R)"], ["sg", "var(--B)"]].map(([id, c]) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={c} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={c} stopOpacity={0}   />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="m" tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip content={<ChartTip />} />
            <Legend wrapperStyle={{ fontFamily: "var(--mono)", fontSize: 10 }} />
            <Area type="monotone" dataKey="inc" name="Income"  stroke="var(--G)" strokeWidth={2} fill="url(#ig)" dot={{ fill: "var(--G)", r: 3 }} />
            <Area type="monotone" dataKey="exp" name="Expense" stroke="var(--R)" strokeWidth={2} fill="url(#eg)" dot={{ fill: "var(--R)", r: 3 }} />
            <Area type="monotone" dataKey="sav" name="Savings" stroke="var(--B)" strokeWidth={2} fill="url(#sg)" dot={{ fill: "var(--B)", r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="g2 sec">
        {/* Top 5 expenses */}
        <div className="card">
          <div className="ctitle">Top 5 Expenses This Month</div>
          {top5.length === 0
            ? <div className="empty">No expense data.</div>
            : top5.map((t, i) => (
              <div key={t.id} className="fx aic g3h mb2">
                <span className="mono xs cm" style={{ minWidth: 20 }}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{t.description}</div>
                  <Prog val={Math.round((t.amount / top5[0].amount) * 100)} color={i === 0 ? "var(--R)" : "var(--A)"} h={5} />
                </div>
                <span className="mono xs cr bold" style={{ minWidth: 72, textAlign: "right" }}>{fmt(t.amount)}</span>
              </div>
            ))
          }
        </div>

        {/* Category breakdown */}
        <div className="card">
          <div className="ctitle">Expense by Category</div>
          {catData.length === 0
            ? <div className="empty">No expense data.</div>
            : catData.map((c) => (
              <div key={c.name} className="fx aic g3h mb2">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                <div style={{ width: 70, height: 5, background: "var(--card2)", borderRadius: 3, overflow: "hidden", border: "1px solid var(--border)" }}>
                  <div style={{ width: `${Math.round((c.value / catData[0].value) * 100)}%`, height: "100%", background: c.color, borderRadius: 3 }} />
                </div>
                <span className="mono xs cr bold" style={{ minWidth: 68, textAlign: "right" }}>{fmt(c.value)}</span>
                <span className="mono xs cm" style={{ minWidth: 30, textAlign: "right" }}>{Math.round((c.value / total) * 100)}%</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Full transaction log */}
      <div className="sec">
        <div className="sechd"><span className="sectitle">Full Transaction Log</span></div>
        <div className="tbl">
          <table>
            <thead>
              <tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th style={{ textAlign: "right" }}>Amount</th></tr>
            </thead>
            <tbody>
              {[...txns].sort((a, b) => new Date(b.date) - new Date(a.date)).map((t) => (
                <tr key={t.id}>
                  <td className="mono cm xs">{fmtD(t.date)}</td>
                  <td style={{ fontWeight: 500 }}>{t.description}</td>
                  <td><span className="tag ta">{t.category}</span></td>
                  <td><span className={`tag ${t.type === "income" ? "tg" : "tr"}`}>{t.type}</span></td>
                  <td className="mono bold" style={{ textAlign: "right", color: t.type === "income" ? "var(--G)" : "var(--R)" }}>
                    {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                  </td>
                </tr>
              ))}
              {txns.length === 0 && <tr><td colSpan={5}><div className="empty">No transactions yet.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
