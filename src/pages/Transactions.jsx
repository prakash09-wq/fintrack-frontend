import { useState } from "react";
import { fmt, fmtD, CURR_MONTH, CURR_YEAR, currentMonthLabel } from "../utils/format";
import { TX_CATS, uid } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { Stat, CDel } from "../components/UI";
import Calendar from "../components/Calendar";

export default function Transactions() {
  const { data, setData } = useAuth();
  const txns = data?.txns || [];

  const today = new Date();
  const [typeF,   setTypeF]   = useState("all");
  const [cat,     setCat]     = useState("All");
  const [modal,   setModal]   = useState(null);
  const [conf,    setConf]    = useState(null);
  const [selDate, setSelDate] = useState(null);
  const [view,    setView]    = useState("list");
  const [monthF,  setMonthF]  = useState(CURR_MONTH);
  const [yearF,   setYearF]   = useState(CURR_YEAR);

  const blank = {
    type: "expense", amount: "", category: "Food", description: "",
    date: `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`,
  };
  const [form, setForm] = useState(blank);

  // Filter by selected month/year + type + category
  const filtered = txns
    .filter((t) => {
      const d = new Date(t.date);
      const inMonth = d.getMonth() === monthF && d.getFullYear() === yearF;
      const inType  = typeF === "all" || t.type === typeF;
      const inCat   = cat === "All" || t.category === cat;
      return inMonth && inType && inCat;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const inc = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const exp = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const save = () => {
    if (!form.description || !form.amount) return;
    const entry = { ...form, amount: parseFloat(form.amount) };
    setData((prev) => ({
      ...prev,
      txns: modal === "add"
        ? [{ ...entry, id: uid() }, ...prev.txns]
        : prev.txns.map((t) => (t.id === modal ? { ...entry, id: t.id } : t)),
    }));
    setModal(null);
  };

  const del = (id) => {
    setData((prev) => ({ ...prev, txns: prev.txns.filter((t) => t.id !== id) }));
    setConf(null);
  };

  // Month navigator
  const prevMonth = () => {
    if (monthF === 0) { setMonthF(11); setYearF((y) => y - 1); }
    else setMonthF((m) => m - 1);
  };
  const nextMonth = () => {
    if (monthF === 11) { setMonthF(0); setYearF((y) => y + 1); }
    else setMonthF((m) => m + 1);
  };
  const monthLabel = new Date(yearF, monthF, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="page">
      <div className="ph">
        <div><div className="ptitle">Transactions</div><div className="psub">Every rupee tracked</div></div>
        <div className="phr">
          <div className="tabs">
            <button className={`tab${view === "list" ? " on" : ""}`} onClick={() => setView("list")}>List</button>
            <button className={`tab${view === "cal"  ? " on" : ""}`} onClick={() => setView("cal")}>Calendar</button>
          </div>
          <button className="btn bp" onClick={() => { setForm(blank); setModal("add"); }}>+ Add</button>
        </div>
      </div>

      {/* Month navigator */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--rsm)", padding: "8px 14px", width: "fit-content", boxShadow: "var(--sh)" }}>
        <button className="cal-nav" style={{ color: "var(--text3)", fontSize: 16 }} onClick={prevMonth}>‹</button>
        <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: "var(--text)", minWidth: 140, textAlign: "center" }}>{monthLabel}</span>
        <button className="cal-nav" style={{ color: "var(--text3)", fontSize: 16 }} onClick={nextMonth}>›</button>
        {(monthF !== CURR_MONTH || yearF !== CURR_YEAR) && (
          <button className="btn bg bxs" onClick={() => { setMonthF(CURR_MONTH); setYearF(CURR_YEAR); }}>Today</button>
        )}
      </div>

      <div className="sg sg3">
        <Stat label="Income"  value={fmt(inc)} color="var(--G)" />
        <Stat label="Expenses" value={fmt(exp)} color="var(--R)" />
        <Stat label="Balance"  value={fmt(inc - exp)} color={inc - exp >= 0 ? "var(--G)" : "var(--R)"} />
      </div>

      {view === "cal" ? (
        <div className="g2 sec">
          <Calendar transactions={txns} selectedDate={selDate} onDateSelect={setSelDate} />
          <div className="card">
            <div className="ctitle">
              {selDate
                ? selDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                : "Select a date on the calendar"}
            </div>
            {selDate && (() => {
              const key = `${selDate.getFullYear()}-${selDate.getMonth()}-${selDate.getDate()}`;
              const dayTxns = txns.filter((t) => {
                const d = new Date(t.date);
                return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === key;
              }).sort((a,b) => a.type === "income" ? -1 : 1);
              return dayTxns.length === 0 ? (
                <div className="empty" style={{ padding: "20px 0" }}>
                  No transactions<br />
                  <button className="btn bp bsm" style={{ marginTop: 8 }} onClick={() => {
                    const ds = `${selDate.getFullYear()}-${String(selDate.getMonth()+1).padStart(2,"0")}-${String(selDate.getDate()).padStart(2,"0")}`;
                    setForm({ ...blank, date: ds }); setModal("add");
                  }}>+ Add one</button>
                </div>
              ) : (
                <div>
                  {dayTxns.map((t) => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                        <div style={{ fontWeight: 500, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>
                        <div className="mono xs cm mt1">{t.category}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <span className="mono bold xs" style={{ color: t.type === "income" ? "var(--G)" : "var(--R)" }}>
                          {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                        </span>
                        <button className="btn bg bic" onClick={() => { setForm({ ...t, amount: String(t.amount) }); setModal(t.id); }}>✎</button>
                        <button className="btn bd bic" onClick={() => setConf(t.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 12, marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                    <span className="mono xs cg bold">Inc: {fmt(dayTxns.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0))}</span>
                    <span className="mono xs cr bold">Exp: {fmt(dayTxns.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0))}</span>
                  </div>
                </div>
              );
            })()}
            {!selDate && <div className="empty" style={{ padding: "20px 0" }}>Click any date to view transactions</div>}
          </div>
        </div>
      ) : (
        <div className="sec">
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
            <div className="tabs">
              {["all", "income", "expense"].map((v) => (
                <button key={v} className={`tab${typeF === v ? " on" : ""}`} onClick={() => setTypeF(v)}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <select className="fi" style={{ width: "auto", padding: "5px 11px", fontSize: 12 }} value={cat} onChange={(e) => setCat(e.target.value)}>
              {["All", ...TX_CATS].map((c) => <option key={c}>{c}</option>)}
            </select>
            <span className="mono cm xs" style={{ marginLeft: "auto" }}>{filtered.length} entries</span>
          </div>
          <div className="tbl">
            <table>
              <thead>
                <tr><th>Description</th><th>Category</th><th>Date</th><th>Type</th><th style={{ textAlign: "right" }}>Amount</th><th style={{ textAlign: "right" }}>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6}><div className="empty">No transactions in {monthLabel}.</div></td></tr>}
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</td>
                    <td><span className="tag ta">{t.category}</span></td>
                    <td className="mono cm xs">{fmtD(t.date)}</td>
                    <td><span className={`tag ${t.type === "income" ? "tg" : "tr"}`}>{t.type}</span></td>
                    <td className="mono bold" style={{ textAlign: "right", color: t.type === "income" ? "var(--G)" : "var(--R)" }}>
                      {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                    </td>
                    <td>
                      <div className="acols" style={{ justifyContent: "flex-end" }}>
                        <button className="btn bg bic" onClick={() => { setForm({ ...t, amount: String(t.amount) }); setModal(t.id); }}>✎</button>
                        <button className="btn bd bic" onClick={() => setConf(t.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="ov" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="mtitle">{modal === "add" ? "Add Transaction" : "Edit Transaction"}</div>
            <div className="tabs" style={{ width: "100%", marginBottom: 16 }}>
              {["expense", "income"].map((v) => (
                <button key={v} className={`tab${form.type === v ? " on" : ""}`} style={{ flex: 1 }} onClick={() => setForm({ ...form, type: v })}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <div className="g2" style={{ gap: 10 }}>
              <div className="fr"><label className="fl">Amount (₹)</label><input className="fi" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} autoFocus /></div>
              <div className="fr"><label className="fl">Category</label>
                <select className="fi" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {TX_CATS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="fr"><label className="fl">Description</label><input className="fi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What was this for?" /></div>
            <div className="fr"><label className="fl">Date</label><input className="fi" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div className="mfooter">
              <button className="btn bg" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn bp" onClick={save}>{modal === "add" ? "Add" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
      {conf && <CDel msg="This transaction will be permanently removed." onOk={() => del(conf)} onNo={() => setConf(null)} />}
    </div>
  );
}
