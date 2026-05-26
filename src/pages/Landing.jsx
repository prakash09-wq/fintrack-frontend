export default function Landing({ onGetStarted }) {
  const features = [
    { ic: "📊", h: "Smart Dashboard", p: "See your total income, expenses, net savings and net worth in one glance. Charts update live as you add data." },
    { ic: "💳", h: "Transaction Tracking", p: "Add income and expense entries in seconds. Filter by type or category, edit any entry, and delete with one click." },
    { ic: "📅", h: "Calendar View", p: "See all transactions on an interactive calendar. Click any date to view income and expenses recorded that day." },
    { ic: "🏦", h: "Loan & EMI Tracker", p: "Track principal, interest and repayment. Tick each monthly EMI as paid or unpaid with a simple checkbox." },
    { ic: "🎯", h: "Goal Planning", p: "Create savings goals with a target amount and deadline. Add money to a goal anytime and watch the progress bar grow." },
    { ic: "🧠", h: "AI Analysis", p: "Get a Financial Health Score out of 100 based on your savings rate, budget compliance, debt load and goal progress." },
  ];

  const steps = [
    {
      n: "1", h: "Create Your Account",
      p: "Sign up with Google or email in under 30 seconds. Your data is saved securely and always available when you log back in.",
      detail: "Supports Google OAuth and Email/Password. Works on any device.",
    },
    {
      n: "2", h: "Add Income & Expenses",
      p: "Log every transaction with amount, category, description and date. Use the calendar to see transactions day by day.",
      detail: "Categories: Salary, Freelance, Food, Rent, EMI, Travel, Shopping, Health and more.",
    },
    {
      n: "3", h: "Track Loans & Set Budgets",
      p: "Enter your loans and mark each monthly EMI as paid or unpaid with a checkbox. Set monthly spending limits per category.",
      detail: "EMI calculator included. Budget ring shows how much of your limit is used.",
    },
    {
      n: "4", h: "Get Your Health Score",
      p: "Visit the Analysis page to see your Financial Health Score out of 100, a performance radar, and smart recommendations.",
      detail: "Score based on: Savings Rate, Budget Adherence, EMI-to-Income Ratio, Goals Progress.",
    },
  ];

  const aiPoints = [
    { icon: "📈", title: "Savings Rate Check", desc: "Checks total income vs expenses. Flags if savings rate is below 20% and tells you exactly how far off you are." },
    { icon: "💰", title: "Budget Compliance", desc: "Checks how many categories stayed within limit. Shows your compliance percentage and which categories went over." },
    { icon: "🔴", title: "EMI Burden Warning", desc: "Compares total monthly EMI against income. Warns if EMI load crosses the 30% safe zone." },
    { icon: "🎯", title: "Goal Progress", desc: "Averages progress across all goals. Recommends increasing monthly contributions if overall progress is below 40%." },
    { icon: "⭐", title: "Health Score 0-100", desc: "Four metrics combined into one score. Excellent 85+, Good 70-84, Fair 55-69, Needs Work below 55." },
    { icon: "💡", title: "Smart Tips", desc: "Generates plain-language tips — which goal you will hit by which month at your current pace, and investment suggestions." },
  ];

  return (
    <div className="land">
      {/* Nav */}
      <nav className="land-nav">
        <div className="land-logo">
          <div className="land-logo-ic">Ft</div>
          <div className="land-logo-nm">Fin<span>Track</span></div>
        </div>
        <div className="land-nav-links">
          <button className="land-nav-link">Features</button>
          <button className="land-nav-link">How it works</button>
          <button className="land-nav-link">AI Insights</button>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn bl-outline bsm" onClick={onGetStarted}>Sign In</button>
          <button className="btn bl-solid bsm" onClick={onGetStarted}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="land-hero">
        <div className="hero-badge"><span className="hero-dot" />&nbsp;AI-powered Financial Health Score inside</div>
        <h1 className="hero-h1">Take Control of Your<br /><span>Financial Future</span></h1>
        <p className="hero-sub">Track income, expenses, loans and goals — all in one place. Get a real-time Financial Health Score and know exactly where your money goes.</p>
        <div className="hero-ctas">
          <button className="btn bl-solid" style={{ padding: "13px 32px", fontSize: 15 }} onClick={onGetStarted}>Start for Free →</button>
          <button className="btn bl-outline" style={{ padding: "13px 32px", fontSize: 15 }} onClick={onGetStarted}>Sign In</button>
        </div>
        <div className="hero-stats">
          {[{ v: "Free", l: "Forever, no catch" }, { v: "8", l: "Finance modules" }, { v: "100%", l: "Data stays with you" }, { v: "Live", l: "AI health score" }].map((s, i) => (
            <div key={i} className="hstat">
              <div className="hstat-val">{s.v}</div>
              <div className="hstat-lbl">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="land-sec">
        <div className="land-sec-inner">
          <div className="land-sec-tag">Everything you need</div>
          <h2 className="land-sec-h">Built for serious personal finance</h2>
          <p className="land-sec-p">Not just a ledger — a full financial cockpit with live charts, loan trackers, calendar view, goal planners and AI insights.</p>
          <div className="feat-grid">
            {features.map((f, i) => (
              <div key={i} className="feat-card">
                <div className="feat-ic">{f.ic}</div>
                <div className="feat-h">{f.h}</div>
                <p className="feat-p">{f.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="land-sec">
        <div className="land-sec-inner">
          <div className="land-sec-tag">Step by step</div>
          <h2 className="land-sec-h">How FinTrack works</h2>
          <p className="land-sec-p">Four simple steps from signup to a full picture of your finances — no complicated setup.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 48, position: "relative" }}>
            <div style={{ position: "absolute", left: 23, top: 48, bottom: 48, width: 2, background: "linear-gradient(to bottom, var(--A), rgba(200,115,42,0.1))", zIndex: 0 }} />
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 24, marginBottom: i < steps.length - 1 ? 36 : 0, position: "relative", zIndex: 1 }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,var(--A),#d88030)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18, color: "#fff", boxShadow: "0 4px 16px rgba(200,115,42,0.4)" }}>{s.n}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "22px 24px", flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.h}</div>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 10 }}>{s.p}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(200,115,42,0.1)", border: "1px solid rgba(200,115,42,0.2)", borderRadius: 8, padding: "8px 12px" }}>
                    <span style={{ color: "var(--AB)", fontSize: 13, fontFamily: "var(--mono)" }}>→</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "var(--mono)" }}>{s.detail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Insights */}
      <section className="land-sec" style={{ background: "rgba(200,115,42,0.04)" }}>
        <div className="land-sec-inner">
          <div className="land-sec-tag">Intelligence built in</div>
          <h2 className="land-sec-h">How the AI Insights engine works</h2>
          <p className="land-sec-p" style={{ marginBottom: 48 }}>No black-box AI — clear financial rules applied to your real data, explained in plain language.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {aiPoints.map((a, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "22px 24px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(200,115,42,0.15)", border: "1px solid rgba(200,115,42,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{a.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 7, color: "#fff" }}>{a.title}</div>
                  <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "20px 24px", display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ fontSize: 28 }}>🔒</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>Your data never leaves your device</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>All AI analysis runs entirely in your browser. Nothing is sent to any external AI server. Insights are calculated instantly on-device every time you open the Analysis page.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="land-cta-band">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="land-sec-tag" style={{ display: "flex", justifyContent: "center" }}>Join FinTrack today</div>
          <h2 className="land-sec-h" style={{ marginBottom: 14 }}>Your finances deserve better clarity</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>Free forever. No credit card. No hidden fees.</p>
          <button className="btn bl-solid" style={{ padding: "14px 40px", fontSize: 16 }} onClick={onGetStarted}>Create Free Account →</button>
        </div>
      </section>

      <footer className="land-footer">
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", fontFamily: "var(--mono)" }}>© 2025 FinTrack · NSU Jamshedpur · BCA Final Year Project</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.28)" }}>Jay P. Shaw · Sourav Bhattacharjee · Sujay K. Giri</div>
      </footer>
    </div>
  );
}
