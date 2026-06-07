export const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const fmtD = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export const pct = (a, b) => (b === 0 ? 0 : Math.min(100, Math.round((a / b) * 100)));

export const emiCalc = (p, r, n) => {
  const m = r / 12 / 100;
  if (!m) return Math.round(p / n);
  return Math.round((p * m * Math.pow(1 + m, n)) / (Math.pow(1 + m, n) - 1));
};

// Always current date
export const NOW        = new Date();
export const CURR_YEAR  = NOW.getFullYear();
export const CURR_MONTH = NOW.getMonth();      // 0-indexed
export const CURR_MONTH1= NOW.getMonth() + 1; // 1-indexed

export const MONTHS_LONG  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const DAYS_SHORT   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export const currentMonthLabel = () =>
  NOW.toLocaleString("en-IN", { month: "long", year: "numeric" });
