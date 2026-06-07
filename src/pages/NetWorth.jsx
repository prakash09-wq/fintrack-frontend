import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fmt } from "../utils/format";
import { NW_HIST, ASSET_TYPES, LIAB_TYPES } from "../data/mockData";
import { uid } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { Stat, ChartTip, CDel } from "../components/UI";

export default function NetWorth() {
  const { data, setData } = useAuth();
  const assets = data?.assets || [];
  const liabs  = data?.liabs  || [];

  const [modal, setModal] = useState(null);
  const [conf,  setConf]  = useState(null);
  const [form,  setForm]  = useState({});

  const tA = assets.reduce((s, a) => s + a.value, 0);
  const tL = liabs.reduce((s, l) => s + l.owed, 0);

  const save = () => {
    if (!form.name) return;
    if (form.kind === "asset") {
      const e = { ...form, value: parseFloat(form.value || 0) };
      setData((prev) => ({
        ...prev,
        assets: modal === "add" ? [...prev.assets, { ...e, id: uid() }] : prev.assets.map((a) => a.id === modal ? { ...e, id: a.id } : a),
      }));
    } else {
      const e = { ...form, owed: parseFloat(form.owed || 0) };
      setData((prev) => ({
        ...prev,
        liabs: modal === "add" ? [...prev.liabs, { ...e, id: uid() }] : prev.liabs.map((l) => l.id === modal ? { ...e, id: l.id } : l),
      }));
    }
    setModal(null);
  };

  const del = () => {
    if (conf.kind === "asset") setData((prev) => ({ ...prev, assets: prev.assets.filter((a) => a.id !== conf.id) }));
    else setData((prev) => ({ ...prev, liabs: prev.liabs.filter((l) => l.id !== conf.id) }));
    setConf(null);
  };

  const openAdd = (kind) => {
    setForm(kind === "asset" ? { kind, name: "", type: "Cash", value: "" } : { kind, name: "", type: "Loan", owed: "", due: "" });
    setModal("add");
  };
  const openEdit = (item, kind) => {
    setForm({ ...item, kind, value: String(item.value || ""), owed: String(item.owed || "") });
    setModal(item.id);
  };

  return (
    <div className="page">
      <div className="ph">
        <div><div className="ptitle">Net Worth</div><div className="psub">Assets minus liabilities</div></div>
      </div>

      <div className="sg sg3">
        <Stat label="Total Assets"      value={fmt(tA)} color="var(--G)" note={`${assets.length} items`} nt="up" />
        <Stat label="Total Liabilities" value={fmt(tL)} color="var(--R)" note={`${liabs.length} items`}  nt="dn" />
        <Stat label="Net Worth"         value={fmt(tA - tL)} color={tA - tL >= 0 ? "var(--G)" : "var(--R)"} />
      </div>

      <div className="sec card mb3">
        <div className="ctitle">Net Worth Trend</div>
        <ResponsiveContainer width="100%" height={165}>
          <AreaChart data={NW_HIST}>
            <defs>
              <linearGradient id="nwg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--A)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--A)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="m" tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip content={<ChartTip />} />
            <Area type="monotone" dataKey="nw" name="Net Worth" stroke="var(--A)" strokeWidth={2} fill="url(#nwg2)" dot={{ fill: "var(--A)", r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="g2 sec">
        {[
          { title: "Assets",      list: assets, kind: "asset",     col: "var(--G)", btnCls: "bp" },
          { title: "Liabilities", list: liabs,  kind: "liability", col: "var(--R)", btnCls: "bd" },
        ].map(({ title, list, kind, col, btnCls }) => (
          <div key={kind}>
            <div className="sechd">
              <span className="sectitle">{title}</span>
              <button className={`btn ${btnCls} bsm`} onClick={() => openAdd(kind)}>+ Add</button>
            </div>
            <div className="tbl">
              <table>
                <thead>
                  <tr><th>Name</th><th>Type</th><th style={{ textAlign: "right" }}>{kind === "asset" ? "Value" : "Owed"}</th><th /></tr>
                </thead>
                <tbody>
                  {list.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td><span className={`tag ${kind === "asset" ? "tg" : "tr"}`}>{item.type}</span></td>
                      <td className="mono bold" style={{ textAlign: "right", color: col }}>{fmt(item.value || item.owed)}</td>
                      <td>
                        <div className="acols">
                          <button className="btn bg bic" onClick={() => openEdit(item, kind)}>✎</button>
                          <button className="btn bd bic" onClick={() => setConf({ ...item, kind })}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: "var(--card2)" }}>
                    <td colSpan={2} className="mono cm xs">Total</td>
                    <td className="mono bold" style={{ textAlign: "right", color: col }}>{fmt(list.reduce((s, i) => s + (i.value || i.owed), 0))}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="ov" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="mtitle">{modal === "add" ? `Add ${form.kind === "asset" ? "Asset" : "Liability"}` : `Edit ${form.kind === "asset" ? "Asset" : "Liability"}`}</div>
            <div className="fr"><label className="fl">Name</label><input className="fi" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus placeholder={form.kind === "asset" ? "e.g. SBI Savings Account" : "e.g. HDFC Credit Card"} /></div>
            <div className="fr">
              <label className="fl">Type</label>
              <select className="fi" value={form.type || ""} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {(form.kind === "asset" ? ASSET_TYPES : LIAB_TYPES).map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            {form.kind === "asset"
              ? <div className="fr"><label className="fl">Value (₹)</label><input className="fi" type="number" value={form.value || ""} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
              : <div className="fr"><label className="fl">Amount Owed (₹)</label><input className="fi" type="number" value={form.owed || ""} onChange={(e) => setForm({ ...form, owed: e.target.value })} /></div>
            }
            {form.kind === "liability" && <div className="fr"><label className="fl">Due Date</label><input className="fi" type="date" value={form.due || ""} onChange={(e) => setForm({ ...form, due: e.target.value })} /></div>}
            <div className="mfooter">
              <button className="btn bg" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn bp" onClick={save}>{modal === "add" ? "Add" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
      {conf && <CDel msg={`Delete "${conf.name}"?`} onOk={del} onNo={() => setConf(null)} />}
    </div>
  );
}
