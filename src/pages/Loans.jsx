import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { fmt, fmtD, pct, emiCalc } from "../utils/format";
import { uid } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { Stat, Prog, CDel, Checkbox } from "../components/UI";

export default function Loans() {
  const { data, setData } = useAuth();
  const loans = data?.loans || [];

  const [selId,    setSelId]    = useState(loans[0]?.id);
  const [modal,    setModal]    = useState(null);
  const [conf,     setConf]     = useState(null);
  const [showCalc, setShowCalc] = useState(false);
  const [calc,     setCalc]     = useState({ p: "", r: "", n: "" });
  const blank = { lender: "", principal: "", rate: "", months: "", paid: "0", start: new Date().toISOString().slice(0, 10) };
  const [form, setForm] = useState(blank);

  const active   = loans.filter((l) => l.status === "active");
  const totalEMI = active.reduce((s, l) => s + emiCalc(l.principal, l.rate, l.months), 0);
  const s        = loans.find((l) => l.id === selId) || loans[0];
  const sEMI     = s ? emiCalc(s.principal, s.rate, s.months) : 0;
  const sOut     = s ? s.principal - s.paid : 0;
  const sPct     = s ? pct(s.paid, s.principal) : 0;
  const sLeft    = s ? Math.max(0, s.months - Math.round(s.paid / Math.max(sEMI, 1))) : 0;
  const calcEMI  = calc.p && calc.r && calc.n ? emiCalc(parseFloat(calc.p), parseFloat(calc.r), parseInt(calc.n)) : null;

  const save = () => {
    if (!form.lender || !form.principal) return;
    const emi = emiCalc(parseFloat(form.principal), parseFloat(form.rate), parseInt(form.months));
    const entry = {
      ...form,
      principal: parseFloat(form.principal),
      rate:      parseFloat(form.rate),
      months:    parseInt(form.months),
      paid:      parseFloat(form.paid || 0),
      status:    form.status || "active",
      payments:  form.payments || [],
      emi_amount: emi,
    };
    if (modal === "add") {
      const nl = { ...entry, id: uid() };
      setData((prev) => ({ ...prev, loans: [nl, ...prev.loans] }));
      setSelId(nl.id);
    } else {
      setData((prev) => ({ ...prev, loans: prev.loans.map((l) => l.id === modal ? { ...entry, id: l.id } : l) }));
    }
    setModal(null);
  };

  const del = (id) => {
    setData((prev) => ({ ...prev, loans: prev.loans.filter((l) => l.id !== id) }));
    if (selId === id) setSelId(loans.find((l) => l.id !== id)?.id);
    setConf(null);
  };

  const togglePayment = (loanId, paymentId) => {
    setData((prev) => ({
      ...prev,
      loans: prev.loans.map((l) => {
        if (l.id !== loanId) return l;
        const updatedPayments = l.payments.map((p) =>
          p.id === paymentId ? { ...p, done: !p.done } : p
        );
        const paidCount  = updatedPayments.filter((p) => p.done).length;
        const newPaid    = paidCount * emiCalc(l.principal, l.rate, l.months);
        return { ...l, payments: updatedPayments, paid: Math.min(newPaid, l.principal) };
      }),
    }));
  };

  const closeLoan = (id) => {
    setData((prev) => ({
      ...prev,
      loans: prev.loans.map((l) => l.id === id ? { ...l, status: "closed", paid: l.principal } : l),
    }));
  };

  const pieData = s ? [
    { name: "Paid",        value: s.paid,                        color: "var(--G)" },
    { name: "Outstanding", value: Math.max(0, s.principal - s.paid), color: "var(--R)" },
  ] : [];

  return (
    <div className="page">
      <div className="ph">
        <div><div className="ptitle">Loans & EMI</div><div className="psub">Track every payment</div></div>
        <div className="phr">
          <button className="btn bg" onClick={() => setShowCalc(true)}>EMI Calc</button>
          <button className="btn bp" onClick={() => { setForm(blank); setModal("add"); }}>+ Add Loan</button>
        </div>
      </div>

      <div className="sg sg3">
        <Stat label="Monthly EMI"    value={fmt(totalEMI)} color="var(--R)" note={`${active.length} active`} nt="nu" />
        <Stat label="Outstanding"    value={fmt(active.reduce((s, l) => s + (l.principal - l.paid), 0))} color="var(--Y)" />
        <Stat label="Total Repaid"   value={fmt(active.reduce((s, l) => s + l.paid, 0))} color="var(--G)" note="All time" nt="up" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 14, flexWrap: "wrap" }} className="sec loan-detail-grid">
        {/* Loan list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {loans.map((l) => {
            const e = emiCalc(l.principal, l.rate, l.months);
            const p = pct(l.paid, l.principal);
            return (
              <div key={l.id} className={`loan-item${l.id === selId ? " sel" : ""}`} onClick={() => setSelId(l.id)}>
                <div className="fx jb aic mb2">
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{l.lender}</span>
                  <span className={`tag ${l.status === "active" ? "ty" : "tg"}`}>{l.status}</span>
                </div>
                <div className="mono xs cm mb2">{fmt(e)}/month</div>
                <Prog val={p} color={l.status === "closed" ? "var(--G)" : "var(--A)"} />
                <div className="fx jb mt1">
                  <span className="mono xs cm">{p}% paid</span>
                  <span className="mono xs cm">{fmt(l.paid)} of {fmt(l.principal)}</span>
                </div>
              </div>
            );
          })}
          {loans.length === 0 && <div className="card"><div className="empty">No loans added yet.</div></div>}
        </div>

        {/* Loan detail */}
        {s && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Summary card */}
            <div className="card">
              <div className="fx jb aic" style={{ marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>{s.lender}</div>
                  <div className="mono xs cm mt1">Started {fmtD(s.start)} · {s.rate}% p.a. · {s.months} months</div>
                </div>
                <div className="fx aic g2h" style={{ flexWrap: "wrap" }}>
                  <div style={{ textAlign: "right", marginRight: 6 }}>
                    <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--Y)" }}>{fmt(sEMI)}</div>
                    <div className="mono xs cm">per month</div>
                  </div>
                  <button className="btn bg bsm" onClick={() => { setForm({ ...s, principal: String(s.principal), rate: String(s.rate), months: String(s.months), paid: String(s.paid) }); setModal(s.id); }}>✎ Edit</button>
                  {s.status === "active" && <button className="btn bg bsm" onClick={() => closeLoan(s.id)}>Mark Closed</button>}
                  <button className="btn bd bsm" onClick={() => setConf(s.id)}>✕</button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
                {[
                  { l: "Principal",   v: fmt(s.principal),                     c: "var(--text)" },
                  { l: "Paid",        v: fmt(s.paid),                          c: "var(--G)"    },
                  { l: "Outstanding", v: fmt(sOut),                             c: "var(--R)"    },
                  { l: "Months Left", v: s.status === "closed" ? "Closed" : `${sLeft}`, c: "var(--Y)" },
                ].map((x, i) => (
                  <div key={i} style={{ background: "var(--card2)", borderRadius: "var(--rsm)", padding: "10px 12px", border: "1px solid var(--border)" }}>
                    <div className="mono xs cm mb1">{x.l}</div>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: x.c }}>{x.v}</div>
                  </div>
                ))}
              </div>

              <div className="fx jb aic mb2">
                <span style={{ fontSize: 12, color: "var(--text2)" }}>Repayment Progress</span>
                <span className="mono xs bold ca">{sPct}%</span>
              </div>
              <div className="pt" style={{ height: 10, borderRadius: 5 }}>
                <div className="pf" style={{ width: `${sPct}%`, background: s.status === "closed" ? "var(--G)" : "linear-gradient(90deg,var(--A),var(--G))", borderRadius: 5 }} />
              </div>
              <div className="fx jb mt2">
                <span className="mono xs cg">{fmt(s.paid)} repaid</span>
                <span className="mono xs cr">{fmt(sOut)} remaining</span>
              </div>

              <div className="div" />
              <div className="g2" style={{ gap: 8 }}>
                <div style={{ background: "var(--card2)", borderRadius: "var(--rsm)", padding: "10px 12px", border: "1px solid var(--border)" }}>
                  <div className="mono xs cm mb1">Total Loan Cost</div>
                  <div className="mono bold">{fmt(sEMI * s.months)}</div>
                </div>
                <div style={{ background: "var(--card2)", borderRadius: "var(--rsm)", padding: "10px 12px", border: "1px solid var(--border)" }}>
                  <div className="mono xs cm mb1">Total Interest</div>
                  <div className="mono bold cr">{fmt(Math.max(0, sEMI * s.months - s.principal))}</div>
                </div>
              </div>
            </div>

            {/* Pie + Payments */}
            <div className="g2" style={{ gap: 12 }}>
              <div className="card">
                <div className="ctitle">Loan Breakdown</div>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={58} dataKey="value" paddingAngle={3}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "var(--mono)", fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {pieData.map((d, i) => (
                    <div key={i} className="fx jb aic">
                      <div className="fx aic g2h"><span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, display: "inline-block" }} /><span className="xs c2">{d.name}</span></div>
                      <span className="mono xs bold" style={{ color: d.color }}>{fmt(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* EMI Payment History with Checkboxes */}
              <div className="card">
                <div className="ctitle">EMI Payments — Check as Paid</div>
                {s.payments.length === 0
                  ? <div className="empty" style={{ padding: "20px 0" }}>No payment records</div>
                  : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {s.payments.map((p) => (
                        <div key={p.id} className={`emi-row${p.done ? " paid" : ""}`}>
                          <Checkbox
                            checked={p.done}
                            onChange={() => togglePayment(s.id, p.id)}
                          />
                          <div style={{ flex: 1 }}>
                            <div className={`mono xs emi-month${p.done ? " cm" : ""}`} style={{ fontWeight: 600 }}>{p.m}</div>
                            <div className="mono" style={{ fontSize: 9, color: "var(--text3)", marginTop: 1 }}>
                              P: {fmt(p.prin)} · I: {fmt(p.int)}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div className="mono xs bold" style={{ color: p.done ? "var(--G)" : "var(--Y)" }}>{fmt(p.amt)}</div>
                            <div style={{ fontSize: 10, color: p.done ? "var(--G)" : "var(--Y)", marginTop: 1 }}>{p.done ? "✓ Paid" : "Unpaid"}</div>
                          </div>
                        </div>
                      ))}
                      <div style={{ padding: "8px 0", borderTop: "1px solid var(--border)", marginTop: 4 }}>
                        <div className="fx jb">
                          <span className="mono xs cm">Paid EMIs</span>
                          <span className="mono xs cg bold">{s.payments.filter(p => p.done).length} / {s.payments.length}</span>
                        </div>
                        <div className="fx jb mt1">
                          <span className="mono xs cm">Total Paid</span>
                          <span className="mono xs cg bold">{fmt(s.payments.filter(p => p.done).reduce((sum, p) => sum + p.amt, 0))}</span>
                        </div>
                      </div>
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="ov" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="mtitle">{modal === "add" ? "Add Loan" : "Edit Loan"}</div>
            <div className="fr"><label className="fl">Lender Name</label><input className="fi" value={form.lender || ""} onChange={(e) => setForm({ ...form, lender: e.target.value })} autoFocus placeholder="e.g. SBI Home Loans" /></div>
            <div className="g2" style={{ gap: 10 }}>
              <div className="fr"><label className="fl">Principal (₹)</label><input className="fi" type="number" value={form.principal || ""} onChange={(e) => setForm({ ...form, principal: e.target.value })} /></div>
              <div className="fr"><label className="fl">Interest % p.a.</label><input className="fi" type="number" step="0.1" value={form.rate || ""} onChange={(e) => setForm({ ...form, rate: e.target.value })} /></div>
            </div>
            <div className="g2" style={{ gap: 10 }}>
              <div className="fr"><label className="fl">Tenure (months)</label><input className="fi" type="number" value={form.months || ""} onChange={(e) => setForm({ ...form, months: e.target.value })} /></div>
              <div className="fr"><label className="fl">Already Paid (₹)</label><input className="fi" type="number" value={form.paid || ""} onChange={(e) => setForm({ ...form, paid: e.target.value })} /></div>
            </div>
            <div className="fr"><label className="fl">Start Date</label><input className="fi" type="date" value={form.start || ""} onChange={(e) => setForm({ ...form, start: e.target.value })} /></div>
            {form.principal && form.rate && form.months && (
              <div className="al al-s" style={{ marginBottom: 8 }}>
                EMI: <strong className="mono">{fmt(emiCalc(parseFloat(form.principal), parseFloat(form.rate), parseInt(form.months)))}/month</strong>
              </div>
            )}
            <div className="mfooter">
              <button className="btn bg" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn bp" onClick={save}>{modal === "add" ? "Add Loan" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* EMI Calculator */}
      {showCalc && (
        <div className="ov" onClick={() => setShowCalc(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="mtitle">EMI Calculator</div>
            <div className="fr"><label className="fl">Loan Amount (₹)</label><input className="fi" type="number" value={calc.p} onChange={(e) => setCalc({ ...calc, p: e.target.value })} autoFocus /></div>
            <div className="fr"><label className="fl">Annual Interest Rate (%)</label><input className="fi" type="number" step="0.1" value={calc.r} onChange={(e) => setCalc({ ...calc, r: e.target.value })} /></div>
            <div className="fr"><label className="fl">Tenure (months)</label><input className="fi" type="number" value={calc.n} onChange={(e) => setCalc({ ...calc, n: e.target.value })} /></div>
            {calcEMI && (
              <div style={{ background: "var(--AL)", border: "1px solid var(--AB)", borderRadius: "var(--rsm)", padding: 16, marginTop: 4 }}>
                <div className="mono xs cm mb2">Monthly EMI</div>
                <div className="mono ca" style={{ fontSize: 30, fontWeight: 700 }}>{fmt(calcEMI)}</div>
                <div className="div" />
                <div className="g2" style={{ gap: 8 }}>
                  <div><div className="mono xs cm mb1">Total Payment</div><div className="mono bold">{fmt(calcEMI * parseInt(calc.n))}</div></div>
                  <div><div className="mono xs cm mb1">Total Interest</div><div className="mono bold cr">{fmt(calcEMI * parseInt(calc.n) - parseFloat(calc.p))}</div></div>
                </div>
              </div>
            )}
            <div className="mfooter"><button className="btn bg w100" onClick={() => setShowCalc(false)}>Close</button></div>
          </div>
        </div>
      )}

      {conf && <CDel msg="This loan and all payment history will be deleted." onOk={() => del(conf)} onNo={() => setConf(null)} />}
    </div>
  );
}
