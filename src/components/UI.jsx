import { fmt } from "../utils/format";

export function Stat({ label, value, note, nt = "nu", color }) {
  return (
    <div className="stat">
      <div className="slbl">{label}</div>
      <div className="sval" style={color ? { color } : {}}>{value}</div>
      {note && <span className={`snote s${nt}`}>{note}</span>}
    </div>
  );
}

export function Prog({ val, color = "var(--A)", h = 6 }) {
  return (
    <div className="pt" style={{ height: h }}>
      <div className="pf" style={{ width: `${val}%`, background: color }} />
    </div>
  );
}

export function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 13px", boxShadow: "var(--sh)", fontFamily: "var(--mono)", fontSize: 11 }}>
      <div style={{ color: "var(--text3)", marginBottom: 5 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, display: "flex", justifyContent: "space-between", gap: 14 }}>
          <span>{p.name}</span><span>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function CDel({ msg, onOk, onNo }) {
  return (
    <div className="ov" onClick={onNo}>
      <div className="confirm" onClick={(e) => e.stopPropagation()}>
        <h3>Are you sure?</h3>
        <p>{msg}</p>
        <div className="cbtn">
          <button className="btn bg" onClick={onNo}>Cancel</button>
          <button className="btn bd" onClick={onOk}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export function Checkbox({ checked, onChange, label }) {
  return (
    <label className="chk-wrap" style={{ cursor: "pointer" }} onClick={onChange}>
      <div className={`chk-box${checked ? " checked" : ""}`} />
      {label && <span className="chk-lbl">{label}</span>}
    </label>
  );
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
