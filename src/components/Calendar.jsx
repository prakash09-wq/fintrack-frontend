import { useState, useMemo } from "react";
import { fmt, CURR_YEAR, CURR_MONTH, DAYS_SHORT, MONTHS_LONG } from "../utils/format";

export default function Calendar({ transactions = [], onDateSelect, selectedDate }) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(CURR_YEAR);
  const [viewMonth, setViewMonth] = useState(CURR_MONTH);

  const txnMap = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      const d   = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [transactions]);

  const prev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const next = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev  = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, cur: false, year: viewMonth === 0 ? viewYear - 1 : viewYear, month: viewMonth === 0 ? 11 : viewMonth - 1 });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, cur: true, year: viewYear, month: viewMonth });
  const rem = 42 - cells.length;
  for (let d = 1; d <= rem; d++)
    cells.push({ day: d, cur: false, year: viewMonth === 11 ? viewYear + 1 : viewYear, month: viewMonth === 11 ? 0 : viewMonth + 1 });

  const selKey  = selectedDate ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}` : null;
  const selTxns = selKey ? (txnMap[selKey] || []) : [];

  return (
    <div className="cal-wrap">
      <div className="cal-header">
        <button className="cal-nav" onClick={prev}>‹</button>
        <div className="cal-title">{MONTHS_LONG[viewMonth]} {viewYear}</div>
        <button className="cal-nav" onClick={next}>›</button>
      </div>

      <div className="cal-grid">
        {DAYS_SHORT.map((d) => <div key={d} className="cal-day-name">{d}</div>)}
        {cells.map((cell, i) => {
          const key  = `${cell.year}-${cell.month}-${cell.day}`;
          const txns = txnMap[key] || [];
          const isToday = cell.cur && cell.day === today.getDate() && cell.month === today.getMonth() && cell.year === today.getFullYear();
          const isSel   = selKey === key;
          const inc     = txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
          const exp     = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
          return (
            <button
              key={i}
              className={`cal-day${isToday ? " today" : ""}${!cell.cur ? " other-month" : ""}${isSel ? " selected" : ""}`}
              onClick={() => onDateSelect && onDateSelect(new Date(cell.year, cell.month, cell.day))}
            >
              <div className="cal-day-num">{cell.day}</div>
              {txns.length > 0 && (
                <div className="cal-dots">
                  {inc > 0 && <span className="cal-dot" style={{ background: "var(--G)" }} title={`Income: ${fmt(inc)}`} />}
                  {exp > 0 && <span className="cal-dot" style={{ background: "var(--R)" }} title={`Expense: ${fmt(exp)}`} />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="cal-selected-info">
        {selectedDate ? (
          <>
            <div className="cal-sel-date">
              {selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            {selTxns.length === 0 ? (
              <div className="cal-sel-empty">No transactions on this day</div>
            ) : (
              <div className="cal-sel-txns">
                {selTxns.map((t) => (
                  <div key={t.id} className="cal-sel-txn">
                    <span style={{ fontSize: 12, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>{t.description}</span>
                    <span className="mono xs bold" style={{ color: t.type === "income" ? "var(--G)" : "var(--R)", flexShrink: 0 }}>
                      {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                    </span>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 12, marginTop: 6, paddingTop: 6, borderTop: "1px solid var(--border)" }}>
                  {selTxns.filter((t) => t.type === "income").length > 0 && (
                    <span className="mono xs cg bold">+{fmt(selTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0))}</span>
                  )}
                  {selTxns.filter((t) => t.type === "expense").length > 0 && (
                    <span className="mono xs cr bold">-{fmt(selTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0))}</span>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="cal-sel-empty">Click any date to see transactions</div>
        )}
      </div>
    </div>
  );
}
