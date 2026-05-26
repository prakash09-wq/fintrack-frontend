import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { fmt, pct, emiCalc } from "../utils/format";
import { MONTHLY_CHART } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { Prog, ChartTip } from "../components/UI";

export default function Analysis() {
  const { data } = useAuth();
  const txns    = data?.txns    || [];
  const goals   = data?.goals   || [];
  const budgets = data?.budgets || [];
  const loans   = data?.loans   || [];

  const inc = txns.filter((t) => t.type === "income").reduce((s, t)  => s + t.amount, 0);
  const exp = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const sr  = inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0;
  const ba  = budgets.length > 0
    ? Math.round((budgets.filter((b) => b.spent <= b.limit).length / budgets.length) * 100)
    : 100;
  const activeLns = loans.filter((l) => l.status === "active");
  const tEMI = activeLns.reduce((s, l) => s + emiCalc(l.principal, l.rate, l.months), 0);
  const er   = inc > 0 ? Math.round((tEMI / inc) * 100) : 0;
  const gp   = goals.length > 0
    ? Math.round(goals.reduce((s, g) => s + pct(g.saved, g.target), 0) / goals.length)
    : 0;

  const score = Math.min(100, Math.round(
    (sr >= 30 ? 25 : sr >= 20 ? 20 : sr >= 10 ? 14 : 7) +
    (ba >= 90 ? 25 : ba >= 70 ? 18 : ba >= 50 ? 12 : 6) +
    (er <= 15 ? 25 : er <= 25 ? 20 : er <= 35 ? 14 : 7) +
    (gp >= 60 ? 25 : gp >= 40 ? 20 : gp >= 20 ? 14 : 7)
  ));

  const sLbl = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 55 ? "Fair" : "Needs Work";
  const sCol = score >= 85 ? "var(--G)"  : score >= 70 ? "var(--B)" : score >= 55 ? "var(--Y)" : "var(--R)";

  const radar = [
    { s: "Savings",   A: Math.min(100, sr * 2.5) },
    { s: "Budgeting", A: ba },
    { s: "Debt",      A: Math.min(100, 100 - er * 2) },
    { s: "Goals",     A: gp },
    { s: "Income",    A: 72 },
    { s: "NetWorth",  A: 68 },
  ];

  const metrics = [
    { l: "Savings Rate",      v: sr, u: "%", c: "var(--G)", bm: "Target: >20%", ok: sr >= 20 },
    { l: "Budget Adherence",  v: ba, u: "%", c: "var(--B)", bm: "Target: >80%", ok: ba >= 80 },
    { l: "EMI-to-Income",     v: er, u: "%", c: "var(--Y)", bm: "Safe: <30%",   ok: er < 30  },
    { l: "Goals Progress",    v: gp, u: "%", c: "var(--P)", bm: "Avg of all",   ok: gp >= 40 },
  ];

  const tips = [
    sr >= 20
      ? { t: "al-s", h: "Strong Savings",    b: `Saving ${sr}% of income — above the 20% target. Excellent!` }
      : { t: "al-w", h: "Low Savings Rate",  b: `Rate is ${sr}%. Cut discretionary spending to reach 20%.`   },
    ba >= 80
      ? { t: "al-s", h: "Budget on Track",   b: `${ba}% of categories stayed within budget this month.` }
      : { t: "al-w", h: "Budget Overruns",   b: `Only ${ba}% of categories within budget. Review overruns.` },
    er < 30
      ? { t: "al-s", h: "Healthy Debt Load", b: `EMIs at ${er}% of income — within the 30% safe zone.` }
      : { t: "al-d", h: "High EMI Burden",   b: `EMIs consume ${er}% of income. Consider prepaying a loan.` },
    { t: "al-i", h: "Investment Tip", b: "Fixed Deposits earn ~7% p.a. Index funds may offer better long-term returns." },
  ];

  const R = 54; const circ = 2 * Math.PI * R;

  const budgetVsActual = budgets.map((b) => ({
    category: b.category.slice(0, 4),
    Budget:   b.limit,
    Spent:    b.spent,
  }));

  return (
    <div className="page">
      <div className="ph">
        <div><div className="ptitle">Financial Analysis</div><div className="psub">Your complete financial health report</div></div>
      </div>

      {/* Score + Radar */}
      <div className="g21 sec">
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 28 }}>
          <div className="ctitle">Financial Health Score</div>
          <div style={{ position: "relative", width: 150, height: 150 }}>
            <svg viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
              <circle cx="65" cy="65" r={R} fill="none" stroke="var(--card2)" strokeWidth="11" />
              <circle cx="65" cy="65" r={R} fill="none" stroke={sCol} strokeWidth="11"
                strokeDasharray={`${circ * score / 100} ${circ}`} strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span className="mono" style={{ fontSize: 38, fontWeight: 800, color: sCol, lineHeight: 1 }}>{score}</span>
              <span className="mono xs cm" style={{ marginTop: 3 }}>/ 100</span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: sCol }}>{sLbl}</div>
            <div className="xs c2 mt1">Savings · Budgeting · Debt · Goals</div>
          </div>
          <div className="g2" style={{ gap: 8, width: "100%" }}>
            {[
              { l: "Savings",   v: sr + "%", c: "var(--G)" },
              { l: "Budgeting", v: ba + "%", c: "var(--B)" },
              { l: "Debt",      v: er + "%", c: "var(--Y)" },
              { l: "Goals",     v: gp + "%", c: "var(--P)" },
            ].map((x, i) => (
              <div key={i} style={{ background: "var(--card2)", borderRadius: "var(--rsm)", padding: "9px 12px", border: "1px solid var(--border)" }}>
                <div className="mono xs cm mb1">{x.l}</div>
                <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: x.c }}>{x.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="ctitle">Performance Radar</div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radar}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="s" tick={{ fill: "var(--text3)", fontSize: 11, fontFamily: "var(--mono)" }} />
              <Radar dataKey="A" name="Score" stroke="var(--A)" fill="var(--A)" fillOpacity={0.12} strokeWidth={2} dot={{ fill: "var(--A)", r: 4 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key metrics */}
      <div className="sec card mb3">
        <div className="ctitle">Key Performance Metrics</div>
        {metrics.map((m, i) => (
          <div key={i} className="fx aic g4" style={{ marginBottom: i < metrics.length - 1 ? 14 : 0 }}>
            <div style={{ minWidth: 160 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.l}</div>
              <div className="mono xs cm mt1">{m.bm}</div>
            </div>
            <div style={{ flex: 1, height: 10, background: "var(--card2)", borderRadius: 5, overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{ height: "100%", borderRadius: 5, width: `${Math.min(100, m.v)}%`, background: m.c, transition: "width 0.8s" }} />
            </div>
            <div className="mono" style={{ minWidth: 48, textAlign: "right", fontSize: 15, fontWeight: 700, color: m.c }}>{m.v}{m.u}</div>
            <div style={{ width: 20, textAlign: "center", fontSize: 16, color: m.ok ? "var(--G)" : "var(--R)" }}>{m.ok ? "✓" : "!"}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="g2 sec">
        <div className="card">
          <div className="ctitle">6-Month Trend</div>
          <ResponsiveContainer width="100%" height={190}>
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

        <div className="card">
          <div className="ctitle">Budget vs Actual</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={budgetVsActual} barGap={3} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="category" tick={{ fill: "var(--text3)", fontSize: 9, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text3)", fontSize: 9, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip content={<ChartTip />} />
              <Legend wrapperStyle={{ fontFamily: "var(--mono)", fontSize: 10 }} />
              <Bar dataKey="Budget" fill="var(--B)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Spent"  fill="var(--Y)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="sec">
        <div className="sechd"><span className="sectitle">Insights & Recommendations</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tips.map((tip, i) => (
            <div key={i} className={`al ${tip.t}`} style={{ alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {tip.t.includes("s") ? "✓" : tip.t.includes("w") ? "⚠" : tip.t.includes("d") ? "✗" : "ℹ"}
              </span>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 3 }}>{tip.h}</div>
                <div style={{ fontWeight: 400 }}>{tip.b}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goals table */}
      <div className="sec">
        <div className="sechd"><span className="sectitle">Goals Progress Summary</span></div>
        <div className="tbl">
          <table>
            <thead>
              <tr><th>Goal</th><th style={{ textAlign: "right" }}>Target</th><th style={{ textAlign: "right" }}>Saved</th><th style={{ textAlign: "right" }}>Progress</th><th style={{ width: 140 }}>Bar</th></tr>
            </thead>
            <tbody>
              {goals.map((g) => {
                const p = pct(g.saved, g.target);
                const c = p >= 100 ? "var(--G)" : p >= 50 ? "var(--B)" : p >= 25 ? "var(--Y)" : "var(--A)";
                return (
                  <tr key={g.id}>
                    <td style={{ fontWeight: 600 }}>{g.name}</td>
                    <td className="mono xs cm" style={{ textAlign: "right" }}>{fmt(g.target)}</td>
                    <td className="mono xs" style={{ textAlign: "right", color: c }}>{fmt(g.saved)}</td>
                    <td className="mono bold" style={{ textAlign: "right", color: c }}>{p}%</td>
                    <td><Prog val={p} color={c} /></td>
                  </tr>
                );
              })}
              {goals.length === 0 && <tr><td colSpan={5}><div className="empty">No goals added yet.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
