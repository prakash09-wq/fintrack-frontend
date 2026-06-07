import { useState } from "react";
import { fmt, fmtD, pct } from "../utils/format";
import { uid } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { Stat, Prog, CDel } from "../components/UI";

const GCOLS = ["var(--A)", "var(--G)", "var(--B)", "var(--P)", "var(--R)"];

export default function Goals() {
  const { data, setData } = useAuth();
  const goals = data?.goals || [];

  const [modal,   setModal]   = useState(null);
  const [addMod,  setAddMod]  = useState(null);
  const [conf,    setConf]    = useState(null);
  const [addAmt,  setAddAmt]  = useState("");
  const blank = { name: "", target: "", saved: "", deadline: "" };
  const [form, setForm] = useState(blank);

  const done = goals.filter((g) => pct(g.saved, g.target) >= 100).length;

  const save = () => {
    if (!form.name || !form.target) return;
    const entry = { ...form, target: parseFloat(form.target), saved: parseFloat(form.saved || 0) };
    setData((prev) => ({
      ...prev,
      goals: modal === "add"
        ? [...prev.goals, { ...entry, id: uid() }]
        : prev.goals.map((g) => g.id === modal ? { ...entry, id: g.id } : g),
    }));
    setModal(null);
  };

  const addSavings = () => {
    if (!addAmt || !addMod) return;
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === addMod.id
          ? { ...g, saved: Math.min(g.saved + parseFloat(addAmt), g.target) }
          : g
      ),
    }));
    setAddAmt(""); setAddMod(null);
  };

  const del = (id) => {
    setData((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));
    setConf(null);
  };

  return (
    <div className="page">
      <div className="ph">
        <div><div className="ptitle">Financial Goals</div><div className="psub">Set targets, track progress</div></div>
        <div className="phr">
          <button className="btn bp" onClick={() => { setForm(blank); setModal("add"); }}>+ New Goal</button>
        </div>
      </div>

      <div className="sg sg4">
        <Stat label="Total Goals"   value={goals.length} />
        <Stat label="Achieved"      value={done}                  color="var(--G)" />
        <Stat label="In Progress"   value={goals.length - done}   color="var(--Y)" />
        <Stat label="Avg Progress"  value={goals.length ? Math.round(goals.reduce((s, g) => s + pct(g.saved, g.target), 0) / goals.length) + "%" : "—"} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="sec">
        {goals.map((g, i) => {
          const p      = pct(g.saved, g.target);
          const isDone = p >= 100;
          const col    = isDone ? "var(--G)" : GCOLS[i % GCOLS.length];
          const rem    = g.target - g.saved;
          const days   = g.deadline ? Math.ceil((new Date(g.deadline) - new Date()) / 86400000) : null;

          return (
            <div key={g.id} className="card" style={{ borderLeft: `3px solid ${col}` }}>
              <div className="fx jb aic mb3" style={{ flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{g.name}</div>
                  {g.deadline && (
                    <div className="mono xs cm mt1">
                      Due {fmtD(g.deadline)}
                      {days !== null && days > 0  && <span style={{ marginLeft: 6, color: days < 60 ? "var(--Y)" : "var(--text3)" }}>· {days}d left</span>}
                      {days !== null && days <= 0 && !isDone && <span style={{ marginLeft: 6, color: "var(--R)" }}>· Overdue</span>}
                    </div>
                  )}
                </div>
                <div className="fx aic g2h" style={{ flexWrap: "wrap" }}>
                  <span className={`tag ${isDone ? "tg" : "tb"}`}>{isDone ? "✓ Done" : "In Progress"}</span>
                  {!isDone && <button className="btn bg bxs" onClick={() => setAddMod(g)}>+ Add</button>}
                  <button className="btn bg bic" onClick={() => { setForm({ ...g, target: String(g.target), saved: String(g.saved) }); setModal(g.id); }}>✎</button>
                  <button className="btn bd bic" onClick={() => setConf(g.id)}>✕</button>
                </div>
              </div>

              <div className="g3" style={{ gap: 8, marginBottom: 12 }}>
                {[
                  { l: "Target",    v: fmt(g.target), c: "var(--text)" },
                  { l: "Saved",     v: fmt(g.saved),  c: col           },
                  { l: "Remaining", v: rem > 0 ? fmt(rem) : "Done!", c: rem > 0 ? "var(--R)" : "var(--G)" },
                ].map((x, i) => (
                  <div key={i} style={{ background: "var(--card2)", borderRadius: "var(--rsm)", padding: "9px 12px", border: "1px solid var(--border)" }}>
                    <div className="mono xs cm mb1">{x.l}</div>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: x.c }}>{x.v}</div>
                  </div>
                ))}
              </div>

              <div className="fx jb aic mb2">
                <span className="xs c2">Progress</span>
                <span className="mono xs bold" style={{ color: col }}>{p}%</span>
              </div>
              <Prog val={p} color={col} h={8} />
            </div>
          );
        })}
        {goals.length === 0 && <div className="card"><div className="empty">No goals yet. Create one!</div></div>}
      </div>

      {/* Add / Edit goal modal */}
      {modal && (
        <div className="ov" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="mtitle">{modal === "add" ? "New Goal" : "Edit Goal"}</div>
            <div className="fr"><label className="fl">Goal Name</label><input className="fi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus placeholder="e.g. Emergency Fund" /></div>
            <div className="g2" style={{ gap: 10 }}>
              <div className="fr"><label className="fl">Target (₹)</label><input className="fi" type="number" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} /></div>
              <div className="fr"><label className="fl">Saved so far (₹)</label><input className="fi" type="number" value={form.saved} onChange={(e) => setForm({ ...form, saved: e.target.value })} /></div>
            </div>
            <div className="fr"><label className="fl">Deadline (optional)</label><input className="fi" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
            <div className="mfooter">
              <button className="btn bg" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn bp" onClick={save}>{modal === "add" ? "Create Goal" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add savings modal */}
      {addMod && (
        <div className="ov" onClick={() => setAddMod(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="mtitle">Add savings — {addMod.name}</div>
            <div style={{ background: "var(--card2)", borderRadius: "var(--rsm)", padding: 14, marginBottom: 16, border: "1px solid var(--border)" }}>
              <div className="fx jb mb2">
                <span className="mono xs cm">Progress</span>
                <span className="mono xs ca bold">{pct(addMod.saved, addMod.target)}%</span>
              </div>
              <Prog val={pct(addMod.saved, addMod.target)} />
              <div className="fx jb mt2">
                <span className="mono xs c2">{fmt(addMod.saved)} saved</span>
                <span className="mono xs cm">of {fmt(addMod.target)}</span>
              </div>
            </div>
            <div className="fr"><label className="fl">Amount to Add (₹)</label><input className="fi" type="number" value={addAmt} onChange={(e) => setAddAmt(e.target.value)} autoFocus placeholder="5000" /></div>
            <div className="mfooter">
              <button className="btn bg" onClick={() => setAddMod(null)}>Cancel</button>
              <button className="btn bp" onClick={addSavings}>Add Savings</button>
            </div>
          </div>
        </div>
      )}

      {conf && <CDel msg="This goal will be permanently deleted." onOk={() => del(conf)} onNo={() => setConf(null)} />}
    </div>
  );
}
