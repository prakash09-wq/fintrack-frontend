import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fmt, fmtD, CURR_MONTH, CURR_YEAR, currentMonthLabel } from "../utils/format";
import { MONTHLY_CHART, NW_HIST, CAT_COLORS } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { Stat, ChartTip } from "../components/UI";
import Calendar from "../components/Calendar";

export default function Dashboard() {
  const { user, data } = useAuth();
  const txns = data?.txns || [];
  const [selDate, setSelDate] = useState(null);

  // Only show current month transactions in summary
  const monthTxns = txns.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === CURR_MONTH && d.getFullYear() === CURR_YEAR;
  });

  const inc = monthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const exp = monthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const sr  = inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0;

  const catExp = {};
  monthTxns.filter((t) => t.type === "expense").forEach((t) => { catExp[t.category] = (catExp[t.category] || 0) + t.amount; });
  const pieData = Object.entries(catExp).map(([name, value]) => ({ name, value, color: CAT_COLORS[name] || "#6b5f52" })).sort((a, b) => b.value - a.value);

  const recent = [...txns].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  const firstName = user?.name?.split(" ")[0] || "there";

  const tips = [
    sr >= 20
      ? { c: "al-s", t: `Saving ${sr}% of income — above the 20% target. Great!` }
      : { c: "al-w", t: `Savings rate is ${sr}%. Try to reach 20% of income.` },
    { c: "al-i", t: "EMI load is about 15% of income — within the safe 30% zone." },
    { c: "al-i", t: "Emergency Fund is 41% complete. ₹5,000/month gets you there by Sep." },
  ];

  return (
    <div className="page">
      <div className="ph">
        <div>
          <div className="ptitle">Good morning, {firstName} 👋</div>
          <div className="psub">{currentMonthLabel()} · Financial overview</div>
        </div>
      </div>

      <div className="sg sg4">
        <Stat label="Total Income"   value={fmt(inc)}       note="This month" nt="up" color="var(--G)" />
        <Stat label="Total Expenses" value={fmt(exp)}       note="This month"  nt="dn" color="var(--R)" />
        <Stat label="Net Savings"    value={fmt(inc - exp)} note={`${sr}% saved`} nt="up" color="var(--B)" />
        <Stat label="Net Worth"      value={fmt(460500)}    note="↑ All time"  nt="up" color="var(--A)" />
      </div>

      <div className="g2 sec">
        <div className="card">
          <div className="ctitle">6-Month Income vs Expense</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY_CHART} barGap={3} barCategoryGap="32%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="m" tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="inc" name="Income"  fill="var(--G)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="exp" name="Expense" fill="var(--R)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="sav" name="Savings" fill="var(--B)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="ctitle">This Month — Expense Breakdown</div>
          {pieData.length === 0 ? (
            <div className="empty">No expenses this month</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={78} dataKey="value" paddingAngle={3}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "var(--mono)", fontSize: 11 }} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text2)" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="g2 sec">
        <div className="card">
          <div className="ctitle">Net Worth Trend</div>
          <ResponsiveContainer width="100%" height={165}>
            <AreaChart data={NW_HIST}>
              <defs>
                <linearGradient id="nwg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--A)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--A)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="m" tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="nw" name="Net Worth" stroke="var(--A)" strokeWidth={2} fill="url(#nwg)" dot={{ fill: "var(--A)", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="ctitle">AI Insights</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tips.map((t, i) => (
              <div key={i} className={`al ${t.c}`} style={{ marginBottom: 0 }}>
                <span style={{ flexShrink: 0 }}>{t.c === "al-s" ? "✓" : t.c === "al-w" ? "⚠" : "ℹ"}</span>
                <span>{t.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar + Recent Transactions */}
      <div className="sec">
        <div className="sechd"><span className="sectitle">Transaction Calendar — {currentMonthLabel()}</span></div>
        <div className="g2">
          <Calendar transactions={txns} selectedDate={selDate} onDateSelect={setSelDate} />
          <div className="card">
            <div className="ctitle">Recent Transactions</div>
            {recent.length === 0 ? (
              <div className="empty">No transactions yet.</div>
            ) : (
              <div>
                {recent.map((t) => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                      <div style={{ fontWeight: 500, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>
                      <div className="mono xs cm mt1">{fmtD(t.date)} · {t.category}</div>
                    </div>
                    <div className="mono bold xs" style={{ color: t.type === "income" ? "var(--G)" : "var(--R)", flexShrink: 0 }}>
                      {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
